<?php
/**
 * WALKIN - Server-Side Application Endpoint
 * Enforces 3 monthly applications quota, exactly 3 screening questions, and 1-3 words validation.
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');
require_once dirname(__DIR__, 2) . '/config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed. Use POST.']);
    exit;
}

$pdo = Database::getConnection();

// 1. Authenticated User Check (Session or Bearer token)
$candidateId = $_SESSION['user_id'] ?? null;
if (!$candidateId) {
    http_response_code(401);
    echo json_encode(['error' => 'Authentication required. Please log in as candidate.']);
    exit;
}

// Read JSON input
$payload = json_decode(file_get_contents('php://input'), true);
$jobId = trim($payload['job_id'] ?? '');
$resumeId = trim($payload['resume_id'] ?? '');
$answers = $payload['answers'] ?? []; // Array of { question_id, answer_text }

if (!$jobId || !$resumeId) {
    http_response_code(400);
    echo json_encode(['error' => 'job_id and resume_id are required.']);
    exit;
}

// 2. Verify Job Exists
$stmt = $pdo->prepare("SELECT * FROM jobs WHERE id = :job_id AND status = 'active'");
$stmt->execute(['job_id' => $jobId]);
$job = $stmt->fetch();
if (!$job) {
    http_response_code(404);
    echo json_encode(['error' => 'Job vacancy not found or no longer active.']);
    exit;
}

// 3. Check for Duplicate Submission
$stmt = $pdo->prepare("SELECT id FROM applications WHERE candidate_id = :cid AND job_id = :jid");
$stmt->execute(['cid' => $candidateId, 'jid' => $jobId]);
if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(['error' => 'You have already applied for this walk-in vacancy.']);
    exit;
}

// 4. Monthly Application Quota Enforcement (3 Free Applications / Calendar Month)
$firstDayOfMonth = date('Y-m-01 00:00:00');
$stmt = $pdo->prepare("
    SELECT COUNT(*) as count 
    FROM applications 
    WHERE candidate_id = :cid AND applied_at >= :first_day
");
$stmt->execute(['cid' => $candidateId, 'first_day' => $firstDayOfMonth]);
$monthlyUsed = (int)$stmt->fetchColumn();

// Check if candidate is premium or has credits
$stmt = $pdo->prepare("SELECT is_premium, application_credits FROM candidate_profiles WHERE user_id = :cid");
$stmt->execute(['cid' => $candidateId]);
$profile = $stmt->fetch();
$isPremium = (bool)($profile['is_premium'] ?? false);
$extraCredits = (int)($profile['application_credits'] ?? 0);

if (!$isPremium && $monthlyUsed >= 3 && $extraCredits <= 0) {
    http_response_code(403);
    echo json_encode([
        'error' => 'Monthly quota exceeded! Free candidate accounts are limited to 3 applications per calendar month. Upgrade to Premium for unlimited access.',
        'used' => $monthlyUsed,
        'quota' => 3
    ]);
    exit;
}

// 5. Enforce EXACTLY THREE Screening Questions & 1 to 3 words count
$stmt = $pdo->prepare("SELECT * FROM screening_questions WHERE job_id = :jid ORDER BY question_order ASC");
$stmt->execute(['jid' => $jobId]);
$expectedQuestions = $stmt->fetchAll();

if (count($expectedQuestions) !== 3) {
    http_response_code(500);
    echo json_encode(['error' => 'Integrity error: This vacancy must configure exactly 3 screening questions.']);
    exit;
}

if (!is_array($answers) || count($answers) !== 3) {
    http_response_code(400);
    echo json_encode(['error' => 'You must provide answers to all 3 screening questions.']);
    exit;
}

$validatedAnswers = [];
foreach ($expectedQuestions as $index => $q) {
    $userAnswerText = trim((string)($answers[$index]['answer_text'] ?? ''));
    if ($userAnswerText === '') {
        http_response_code(400);
        echo json_encode(['error' => "Question " . ($index + 1) . " cannot be blank."]);
        exit;
    }

    $words = preg_split('/\s+/', $userAnswerText, -1, PREG_SPLIT_NO_EMPTY);
    $wordCount = count($words);

    if ($wordCount < 1 || $wordCount > 3) {
        http_response_code(400);
        echo json_encode([
            'error' => "Answer to Question " . ($index + 1) . " must be between 1 and 3 words. You provided {$wordCount} words."
        ]);
        exit;
    }

    $validatedAnswers[] = [
        'question_id' => $q['id'],
        'question_text' => $q['question_text'],
        'answer_text' => $userAnswerText,
        'word_count' => $wordCount
    ];
}

// 6. Resume Snapshot
$stmt = $pdo->prepare("SELECT * FROM candidate_resumes WHERE id = :rid AND candidate_id = :cid");
$stmt->execute(['rid' => $resumeId, 'cid' => $candidateId]);
$resume = $stmt->fetch();
if (!$resume) {
    http_response_code(400);
    echo json_encode(['error' => 'Selected resume does not exist.']);
    exit;
}

// 7. Atomic Database Insertion via Transaction
try {
    $pdo->beginTransaction();

    $appId = 'app_' . bin2hex(random_bytes(10));
    $isVenueUnlocked = ($job['walk_in_mode'] === 'open_walkin') ? 1 : 0;

    // Insert Application
    $stmt = $pdo->prepare("
        INSERT INTO applications (
            id, job_id, candidate_id, recruiter_id, company_id, resume_id, status, is_venue_unlocked, applied_at
        ) VALUES (
            :id, :job_id, :candidate_id, :recruiter_id, :company_id, :resume_id, 'applied', :is_venue_unlocked, NOW()
        )
    ");
    $stmt->execute([
        'id' => $appId,
        'job_id' => $jobId,
        'candidate_id' => $candidateId,
        'recruiter_id' => $job['recruiter_id'],
        'company_id' => $job['company_id'],
        'resume_id' => $resumeId,
        'is_venue_unlocked' => $isVenueUnlocked
    ]);

    // Insert 3 Application Answers
    $stmtAnswer = $pdo->prepare("
        INSERT INTO application_answers (application_id, question_id, question_text, answer_text, word_count)
        VALUES (:app_id, :qid, :qtext, :atext, :wcount)
    ");
    foreach ($validatedAnswers as $va) {
        $stmtAnswer->execute([
            'app_id' => $appId,
            'qid' => $va['question_id'],
            'qtext' => $va['question_text'],
            'atext' => $va['answer_text'],
            'wcount' => $va['word_count']
        ]);
    }

    // Insert Immutable Resume Snapshot Record
    $stmtSnap = $pdo->prepare("
        INSERT INTO application_resumes (application_id, original_resume_id, snapshot_file_name, snapshot_path, content_snippet)
        VALUES (:app_id, :orig_id, :file_name, :fpath, :snippet)
    ");
    $stmtSnap->execute([
        'app_id' => $appId,
        'orig_id' => $resumeId,
        'file_name' => $resume['file_name'],
        'snapshot_path' => $resume['file_path'],
        'snippet' => $resume['content_snippet']
    ]);

    // Increment Jobs Applications Counter
    $stmtInc = $pdo->prepare("UPDATE jobs SET applications_count = applications_count + 1 WHERE id = :jid");
    $stmtInc->execute(['jid' => $jobId]);

    // Deduct extra credit if non-premium and quota was exceeded
    if (!$isPremium && $monthlyUsed >= 3 && $extraCredits > 0) {
        $stmtCredit = $pdo->prepare("UPDATE candidate_profiles SET application_credits = application_credits - 1 WHERE user_id = :cid");
        $stmtCredit->execute(['cid' => $candidateId]);
    }

    // Enqueue In-App Notification & Email Queue for Recruiter
    $notifId = 'notif_' . bin2hex(random_bytes(8));
    $stmtNotif = $pdo->prepare("
        INSERT INTO notifications (id, user_id, type, title, message, link, is_read, created_at)
        VALUES (:id, :uid, 'application_viewed', 'New Walk-In Application', 'A candidate submitted an application with 3 screening answers.', '/recruiter/applications', 0, NOW())
    ");
    $stmtNotif->execute(['id' => $notifId, 'uid' => $job['recruiter_id']]);

    // Enqueue Transactional Email into email_queue
    $stmtEmail = $pdo->prepare("
        INSERT INTO email_queue (recipient_email, recipient_name, subject, body_html, status, created_at)
        SELECT u.email, u.name, 'New Walk-In Application Received - WALKIN', 
               CONCAT('<p>Hello, a new candidate has applied for your walk-in vacancy: <strong>', :jtitle, '</strong>.</p>'),
               'pending', NOW()
        FROM users u WHERE u.id = :rec_id
    ");
    $stmtEmail->execute(['rec_id' => $job['recruiter_id'], 'jtitle' => $job['title']]);

    // Record Audit Log
    $stmtAudit = $pdo->prepare("
        INSERT INTO audit_logs (user_id, user_name, user_role, action, details, ip_address, timestamp)
        VALUES (:uid, 'Candidate', 'candidate', 'APPLICATION_SUBMITTED', :details, :ip, NOW())
    ");
    $stmtAudit->execute([
        'uid' => $candidateId,
        'details' => "Application {$appId} submitted for Job {$jobId} with 3 validated screening answers.",
        'ip' => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1'
    ]);

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'application_id' => $appId,
        'venue_unlocked' => (bool)$isVenueUnlocked,
        'message' => 'Application successfully submitted.'
    ]);
} catch (Exception $e) {
    $pdo->rollBack();
    error_log("Application submission failed: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database transaction failed during application submission.']);
}

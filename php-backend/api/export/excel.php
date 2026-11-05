<?php
/**
 * WALKIN - Server-Side HR Excel / CSV Export Endpoint
 * Generates XLSX / CSV downloads using PhpSpreadsheet for Hostinger PHP 8.3
 */

declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/config/database.php';

// Check Recruiter authentication
$recruiterId = $_SESSION['user_id'] ?? null;
if (!$recruiterId) {
    http_response_code(401);
    die('Unauthorized access.');
}

$pdo = Database::getConnection();

$format = strtolower($_GET['format'] ?? 'xlsx');
$type = strtolower($_GET['type'] ?? 'all');
$jobId = $_GET['job_id'] ?? null;

// Query applications for this recruiter's company vacancies only
$sql = "
    SELECT 
        a.id AS application_id,
        j.title AS job_title,
        j.walk_in_mode,
        u.name AS candidate_name,
        u.email AS candidate_email,
        u.phone AS candidate_phone,
        cp.current_qualification,
        cp.experience_years,
        r.file_name AS resume_name,
        a.applied_at,
        a.status AS current_status,
        i.interview_date,
        i.interview_time,
        i.round_name,
        i.interviewer_name,
        i.attendance_status
    FROM applications a
    JOIN jobs j ON a.job_id = j.id
    JOIN users u ON a.candidate_id = u.id
    LEFT JOIN candidate_profiles cp ON u.id = cp.user_id
    LEFT JOIN candidate_resumes r ON a.resume_id = r.id
    LEFT JOIN interview_schedules i ON a.id = i.application_id
    WHERE a.recruiter_id = :rec_id
";

$params = ['rec_id' => $recruiterId];
if ($jobId && $jobId !== 'all') {
    $sql .= " AND a.job_id = :jid";
    $params['jid'] = $jobId;
}

if ($type === 'shortlisted') {
    $sql .= " AND a.status IN ('shortlisted', 'interview_scheduled', 'selected')";
} elseif ($type === 'rejected') {
    $sql .= " AND a.status = 'rejected'";
} elseif ($type === 'selected') {
    $sql .= " AND a.status = 'selected'";
}

$sql .= " ORDER BY a.applied_at DESC";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll();

// Fallback to pure streaming CSV if PhpSpreadsheet is not installed yet
if ($format === 'csv' || !class_exists('\PhpOffice\PhpSpreadsheet\Spreadsheet')) {
    header('Content-Type: text/csv; charset=UTF-8');
    header('Content-Disposition: attachment; filename="WALKIN_Export_' . date('Y-m-d') . '.csv"');
    
    $output = fopen('php://output', 'w');
    // UTF-8 BOM for Excel compatibility
    fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

    fputcsv($output, [
        'Application ID', 'Job Title', 'Walk-In Mode', 'Candidate Name', 'Email', 
        'Phone', 'Qualification', 'Experience (Yrs)', 'Resume', 'Applied Date', 
        'Current Status', 'Interview Date', 'Interview Time', 'Round', 'Interviewer', 'Attendance'
    ]);

    foreach ($rows as $row) {
        fputcsv($output, [
            $row['application_id'],
            $row['job_title'],
            $row['walk_in_mode'] === 'open_walkin' ? 'Open Walk-In' : 'Candidate-Selected Walk-In',
            $row['candidate_name'],
            $row['candidate_email'],
            $row['candidate_phone'],
            $row['current_qualification'],
            $row['experience_years'],
            $row['resume_name'],
            $row['applied_at'],
            strtoupper((string)$row['current_status']),
            $row['interview_date'] ?? 'N/A',
            $row['interview_time'] ?? 'N/A',
            $row['round_name'] ?? 'N/A',
            $row['interviewer_name'] ?? 'N/A',
            strtoupper((string)($row['attendance_status'] ?? 'PENDING'))
        ]);
    }
    fclose($output);
    exit;
}

// PhpSpreadsheet XLSX export
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

$spreadsheet = new Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();
$sheet->setTitle('Applicants');

$headers = [
    'Application ID', 'Job Title', 'Walk-In Mode', 'Candidate Name', 'Email', 
    'Phone', 'Qualification', 'Experience (Yrs)', 'Resume', 'Applied Date', 
    'Current Status', 'Interview Date', 'Interview Time', 'Round', 'Interviewer', 'Attendance'
];
$sheet->fromArray($headers, NULL, 'A1');

$dataRows = [];
foreach ($rows as $r) {
    $dataRows[] = [
        $r['application_id'],
        $r['job_title'],
        $r['walk_in_mode'] === 'open_walkin' ? 'Open Walk-In' : 'Candidate-Selected Walk-In',
        $r['candidate_name'],
        $r['candidate_email'],
        $r['candidate_phone'],
        $r['current_qualification'],
        $r['experience_years'],
        $r['resume_name'],
        $r['applied_at'],
        strtoupper((string)$r['current_status']),
        $r['interview_date'] ?? 'N/A',
        $r['interview_time'] ?? 'N/A',
        $r['round_name'] ?? 'N/A',
        $r['interviewer_name'] ?? 'N/A',
        strtoupper((string)($r['attendance_status'] ?? 'PENDING'))
    ];
}

if (!empty($dataRows)) {
    $sheet->fromArray($dataRows, NULL, 'A2');
}

// Auto-size columns
foreach (range('A', 'P') as $col) {
    $sheet->getColumnDimension($col)->setAutoSize(true);
}

header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Content-Disposition: attachment; filename="WALKIN_HR_Report_' . date('Y-m-d') . '.xlsx"');
header('Cache-Control: max-age=0');

$writer = new Xlsx($spreadsheet);
$writer->save('php://output');
exit;

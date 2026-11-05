<?php
/**
 * WALKIN - Cron Job Email Processor
 * Execute every 5 minutes in Hostinger hPanel / cPanel Cron Jobs:
 * Command: php /home/u12345/public_html/cron/process_emails.php >/dev/null 2>&1
 */

declare(strict_types=1);

require_once dirname(__DIR__) . '/config/database.php';

$pdo = Database::getConnection();

// Fetch up to 50 pending emails
$stmt = $pdo->prepare("SELECT * FROM email_queue WHERE status = 'pending' AND attempts < 3 ORDER BY created_at ASC LIMIT 50");
$stmt->execute();
$emails = $stmt->fetchAll();

if (empty($emails)) {
    echo "No pending emails in queue.\n";
    exit(0);
}

$smtpHost = getenv('SMTP_HOST') ?: 'localhost';
$smtpUser = getenv('SMTP_USER') ?: '';
$smtpPass = getenv('SMTP_PASS') ?: '';
$smtpPort = (int)(getenv('SMTP_PORT') ?: 465);
$fromEmail = getenv('SMTP_FROM_EMAIL') ?: 'notifications@yourdomain.com';
$fromName = getenv('SMTP_FROM_NAME') ?: 'WALKIN Recruitment';

foreach ($emails as $email) {
    $sent = false;
    $errorMessage = null;

    try {
        // Standard PHP mail() or PHPMailer if vendor installed
        $headers = [
            "MIME-Version: 1.0",
            "Content-type: text/html; charset=UTF-8",
            "From: {$fromName} <{$fromEmail}>",
            "Reply-To: {$fromEmail}",
            "X-Mailer: PHP/" . phpversion()
        ];

        $sent = mail(
            $email['recipient_email'],
            $email['subject'],
            $email['body_html'],
            implode("\r\n", $headers)
        );
    } catch (Exception $e) {
        $errorMessage = $e->getMessage();
    }

    if ($sent) {
        $update = $pdo->prepare("UPDATE email_queue SET status = 'sent', sent_at = NOW(), attempts = attempts + 1 WHERE id = :id");
        $update->execute(['id' => $email['id']]);
        echo "Sent email #{$email['id']} to {$email['recipient_email']}\n";
    } else {
        $update = $pdo->prepare("UPDATE email_queue SET attempts = attempts + 1, error_message = :err WHERE id = :id");
        $update->execute(['id' => $email['id'], 'err' => $errorMessage ?: 'mail() failed to accept message']);
        echo "Failed to send email #{$email['id']}\n";
    }
}

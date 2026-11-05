<?php
/**
 * WALKIN - Platform Configuration
 * Loads environment variables, session parameters, and app settings.
 */

declare(strict_types=1);

// Load .env if present
$envPath = dirname(__DIR__) . '/.env';
if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        [$name, $value] = explode('=', $line, 2) + ['', ''];
        $name = trim($name);
        $value = trim($value, " \t\n\r\0\x0B\"'");
        if ($name) {
            putenv("{$name}={$value}");
            $_ENV[$name] = $value;
        }
    }
}

// Session security configuration
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', '1');
    ini_set('session.use_only_cookies', '1');
    ini_set('session.cookie_samesite', 'Lax');
    if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') {
        ini_set('session.cookie_secure', '1');
    }
    session_start();
}

define('APP_NAME', 'WALKIN');
define('APP_URL', getenv('APP_URL') ?: 'https://yourdomain.com');
define('STORAGE_PATH', dirname(__DIR__) . '/storage');
define('RESUME_STORAGE_PATH', STORAGE_PATH . '/resumes');

// Ensure private directories exist
if (!is_dir(RESUME_STORAGE_PATH)) {
    @mkdir(RESUME_STORAGE_PATH, 0750, true);
}

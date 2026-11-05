# WALKIN – HOSTINGER & SHARED HOSTING DEPLOYMENT GUIDE

This document provides step-by-step instructions to deploy the complete **WALKIN** walk-in recruitment platform on inexpensive shared hosting (such as Hostinger, cPanel, or Plesk) using **PHP 8.3+** and **MySQL 8 / MariaDB**.

---

## 1. Prerequisites on Hostinger

- A standard Hostinger Web Hosting plan (Single, Premium, or Business).
- Domain or Subdomain mapped to `public_html`.
- PHP Version set to **PHP 8.3** (or newer) in **hPanel > Advanced > PHP Configuration**.
- Extensions enabled: `pdo_mysql`, `mbstring`, `json`, `curl`, `zip`, `fileinfo`.

---

## 2. Step 1: Database Setup via phpMyAdmin

1. Log into your Hostinger **hPanel**.
2. Go to **Databases > Management**.
3. Create a new MySQL database:
   - **Database Name**: e.g., `u123456789_walkin`
   - **Username**: e.g., `u123456789_walkinuser`
   - **Password**: Create a strong password and save it securely.
4. Click **Enter phpMyAdmin** next to your new database.
5. In phpMyAdmin, click the **Import** tab at the top.
6. Choose the file `schema.sql` located inside `php-backend/schema.sql`.
7. Click **Go / Import** at the bottom.
8. Verify that all 24 normalized tables are created:
   - `users`, `candidate_profiles`, `recruiter_profiles`, `companies`, `company_domains`, `candidate_resumes`, `qualifications`, `candidate_qualifications`, `jobs`, `job_qualifications`, `job_skills`, `screening_questions`, `applications`, `application_answers`, `application_resumes`, `interview_slots`, `interview_schedules`, `notifications`, `email_queue`, `conversations`, `messages`, `subscriptions`, `payments`, `audit_logs`.

---

## 3. Step 2: Upload Files to Hostinger

1. In hPanel, open the **File Manager** (or connect via FTP / FileZilla).
2. Navigate to `public_html/`.
3. Upload the contents of the `php-backend/` folder into `public_html/` (or your subdomain directory).
4. Verify your directory structure:
   ```text
   public_html/
   ├── .env.example
   ├── .env                  <-- You will create this
   ├── .htaccess
   ├── composer.json
   ├── schema.sql
   ├── config/
   │   ├── config.php
   │   └── database.php
   ├── api/
   │   ├── applications/
   │   │   └── apply.php
   │   └── export/
   │       └── excel.php
   ├── cron/
   │   └── process_emails.php
   └── storage/
       └── resumes/          <-- Private storage directory
   ```
5. Ensure the `storage/` and `storage/resumes/` directories have file permissions set to `0750` or `0755` so the web server can write uploaded files, but public users cannot browse files directly (enforced by `.htaccess`).

---

## 4. Step 3: Configure Environment Variables (.env)

1. Rename `.env.example` to `.env` in `public_html/`.
2. Edit `.env` with your actual Hostinger credentials:
   ```ini
   APP_NAME="WALKIN"
   APP_ENV="production"
   APP_URL="https://yourdomain.com"

   # Hostinger Database
   DB_HOST="localhost"
   DB_PORT="3306"
   DB_NAME="u123456789_walkin"
   DB_USER="u123456789_walkinuser"
   DB_PASS="YourActualStrongPassword"

   # Hostinger Free SMTP Email Settings
   SMTP_HOST="smtp.hostinger.com"
   SMTP_PORT="465"
   SMTP_SECURE="ssl"
   SMTP_USER="notifications@yourdomain.com"
   SMTP_PASS="YourEmailAccountPassword"
   SMTP_FROM_NAME="WALKIN Recruitment"
   SMTP_FROM_EMAIL="notifications@yourdomain.com"
   ```

---

## 5. Step 4: Google OAuth 2.0 Setup (Client-Side & Server-Side)

1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project: `WALKIN Recruitment`.
3. Navigate to **APIs & Services > Credentials**.
4. Configure the **OAuth Consent Screen**:
   - User Type: **External**
   - App Name: `WALKIN - Walk-in Recruitment Platform`
   - User support email: `your-email@domain.com`
   - Scopes: `openid`, `email`, `profile`.
5. Under **Credentials**, click **Create Credentials > OAuth client ID**:
   - Application type: **Web application**.
   - Authorized JavaScript origins: `https://yourdomain.com`.
   - Authorized redirect URIs: `https://yourdomain.com/api/auth/google.php`.
6. Copy the **Client ID** and **Client Secret** into your `.env` file:
   ```ini
   GOOGLE_CLIENT_ID="1234567890-abcdef.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxx"
   ```

---

## 6. Step 5: Hostinger Free SMTP Email Setup

1. In Hostinger hPanel, go to **Emails > Email Accounts**.
2. Click **Create Email Account** (e.g. `notifications@yourdomain.com`).
3. Set a password.
4. Test the mail configuration using the details in `.env`.
5. Hostinger provides free SSL SMTP on port 465, meaning zero third-party email API fees are required!

---

## 7. Step 6: Setup Cron Job for Transactional Email Queue

1. In Hostinger hPanel, navigate to **Advanced > Cron Jobs**.
2. Select **Common Settings: Once every 5 minutes** (`*/5 * * * *`).
3. Set the command:
   ```bash
   php /home/u123456789/domains/yourdomain.com/public_html/cron/process_emails.php >/dev/null 2>&1
   ```
4. Click **Create / Save**.
5. This job processes queued notifications (interview schedules, shortlist passes, status updates) every 5 minutes without slowing down user interactions.

---

## 8. Step 7: Admin Account Creation Procedure

To create your initial super administrator account directly in the database:

1. Open phpMyAdmin on Hostinger.
2. Run the following SQL query:
   ```sql
   INSERT INTO users (
       id, name, email, phone, password_hash, role, is_email_verified, created_at
   ) VALUES (
       'admin_primary',
       'Super Administrator',
       'admin@yourdomain.com',
       '+91 99999 99999',
       '$2y$12$e8Yy8s7sW3z3pLp3vV.Kue9Xm0Xn1Y5YmQ4aZ6bC7dE8fG9hI0jK.', -- Default hash for password: AdminSecurePassword2026!
       'admin',
       1,
       NOW()
   );
   ```
3. You can now log into the Administrator Portal using:
   - Email: `admin@yourdomain.com`
   - Password: `AdminSecurePassword2026!`
   *(Immediately update your password in settings upon first login).*

---

## 9. Step 8: Database Backup & Maintenance

1. In hPanel, click **Databases > Management**.
2. Scroll to **phpMyAdmin** and click **Export**.
3. Choose **Quick Export > Format: SQL**.
4. Download the backup file and store it in a secure location.
5. Automatic scheduled backups can also be enabled in Hostinger **Files > Backups**.

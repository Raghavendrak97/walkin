-- =====================================================================
-- WALKIN - Complete MySQL 8 Database Schema
-- Dedicated Walk-in Recruitment Platform
-- Deployable on Hostinger / cPanel Shared Hosting (MySQL 8 / MariaDB 10.5+)
-- =====================================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS conversations;
DROP TABLE IF EXISTS email_queue;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS interview_schedules;
DROP TABLE IF EXISTS interview_slots;
DROP TABLE IF EXISTS application_resumes;
DROP TABLE IF EXISTS application_answers;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS screening_questions;
DROP TABLE IF EXISTS job_skills;
DROP TABLE IF EXISTS job_qualifications;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS candidate_qualifications;
DROP TABLE IF EXISTS qualifications;
DROP TABLE IF EXISTS candidate_resumes;
DROP TABLE IF EXISTS company_domains;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS recruiter_profiles;
DROP TABLE IF EXISTS candidate_profiles;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users Table
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    phone VARCHAR(25) NOT NULL,
    password_hash VARCHAR(255) NULL,
    google_id VARCHAR(128) NULL UNIQUE,
    role ENUM('candidate', 'recruiter', 'admin') NOT NULL,
    avatar_url VARCHAR(255) NULL,
    is_email_verified TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_role (role),
    INDEX idx_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Companies Table
CREATE TABLE companies (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(180) NOT NULL,
    logo_url VARCHAR(255) NULL,
    description TEXT NULL,
    website VARCHAR(255) NOT NULL,
    company_linkedin VARCHAR(255) NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    industry VARCHAR(120) NOT NULL,
    company_size VARCHAR(60) NOT NULL,
    is_verified TINYINT(1) DEFAULT 0,
    official_domain VARCHAR(100) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_comp_verified (is_verified),
    INDEX idx_comp_city (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Company Authorized Domains
CREATE TABLE company_domains (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id VARCHAR(64) NOT NULL,
    domain VARCHAR(120) NOT NULL,
    is_primary TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE KEY uq_comp_domain (company_id, domain)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Candidate Profiles
CREATE TABLE candidate_profiles (
    user_id VARCHAR(64) PRIMARY KEY,
    current_qualification VARCHAR(120) NOT NULL,
    experience_years DECIMAL(4,1) DEFAULT 0,
    current_city VARCHAR(100) NOT NULL,
    bio TEXT NULL,
    is_premium TINYINT(1) DEFAULT 0,
    premium_expires_at DATETIME NULL,
    application_credits INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Recruiter Profiles
CREATE TABLE recruiter_profiles (
    user_id VARCHAR(64) PRIMARY KEY,
    company_id VARCHAR(64) NOT NULL,
    designation VARCHAR(120) NOT NULL,
    official_company_email VARCHAR(191) NOT NULL UNIQUE,
    recruiter_linkedin VARCHAR(255) NOT NULL,
    verification_status ENUM('pending', 'verified', 'rejected', 'suspended') DEFAULT 'pending',
    rejection_reason TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE RESTRICT,
    INDEX idx_rec_status (verification_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Candidate Resumes (Multiple Resumes Support)
CREATE TABLE candidate_resumes (
    id VARCHAR(64) PRIMARY KEY,
    candidate_id VARCHAR(64) NOT NULL,
    name VARCHAR(150) NOT NULL,
    file_path VARCHAR(255) NOT NULL, -- Private secure storage path
    file_name VARCHAR(150) NOT NULL,
    file_size_kb INT NOT NULL,
    file_type VARCHAR(60) NOT NULL,
    is_default TINYINT(1) DEFAULT 0,
    content_snippet TEXT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_res_cand (candidate_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Qualifications Master Table
CREATE TABLE qualifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    degree_name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(60) NULL,
    is_custom TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Candidate Qualifications
CREATE TABLE candidate_qualifications (
    candidate_id VARCHAR(64) NOT NULL,
    qualification_name VARCHAR(100) NOT NULL,
    passing_year INT NULL,
    percentage_or_cgpa VARCHAR(20) NULL,
    PRIMARY KEY (candidate_id, qualification_name),
    FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Jobs / Walk-In Vacancies
CREATE TABLE jobs (
    id VARCHAR(64) PRIMARY KEY,
    recruiter_id VARCHAR(64) NOT NULL,
    company_id VARCHAR(64) NOT NULL,
    title VARCHAR(200) NOT NULL,
    department VARCHAR(120) NOT NULL,
    job_description TEXT NOT NULL,
    exp_min_years INT DEFAULT 0,
    exp_max_years INT DEFAULT 1,
    openings INT DEFAULT 1,
    salary_min INT DEFAULT 0,
    salary_max INT DEFAULT 0,
    salary_period ENUM('month', 'year') DEFAULT 'year',
    city VARCHAR(100) NOT NULL,
    locality VARCHAR(120) NOT NULL,
    work_location ENUM('On-site', 'Hybrid') DEFAULT 'On-site',
    application_deadline DATE NOT NULL,
    
    -- Employment category
    employment_category ENUM('direct_company_payroll', 'third_party_payroll', 'contractual') NOT NULL,
    staffing_agency_name VARCHAR(150) NULL,
    actual_client_name VARCHAR(150) NULL,
    client_work_location VARCHAR(200) NULL,

    -- Walk-In Mode & Venue Settings
    walk_in_mode ENUM('candidate_selected', 'open_walkin') NOT NULL,
    venue_name VARCHAR(255) NOT NULL,
    full_address TEXT NOT NULL,
    google_maps_url TEXT NOT NULL,
    interview_date_start DATE NOT NULL,
    interview_date_end DATE NOT NULL,
    daily_start_time VARCHAR(20) NOT NULL,
    daily_end_time VARCHAR(20) NOT NULL,
    instructions TEXT NULL,
    required_documents TEXT NULL,

    status ENUM('active', 'closed', 'draft', 'flagged') DEFAULT 'active',
    views_count INT DEFAULT 0,
    applications_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE RESTRICT,
    INDEX idx_job_status (status),
    INDEX idx_job_city (city),
    INDEX idx_job_mode (walk_in_mode),
    FULLTEXT KEY ft_job_search (title, job_description, city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Job Qualifications (Many-to-Many)
CREATE TABLE job_qualifications (
    job_id VARCHAR(64) NOT NULL,
    degree_name VARCHAR(100) NOT NULL,
    PRIMARY KEY (job_id, degree_name),
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    INDEX idx_deg (degree_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Job Skills
CREATE TABLE job_skills (
    job_id VARCHAR(64) NOT NULL,
    skill_name VARCHAR(80) NOT NULL,
    PRIMARY KEY (job_id, skill_name),
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Screening Questions (MANDATORY EXACTLY 3 PER JOB)
CREATE TABLE screening_questions (
    id VARCHAR(64) PRIMARY KEY,
    job_id VARCHAR(64) NOT NULL,
    question_text VARCHAR(255) NOT NULL,
    question_order TINYINT NOT NULL CHECK (question_order IN (1, 2, 3)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    UNIQUE KEY uq_job_order (job_id, question_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Applications
CREATE TABLE applications (
    id VARCHAR(64) PRIMARY KEY,
    job_id VARCHAR(64) NOT NULL,
    candidate_id VARCHAR(64) NOT NULL,
    recruiter_id VARCHAR(64) NOT NULL,
    company_id VARCHAR(64) NOT NULL,
    resume_id VARCHAR(64) NOT NULL,
    status ENUM('applied', 'viewed', 'shortlisted', 'rejected', 'interview_scheduled', 'selected', 'not_attended', 'withdrawn') DEFAULT 'applied',
    is_venue_unlocked TINYINT(1) DEFAULT 0,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE RESTRICT,
    FOREIGN KEY (resume_id) REFERENCES candidate_resumes(id) ON DELETE RESTRICT,
    UNIQUE KEY uq_cand_job (candidate_id, job_id),
    INDEX idx_app_status (status),
    INDEX idx_app_month (candidate_id, applied_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Application Answers (Strictly 1 to 3 words)
CREATE TABLE application_answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id VARCHAR(64) NOT NULL,
    question_id VARCHAR(64) NOT NULL,
    question_text VARCHAR(255) NOT NULL,
    answer_text VARCHAR(150) NOT NULL,
    word_count TINYINT NOT NULL CHECK (word_count BETWEEN 1 AND 3),
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES screening_questions(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Application Resume Immutable Snapshot
CREATE TABLE application_resumes (
    application_id VARCHAR(64) PRIMARY KEY,
    original_resume_id VARCHAR(64) NOT NULL,
    snapshot_file_name VARCHAR(150) NOT NULL,
    snapshot_path VARCHAR(255) NOT NULL,
    content_snippet TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. Interview Capacity Slots
CREATE TABLE interview_slots (
    id VARCHAR(64) PRIMARY KEY,
    job_id VARCHAR(64) NOT NULL,
    slot_date DATE NOT NULL,
    start_time VARCHAR(20) NOT NULL,
    end_time VARCHAR(20) NOT NULL,
    capacity INT DEFAULT 5,
    booked_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. Interview Schedules (Assigned to Candidates)
CREATE TABLE interview_schedules (
    id VARCHAR(64) PRIMARY KEY,
    application_id VARCHAR(64) NOT NULL UNIQUE,
    job_id VARCHAR(64) NOT NULL,
    candidate_id VARCHAR(64) NOT NULL,
    recruiter_id VARCHAR(64) NOT NULL,
    slot_id VARCHAR(64) NULL,
    interview_date DATE NOT NULL,
    interview_time VARCHAR(20) NOT NULL,
    round_name VARCHAR(150) NOT NULL,
    interviewer_name VARCHAR(150) NOT NULL,
    instructions TEXT NULL,
    attendance_status ENUM('scheduled', 'attended', 'absent', 'selected', 'on_hold') DEFAULT 'scheduled',
    notes TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (slot_id) REFERENCES interview_slots(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. Notifications Table
CREATE TABLE notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    type VARCHAR(60) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(255) NULL,
    is_read TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notif_user (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. Email Delivery Queue (Hosting SMTP)
CREATE TABLE email_queue (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipient_email VARCHAR(191) NOT NULL,
    recipient_name VARCHAR(150) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    body_html TEXT NOT NULL,
    status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
    attempts TINYINT DEFAULT 0,
    error_message TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    sent_at DATETIME NULL,
    INDEX idx_queue_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. Conversations
CREATE TABLE conversations (
    id VARCHAR(64) PRIMARY KEY,
    job_id VARCHAR(64) NOT NULL,
    candidate_id VARCHAR(64) NOT NULL,
    recruiter_id VARCHAR(64) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_conv (job_id, candidate_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. Messages
CREATE TABLE messages (
    id VARCHAR(64) PRIMARY KEY,
    conversation_id VARCHAR(64) NOT NULL,
    sender_id VARCHAR(64) NOT NULL,
    message_text TEXT NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 22. Subscriptions
CREATE TABLE subscriptions (
    id VARCHAR(64) PRIMARY KEY,
    candidate_id VARCHAR(64) NOT NULL,
    plan_name VARCHAR(80) NOT NULL,
    amount_inr DECIMAL(10,2) NOT NULL,
    status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 23. Payments
CREATE TABLE payments (
    id VARCHAR(64) PRIMARY KEY,
    candidate_id VARCHAR(64) NOT NULL,
    amount_inr DECIMAL(10,2) NOT NULL,
    gateway_reference VARCHAR(120) NULL,
    status ENUM('success', 'pending', 'failed') DEFAULT 'success',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 24. Audit Logs
CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(64) NULL,
    user_name VARCHAR(150) NULL,
    user_role VARCHAR(40) NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT NULL,
    ip_address VARCHAR(45) NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_log_action (action),
    INDEX idx_log_time (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- SEED INITIAL MASTER DATA
-- =====================================================================

INSERT INTO qualifications (degree_name, category) VALUES
('B.Tech', 'Engineering'),
('B.E.', 'Engineering'),
('B.Com', 'Commerce'),
('B.Sc', 'Science'),
('B.A.', 'Arts'),
('BBA', 'Management'),
('MBA', 'Management'),
('B.Pharm', 'Pharmacy'),
('M.Pharm', 'Pharmacy'),
('Pharm.D', 'Pharmacy'),
('D.Pharm', 'Pharmacy'),
('M.Sc', 'Science'),
('M.Com', 'Commerce'),
('MCA', 'Computer Applications'),
('BCA', 'Computer Applications'),
('Diploma', 'Vocational'),
('Any Degree', 'General');

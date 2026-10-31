-- ==============================================================================
-- 🏥 AegisGlobal: Master Database Migration & Realistic Sample Data
-- Target: Supabase SQL Editor / PostgreSQL 14+
-- ==============================================================================

-- 1. Create Base Tables
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    password_hash VARCHAR(255),
    role VARCHAR(50) DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'admin')),
    is_premium BOOLEAN DEFAULT FALSE,
    referral_code VARCHAR(50) UNIQUE,
    referral_count INT DEFAULT 0,
    referred_by VARCHAR(50),
    wallet_balance NUMERIC(10, 2) DEFAULT 0.00,
    reset_otp VARCHAR(10),
    reset_otp_expiry TIMESTAMP,
    subscription_end_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS doctors (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    full_name VARCHAR(255),
    specialization VARCHAR(255) DEFAULT 'General Physician',
    experience_years INT DEFAULT 0,
    consultation_fee NUMERIC(10, 2) DEFAULT 0.00,
    phone_number VARCHAR(20),
    bio TEXT,
    address TEXT,
    availability TEXT,
    is_emergency BOOLEAN DEFAULT FALSE,
    is_emergency_active BOOLEAN DEFAULT FALSE,
    is_online BOOLEAN DEFAULT TRUE,
    warning_count INT DEFAULT 0,
    reliability_score NUMERIC(5, 2) DEFAULT 100.00,
    total_revenue NUMERIC(10, 2) DEFAULT 0.00,
    wallet_balance NUMERIC(10, 2) DEFAULT 0.00,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    full_name VARCHAR(255),
    phone_number VARCHAR(20),
    address TEXT,
    dob DATE,
    gender VARCHAR(20),
    blood_group VARCHAR(10),
    medical_history TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id INT REFERENCES doctors(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Completed', 'Cancelled', 'Expired', 'Rescheduled')),
    is_emergency BOOLEAN DEFAULT FALSE,
    penalty_applied BOOLEAN DEFAULT FALSE,
    timeout_at TIMESTAMP,
    responded_at TIMESTAMP,
    response_time_seconds INT,
    rejection_reason TEXT,
    reassigned_from INT,
    reassignment_count INT DEFAULT 0,
    meeting_link VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prescriptions (
    id SERIAL PRIMARY KEY,
    appointment_id INT REFERENCES appointments(id) ON DELETE CASCADE,
    doctor_id INT REFERENCES doctors(id) ON DELETE CASCADE,
    patient_id INT REFERENCES patients(id) ON DELETE CASCADE,
    medicines TEXT,
    instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS medical_records (
    id SERIAL PRIMARY KEY,
    appointment_id INT REFERENCES appointments(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    remarks TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    appointment_id INT REFERENCES appointments(id) ON DELETE CASCADE,
    doctor_id INT REFERENCES doctors(id) ON DELETE CASCADE,
    patient_id INT REFERENCES patients(id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('credit','debit','penalty','refund','consultation','referral_bonus','subscription')),
    amount NUMERIC(10,2) NOT NULL,
    balance_after NUMERIC(10,2) NOT NULL,
    description TEXT,
    reference_id INT,
    reference_type VARCHAR(50),
    created_by VARCHAR(50) DEFAULT 'system',
    reversible BOOLEAN DEFAULT FALSE,
    reversed BOOLEAN DEFAULT FALSE,
    reversed_by INT REFERENCES users(id),
    reversed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS emergency_violations (
    id SERIAL PRIMARY KEY,
    doctor_id INT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    appointment_id INT NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    violation_type VARCHAR(50) NOT NULL CHECK (violation_type IN ('timeout','rejection')),
    response_time_seconds INT,
    penalty_amount NUMERIC(10,2) DEFAULT 0,
    warning_count_at_time INT DEFAULT 0,
    rejection_reason TEXT,
    action_taken VARCHAR(50) CHECK (action_taken IN ('warning','penalty')),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS doctor_metrics (
    id SERIAL PRIMARY KEY,
    doctor_id INT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE UNIQUE,
    total_emergency_requests INT DEFAULT 0,
    accepted_count INT DEFAULT 0,
    rejected_count INT DEFAULT 0,
    timeout_count INT DEFAULT 0,
    avg_response_time_seconds NUMERIC(10,2) DEFAULT 0,
    response_rate_percentage NUMERIC(5,2) DEFAULT 100,
    reliability_score NUMERIC(5,2) DEFAULT 100,
    total_penalties INT DEFAULT 0,
    total_penalty_amount NUMERIC(10,2) DEFAULT 0,
    warning_count INT DEFAULT 0,
    last_violation_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low','normal','urgent')),
    data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_conversations (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) DEFAULT 'New Conversation',
    is_pinned BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_messages (
    id SERIAL PRIMARY KEY,
    conversation_id INT NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role VARCHAR(10) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_usage (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
    message_count INT DEFAULT 0,
    UNIQUE(user_id, usage_date)
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_session_id VARCHAR(255),
    plan_type VARCHAR(20) NOT NULL CHECK (plan_type IN ('monthly', 'annual')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
    amount NUMERIC(10,2) NOT NULL,
    starts_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    cancelled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_emergency ON appointments(is_emergency, status);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);

-- ==============================================================================
-- 2. Populate Realistic Sample Data (Password for all: Test@123)
-- ==============================================================================

-- Sample Users
INSERT INTO users (id, email, full_name, password_hash, role, is_premium, referral_code, wallet_balance)
VALUES
  (1, 'admin@aegisglobal.org', 'Director General UNESCO Care', '$2a$10$nH09p7UvgMV4Farv09Jks.nl4b7uVAO4qhPyXMSaUGdQMwVLTlteS', 'admin', true, 'AEGIS-ADMIN', 100000.00),
  (2, 'patient@aegisglobal.org', 'Elena Rostova', '$2a$10$nH09p7UvgMV4Farv09Jks.nl4b7uVAO4qhPyXMSaUGdQMwVLTlteS', 'patient', true, 'AEGIS-PAT01', 3500.00),
  (3, 'patient2@aegisglobal.org', 'David Miller', '$2a$10$nH09p7UvgMV4Farv09Jks.nl4b7uVAO4qhPyXMSaUGdQMwVLTlteS', 'patient', false, 'AEGIS-PAT02', 800.00),
  (4, 'dr.elena@aegisglobal.org', 'Dr. Elena Vance', '$2a$10$nH09p7UvgMV4Farv09Jks.nl4b7uVAO4qhPyXMSaUGdQMwVLTlteS', 'doctor', true, 'AEGIS-DOC01', 12500.00),
  (5, 'dr.marcus@aegisglobal.org', 'Dr. Marcus Brody', '$2a$10$nH09p7UvgMV4Farv09Jks.nl4b7uVAO4qhPyXMSaUGdQMwVLTlteS', 'doctor', true, 'AEGIS-DOC02', 8900.00),
  (6, 'dr.sophia@aegisglobal.org', 'Dr. Sophia Chen', '$2a$10$nH09p7UvgMV4Farv09Jks.nl4b7uVAO4qhPyXMSaUGdQMwVLTlteS', 'doctor', true, 'AEGIS-DOC03', 14200.00),
  (7, 'dr.aravind@aegisglobal.org', 'Dr. Aravind Menon', '$2a$10$nH09p7UvgMV4Farv09Jks.nl4b7uVAO4qhPyXMSaUGdQMwVLTlteS', 'doctor', true, 'AEGIS-DOC04', 6400.00),
  (8, 'dr.amara@aegisglobal.org', 'Dr. Amara Okafor', '$2a$10$nH09p7UvgMV4Farv09Jks.nl4b7uVAO4qhPyXMSaUGdQMwVLTlteS', 'doctor', true, 'AEGIS-DOC05', 9800.00)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  is_premium = EXCLUDED.is_premium,
  wallet_balance = EXCLUDED.wallet_balance;

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- Sample Doctors
INSERT INTO doctors (id, user_id, full_name, specialization, experience_years, consultation_fee, phone_number, bio, address, availability, is_emergency, is_emergency_active, reliability_score)
VALUES
  (1, 4, 'Dr. Elena Vance', 'Cardiology', 14, 1200.00, '+1 (555) 234-5678', 'UNESCO Global Fellow in Preventive Cardiology. Pioneer in non-invasive telemetry and arrhythmia stabilization.', 'Geneva Global Medical Hub, Suite 402', 'Mon - Fri: 09:00 AM - 05:00 PM', true, true, 98.50),
  (2, 5, 'Dr. Marcus Brody', 'Neurology', 18, 1500.00, '+1 (555) 345-6789', 'Senior Neurologist specializing in neurodegenerative rehabilitation and cognitive health protocols.', 'Zurich Neuroscience Institute, Wing B', 'Tue - Sat: 10:00 AM - 06:00 PM', true, true, 96.00),
  (3, 6, 'Dr. Sophia Chen', 'Pediatrics', 9, 800.00, '+1 (555) 456-7890', 'Chief of Pediatric Care for underserved cross-border communities. Advocate for universal child immunization.', 'Singapore Regional Health Campus', 'Mon - Thu: 08:30 AM - 03:30 PM', false, false, 99.20),
  (4, 7, 'Dr. Aravind Menon', 'General Physician', 12, 500.00, '+1 (555) 567-8901', 'Comprehensive internal medicine consultant with 10,000+ completed humanitarian telemedicine sessions.', 'UNESCO Care Complex, Sector 12', 'Daily: 08:00 AM - 08:00 PM', true, true, 100.00),
  (5, 8, 'Dr. Amara Okafor', 'Emergency Medicine', 15, 1100.00, '+1 (555) 678-9012', 'Lead Trauma & Emergency Response Surgeon. Enforces 10-minute rapid triage response SLA across the global network.', 'International Crisis Center, Trauma Unit', '24/7 On-Call Emergency Responder', true, true, 97.80)
ON CONFLICT (id) DO UPDATE SET
  specialization = EXCLUDED.specialization,
  consultation_fee = EXCLUDED.consultation_fee,
  is_emergency = EXCLUDED.is_emergency,
  is_emergency_active = EXCLUDED.is_emergency_active,
  reliability_score = EXCLUDED.reliability_score;

SELECT setval('doctors_id_seq', (SELECT MAX(id) FROM doctors));

-- Doctor Metrics
INSERT INTO doctor_metrics (doctor_id, total_emergency_requests, accepted_count, avg_response_time_seconds, reliability_score)
VALUES
  (1, 24, 23, 142.50, 98.50),
  (2, 19, 18, 160.00, 96.00),
  (3, 5, 5, 120.00, 99.20),
  (4, 45, 45, 110.00, 100.00),
  (5, 52, 50, 95.00, 97.80)
ON CONFLICT (doctor_id) DO UPDATE SET
  reliability_score = EXCLUDED.reliability_score;

-- Sample Patients
INSERT INTO patients (id, user_id, full_name, phone_number, address, dob, gender, blood_group, medical_history)
VALUES
  (1, 2, 'Elena Rostova', '+1 (555) 901-2345', '742 Evergreen Terrace', '1992-05-14', 'Female', 'O+', 'Mild Hypertension, Penicillin allergy'),
  (2, 3, 'David Miller', '+1 (555) 902-3456', '124 Horizon Blvd', '1988-11-20', 'Male', 'A+', 'Type 2 Diabetes controlled with Metformin')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

SELECT setval('patients_id_seq', (SELECT MAX(id) FROM patients));

-- Sample Appointments
INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, appointment_time, status, is_emergency, meeting_link)
VALUES
  (1, 1, 1, CURRENT_DATE, '10:00:00', 'Confirmed', false, 'https://meet.jit.si/AegisGlobal-Consult-401'),
  (2, 1, 5, CURRENT_DATE, '14:30:00', 'Confirmed', true, 'https://meet.jit.si/AegisGlobal-Emergency-SOS-77'),
  (3, 2, 4, CURRENT_DATE, '11:15:00', 'Completed', false, NULL)
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;

SELECT setval('appointments_id_seq', (SELECT MAX(id) FROM appointments));

-- Sample Prescriptions
INSERT INTO prescriptions (id, appointment_id, doctor_id, patient_id, medicines, instructions)
VALUES
  (1, 3, 4, 2, 'Amlodipine 5mg (Once daily morning), Omega-3 Fatty Acids 1000mg', 'Check BP daily at 9am. Reduce dietary sodium intake. Follow up in 30 days.')
ON CONFLICT (id) DO NOTHING;

SELECT setval('prescriptions_id_seq', (SELECT MAX(id) FROM prescriptions));

-- Sample Reviews
INSERT INTO reviews (id, appointment_id, doctor_id, patient_id, rating, comment)
VALUES
  (1, 3, 4, 2, 5, 'Dr. Aravind is exceptionally attentive and provided crystal-clear guidance on my metabolic plan.'),
  (2, 2, 5, 1, 5, 'Immediate connection and calm expertise during the emergency consult. Lifesaving service.')
ON CONFLICT (id) DO NOTHING;

SELECT setval('reviews_id_seq', (SELECT MAX(id) FROM reviews));

-- Sample Transactions
INSERT INTO transactions (id, user_id, type, amount, balance_after, description)
VALUES
  (1, 2, 'credit', 2000.00, 3500.00, 'Elite Membership Health Credits Added'),
  (2, 2, 'consultation', -500.00, 3000.00, 'Consultation fee paid to Dr. Aravind Menon'),
  (3, 7, 'consultation', 500.00, 6400.00, 'Consultation payout received from Patient David Miller')
ON CONFLICT (id) DO NOTHING;

SELECT setval('transactions_id_seq', (SELECT MAX(id) FROM transactions));

-- Sample Notifications
INSERT INTO notifications (id, user_id, type, title, message, priority)
VALUES
  (1, 2, 'welcome', 'Welcome to AegisGlobal UNESCO Network', 'Your humanitarian telemedicine account is active with 24/7 AI Triage enabled.', 'normal'),
  (2, 2, 'appointment_confirmed', 'Consultation Confirmed', 'Dr. Elena Vance has confirmed your session for today at 10:00 AM.', 'urgent'),
  (3, 4, 'emergency_alert', 'Emergency Network Online', 'You are designated as an active Level-1 Rapid Emergency Responder.', 'urgent')
ON CONFLICT (id) DO NOTHING;

SELECT setval('notifications_id_seq', (SELECT MAX(id) FROM notifications));

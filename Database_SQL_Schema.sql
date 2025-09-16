-- Employee Management System Database Schema
-- PostgreSQL 15+ Compatible
-- Created: 2024

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('HR_ADMIN', 'MANAGER', 'EMPLOYEE');
CREATE TYPE gender_type AS ENUM ('MALE', 'FEMALE', 'OTHER');
CREATE TYPE marital_status_type AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED');
CREATE TYPE employment_status_type AS ENUM ('ACTIVE', 'INACTIVE', 'TERMINATED', 'ON_LEAVE');
CREATE TYPE attendance_status_type AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'WORK_FROM_HOME');
CREATE TYPE timeoff_type AS ENUM ('VACATION', 'SICK_LEAVE', 'PERSONAL', 'MATERNITY', 'PATERNITY', 'BEREAVEMENT', 'OTHER');
CREATE TYPE request_status_type AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
CREATE TYPE review_status_type AS ENUM ('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED');
CREATE TYPE salary_type AS ENUM ('BASE', 'BONUS', 'RAISE', 'ADJUSTMENT');
CREATE TYPE document_type AS ENUM ('CONTRACT', 'ID', 'CERTIFICATE', 'EVALUATION', 'OTHER');
CREATE TYPE notification_type AS ENUM ('INFO', 'WARNING', 'ERROR', 'SUCCESS');

-- =============================================
-- CORE TABLES
-- =============================================

-- Users table (Authentication and authorization)
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Departments table
CREATE TABLE departments (
    department_id SERIAL PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL,
    department_code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    parent_department_id INTEGER REFERENCES departments(department_id),
    manager_id INTEGER, -- Will be set after employees table is created
    budget DECIMAL(15,2),
    location VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Positions table
CREATE TABLE positions (
    position_id SERIAL PRIMARY KEY,
    position_title VARCHAR(100) NOT NULL,
    position_code VARCHAR(20) UNIQUE NOT NULL,
    department_id INTEGER REFERENCES departments(department_id),
    job_description TEXT,
    requirements TEXT,
    min_salary DECIMAL(10,2),
    max_salary DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employees table
CREATE TABLE employees (
    employee_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    employee_number VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    middle_name VARCHAR(50),
    date_of_birth DATE,
    gender gender_type,
    marital_status marital_status_type,
    nationality VARCHAR(50),
    ssn VARCHAR(20) UNIQUE,
    phone VARCHAR(20),
    personal_email VARCHAR(100),
    address_line1 VARCHAR(100),
    address_line2 VARCHAR(100),
    city VARCHAR(50),
    state VARCHAR(50),
    postal_code VARCHAR(20),
    country VARCHAR(50),
    hire_date DATE NOT NULL,
    termination_date DATE,
    employment_status employment_status_type NOT NULL DEFAULT 'ACTIVE',
    department_id INTEGER REFERENCES departments(department_id),
    position_id INTEGER REFERENCES positions(position_id),
    manager_id INTEGER, -- Self-referencing foreign key
    salary DECIMAL(10,2),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Add self-referencing foreign key constraint
    CONSTRAINT fk_employees_manager FOREIGN KEY (manager_id) REFERENCES employees(employee_id)
);

-- Update departments table to reference employees
ALTER TABLE departments ADD CONSTRAINT fk_departments_manager 
FOREIGN KEY (manager_id) REFERENCES employees(employee_id);

-- =============================================
-- ATTENDANCE AND TIME MANAGEMENT
-- =============================================

-- Attendance records table
CREATE TABLE attendance_records (
    attendance_id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(employee_id),
    attendance_date DATE NOT NULL,
    check_in_time TIMESTAMP,
    check_out_time TIMESTAMP,
    total_hours DECIMAL(4,2) GENERATED ALWAYS AS (
        CASE 
            WHEN check_in_time IS NOT NULL AND check_out_time IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (check_out_time - check_in_time)) / 3600
            ELSE 0
        END
    ) STORED,
    overtime_hours DECIMAL(4,2) DEFAULT 0,
    status attendance_status_type DEFAULT 'PRESENT',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one record per employee per day
    UNIQUE(employee_id, attendance_date)
);

-- Time-off requests table
CREATE TABLE time_off_requests (
    request_id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(employee_id),
    request_type timeoff_type NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days DECIMAL(4,2) NOT NULL,
    reason TEXT,
    status request_status_type DEFAULT 'PENDING',
    requested_by INTEGER REFERENCES employees(employee_id),
    approved_by INTEGER REFERENCES employees(employee_id),
    approval_date TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure valid date range
    CONSTRAINT chk_timeoff_dates CHECK (end_date >= start_date),
    -- Ensure positive total days
    CONSTRAINT chk_timeoff_days CHECK (total_days > 0)
);

-- =============================================
-- PERFORMANCE AND COMPENSATION
-- =============================================

-- Performance reviews table
CREATE TABLE performance_reviews (
    review_id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(employee_id),
    reviewer_id INTEGER REFERENCES employees(employee_id),
    review_period_start DATE NOT NULL,
    review_period_end DATE NOT NULL,
    overall_rating DECIMAL(3,2) CHECK (overall_rating >= 0 AND overall_rating <= 5),
    goals_achieved INTEGER DEFAULT 0,
    goals_total INTEGER DEFAULT 0,
    strengths TEXT,
    areas_for_improvement TEXT,
    development_plan TEXT,
    next_review_date DATE,
    status review_status_type DEFAULT 'DRAFT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure valid date range
    CONSTRAINT chk_review_dates CHECK (review_period_end >= review_period_start),
    -- Ensure goals are valid
    CONSTRAINT chk_review_goals CHECK (goals_achieved >= 0 AND goals_total >= 0 AND goals_achieved <= goals_total)
);

-- Salary history table
CREATE TABLE salary_history (
    salary_id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(employee_id),
    salary_amount DECIMAL(10,2) NOT NULL,
    effective_date DATE NOT NULL,
    end_date DATE,
    salary_type salary_type NOT NULL,
    reason TEXT,
    approved_by INTEGER REFERENCES employees(employee_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure valid date range
    CONSTRAINT chk_salary_dates CHECK (end_date IS NULL OR end_date >= effective_date),
    -- Ensure positive salary
    CONSTRAINT chk_salary_amount CHECK (salary_amount > 0)
);

-- =============================================
-- SUPPORTING TABLES
-- =============================================

-- Emergency contacts table
CREATE TABLE emergency_contacts (
    contact_id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(employee_id),
    contact_name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    address TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documents table
CREATE TABLE documents (
    document_id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(employee_id),
    document_name VARCHAR(200) NOT NULL,
    document_type document_type NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_by INTEGER REFERENCES employees(employee_id),
    is_confidential BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure positive file size
    CONSTRAINT chk_document_size CHECK (file_size > 0)
);

-- Notifications table
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    notification_type notification_type DEFAULT 'INFO',
    is_read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs table
CREATE TABLE audit_logs (
    log_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Users table indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- Employees table indexes
CREATE INDEX idx_employees_employee_number ON employees(employee_number);
CREATE INDEX idx_employees_department ON employees(department_id);
CREATE INDEX idx_employees_position ON employees(position_id);
CREATE INDEX idx_employees_manager ON employees(manager_id);
CREATE INDEX idx_employees_status ON employees(employment_status);
CREATE INDEX idx_employees_hire_date ON employees(hire_date);
CREATE INDEX idx_employees_name ON employees(last_name, first_name);

-- Departments table indexes
CREATE INDEX idx_departments_code ON departments(department_code);
CREATE INDEX idx_departments_parent ON departments(parent_department_id);
CREATE INDEX idx_departments_manager ON departments(manager_id);
CREATE INDEX idx_departments_active ON departments(is_active);

-- Positions table indexes
CREATE INDEX idx_positions_code ON positions(position_code);
CREATE INDEX idx_positions_department ON positions(department_id);
CREATE INDEX idx_positions_active ON positions(is_active);

-- Attendance records indexes
CREATE INDEX idx_attendance_employee_date ON attendance_records(employee_id, attendance_date);
CREATE INDEX idx_attendance_date ON attendance_records(attendance_date);
CREATE INDEX idx_attendance_status ON attendance_records(status);

-- Time-off requests indexes
CREATE INDEX idx_timeoff_employee ON time_off_requests(employee_id);
CREATE INDEX idx_timeoff_status ON time_off_requests(status);
CREATE INDEX idx_timeoff_dates ON time_off_requests(start_date, end_date);
CREATE INDEX idx_timeoff_type ON time_off_requests(request_type);

-- Performance reviews indexes
CREATE INDEX idx_reviews_employee ON performance_reviews(employee_id);
CREATE INDEX idx_reviews_reviewer ON performance_reviews(reviewer_id);
CREATE INDEX idx_reviews_period ON performance_reviews(review_period_start, review_period_end);
CREATE INDEX idx_reviews_status ON performance_reviews(status);

-- Salary history indexes
CREATE INDEX idx_salary_employee ON salary_history(employee_id);
CREATE INDEX idx_salary_dates ON salary_history(effective_date, end_date);
CREATE INDEX idx_salary_type ON salary_history(salary_type);

-- Emergency contacts indexes
CREATE INDEX idx_emergency_employee ON emergency_contacts(employee_id);
CREATE INDEX idx_emergency_primary ON emergency_contacts(is_primary);

-- Documents indexes
CREATE INDEX idx_documents_employee ON documents(employee_id);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);

-- Notifications indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- Audit logs indexes
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_table ON audit_logs(table_name);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- =============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON positions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timeoff_updated_at BEFORE UPDATE ON time_off_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON performance_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emergency_updated_at BEFORE UPDATE ON emergency_contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on sensitive tables
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Ensure application roles exist (create if missing)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'hr_admin') THEN
        CREATE ROLE hr_admin;
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'manager') THEN
        CREATE ROLE manager;
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'employee') THEN
        CREATE ROLE employee;
    END IF;
END
$$;

-- Create policies for different user roles
-- Note: These are basic policies - implement proper user context in application

-- HR Admins can see all data
CREATE POLICY hr_admin_all_access ON employees
    FOR ALL TO hr_admin USING (true);

CREATE POLICY hr_admin_salary_access ON salary_history
    FOR ALL TO hr_admin USING (true);

CREATE POLICY hr_admin_reviews_access ON performance_reviews
    FOR ALL TO hr_admin USING (true);

CREATE POLICY hr_admin_documents_access ON documents
    FOR ALL TO hr_admin USING (true);

CREATE POLICY hr_admin_emergency_access ON emergency_contacts
    FOR ALL TO hr_admin USING (true);

-- Managers can see their team
CREATE POLICY manager_team_access ON employees
    FOR ALL TO manager USING (
        manager_id = current_setting('app.current_user_id')::INTEGER 
        OR employee_id = current_setting('app.current_user_id')::INTEGER
    );

-- Employees can only see their own data
CREATE POLICY employee_self_access ON employees
    FOR ALL TO employee USING (
        employee_id = current_setting('app.current_user_id')::INTEGER
    );

CREATE POLICY employee_self_salary_access ON salary_history
    FOR ALL TO employee USING (
        employee_id = current_setting('app.current_user_id')::INTEGER
    );

CREATE POLICY employee_self_reviews_access ON performance_reviews
    FOR ALL TO employee USING (
        employee_id = current_setting('app.current_user_id')::INTEGER
    );

CREATE POLICY employee_self_documents_access ON documents
    FOR ALL TO employee USING (
        employee_id = current_setting('app.current_user_id')::INTEGER
    );

CREATE POLICY employee_self_emergency_access ON emergency_contacts
    FOR ALL TO employee USING (
        employee_id = current_setting('app.current_user_id')::INTEGER
    );

-- =============================================
-- SAMPLE DATA (Optional - for testing)
-- =============================================

-- Insert sample departments
INSERT INTO departments (department_name, department_code, description, budget, location) VALUES
('Human Resources', 'HR', 'Human Resources Department', 500000.00, 'Main Office'),
('Information Technology', 'IT', 'IT Department', 750000.00, 'Tech Building'),
('Finance', 'FIN', 'Finance Department', 400000.00, 'Main Office'),
('Marketing', 'MKT', 'Marketing Department', 300000.00, 'Main Office'),
('Operations', 'OPS', 'Operations Department', 600000.00, 'Warehouse');

-- Insert sample positions
INSERT INTO positions (position_title, position_code, department_id, job_description, min_salary, max_salary) VALUES
('HR Manager', 'HR-MGR', 1, 'Manages HR operations and policies', 70000.00, 90000.00),
('HR Specialist', 'HR-SPEC', 1, 'Handles employee relations and benefits', 45000.00, 60000.00),
('Software Developer', 'IT-DEV', 2, 'Develops and maintains software applications', 60000.00, 100000.00),
('IT Manager', 'IT-MGR', 2, 'Manages IT infrastructure and team', 80000.00, 120000.00),
('Financial Analyst', 'FIN-ANAL', 3, 'Analyzes financial data and reports', 50000.00, 70000.00),
('Marketing Coordinator', 'MKT-COORD', 4, 'Coordinates marketing campaigns', 40000.00, 55000.00),
('Operations Manager', 'OPS-MGR', 5, 'Manages daily operations', 65000.00, 85000.00);

-- =============================================
-- VIEWS FOR COMMON QUERIES
-- =============================================

-- Employee directory view
CREATE VIEW employee_directory AS
SELECT 
    e.employee_id,
    e.employee_number,
    e.first_name,
    e.last_name,
    u.email,
    e.phone,
    d.department_name,
    p.position_title,
    m.first_name || ' ' || m.last_name AS manager_name,
    e.hire_date,
    e.employment_status
FROM employees e
LEFT JOIN users u ON e.user_id = u.user_id
LEFT JOIN departments d ON e.department_id = d.department_id
LEFT JOIN positions p ON e.position_id = p.position_id
LEFT JOIN employees m ON e.manager_id = m.employee_id
WHERE e.employment_status = 'ACTIVE';

-- Attendance summary view
CREATE VIEW attendance_summary AS
SELECT 
    e.employee_id,
    e.first_name || ' ' || e.last_name AS employee_name,
    d.department_name,
    COUNT(ar.attendance_id) AS total_days,
    COUNT(CASE WHEN ar.status = 'PRESENT' THEN 1 END) AS present_days,
    COUNT(CASE WHEN ar.status = 'ABSENT' THEN 1 END) AS absent_days,
    COUNT(CASE WHEN ar.status = 'LATE' THEN 1 END) AS late_days,
    SUM(ar.total_hours) AS total_hours,
    SUM(ar.overtime_hours) AS total_overtime
FROM employees e
LEFT JOIN attendance_records ar ON e.employee_id = ar.employee_id
LEFT JOIN departments d ON e.department_id = d.department_id
WHERE e.employment_status = 'ACTIVE'
GROUP BY e.employee_id, e.first_name, e.last_name, d.department_name;

-- Time-off balance view
CREATE VIEW timeoff_balance AS
SELECT 
    e.employee_id,
    e.first_name || ' ' || e.last_name AS employee_name,
    d.department_name,
    COUNT(CASE WHEN tor.request_type = 'VACATION' AND tor.status = 'APPROVED' THEN 1 END) AS vacation_taken,
    COUNT(CASE WHEN tor.request_type = 'SICK_LEAVE' AND tor.status = 'APPROVED' THEN 1 END) AS sick_leave_taken,
    SUM(CASE WHEN tor.request_type = 'VACATION' AND tor.status = 'APPROVED' THEN tor.total_days ELSE 0 END) AS vacation_days_taken,
    SUM(CASE WHEN tor.request_type = 'SICK_LEAVE' AND tor.status = 'APPROVED' THEN tor.total_days ELSE 0 END) AS sick_days_taken
FROM employees e
LEFT JOIN time_off_requests tor ON e.employee_id = tor.employee_id
LEFT JOIN departments d ON e.department_id = d.department_id
WHERE e.employment_status = 'ACTIVE'
GROUP BY e.employee_id, e.first_name, e.last_name, d.department_name;

-- =============================================
-- COMMENTS AND DOCUMENTATION
-- =============================================

COMMENT ON DATABASE employee_management IS 'Employee Management System Database - Stores employee data, attendance, performance reviews, and organizational information';

COMMENT ON TABLE users IS 'System users with authentication and authorization information';
COMMENT ON TABLE employees IS 'Employee master data including personal and employment information';
COMMENT ON TABLE departments IS 'Organizational departments and hierarchy';
COMMENT ON TABLE positions IS 'Job positions and roles within departments';
COMMENT ON TABLE attendance_records IS 'Daily attendance tracking for employees';
COMMENT ON TABLE time_off_requests IS 'Employee time-off requests and approvals';
COMMENT ON TABLE performance_reviews IS 'Employee performance review data';
COMMENT ON TABLE salary_history IS 'Employee salary and compensation history';
COMMENT ON TABLE emergency_contacts IS 'Employee emergency contact information';
COMMENT ON TABLE documents IS 'Employee document storage and management';
COMMENT ON TABLE notifications IS 'System notifications for users';
COMMENT ON TABLE audit_logs IS 'Audit trail for all system changes';

-- =============================================
-- END OF SCHEMA
-- =============================================

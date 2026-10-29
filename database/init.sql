-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Reusable trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- User roles ENUM type
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'TEACHER', 'STUDENT', 'PARENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    role user_role NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DROP TRIGGER IF EXISTS trigger_users_updated_at ON users;
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 2. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DROP TRIGGER IF EXISTS trigger_departments_updated_at ON departments;
CREATE TRIGGER trigger_departments_updated_at
    BEFORE UPDATE ON departments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 3. Students Table
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    department_id UUID NOT NULL,
    enrollment_number VARCHAR(100) NOT NULL UNIQUE,
    date_of_birth DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_students_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT
);

DROP TRIGGER IF EXISTS trigger_students_updated_at ON students;
CREATE TRIGGER trigger_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance & foreign key lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_department_id ON students(department_id);
CREATE INDEX IF NOT EXISTS idx_students_enrollment_number ON students(enrollment_number);

-- 4. Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    department_id UUID NOT NULL,
    credits INT NOT NULL DEFAULT 3,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_courses_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT
);

DROP TRIGGER IF EXISTS trigger_courses_updated_at ON courses;
CREATE TRIGGER trigger_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    course_id UUID NOT NULL,
    attendance_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'LATE')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attendance_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_attendance_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    CONSTRAINT uq_student_course_date UNIQUE (student_id, course_id, attendance_date)
);

DROP TRIGGER IF EXISTS trigger_attendance_updated_at ON attendance;
CREATE TRIGGER trigger_attendance_updated_at
    BEFORE UPDATE ON attendance
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_courses_department_id ON courses(department_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_course_id ON attendance(course_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(attendance_date);

-- 6. Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PARTIAL', 'PAID')),
    due_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_invoices_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

DROP TRIGGER IF EXISTS trigger_invoices_updated_at ON invoices;
CREATE TRIGGER trigger_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL,
    amount_paid DECIMAL(10, 2) NOT NULL CHECK (amount_paid > 0),
    payment_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payments_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

DROP TRIGGER IF EXISTS trigger_payments_updated_at ON payments;
CREATE TRIGGER trigger_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_invoices_student_id ON invoices(student_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
-- 8. Marks & Grades Table
CREATE TABLE IF NOT EXISTS marks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    course_id UUID NOT NULL,
    internal_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    external_score NUMERIC(5,2) DEFAULT NULL,
    total_score NUMERIC(5,2) DEFAULT NULL,
    grade VARCHAR(10) DEFAULT NULL,
    risk_score NUMERIC(4,2) DEFAULT NULL,
    risk_status VARCHAR(50) DEFAULT 'Low Risk',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_marks_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_marks_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    CONSTRAINT uq_student_course_marks UNIQUE (student_id, course_id)
);

DROP TRIGGER IF EXISTS trigger_marks_updated_at ON marks;
CREATE TRIGGER trigger_marks_updated_at
    BEFORE UPDATE ON marks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_marks_student_id ON marks(student_id);
CREATE INDEX IF NOT EXISTS idx_marks_course_id ON marks(course_id);

-- 9. Faculty-Student Advisory Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    sender_name VARCHAR(150) NOT NULL,
    sender_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(50) DEFAULT 'HIGH',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_messages_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_messages_student_id ON messages(student_id);

-- 10. Faculty Leave Requests Table (HR Management)
CREATE TABLE IF NOT EXISTS leaves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id VARCHAR(100) NOT NULL,
    faculty_name VARCHAR(255) NOT NULL,
    faculty_email VARCHAR(255) NOT NULL,
    leave_type VARCHAR(50) NOT NULL CHECK (leave_type IN ('CASUAL', 'MEDICAL', 'ON_DUTY', 'EARNED')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_count INT NOT NULL DEFAULT 1,
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    admin_remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_leaves_faculty_email ON leaves(faculty_email);
CREATE INDEX IF NOT EXISTS idx_leaves_status ON leaves(status);

-- ==========================================
-- SEED DATA: Departments, Users, and Students
-- ==========================================

-- 1. Insert Department
INSERT INTO departments (id, name, description)
VALUES 
    ('bfbd9a42-0e41-4629-8473-36c0b7fb7069', 'Computer Science and Engineering', 'Department of Computer Science & Engineering')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Users (Admin, Faculty, Student)
-- admin@erp.com       / admin@123
-- faculty@erp.com     / faculty@123
-- alex.turner@erp.com / student123
INSERT INTO users (id, email, password_hash, role, is_active)
VALUES 
    ('64005ce7-e51f-4ee5-befc-9a7e12d21d97', 'admin@erp.com', '$2b$10$6HW0ndeqfwMHXNTnc2k/5.gb4y766T3w896gMH0TkEqwZqQVGq5a6', 'SUPER_ADMIN', true),
    ('2967fd8a-900d-464e-83fc-b66e4079c8a9', 'faculty@erp.com', '$2b$10$a2XQSP8i8GcHDDa2Ca2dU.93dhx8GNW1xkUk0zlFid3xVg2CIVIku', 'TEACHER', true),
    ('e0e6db2d-6906-421c-a710-499bf39e75ef', 'alex.turner@erp.com', '$2b$10$CeR31C7iNNcIJWTJm3pnlu2jVRSda.pblRIuGP9bJhhswWHeQj5ka', 'STUDENT', true)
ON CONFLICT (email) DO NOTHING;

-- 3. Insert Student Record
INSERT INTO students (id, user_id, department_id, enrollment_number, date_of_birth)
VALUES 
    ('0937df8b-2b8f-49a7-bfee-84eace226eec', 'e0e6db2d-6906-421c-a710-499bf39e75ef', 'bfbd9a42-0e41-4629-8473-36c0b7fb7069', 'STU-2026-CCF9BC', '2004-05-15')
ON CONFLICT (enrollment_number) DO NOTHING;


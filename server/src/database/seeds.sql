-- InfraSync BD Initial Seed Data

-- 1. Insert default roles
INSERT INTO roles (role_name, description) VALUES
('super_admin', 'System Administrator with full platform access'),
('department_officer', 'Verified Government Agency Officer'),
('contractor', 'Verified Infrastructure Contractor'),
('citizen', 'Public Citizen User');

-- 2. Insert standard government departments
INSERT INTO departments (department_name, department_type, office_address, contact_phone, contact_email) VALUES
('Roads and Highways Department', 'Road', 'Sarak Bhaban, Tejgaon, Dhaka', '01700000001', 'contact@rhd.gov.bd'),
('Dhaka North City Corporation (DNCC)', 'Road', 'Gulshan, Dhaka', '01700000002', 'info@dncc.gov.bd'),
('Dhaka South City Corporation (DSCC)', 'Road', 'Nagar Bhaban, Dhaka', '01700000003', 'info@dscc.gov.bd'),
('Dhaka WASA', 'Water', 'WASA Bhaban, Karwan Bazar, Dhaka', '01700000004', 'info@dwasa.org.bd'),
('Titas Gas Transmission and Distribution', 'Gas', 'Titas Bhaban, Kawran Bazar, Dhaka', '01700000005', 'contact@titasgas.org.bd'),
('DPDC (Electricity)', 'Power', 'Bidyut Bhaban, Dhaka', '01700000006', 'info@dpdc.gov.bd'),
('DESCO (Electricity)', 'Power', 'Nikunja-2, Dhaka', '01700000007', 'info@desco.org.bd'),
('BTCL (Telecommunication/Fiber)', 'Telecom', 'Telejogajog Bhaban, Eskaton, Dhaka', '01700000008', 'info@btcl.gov.bd');

-- 3. Insert root Super Admin User (plain text password: admin123)
INSERT INTO users (role_id, full_name, email, phone, password_hash, account_status)
VALUES (
    (SELECT role_id FROM roles WHERE role_name = 'super_admin'),
    'System Administrator',
    'admin@infrasync.gov.bd',
    '01799999999',
    'admin123',
    'active'
);

-- 4. Insert 3 Citizens (Role 4), active
INSERT INTO users (role_id, full_name, email, phone, password_hash, account_status) VALUES
(4, 'Rahim Uddin', 'rahim@citizen.com', '01711111111', 'admin123', 'active'),
(4, 'Karim Hasan', 'karim@citizen.com', '01711111112', 'admin123', 'active'),
(4, 'Sadia Akter', 'sadia@citizen.com', '01711111113', 'admin123', 'active');

-- 5. Insert 3 Contractors (Role 3), 2 active, 1 pending
INSERT INTO users (role_id, full_name, email, phone, password_hash, account_status) VALUES
(3, 'Tariq Construction', 'tariq@builder.com', '01722222221', 'admin123', 'active'),
(3, 'Molla Builders', 'molla@builder.com', '01722222222', 'admin123', 'active'),
(3, 'ABC Infrastructure', 'abc@builder.com', '01722222223', 'admin123', 'pending_verification');

-- We fetch the exact IDs of the newly inserted contractors to link their profiles
SET @c1 = (SELECT user_id FROM users WHERE email = 'tariq@builder.com');
SET @c2 = (SELECT user_id FROM users WHERE email = 'molla@builder.com');
SET @c3 = (SELECT user_id FROM users WHERE email = 'abc@builder.com');

INSERT INTO contractor_profiles (user_id, company_name, trade_license_no, contractor_license_no, office_address, license_document_url) VALUES
(@c1, 'Tariq Construction Ltd.', 'TRD-1001', 'LIC-1001', 'Banani, Dhaka', 'placeholder.jpg'),
(@c2, 'Molla Builders', 'TRD-1002', 'LIC-1002', 'Uttara, Dhaka', 'placeholder.jpg'),
(@c3, 'ABC Infrastructure', 'TRD-1003', 'LIC-1003', 'Mirpur, Dhaka', 'placeholder.jpg');

-- 6. Insert 3 Department Officers (Role 2), 2 active, 1 pending
INSERT INTO users (role_id, full_name, email, phone, password_hash, account_status) VALUES
(2, 'Eng. Salman', 'salman@rhd.gov.bd', '01733333331', 'admin123', 'active'),
(2, 'Eng. Farhana', 'farhana@dncc.gov.bd', '01733333332', 'admin123', 'active'),
(2, 'Eng. Rafiq', 'rafiq@wasa.gov.bd', '01733333333', 'admin123', 'pending_verification');

SET @o1 = (SELECT user_id FROM users WHERE email = 'salman@rhd.gov.bd');
SET @o2 = (SELECT user_id FROM users WHERE email = 'farhana@dncc.gov.bd');
SET @o3 = (SELECT user_id FROM users WHERE email = 'rafiq@wasa.gov.bd');

-- Dept 1 = RHD, Dept 2 = DNCC, Dept 4 = WASA
INSERT INTO officer_profiles (user_id, department_id, employee_id, designation, office_location, verification_document_url) VALUES
(@o1, 1, 'EMP-RHD-01', 'Executive Engineer', 'RHD HQ', 'placeholder.jpg'),
(@o2, 2, 'EMP-DNCC-02', 'Assistant Engineer', 'DNCC Zone 1', 'placeholder.jpg'),
(@o3, 4, 'EMP-WASA-03', 'Sub-Divisional Engineer', 'WASA Bhaban', 'placeholder.jpg');

-- 7. Insert Mock Projects
INSERT INTO projects (project_code, project_name, project_type, department_id, created_by_officer_id, assigned_contractor_id, budget, start_date, target_completion_date, status) VALUES
('PRJ-10001', 'Mirpur Road Repair', 'Road Maintenance', 1, 1, 1, 500000.00, '2026-01-01', '2026-12-31', 'ongoing'),
('PRJ-10002', 'Gulshan Water Pipe Installation', 'Water Supply', 4, 3, 2, 800000.00, '2026-03-01', '2026-10-31', 'ongoing');

-- 8. Insert Mock Inspections
INSERT INTO inspections (project_id, inspector_officer_id, scheduled_date, result, engineer_remarks) VALUES
(1, 1, '2026-09-15 10:00:00', 'pending', 'Initial quality check'),
(2, 3, '2026-09-20 14:00:00', 'failed', 'Material quality does not meet standards');

-- 9. Insert Mock Checklists
INSERT INTO inspection_checklist_items (inspection_id, criteria_title, status) VALUES
(2, 'Drawing compliance', 'pass'),
(2, 'Material quality', 'fail'),
(2, 'Worker safety', 'pass');

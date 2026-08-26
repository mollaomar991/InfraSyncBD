-- 4. Insert 3 Citizens (Role 4), active
INSERT INTO users (role_id, full_name, email, phone, password_hash, account_status) VALUES
(4, 'Rahim Uddin', 'rahim@citizen.com', '01711111111', '$2b$10$94MeD6X0a2Akm6PgEOABCOmWjP2nj8pr8Q2CXFqcVMYvg2Wzm7uIe', 'active'),
(4, 'Karim Hasan', 'karim@citizen.com', '01711111112', '$2b$10$94MeD6X0a2Akm6PgEOABCOmWjP2nj8pr8Q2CXFqcVMYvg2Wzm7uIe', 'active'),
(4, 'Sadia Akter', 'sadia@citizen.com', '01711111113', '$2b$10$94MeD6X0a2Akm6PgEOABCOmWjP2nj8pr8Q2CXFqcVMYvg2Wzm7uIe', 'active');

-- 5. Insert 3 Contractors (Role 3), 2 active, 1 pending
INSERT INTO users (role_id, full_name, email, phone, password_hash, account_status) VALUES
(3, 'Tariq Construction', 'tariq@builder.com', '01722222221', '$2b$10$94MeD6X0a2Akm6PgEOABCOmWjP2nj8pr8Q2CXFqcVMYvg2Wzm7uIe', 'active'),
(3, 'Molla Builders', 'molla@builder.com', '01722222222', '$2b$10$94MeD6X0a2Akm6PgEOABCOmWjP2nj8pr8Q2CXFqcVMYvg2Wzm7uIe', 'active'),
(3, 'ABC Infrastructure', 'abc@builder.com', '01722222223', '$2b$10$94MeD6X0a2Akm6PgEOABCOmWjP2nj8pr8Q2CXFqcVMYvg2Wzm7uIe', 'pending_verification');

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
(2, 'Eng. Salman', 'salman@rhd.gov.bd', '01733333331', '$2b$10$94MeD6X0a2Akm6PgEOABCOmWjP2nj8pr8Q2CXFqcVMYvg2Wzm7uIe', 'active'),
(2, 'Eng. Farhana', 'farhana@dncc.gov.bd', '01733333332', '$2b$10$94MeD6X0a2Akm6PgEOABCOmWjP2nj8pr8Q2CXFqcVMYvg2Wzm7uIe', 'active'),
(2, 'Eng. Rafiq', 'rafiq@wasa.gov.bd', '01733333333', '$2b$10$94MeD6X0a2Akm6PgEOABCOmWjP2nj8pr8Q2CXFqcVMYvg2Wzm7uIe', 'pending_verification');

SET @o1 = (SELECT user_id FROM users WHERE email = 'salman@rhd.gov.bd');
SET @o2 = (SELECT user_id FROM users WHERE email = 'farhana@dncc.gov.bd');
SET @o3 = (SELECT user_id FROM users WHERE email = 'rafiq@wasa.gov.bd');

-- Dept 1 = RHD, Dept 2 = DNCC, Dept 4 = WASA
INSERT INTO officer_profiles (user_id, department_id, employee_id, designation, office_location, verification_document_url) VALUES
(@o1, 1, 'EMP-RHD-01', 'Executive Engineer', 'RHD HQ', 'placeholder.jpg'),
(@o2, 2, 'EMP-DNCC-02', 'Assistant Engineer', 'DNCC Zone 1', 'placeholder.jpg'),
(@o3, 4, 'EMP-WASA-03', 'Sub-Divisional Engineer', 'WASA Bhaban', 'placeholder.jpg');

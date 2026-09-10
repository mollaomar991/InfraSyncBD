-- InfraSync BD: Comprehensive Demo Data
-- Run this AFTER schema.sql and seeds.sql

-- Fetch Officer IDs
SET @rhd_officer = (SELECT officer_id FROM officer_profiles op JOIN users u ON op.user_id = u.user_id WHERE u.email = 'salman@rhd.gov.bd' LIMIT 1);
SET @dncc_officer = (SELECT officer_id FROM officer_profiles op JOIN users u ON op.user_id = u.user_id WHERE u.email = 'farhana@dncc.gov.bd' LIMIT 1);
SET @wasa_officer = (SELECT officer_id FROM officer_profiles op JOIN users u ON op.user_id = u.user_id WHERE u.email = 'rafiq@wasa.gov.bd' LIMIT 1);

-- Fetch Contractor IDs
SET @contractor_1 = (SELECT contractor_id FROM contractor_profiles cp JOIN users u ON cp.user_id = u.user_id WHERE u.email = 'tariq@builder.com' LIMIT 1);
SET @contractor_2 = (SELECT contractor_id FROM contractor_profiles cp JOIN users u ON cp.user_id = u.user_id WHERE u.email = 'molla@builder.com' LIMIT 1);

-- Fetch Citizen IDs
SET @citizen_1 = (SELECT user_id FROM users WHERE email = 'rahim@citizen.com' LIMIT 1);
SET @citizen_2 = (SELECT user_id FROM users WHERE email = 'karim@citizen.com' LIMIT 1);

-- ==========================================
-- 1. Insert More Projects
-- ==========================================
INSERT INTO projects (project_code, project_name, project_type, department_id, created_by_officer_id, assigned_contractor_id, budget, start_date, target_completion_date, status, description) VALUES
('PRJ-20001', 'Mirpur 10 Metro Station Surface Repair', 'Road Repair', 1, @rhd_officer, @contractor_1, 15000000.00, '2026-08-01', '2026-11-30', 'ongoing', 'Surface repairing of the main road under Mirpur 10 Metro Station.'),
('PRJ-20002', 'Gulshan 2 Underground Water Pipeline', 'Water Supply', 4, @wasa_officer, @contractor_2, 25000000.00, '2026-09-01', '2027-02-28', 'ongoing', 'Replacement of 40-year old water pipelines along Gulshan Avenue.'),
('PRJ-20003', 'Banani Drainage Upgrade', 'Drainage', 2, @dncc_officer, @contractor_1, 12000000.00, '2026-07-15', '2026-10-15', 'delayed', 'Upgrading the primary drainage network to prevent waterlogging.'),
('PRJ-20004', 'Dhanmondi 27 Gas Line Extension', 'Gas', 1, @rhd_officer, NULL, 5000000.00, '2026-10-01', '2026-12-01', 'draft', 'New commercial gas line extension for upcoming shopping complex.'),
('PRJ-20005', 'Uttara Sector 11 Road Carpeting', 'Road Construction', 2, @dncc_officer, @contractor_2, 35000000.00, '2025-01-01', '2025-12-31', 'completed', 'Complete road carpeting of Sector 11 main avenue.');

SET @p1 = LAST_INSERT_ID(); -- PRJ-20001 (Mirpur)
SET @p2 = @p1 + 1; -- PRJ-20002 (Gulshan)
SET @p3 = @p1 + 2; -- PRJ-20003 (Banani)
SET @p4 = @p1 + 3; -- PRJ-20004 (Dhanmondi)
SET @p5 = @p1 + 4; -- PRJ-20005 (Uttara)

-- Insert Project Locations
INSERT INTO project_locations (project_id, road_name, area_name, latitude, longitude, geometry_type, coordinates_json) VALUES
(@p1, 'Begum Rokeya Sarani', 'Mirpur', 23.8069, 90.3687, 'polyline', '[[23.8069, 90.3687], [23.8105, 90.3670]]'),
(@p2, 'Gulshan Avenue', 'Gulshan', 23.7937, 90.4154, 'polyline', '[[23.7937, 90.4154], [23.7885, 90.4168]]'),
(@p3, 'Kemal Ataturk Avenue', 'Banani', 23.7930, 90.4042, 'polyline', '[[23.7930, 90.4042], [23.7950, 90.4050]]'),
(@p4, 'Dhanmondi 27', 'Dhanmondi', 23.7540, 90.3750, 'point', '[[23.7540, 90.3750]]'),
(@p5, 'Sector 11 Main Road', 'Uttara', 23.8728, 90.3938, 'polyline', '[[23.8728, 90.3938], [23.8750, 90.3950]]');

-- ==========================================
-- 2. Insert Conflict Alerts & Coordination
-- ==========================================
INSERT INTO conflict_alerts (project_id, conflicting_project_id, conflict_level, conflict_reason, recommended_sequence, resolution_status) VALUES
(@p2, @p3, 'high', 'Both projects involve deep excavation in overlapping zones during October 2026.', 'WASA should complete pipe laying before DNCC starts surface drainage work.', 'under_coordination');

INSERT INTO coordination_requests (project_id, sender_department_id, receiver_department_id, suggested_start_date, suggested_end_date, status, notes) VALUES
(@p2, 4, 2, '2026-10-15', '2026-11-15', 'pending', 'We need to delay your drainage project by 1 month to allow our water pipes to be laid first.');

-- ==========================================
-- 3. Insert Progress Updates
-- ==========================================
INSERT INTO progress_updates (project_id, contractor_id, update_date, physical_progress_pct, financial_progress_pct, completed_work_summary, remaining_work_summary, photo_evidence_url, is_delayed, officer_review_status) VALUES
(@p1, @contractor_1, '2026-09-01', 30.00, 25.00, 'Surface cleared and leveled', 'Asphalt laying remaining', 'demo_progress_1.jpg', FALSE, 'accepted'),
(@p2, @contractor_2, '2026-09-10', 45.00, 40.00, 'Trench digging completed for 2km', 'Pipe insertion and backfilling remaining', 'demo_progress_2.jpg', FALSE, 'pending'),
(@p3, @contractor_1, '2026-09-05', 20.00, 25.00, 'Initial excavation started', 'Heavy rain delayed excavation, 80% remaining', 'demo_progress_3.jpg', TRUE, 'accepted');

-- ==========================================
-- 4. Insert Inspections & Checklist Items
-- ==========================================
INSERT INTO inspections (project_id, inspector_officer_id, scheduled_date, result, engineer_remarks) VALUES
(@p1, @rhd_officer, '2026-09-05 10:00:00', 'passed', 'Site looks good and safety protocols are followed.'),
(@p3, @dncc_officer, '2026-09-08 14:00:00', 'failed', 'Workers were found without helmets and proper barriers were missing.'),
(@p2, @wasa_officer, '2026-09-20 10:00:00', 'pending', NULL);

SET @i1 = LAST_INSERT_ID();
SET @i2 = @i1 + 1;

-- Checklist for passed inspection
INSERT INTO inspection_checklist_items (inspection_id, criteria_title, status) VALUES
(@i1, 'Drawing compliance', 'pass'),
(@i1, 'Material quality', 'pass'),
(@i1, 'Worker safety', 'pass'),
(@i1, 'Traffic management', 'pass'),
(@i1, 'Site cleanliness', 'pass');

-- Checklist for failed inspection
INSERT INTO inspection_checklist_items (inspection_id, criteria_title, status) VALUES
(@i2, 'Drawing compliance', 'pass'),
(@i2, 'Material quality', 'pass'),
(@i2, 'Worker safety', 'fail'),
(@i2, 'Traffic management', 'fail'),
(@i2, 'Site cleanliness', 'pass');

-- ==========================================
-- 5. Insert Citizen Complaints
-- ==========================================
INSERT INTO complaints (complaint_ticket_no, citizen_user_id, project_id, category, location_address, description, status, citizen_rating, created_at) VALUES
('CMP-80001', @citizen_1, @p2, 'dust_pollution', 'Gulshan Avenue, near Circle 2', 'Massive dust blowing from the open excavation site. Hard to breathe.', 'resolved', 4, '2026-09-02 08:00:00'),
('CMP-80002', @citizen_2, @p3, 'unsafe_construction', 'Kemal Ataturk Ave', 'Deep ditch left open without any red tape or barriers. Very dangerous at night.', 'in_progress', NULL, '2026-09-10 20:00:00'),
('CMP-80003', @citizen_1, NULL, 'waterlogging', 'Mirpur 10 intersection', 'Water is clogged due to recent road cutting debris blocking the drain.', 'submitted', NULL, '2026-09-11 09:00:00');

-- ==========================================
-- 6. Insert Road Restorations
-- ==========================================
INSERT INTO road_restorations (project_id, contractor_id, before_photo_url, after_photo_url, status) VALUES
(@p5, @contractor_2, 'before_uttara.jpg', 'after_uttara.jpg', 'restoration_approved');

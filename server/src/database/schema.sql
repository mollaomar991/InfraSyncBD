-- InfraSync BD Schema Definition

-- Table 1: roles
CREATE TABLE roles (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255)
) ENGINE=InnoDB;

-- Table 2: departments
CREATE TABLE departments (
    department_id INT PRIMARY KEY AUTO_INCREMENT,
    department_name VARCHAR(100) UNIQUE NOT NULL,
    department_type VARCHAR(50) NOT NULL,
    office_address VARCHAR(255),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(100),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Table 3: users
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    role_id INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    account_status ENUM('pending_verification', 'active', 'rejected', 'suspended') DEFAULT 'pending_verification',
    rejection_reason TEXT NULL,
    avatar_url VARCHAR(255) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
) ENGINE=InnoDB;

-- Table 4: officer_profiles
CREATE TABLE officer_profiles (
    officer_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    department_id INT NOT NULL,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    designation VARCHAR(100) NOT NULL,
    office_location VARCHAR(150) NOT NULL,
    verification_document_url VARCHAR(255) NOT NULL,
    verified_by INT NULL,
    verified_at DATETIME NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (department_id) REFERENCES departments(department_id),
    FOREIGN KEY (verified_by) REFERENCES users(user_id)
) ENGINE=InnoDB;

-- Table 5: contractor_profiles
CREATE TABLE contractor_profiles (
    contractor_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    company_name VARCHAR(150) NOT NULL,
    trade_license_no VARCHAR(100) UNIQUE NOT NULL,
    contractor_license_no VARCHAR(100) UNIQUE NOT NULL,
    office_address VARCHAR(255) NOT NULL,
    experience_years INT DEFAULT 0,
    equipment_summary TEXT,
    license_document_url VARCHAR(255) NOT NULL,
    performance_rating DECIMAL(3,2) DEFAULT 5.00,
    safety_rating DECIMAL(3,2) DEFAULT 5.00,
    risk_level ENUM('low_risk', 'medium_risk', 'high_risk', 'blacklisted') DEFAULT 'low_risk',
    total_assigned_projects INT DEFAULT 0,
    completed_projects INT DEFAULT 0,
    delayed_projects INT DEFAULT 0,
    verified_by INT NULL,
    verified_at DATETIME NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (verified_by) REFERENCES users(user_id)
) ENGINE=InnoDB;

-- Table 6: projects
CREATE TABLE projects (
    project_id INT PRIMARY KEY AUTO_INCREMENT,
    project_code VARCHAR(50) UNIQUE NOT NULL,
    project_name VARCHAR(200) NOT NULL,
    project_type VARCHAR(50) NOT NULL,
    description TEXT,
    department_id INT NOT NULL,
    created_by_officer_id INT NOT NULL,
    assigned_contractor_id INT NULL,
    budget DECIMAL(14,2) NOT NULL,
    actual_expenditure DECIMAL(14,2) DEFAULT 0.00,
    start_date DATE NOT NULL,
    target_completion_date DATE NOT NULL,
    actual_completion_date DATE NULL,
    status ENUM('draft', 'submitted', 'conflict_detected', 'under_coordination', 'under_approval', 'final_approved', 'contractor_assigned', 'ongoing', 'delayed', 'inspection_pending', 'rework_required', 'restoration_pending', 'completed', 'archived', 'cancelled') DEFAULT 'draft',
    road_status ENUM('open', 'partially_closed', 'fully_closed', 'under_construction', 'restoration_pending', 'reopened', 'completed') DEFAULT 'open',
    physical_progress_pct DECIMAL(5,2) DEFAULT 0.00,
    financial_progress_pct DECIMAL(5,2) DEFAULT 0.00,
    priority ENUM('low', 'medium', 'high', 'emergency') DEFAULT 'medium',
    is_archived BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(department_id),
    FOREIGN KEY (created_by_officer_id) REFERENCES officer_profiles(officer_id),
    FOREIGN KEY (assigned_contractor_id) REFERENCES contractor_profiles(contractor_id)
) ENGINE=InnoDB;

-- Table 7: project_locations (GIS)
CREATE TABLE project_locations (
    location_id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    road_name VARCHAR(150) NOT NULL,
    area_name VARCHAR(100) NOT NULL,
    ward_no VARCHAR(20) NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    geometry_type ENUM('point', 'polyline', 'polygon') DEFAULT 'point',
    coordinates_json JSON NOT NULL,
    buffer_radius_meters INT DEFAULT 20,
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table 8: project_milestones
CREATE TABLE project_milestones (
    milestone_id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    milestone_name VARCHAR(150) NOT NULL,
    target_progress_pct DECIMAL(5,2) NOT NULL,
    planned_start_date DATE NOT NULL,
    planned_end_date DATE NOT NULL,
    status ENUM('pending', 'in_progress', 'completed', 'delayed', 'rework_required') DEFAULT 'pending',
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table 9: conflict_alerts
CREATE TABLE conflict_alerts (
    conflict_id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    conflicting_project_id INT NOT NULL,
    conflict_level ENUM('low', 'medium', 'high') NOT NULL,
    conflict_reason TEXT NOT NULL,
    recommended_sequence TEXT NOT NULL,
    resolution_status ENUM('detected', 'under_coordination', 'resolved', 'ignored') DEFAULT 'detected',
    resolved_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (conflicting_project_id) REFERENCES projects(project_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table 10: coordination_requests
CREATE TABLE coordination_requests (
    coordination_id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    sender_department_id INT NOT NULL,
    receiver_department_id INT NOT NULL,
    suggested_start_date DATE NULL,
    suggested_end_date DATE NULL,
    status ENUM('pending', 'accepted', 'changes_requested', 'rejected') DEFAULT 'pending',
    notes TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (sender_department_id) REFERENCES departments(department_id),
    FOREIGN KEY (receiver_department_id) REFERENCES departments(department_id)
) ENGINE=InnoDB;

-- Table 11: approval_requests
CREATE TABLE approval_requests (
    approval_id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    approving_department_id INT NOT NULL,
    reviewed_by_officer_id INT NULL,
    decision ENUM('pending', 'approved', 'rejected', 'modification_requested') DEFAULT 'pending',
    comments TEXT NULL,
    decision_date DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (approving_department_id) REFERENCES departments(department_id),
    FOREIGN KEY (reviewed_by_officer_id) REFERENCES officer_profiles(officer_id)
) ENGINE=InnoDB;

-- Table 12: progress_updates
CREATE TABLE progress_updates (
    progress_id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    contractor_id INT NOT NULL,
    update_date DATE NOT NULL,
    physical_progress_pct DECIMAL(5,2) NOT NULL,
    financial_progress_pct DECIMAL(5,2) NOT NULL,
    completed_work_summary TEXT NOT NULL,
    remaining_work_summary TEXT NOT NULL,
    labor_count INT DEFAULT 0,
    equipment_used VARCHAR(255),
    photo_evidence_url VARCHAR(255) NOT NULL,
    is_delayed BOOLEAN DEFAULT FALSE,
    delay_reason TEXT NULL,
    officer_review_status ENUM('pending', 'accepted', 'rejected', 'revision_requested') DEFAULT 'pending',
    officer_comments TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (contractor_id) REFERENCES contractor_profiles(contractor_id)
) ENGINE=InnoDB;

-- Table 13: inspections
CREATE TABLE inspections (
    inspection_id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    milestone_id INT NULL,
    inspector_officer_id INT NOT NULL,
    scheduled_date DATETIME NOT NULL,
    result ENUM('pending', 'passed', 'passed_with_conditions', 'failed', 'reinspection_required') DEFAULT 'pending',
    engineer_remarks TEXT NULL,
    inspection_photos_url VARCHAR(255) NULL,
    completed_at DATETIME NULL,
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (milestone_id) REFERENCES project_milestones(milestone_id) ON DELETE CASCADE,
    FOREIGN KEY (inspector_officer_id) REFERENCES officer_profiles(officer_id)
) ENGINE=InnoDB;

-- Table 14: inspection_checklist_items
CREATE TABLE inspection_checklist_items (
    item_id INT PRIMARY KEY AUTO_INCREMENT,
    inspection_id INT NOT NULL,
    criteria_title VARCHAR(150) NOT NULL,
    status ENUM('pass', 'fail', 'na') NOT NULL,
    notes VARCHAR(255) NULL,
    FOREIGN KEY (inspection_id) REFERENCES inspections(inspection_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table 15: complaints
CREATE TABLE complaints (
    complaint_id INT PRIMARY KEY AUTO_INCREMENT,
    complaint_ticket_no VARCHAR(50) UNIQUE NOT NULL,
    citizen_user_id INT NOT NULL,
    project_id INT NULL,
    category ENUM('road_damage', 'dust_pollution', 'noise_violation', 'waterlogging', 'unsafe_construction', 'project_delay', 'illegal_excavation', 'traffic_blockage', 'construction_waste', 'poor_road_restoration') NOT NULL,
    location_address VARCHAR(255) NOT NULL,
    latitude DECIMAL(10,8) NULL,
    longitude DECIMAL(11,8) NULL,
    description TEXT NOT NULL,
    evidence_photo_url VARCHAR(255) NULL,
    status ENUM('submitted', 'under_review', 'assigned', 'in_progress', 'resolved', 'rejected', 'closed') DEFAULT 'submitted',
    assigned_contractor_id INT NULL,
    resolution_summary TEXT NULL,
    resolution_photo_url VARCHAR(255) NULL,
    citizen_rating INT NULL,
    citizen_feedback TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME NULL,
    FOREIGN KEY (citizen_user_id) REFERENCES users(user_id),
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_contractor_id) REFERENCES contractor_profiles(contractor_id)
) ENGINE=InnoDB;

-- Table 16: road_restorations
CREATE TABLE road_restorations (
    restoration_id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT UNIQUE NOT NULL,
    contractor_id INT NOT NULL,
    before_photo_url VARCHAR(255) NOT NULL,
    after_photo_url VARCHAR(255) NOT NULL,
    submission_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    verified_by_officer_id INT NULL,
    status ENUM('pending_verification', 'rework_required', 'restoration_approved') DEFAULT 'pending_verification',
    verification_notes TEXT NULL,
    verified_at DATETIME NULL,
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (contractor_id) REFERENCES contractor_profiles(contractor_id),
    FOREIGN KEY (verified_by_officer_id) REFERENCES officer_profiles(officer_id)
) ENGINE=InnoDB;

-- Table 17: restoration_checklist_items
CREATE TABLE restoration_checklist_items (
    check_item_id INT PRIMARY KEY AUTO_INCREMENT,
    restoration_id INT NOT NULL,
    item_name VARCHAR(150) NOT NULL,
    status ENUM('pass', 'fail') NOT NULL,
    notes VARCHAR(255) NULL,
    FOREIGN KEY (restoration_id) REFERENCES road_restorations(restoration_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table 18: project_documents
CREATE TABLE project_documents (
    document_id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    uploaded_by_user_id INT NOT NULL,
    document_category ENUM('proposal', 'engineering_drawing', 'boq', 'schedule', 'utility_map', 'inspection_report', 'completion_certificate') NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    visibility ENUM('public', 'department_only', 'contractor_and_department', 'super_admin_only') DEFAULT 'department_only',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by_user_id) REFERENCES users(user_id)
) ENGINE=InnoDB;

-- Table 19: notifications
CREATE TABLE notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    link_url VARCHAR(255) NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table 20: activity_logs
CREATE TABLE activity_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    role_name VARCHAR(50) NOT NULL,
    action_name VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT NOT NULL,
    previous_state JSON NULL,
    new_state JSON NULL,
    ip_address VARCHAR(45) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

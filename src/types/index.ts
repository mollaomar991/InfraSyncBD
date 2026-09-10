export type Role =
  | 'super_admin'
  | 'department_officer'
  | 'contractor'
  | 'citizen';

export type AccountStatus =
  | 'Active'
  | 'Pending Verification'
  | 'More Documents Requested'
  | 'Rejected'
  | 'Suspended';

export type ProjectStatus =
  | 'Draft'
  | 'Submitted'
  | 'Conflict Detected'
  | 'Under Coordination'
  | 'Under Approval'
  | 'Final Approved'
  | 'Contractor Assigned'
  | 'Ongoing'
  | 'Delayed'
  | 'Inspection Pending'
  | 'Rework Required'
  | 'Completed'
  | 'Archived';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  organization: string;
  accountStatus: AccountStatus;
  phone?: string;
}

export interface Department {
  id: string;
  name: string;
  type: string;
  office: string;
  contact: string;
  status: 'Active' | 'Inactive';
}

export interface Project {
  id: string;
  name: string;
  type: string;
  department: string;
  contractor: string;
  area: string;
  road: string;
  latitude: number;
  longitude: number;
  startDate: string;
  endDate: string;
  budget: number;
  progress: number;
  plannedProgress: number;
  status: ProjectStatus;
  roadStatus: string;
  conflictLevel: 'None' | 'Low' | 'Medium' | 'High';
  approvalStatus: string;
  description: string;
}

export interface Registration {
  id: string;
  role: 'Department Officer' | 'Contractor';
  name: string;
  email: string;
  organization: string;
  designation: string;
  submittedDate: string;
  documentCount: number;
  status: AccountStatus;
}

export interface Conflict {
  id: string;
  level: 'Low' | 'Medium' | 'High';
  project: string;
  conflictingProject: string;
  departments: string;
  location: string;
  overlap: string;
  reason: string;
  recommendation: string;
  status: string;
}

export interface Approval {
  id: string;
  project: string;
  department: string;
  officer: string;
  pendingDays: number;
  status: 'Pending' | 'Approved' | 'Change Requested' | 'Rejected';
  impact: string;
}

export interface Contractor {
  id: string;
  name: string;
  licenseStatus: string;
  activeProjects: number;
  completedProjects: number;
  delayedProjects: number;
  performance: number;
  safety: number;
  failedInspections: number;
  complaints: number;
  risk: 'Low' | 'Medium' | 'High' | 'Blacklisted';
}

export interface Complaint {
  id: string;
  citizen: string;
  project: string;
  category: string;
  location: string;
  description: string;
  submittedDate: string;
  department: string;
  assignedTo: string;
  status:
    | 'Submitted'
    | 'Under Review'
    | 'Assigned'
    | 'In Progress'
    | 'Resolved'
    | 'Rejected'
    | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface Inspection {
  id: string;
  project: string;
  milestone: string;
  inspector: string;
  date: string;
  result:
    | 'Scheduled'
    | 'Passed'
    | 'Passed with Conditions'
    | 'Failed'
    | 'Reinspection Required';
  failedItems: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  role?: Role;
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export interface RegistrationInput {
  role: Exclude<Role, 'super_admin'>;
  name: string;
  email: string;
  phone: string;
  password: string;
  companyName?: string;
  department?: string;
  designation?: string;
  employeeId?: string;
  officeLocation?: string;
  tradeLicense?: string;
  contractorLicense?: string;
  companyAddress?: string;
  previousExperience?: string;
  equipmentInformation?: string;
  employeeInformation?: string;
}

export interface ProjectInput {
  name: string;
  type: string;
  description: string;
  budget: number;
  startDate: string;
  endDate: string;
  road: string;
  area: string;
  latitude: number;
  longitude: number;
}

export interface ComplaintInput {
  project: string;
  category: string;
  location: string;
  description: string;
}

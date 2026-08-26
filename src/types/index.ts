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
  | 'Restoration Pending'
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
  geometryType?: 'point' | 'polyline' | 'polygon';
  coordinates?: [number, number][];
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

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export interface RegistrationInput {
  role: Role;
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
  coordinates: [number, number][];
}

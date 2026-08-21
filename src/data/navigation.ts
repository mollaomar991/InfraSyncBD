import type { NavigationItem } from '../types/navigation';

export const navigationItems: NavigationItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: '▦',
    roles: ['super_admin', 'department_officer', 'contractor', 'citizen'],
  },
  {
    label: 'Departments',
    path: '/departments',
    icon: '◆',
    roles: ['super_admin'],
  },
  {
    label: 'Account Verification',
    path: '/verification',
    icon: '✓',
    roles: ['super_admin'],
  },
  {
    label: 'User Access',
    path: '/users',
    icon: '●',
    roles: ['super_admin'],
  },
  {
    label: 'Project Monitor',
    path: '/projects',
    icon: '▤',
    roles: ['super_admin'],
  },
  {
    label: 'Projects',
    path: '/projects',
    icon: '▤',
    roles: ['department_officer', 'contractor', 'citizen'],
  },
  {
    label: 'Create Project',
    path: '/projects/new',
    icon: '+',
    roles: ['department_officer'],
  },
  {
    label: 'GIS Map',
    path: '/map',
    icon: '⌖',
    roles: ['super_admin', 'department_officer', 'contractor', 'citizen'],
  },
  {
    label: 'Conflict Alerts',
    path: '/conflicts',
    icon: '!',
    roles: ['super_admin', 'department_officer'],
  },
  {
    label: 'Coordination',
    path: '/coordination',
    icon: '↔',
    roles: ['department_officer'],
  },
  {
    label: 'Approvals',
    path: '/approvals',
    icon: '✓',
    roles: ['super_admin', 'department_officer'],
  },
  {
    label: 'Contractors',
    path: '/contractors',
    icon: '▲',
    roles: ['super_admin', 'department_officer'],
  },
  {
    label: 'Progress',
    path: '/progress',
    icon: '▰',
    roles: ['department_officer', 'contractor'],
  },
  {
    label: 'Complaints',
    path: '/complaints',
    icon: '◉',
    roles: ['super_admin', 'department_officer', 'contractor', 'citizen'],
  },
  {
    label: 'Submit Complaint',
    path: '/complaints/new',
    icon: '+',
    roles: ['citizen'],
  },
  {
    label: 'Inspections',
    path: '/inspections',
    icon: '◎',
    roles: ['super_admin', 'department_officer', 'contractor'],
  },
  {
    label: 'Road Restoration',
    path: '/restoration',
    icon: '▰',
    roles: ['super_admin', 'department_officer', 'contractor'],
  },
  {
    label: 'Reports',
    path: '/reports',
    icon: '▥',
    roles: ['super_admin', 'department_officer'],
  },
  {
    label: 'Notifications',
    path: '/notifications',
    icon: '◌',
    roles: ['super_admin', 'department_officer', 'contractor', 'citizen'],
  },
];

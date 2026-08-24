import type { NavigationItem } from '../types/navigation';

export const navigationItems: NavigationItem[] = [
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
    label: 'Projects',
    path: '/projects',
    icon: '▤',
    roles: ['super_admin', 'department_officer', 'contractor', 'citizen'],
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
];

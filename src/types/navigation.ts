import type { Role } from './index';

export interface NavigationItem {
  label: string;
  path: string;
  icon: string;
  roles: Role[];
}

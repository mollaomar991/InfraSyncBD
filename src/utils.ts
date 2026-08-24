import type { Role } from './types';

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0,
  }).format(value);
}

export function roleLabel(role: Role) {
  const labels: Record<Role, string> = {
    super_admin: 'Super Admin',
    department_officer: 'Department Officer',
    contractor: 'Contractor',
    citizen: 'Citizen',
  };

  return labels[role];
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}

export function statusTone(status: string) {
  const normalized = status.toLowerCase();

  if (
    normalized.includes('approved') ||
    normalized.includes('active') ||
    normalized.includes('passed') ||
    normalized.includes('resolved') ||
    normalized.includes('completed') ||
    normalized.includes('low')
  ) {
    return 'success';
  }

  if (
    normalized.includes('rejected') ||
    normalized.includes('failed') ||
    normalized.includes('critical') ||
    normalized.includes('high') ||
    normalized.includes('delayed') ||
    normalized.includes('rework') ||
    normalized.includes('suspended')
  ) {
    return 'danger';
  }

  if (
    normalized.includes('pending') ||
    normalized.includes('medium') ||
    normalized.includes('scheduled') ||
    normalized.includes('review') ||
    normalized.includes('assigned')
  ) {
    return 'warning';
  }

  return 'info';
}

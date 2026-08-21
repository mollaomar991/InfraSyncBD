import { useApp } from '../context/AppContext';
import CitizenDashboard from './citizen/CitizenDashboard';
import ContractorDashboard from './contractor/ContractorDashboard';
import OfficerDashboard from './officer/OfficerDashboard';
import SuperAdminDashboard from './admin/SuperAdminDashboard';

function DashboardPage() {
  const { currentUser } = useApp();

  if (!currentUser) return null;

  switch (currentUser.role) {
    case 'super_admin':
      return <SuperAdminDashboard />;
    case 'department_officer':
      return <OfficerDashboard />;
    case 'contractor':
      return <ContractorDashboard />;
    case 'citizen':
      return <CitizenDashboard />;
    default:
      return null;
  }
}

export default DashboardPage;

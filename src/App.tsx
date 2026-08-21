import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Toast from './components/Toast';
import { useApp } from './context/AppContext';
import ApprovalsPage from './pages/ApprovalsPage';
import ComplaintsPage from './pages/ComplaintsPage';
import ConflictsPage from './pages/ConflictsPage';
import ContractorsPage from './pages/ContractorsPage';
import CoordinationPage from './pages/CoordinationPage';
import CreateProjectPage from './pages/CreateProjectPage';
import DashboardPage from './pages/DashboardPage';
import DepartmentsPage from './pages/DepartmentsPage';
import InspectionsPage from './pages/InspectionsPage';
import LoginPage from './pages/LoginPage';
import MapPage from './pages/MapPage';
import NotFoundPage from './pages/NotFoundPage';
import NotificationsPage from './pages/NotificationsPage';
import ProgressPage from './pages/ProgressPage';
import ProjectsPage from './pages/ProjectsPage';
import ReportsPage from './pages/ReportsPage';
import RestorationPage from './pages/RestorationPage';
import SignupPage from './pages/SignupPage';
import SubmitComplaintPage from './pages/SubmitComplaintPage';
import UsersPage from './pages/UsersPage';
import VerificationPage from './pages/VerificationPage';

function HomeRedirect() {
  const { currentUser } = useApp();
  return <Navigate to={currentUser ? '/dashboard' : '/login'} replace />;
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/complaints" element={<ComplaintsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />

          <Route
            path="/projects/new"
            element={
              <ProtectedRoute allowedRoles={['department_officer']}>
                <CreateProjectPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/departments"
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <DepartmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/verification"
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <VerificationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/conflicts"
            element={
              <ProtectedRoute
                allowedRoles={['super_admin', 'department_officer']}
              >
                <ConflictsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coordination"
            element={
              <ProtectedRoute allowedRoles={['department_officer']}>
                <CoordinationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/approvals"
            element={
              <ProtectedRoute
                allowedRoles={['super_admin', 'department_officer']}
              >
                <ApprovalsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contractors"
            element={
              <ProtectedRoute
                allowedRoles={['super_admin', 'department_officer']}
              >
                <ContractorsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/progress"
            element={
              <ProtectedRoute
                allowedRoles={['department_officer', 'contractor']}
              >
                <ProgressPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/complaints/new"
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <SubmitComplaintPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inspections"
            element={
              <ProtectedRoute
                allowedRoles={[
                  'super_admin',
                  'department_officer',
                  'contractor',
                ]}
              >
                <InspectionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/restoration"
            element={
              <ProtectedRoute
                allowedRoles={[
                  'super_admin',
                  'department_officer',
                  'contractor',
                ]}
              >
                <RestorationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute
                allowedRoles={['super_admin', 'department_officer']}
              >
                <ReportsPage />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toast />
    </>
  );
}

export default App;

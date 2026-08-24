import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Toast from './components/Toast';
import { useApp } from './context/AppContext';
import CreateProjectPage from './pages/CreateProjectPage';
import LoginPage from './pages/LoginPage';
import MapPage from './pages/MapPage';
import ProjectsPage from './pages/ProjectsPage';
import SignupPage from './pages/SignupPage';
import UsersPage from './pages/UsersPage';
import VerificationPage from './pages/VerificationPage';

function HomeRedirect() {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/login" replace />;
  return (
    <Navigate
      to={currentUser.role === 'super_admin' ? '/users' : '/projects'}
      replace
    />
  );
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
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/map" element={<MapPage />} />

          <Route
            path="/projects/new"
            element={
              <ProtectedRoute allowedRoles={['department_officer']}>
                <CreateProjectPage />
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
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toast />
    </>
  );
}

export default App;

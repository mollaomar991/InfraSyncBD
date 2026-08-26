import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import api from '../api/axiosClient';
import type {
  AccountStatus,
  Department,
  Project,
  ProjectInput,
  Registration,
  RegistrationInput,
  ToastMessage,
  User,
} from '../types';

interface LoginResult {
  success: boolean;
  message: string;
  user?: User;
}

interface RegisterResult {
  success: boolean;
  message: string;
  status?: AccountStatus;
}

interface AppContextValue {
  currentUser: User | null;
  users: User[];
  departments: Department[];
  projects: Project[];
  registrations: Registration[];
  toast: ToastMessage | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  register: (input: RegistrationInput) => Promise<RegisterResult>;
  addProject: (input: ProjectInput) => Promise<Project>;
  updateUserStatus: (userId: string, status: AccountStatus) => void;
  updateRegistrationStatus: (
    registrationId: string,
    status: AccountStatus,
  ) => Promise<void>;
  showToast: (message: string, type?: ToastMessage['type']) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    // Initial fetch
    fetchMe();
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (currentUser?.role === 'super_admin') {
      fetchUsers();
      fetchPendingVerifications();
    }
  }, [currentUser]);

  async function fetchMe() {
    const token = localStorage.getItem('infrasync_token');
    if (!token) return;
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) setCurrentUser(res.data.user);
    } catch (e) {
      console.error(e);
      localStorage.removeItem('infrasync_token');
    }
  }

  async function fetchDepartments() {
    try {
      const res = await api.get('/departments');
      if (res.data.success) {
        setDepartments(res.data.data.map((d: any) => ({
          id: d.department_id.toString(),
          name: d.department_name,
          type: d.department_type,
        })));
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchUsers() {
    try {
      const res = await api.get('/admin/users');
      if (res.data.success) setUsers(res.data.data);
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchPendingVerifications() {
    try {
      const res = await api.get('/admin/pending-verifications');
      if (res.data.success) setRegistrations(res.data.data);
    } catch (e) {
      console.error(e);
    }
  }

  function showToast(
    message: string,
    type: ToastMessage['type'] = 'success',
  ) {
    const nextToast = { id: Date.now(), message, type };
    setToast(nextToast);
    window.setTimeout(() => {
      setToast((activeToast) =>
        activeToast?.id === nextToast.id ? null : activeToast,
      );
    }, 3200);
  }

  async function login(email: string, password: string): Promise<LoginResult> {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('infrasync_token', res.data.token);
        setCurrentUser(res.data.user);
        return { success: true, message: 'Login successful.', user: res.data.user };
      }
      return { success: false, message: 'Login failed' };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  }

  function logout() {
    localStorage.removeItem('infrasync_token');
    setCurrentUser(null);
    showToast('You have been signed out.', 'info');
  }

  async function register(input: RegistrationInput): Promise<RegisterResult> {
    try {
      const res = await api.post('/auth/register', input);
      if (res.data.success) {
        return { success: true, message: res.data.message, status: res.data.status };
      }
      return { success: false, message: 'Registration failed' };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  }

  async function addProject(input: ProjectInput): Promise<Project> {
    // Project integration to be done in Module 2 API
    const project: Project = {
      id: `PRJ-${Date.now().toString().slice(-6)}`,
      ...input,
      department: currentUser?.organization || 'Road Department',
      contractor: 'Not assigned',
      progress: 0,
      plannedProgress: 0,
      status: 'Draft',
      roadStatus: 'Open',
      conflictLevel: 'None',
      approvalStatus: 'Not submitted',
    };
    setProjects([project, ...projects]);
    showToast('Project saved (Mock Data for now)');
    return project;
  }

  async function updateUserStatus(userId: string, status: AccountStatus) {
    try {
      await api.put(`/admin/users/${userId}/status`, { status });
      fetchUsers();
      showToast(`User account changed to ${status}.`, 'info');
    } catch (error) {
      showToast('Error updating status', 'error');
    }
  }

  async function updateRegistrationStatus(
    registrationId: string,
    status: AccountStatus,
  ): Promise<void> {
    try {
      const dbStatus = status === 'Active' ? 'active' : 'rejected';
      await api.put(`/admin/verify-user/${registrationId}`, { status: dbStatus });
      fetchPendingVerifications();
      fetchUsers();
      showToast(`Registration status changed to ${status}.`, 'info');
    } catch (error) {
      showToast('Error verifying user', 'error');
    }
  }

  const contextValue: AppContextValue = {
    currentUser,
    users,
    departments,
    projects,
    registrations,
    toast,
    login,
    logout,
    register,
    addProject,
    updateUserStatus,
    updateRegistrationStatus,
    showToast,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider.');
  return context;
}

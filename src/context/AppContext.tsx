import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

// Removed mockData imports
import api from '../api/axiosClient';
import type {
  AccountStatus,
  Complaint,
  ComplaintInput,
  Department,
  NotificationItem,
  Project,
  ProjectInput,
  Registration,
  RegistrationInput,
  Role,
  ToastMessage,
  User,
  Approval,
  Conflict,
  Inspection,
  Contractor
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
  complaints: Complaint[];
  registrations: Registration[];
  notifications: NotificationItem[];
  approvals: Approval[];
  conflicts: Conflict[];
  inspections: Inspection[];
  contractors: Contractor[];
  toast: ToastMessage | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  register: (input: RegistrationInput) => Promise<RegisterResult>;
  addProject: (input: ProjectInput) => Promise<Project>;
  addDepartment: (department: Department) => void;
  updateUserStatus: (userId: string, status: AccountStatus) => void;
  addComplaint: (input: ComplaintInput) => Complaint;
  updateRegistrationStatus: (
    registrationId: string,
    status: AccountStatus,
  ) => Promise<void>;
  updateProjectProgress: (projectId: string, payload: any) => Promise<void>;
  updateComplaintStatus: (
    complaintId: string,
    status: Complaint['status'],
  ) => void;
  showToast: (message: string, type?: ToastMessage['type']) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const STORAGE_KEYS = {
  currentUser: 'infrasync.mosh.v2.currentUser',
  users: 'infrasync.mosh.v2.users',
  departments: 'infrasync.mosh.v2.departments',
  projects: 'infrasync.mosh.v2.projects',
  complaints: 'infrasync.mosh.v2.complaints',
  registrations: 'infrasync.mosh.v2.registrations',
  notifications: 'infrasync.mosh.v2.notifications',
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const savedValue = localStorage.getItem(key);
    return savedValue ? (JSON.parse(savedValue) as T) : fallback;
  } catch {
    return fallback;
  }
}

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(() =>
    readStorage<User | null>(STORAGE_KEYS.currentUser, null),
  );
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    // Initial fetch
    fetchMe();
    fetchDepartments();
    fetchProjects();
    fetchApprovals();
    fetchConflicts();
    fetchInspections();
    fetchContractors();
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

  async function fetchProjects() {
    try {
      const res = await api.get('/projects');
      if (res.data.success) {
        // Map database fields to frontend Project interface
        const mapped = res.data.data.map((p: any) => ({
          id: p.project_code || `PRJ-${p.project_id}`,
          name: p.project_name,
          type: p.project_type || 'Road Construction',
          department: p.department_name || 'Unknown',
          contractor: 'Not assigned',
          area: p.area_name || 'N/A',
          road: p.road_name || 'N/A',
          latitude: p.latitude || 23.8103,
          longitude: p.longitude || 90.4125,
          geometryType: p.geometry_type || 'point',
          coordinates: p.coordinates_json ? (typeof p.coordinates_json === 'string' ? JSON.parse(p.coordinates_json) : p.coordinates_json) : undefined,
          startDate: p.start_date ? new Date(p.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
          endDate: p.target_completion_date ? new Date(p.target_completion_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
          budget: p.budget || 0,
          progress: p.progress_percentage || 0,
          plannedProgress: 0,
          status: p.status || 'draft',
          roadStatus: 'Open',
          conflictLevel: 'None',
          approvalStatus: p.status || 'draft',
          description: p.description || '',
        }));
        setProjects(mapped);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchApprovals() {
    try {
      const res = await api.get('/approvals');
      if (res.data.success) setApprovals(res.data.data);
    } catch (e) { console.error(e); }
  }

  async function fetchConflicts() {
    try {
      const res = await api.get('/conflicts');
      if (res.data.success) {
        const mapped = res.data.data.map((c: any) => ({
          id: `CONF-${c.conflict_id}`,
          project1: c.project_name,
          project2: c.conflicting_project_name,
          department1: c.project_department,
          department2: c.conflicting_department,
          type: c.conflict_type || 'Schedule Overlap',
          status: c.resolution_status === 'resolved' ? 'Resolved' : 'Active',
          description: c.resolution_notes || 'Conflict detected',
          detectedDate: c.created_at
        }));
        setConflicts(mapped);
      }
    } catch (e) { console.error(e); }
  }

  async function fetchInspections() {
    try {
      const res = await api.get('/inspections');
      if (res.data.success) setInspections(res.data.data);
    } catch (e) { console.error(e); }
  }

  async function fetchContractors() {
    try {
      const res = await api.get('/contractors');
      if (res.data.success) setContractors(res.data.data);
    } catch (e) { console.error(e); }
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

  // ── Module 1: Authentication (API-backed) ──────────────────────

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

  // ── Module 2: Project Management (API-backed) ──────────────────

  async function addProject(input: ProjectInput): Promise<Project> {
    try {
      const res = await api.post('/projects', input);
      if (res.data.success) {
        fetchProjects();
        showToast('Project created successfully!', 'success');
        return res.data.data;
      }
      throw new Error('Failed to create project');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to create project', 'error');
      throw error;
    }
  }

  async function updateProjectProgress(projectId: string, payload: any): Promise<void> {
    try {
      // Send progress data to the backend
      const res = await api.post('/progress/submit', payload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.data.success) {
        // Just update local progress state to reflect changes instantly (simplified)
        const safeProgress = Math.max(0, Math.min(100, Number(payload.get('physicalProgress')) || 0));
        setProjects((currentProjects) =>
          currentProjects.map((project) => {
            if (project.id !== projectId) return project;
            const status = safeProgress === 100 ? 'Completed' : payload.get('delayReason') ? 'Delayed' : 'Ongoing';
            return { ...project, progress: safeProgress, status };
          })
        );
        showToast('Project progress updated on the server.');
      }
    } catch (error) {
      console.error('Failed to update progress', error);
      showToast('Failed to save progress update.', 'error');
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

  // ── Remaining functions (unchanged, still localStorage) ────────

  function addDepartment(department: Department) {
    setDepartments((currentDepartments) => [
      ...currentDepartments,
      department,
    ]);
    showToast(`${department.name} added to the official directory.`);
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

  function addComplaint(input: ComplaintInput): Complaint {
    const project = projects.find((item) => item.name === input.project);
    const complaint: Complaint = {
      id: `CMP-${Date.now().toString().slice(-6)}`,
      citizen: currentUser?.name || 'Citizen',
      project: input.project,
      category: input.category,
      location: input.location,
      description: input.description,
      submittedDate: new Date().toISOString().slice(0, 10),
      department: project?.department || 'Pending assignment',
      assignedTo: 'Unassigned',
      status: 'Submitted',
      priority: input.category === 'Unsafe Construction' ? 'Critical' : 'Medium',
    };

    setComplaints((currentComplaints) => [complaint, ...currentComplaints]);
    showToast(`Complaint ${complaint.id} submitted successfully.`);
    return complaint;
  }

  function updateComplaintStatus(
    complaintId: string,
    status: Complaint['status'],
  ) {
    setComplaints((currentComplaints) =>
      currentComplaints.map((complaint) =>
        complaint.id === complaintId ? { ...complaint, status } : complaint,
      ),
    );
    showToast(`Complaint status changed to ${status}.`, 'info');
  }

  const contextValue: AppContextValue = {
    currentUser,
    users,
    departments,
    projects,
    complaints,
    registrations,
    notifications,
    approvals,
    conflicts,
    inspections,
    contractors,
    toast,
    login,
    logout,
    register,
    addProject,
    addDepartment,
    updateUserStatus,
    addComplaint,
    updateRegistrationStatus,
    updateProjectProgress,
    updateComplaintStatus,
    showToast,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useApp must be used inside AppProvider.');
  }

  return context;
}

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import {
  complaints as initialComplaints,
  departments as initialDepartments,
  notifications as initialNotifications,
  projects as initialProjects,
  registrations as initialRegistrations,
  users as initialUsers,
} from '../data/mockData';
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
  updateProjectProgress: (projectId: string, progress: number) => Promise<void>;
  updateComplaintStatus: (
    complaintId: string,
    status: Complaint['status'],
  ) => void;
  showToast: (message: string, type?: ToastMessage['type']) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const STORAGE_KEYS = {
  currentUser: 'infrasync.mosh.v1.currentUser',
  users: 'infrasync.mosh.v1.users',
  departments: 'infrasync.mosh.v1.departments',
  projects: 'infrasync.mosh.v1.projects',
  complaints: 'infrasync.mosh.v1.complaints',
  registrations: 'infrasync.mosh.v1.registrations',
  notifications: 'infrasync.mosh.v1.notifications',
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
  const [users, setUsers] = useState<User[]>(() =>
    readStorage(STORAGE_KEYS.users, initialUsers),
  );
  const [departments, setDepartments] = useState<Department[]>(() =>
    readStorage(STORAGE_KEYS.departments, initialDepartments),
  );
  const [projects, setProjects] = useState<Project[]>(() =>
    readStorage(STORAGE_KEYS.projects, initialProjects),
  );
  const [complaints, setComplaints] = useState<Complaint[]>(() =>
    readStorage(STORAGE_KEYS.complaints, initialComplaints),
  );
  const [registrations, setRegistrations] = useState<Registration[]>(() =>
    readStorage(STORAGE_KEYS.registrations, initialRegistrations),
  );
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    readStorage(STORAGE_KEYS.notifications, initialNotifications),
  );
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Sync to localStorage for offline fallback
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.departments,
      JSON.stringify(departments),
    );
  }, [departments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.complaints, JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.registrations,
      JSON.stringify(registrations),
    );
  }, [registrations]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.notifications,
      JSON.stringify(notifications),
    );
  }, [notifications]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(
        STORAGE_KEYS.currentUser,
        JSON.stringify(currentUser),
      );
    } else {
      localStorage.removeItem(STORAGE_KEYS.currentUser);
    }
  }, [currentUser]);



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
    const matchingUser = users.find(
      (user) =>
        user.email.toLowerCase() === email.trim().toLowerCase(),
    );

    if (!matchingUser || matchingUser.password !== password) {
      return {
        success: false,
        message: 'The email or password is incorrect.',
      };
    }

    if (matchingUser.accountStatus !== 'Active') {
      return {
        success: false,
        message: `This account is currently ${matchingUser.accountStatus}.`,
      };
    }

    setCurrentUser(matchingUser);
    return { success: true, message: 'Login successful.', user: matchingUser };
  }

  function logout() {
    setCurrentUser(null);
    showToast('You have been signed out.', 'info');
  }

  async function register(input: RegistrationInput): Promise<RegisterResult> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const emailExists = users.some(
      (user) => user.email.toLowerCase() === normalizedEmail,
    );

    if (emailExists) {
      return {
        success: false,
        message: 'An account with this email already exists.',
      };
    }

    const isCitizen = input.role === 'citizen';
    const accountStatus: AccountStatus = isCitizen
      ? 'Active'
      : 'Pending Verification';
    const organization =
      input.role === 'department_officer'
        ? input.department || 'Unassigned Department'
        : input.role === 'contractor'
          ? input.companyName || 'Contractor Company'
          : 'Public User';

    const newUser: User = {
      id: `USR-${Date.now()}`,
      name: input.name,
      email: normalizedEmail,
      password: input.password,
      phone: input.phone,
      role: input.role,
      organization,
      accountStatus,
    };

    setUsers((currentUsers) => [...currentUsers, newUser]);

    if (!isCitizen) {
      const newRegistration: Registration = {
        id: `REG-${Date.now()}`,
        role:
          input.role === 'department_officer'
            ? 'Department Officer'
            : 'Contractor',
        name: input.name,
        email: normalizedEmail,
        organization,
        designation:
          input.role === 'department_officer'
            ? input.designation || 'Department Officer'
            : 'Contractor Company',
        submittedDate: new Date().toISOString().slice(0, 10),
        documentCount: input.role === 'department_officer' ? 3 : 4,
        status: 'Pending Verification',
      };

      setRegistrations((currentRegistrations) => [
        newRegistration,
        ...currentRegistrations,
      ]);
    }

    setNotifications((currentNotifications) => [
      {
        id: `NTF-${Date.now()}`,
        title: isCitizen ? 'Citizen account created' : 'Verification submitted',
        message: isCitizen
          ? `${input.name} can now sign in to the citizen portal.`
          : `${input.name} is waiting for Super Admin verification.`,
        time: 'Just now',
        read: false,
        role: isCitizen ? 'citizen' : 'super_admin',
      },
      ...currentNotifications,
    ]);

    return {
      success: true,
      message: isCitizen
        ? 'Your citizen account is active. You can sign in now.'
        : 'Registration submitted. Wait for Super Admin verification.',
      status: accountStatus,
    };
  }

  // ── Module 2: Project Management (API-backed) ──────────────────

  async function addProject(input: ProjectInput): Promise<Project> {
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

    setProjects((currentProjects) => [project, ...currentProjects]);
    showToast('Project saved as a draft.');
    return project;
  }

  async function updateProjectProgress(projectId: string, progress: number): Promise<void> {
    const safeProgress = Math.max(0, Math.min(100, progress));
    setProjects((currentProjects) =>
      currentProjects.map((project) => {
        if (project.id !== projectId) return project;

        const status =
          safeProgress === 100
            ? 'Restoration Pending'
            : safeProgress + 10 < project.plannedProgress
              ? 'Delayed'
              : 'Ongoing';

        return { ...project, progress: safeProgress, status };
      }),
    );
    showToast('Project progress updated.');
  }

  async function updateRegistrationStatus(
    registrationId: string,
    status: AccountStatus,
  ): Promise<void> {
    const registration = registrations.find(
      (item) => item.id === registrationId,
    );

    setRegistrations((currentRegistrations) =>
      currentRegistrations.map((item) =>
        item.id === registrationId ? { ...item, status } : item,
      ),
    );

    if (registration) {
      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.email === registration.email
            ? { ...user, accountStatus: status }
            : user,
        ),
      );
    }

    showToast(`Registration status changed to ${status}.`, 'info');
  }

  // ── Remaining functions (unchanged, still localStorage) ────────

  function addDepartment(department: Department) {
    setDepartments((currentDepartments) => [
      ...currentDepartments,
      department,
    ]);
    showToast(`${department.name} added to the official directory.`);
  }

  function updateUserStatus(userId: string, status: AccountStatus) {
    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === userId ? { ...user, accountStatus: status } : user,
      ),
    );
    showToast(`User account changed to ${status}.`, 'info');
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

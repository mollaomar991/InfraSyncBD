import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import {
  departments as initialDepartments,
  projects as initialProjects,
  registrations as initialRegistrations,
  users as initialUsers,
} from '../data/mockData';
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

const STORAGE_KEYS = {
  currentUser: 'infrasync.two-modules.currentUser',
  users: 'infrasync.two-modules.users',
  projects: 'infrasync.two-modules.projects',
  registrations: 'infrasync.two-modules.registrations',
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
  const [projects, setProjects] = useState<Project[]>(() =>
    readStorage(STORAGE_KEYS.projects, initialProjects),
  );
  const [registrations, setRegistrations] = useState<Registration[]>(() =>
    readStorage(STORAGE_KEYS.registrations, initialRegistrations),
  );
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.registrations,
      JSON.stringify(registrations),
    );
  }, [registrations]);

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

  async function login(email: string, password: string): Promise<LoginResult> {
    const matchingUser = users.find(
      (user) => user.email.toLowerCase() === email.trim().toLowerCase(),
    );

    if (!matchingUser || matchingUser.password !== password) {
      return { success: false, message: 'The email or password is incorrect.' };
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
      return { success: false, message: 'An account with this email already exists.' };
    }

    const isCitizen = input.role === 'citizen';
    const isSuperAdmin = input.role === 'super_admin';
    const requiresVerification =
      input.role === 'department_officer' || input.role === 'contractor';
    const accountStatus: AccountStatus = requiresVerification
      ? 'Pending Verification'
      : 'Active';
    const organization =
      input.role === 'department_officer'
        ? input.department || 'Unassigned Department'
        : input.role === 'contractor'
          ? input.companyName || 'Contractor Company'
          : isSuperAdmin
            ? 'InfraSync BD Administration'
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

    if (requiresVerification) {
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

    return {
      success: true,
      message: isSuperAdmin
        ? 'Your Super Admin account is active. You can sign in now.'
        : isCitizen
          ? 'Your citizen account is active. You can sign in now.'
          : 'Registration submitted. Wait for Super Admin verification.',
      status: accountStatus,
    };
  }

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

  function updateUserStatus(userId: string, status: AccountStatus) {
    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === userId ? { ...user, accountStatus: status } : user,
      ),
    );
    showToast(`User account changed to ${status}.`, 'info');
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

  const contextValue: AppContextValue = {
    currentUser,
    users,
    departments: initialDepartments,
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

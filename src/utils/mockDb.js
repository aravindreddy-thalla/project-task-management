import { 
  auth, 
  db, 
  isFirebaseConfigured 
} from '../firebase';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  addDoc 
} from 'firebase/firestore';

// Predefined users and roles
export const MOCK_USERS = [
  { id: 'u1', name: 'Aravind', email: 'aravind@company.com', role: 'admin', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
  { id: 'u2', name: 'Keerthi', email: 'keerthi@company.com', role: 'manager', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
  { id: 'u3', name: 'Suresh Kumar', email: 'suresh@company.com', role: 'employee', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150' },
  { id: 'u4', name: 'Raju Sharma', email: 'raju@company.com', role: 'employee', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150' },
  { id: 'u5', name: 'Sai Ram', email: 'sai@company.com', role: 'employee', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
];

const INITIAL_TASKS = [
  {
    id: 't1',
    title: 'Optimize Mobile View Performance',
    description: 'Ensure smooth layout rendering, optimize image scales, and compress style libraries to improve overall Web Vitals score on mobile.',
    status: 'done',
    priority: 'high',
    assigneeId: 'u3',
    dueDate: '2026-06-20',
    attachments: [],
    comments: [
      { id: 'c1', userId: 'u1', userName: 'Aravind', text: 'Checked performance report. Visual weight looks great.', timestamp: '2026-06-19T14:30:00.000Z' }
    ]
  },
  {
    id: 't2',
    title: 'Audit CSS Variables & Color Schemes',
    description: 'Establish standard spacing limits and document key variables to simplify theme customization.',
    status: 'done',
    priority: 'medium',
    assigneeId: 'u2',
    dueDate: '2026-06-22',
    attachments: [],
    comments: []
  },
  {
    id: 't3',
    title: 'Integrate WCAG Web Accessibility Standards',
    description: 'Audit semantic headings hierarchy, add proper aria descriptors to widgets, and ensure keyboard focus flows correctly.',
    status: 'todo',
    priority: 'high',
    assigneeId: 'u3',
    dueDate: '2026-07-01',
    attachments: [],
    comments: []
  },
  {
    id: 't4',
    title: 'Configure Content Security Policy (CSP)',
    description: 'Define strict CSP headers in build config script outputs to prevent cross-site scripting risks.',
    status: 'todo',
    priority: 'medium',
    assigneeId: 'u4',
    dueDate: '2026-07-02',
    attachments: [],
    comments: []
  },
  {
    id: 't5',
    title: 'Setup Service Worker Caching Strategies',
    description: 'Configure runtime resource paths using custom caching methods to enable offline app support.',
    status: 'todo',
    priority: 'high',
    assigneeId: 'u5',
    dueDate: '2026-07-03',
    attachments: [],
    comments: []
  },
  {
    id: 't6',
    title: 'Configure Webpack Code Splitting',
    description: 'Analyze import layouts to separate core vendors bundle from routes and load modules dynamically.',
    status: 'in-progress',
    priority: 'medium',
    assigneeId: 'u5',
    dueDate: '2026-06-30',
    attachments: [],
    comments: []
  },
  {
    id: 't7',
    title: 'Audit Third-Party Script Weights',
    description: 'Evaluate bundle loads of analytic pixels, verify defer settings, and optimize async configurations.',
    status: 'todo',
    priority: 'low',
    assigneeId: 'u5',
    dueDate: '2026-07-06',
    attachments: [],
    comments: []
  },
  {
    id: 't8',
    title: 'Implement Core SEO Semantic Elements',
    description: 'Structure schema markup, verify meta title tags rendering, and optimize heading structures.',
    status: 'todo',
    priority: 'low',
    assigneeId: 'u4',
    dueDate: '2026-07-08',
    attachments: [],
    comments: []
  },
  {
    id: 't9',
    title: 'Review Sprint 2 Production Build',
    description: 'Perform bundle audits, check minification outputs, verify layout responsiveness, and approve pipeline release.',
    status: 'in-review',
    priority: 'high',
    assigneeId: 'u2',
    dueDate: '2026-06-29',
    attachments: [],
    comments: []
  },
  {
    id: 't10',
    title: 'Build Glassmorphism Form Components',
    description: 'Create visual workspace fields, implement CSS blur effects, and define standard input parameters.',
    status: 'done',
    priority: 'high',
    assigneeId: 'u4',
    dueDate: '2026-06-25',
    attachments: [],
    comments: []
  }
];

const INITIAL_MESSAGES = {
  general: [
    { id: 'm1', userId: 'u1', userName: 'Aravind', text: 'Welcome team to the real-time project hub!', timestamp: '2026-06-25T10:00:00.000Z' },
    { id: 'm2', userId: 'u2', userName: 'Keerthi', text: 'Excited to be working on this layout. I am mapping out task models now.', timestamp: '2026-06-25T10:05:00.000Z' }
  ],
  'dev-team': [
    { id: 'm3', userId: 'u3', userName: 'Suresh Kumar', text: 'Are we using standard Socket.IO hooks on the client?', timestamp: '2026-06-25T10:10:00.000Z' },
    { id: 'm4', userId: 'u2', userName: 'Keerthi', text: 'Yes, but for testing we can simulate websocket channels directly in React state.', timestamp: '2026-06-25T10:12:00.000Z' }
  ],
  'design-team': [
    { id: 'm5', userId: 'u4', userName: 'Raju Sharma', text: 'I am compiling the UI design system sheets today.', timestamp: '2026-06-25T10:15:00.000Z' }
  ]
};

const INITIAL_LOGS = [
  { id: 'l1', type: 'system', text: 'Project management workspace initialized.', timestamp: '2026-06-25T09:00:00.000Z' },
  { id: 'l2', type: 'task', text: 'Aravind created task: Create Fluid Visual Workflow UI Components', timestamp: '2026-06-25T09:30:00.000Z' },
  { id: 'l3', type: 'comment', text: 'Suresh Kumar added a comment to Setup Socket.IO Event Handlers', timestamp: '2026-06-25T10:45:00.000Z' }
];

// Helper to initialize local storage
const initializeLocalStorage = () => {
  if (isFirebaseConfigured) return; // Skip if using actual Firebase

  const tasksStr = localStorage.getItem('tasks');
  if (tasksStr && (tasksStr.includes('Charlie Brown') || tasksStr.includes('Alice Smith') || tasksStr.includes('1494790108377-be9c29b29330') || tasksStr.includes('1438761681033-6461ffad8d80') || tasksStr.includes('Kanban') || tasksStr.includes('Design Core Architecture Schema'))) {
    localStorage.removeItem('tasks');
    localStorage.removeItem('messages');
    localStorage.removeItem('logs');
    localStorage.removeItem('current_user');
    localStorage.removeItem('jwt_token');
  }

  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(INITIAL_TASKS));
  }
  if (!localStorage.getItem('messages')) {
    localStorage.setItem('messages', JSON.stringify(INITIAL_MESSAGES));
  }
  if (!localStorage.getItem('logs')) {
    localStorage.setItem('logs', JSON.stringify(INITIAL_LOGS));
  }
};

// Firestore Seeder
export const initializeFirestoreDb = async () => {
  if (!isFirebaseConfigured) return;
  
  try {
    const tasksSnap = await getDocs(collection(db, 'tasks'));
    if (tasksSnap.empty) {
      console.log('Firebase Seeding: Populating Firestore with initial workspace data...');

      // Seed Tasks
      for (const task of INITIAL_TASKS) {
        await setDoc(doc(db, 'tasks', task.id), task);
      }

      // Seed Messages
      for (const msg of INITIAL_MESSAGES.general) {
        await addDoc(collection(db, 'messages'), { ...msg, room: 'general' });
      }
      for (const msg of INITIAL_MESSAGES['dev-team']) {
        await addDoc(collection(db, 'messages'), { ...msg, room: 'dev-team' });
      }
      for (const msg of INITIAL_MESSAGES['design-team']) {
        await addDoc(collection(db, 'messages'), { ...msg, room: 'design-team' });
      }

      // Seed Logs
      for (const log of INITIAL_LOGS) {
        await addDoc(collection(db, 'logs'), log);
      }

      // Seed default Users profiles mapping
      for (const user of MOCK_USERS) {
        await setDoc(doc(db, 'users', user.id), user);
      }

      console.log('Firebase Seeding: Completed successfully!');
    }
  } catch (err) {
    console.error('Firebase Seeding Error:', err);
  }
};

initializeLocalStorage();

export const getTasks = () => {
  initializeLocalStorage();
  return JSON.parse(localStorage.getItem('tasks')) || [];
};

export const saveTasks = (tasks) => {
  localStorage.setItem('tasks', JSON.stringify(tasks));
};

export const getMessages = () => {
  initializeLocalStorage();
  return JSON.parse(localStorage.getItem('messages')) || {};
};

export const saveMessages = (messages) => {
  localStorage.setItem('messages', JSON.stringify(messages));
};

export const getLogs = () => {
  initializeLocalStorage();
  return JSON.parse(localStorage.getItem('logs')) || [];
};

export const saveLogs = (logs) => {
  localStorage.setItem('logs', JSON.stringify(logs));
};

export const addLog = (type, text) => {
  const logs = getLogs();
  const newLog = {
    id: 'l_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    type,
    text,
    timestamp: new Date().toISOString()
  };
  logs.unshift(newLog);
  saveLogs(logs.slice(0, 100));
  return newLog;
};

// Authentication login
export const loginUser = async (email, password) => {
  const userEmail = email.toLowerCase();
  
  if (!isFirebaseConfigured) {
    // Local Storage Mock Login
    const user = MOCK_USERS.find(u => u.email === userEmail);
    if (!user) {
      throw new Error('User not found.');
    }
    const expectedPassword = user.email.split('@')[0] + '123';
    if (password !== expectedPassword) {
      throw new Error('Invalid password. Hint: Try using "' + expectedPassword + '"');
    }
    const fakeToken = btoa(JSON.stringify({ id: user.id, email: user.email, role: user.role, exp: Date.now() + 86400000 }));
    localStorage.setItem('jwt_token', fakeToken);
    localStorage.setItem('current_user', JSON.stringify(user));
    addLog('system', `${user.name} logged in successfully (Local Mock).`);
    return { user, token: fakeToken };
  }

  // Firebase Real Authentication
  const matchedMockUser = MOCK_USERS.find(u => u.email === userEmail);
  let userCredential;
  
  try {
    userCredential = await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    // Auto registration on Firebase Auth for preset accounts on first use
    if ((err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/invalid-email') && matchedMockUser) {
      try {
        const defaultPassword = matchedMockUser.email.split('@')[0] + '123';
        userCredential = await createUserWithEmailAndPassword(auth, email, defaultPassword);
      } catch (regErr) {
        throw new Error('Authentication failed: ' + err.message);
      }
    } else {
      throw new Error(err.message);
    }
  }

  const fbUser = userCredential.user;
  let userProfile = null;

  // Map credentials to Firestore profile doc
  const userDocRef = doc(db, 'users', fbUser.uid);
  const userDocSnap = await getDoc(userDocRef);

  if (matchedMockUser) {
    userProfile = {
      id: fbUser.uid,
      name: matchedMockUser.name,
      email: matchedMockUser.email,
      role: matchedMockUser.role,
      avatar: matchedMockUser.avatar
    };
    if (!userDocSnap.exists()) {
      await setDoc(userDocRef, userProfile);
    }
  } else {
    if (userDocSnap.exists()) {
      userProfile = userDocSnap.data();
    } else {
      userProfile = {
        id: fbUser.uid,
        name: email.split('@')[0],
        email: email,
        role: 'employee',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
      };
      await setDoc(userDocRef, userProfile);
    }
  }

  localStorage.setItem('jwt_token', fbUser.accessToken || 'fb_token');
  localStorage.setItem('current_user', JSON.stringify(userProfile));
  
  // Write login action log to Firestore
  try {
    await addDoc(collection(db, 'logs'), {
      type: 'system',
      text: `${userProfile.name} logged in successfully via Firebase.`,
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    console.error('Log write error', e);
  }

  return { user: userProfile, token: fbUser.accessToken };
};

export const getCurrentUser = () => {
  const userJson = localStorage.getItem('current_user');
  return userJson ? JSON.parse(userJson) : null;
};

export const logoutUser = async () => {
  const user = getCurrentUser();
  try {
    if (isFirebaseConfigured) {
      if (user) {
        try {
          await addDoc(collection(db, 'logs'), {
            type: 'system',
            text: `${user.name} logged out.`,
            timestamp: new Date().toISOString()
          });
        } catch (e) {}
      }
      await signOut(auth);
    } else {
      if (user) {
        addLog('system', `${user.name} logged out.`);
      }
    }
  } catch (err) {
    console.error("Firebase logout error:", err);
  } finally {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('current_user');
  }
};

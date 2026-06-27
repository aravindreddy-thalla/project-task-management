import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import KanbanBoard from './components/KanbanBoard';
import TaskModal from './components/TaskModal';
import ChatRooms from './components/ChatRooms';
import Reports from './components/Reports';
import ActivityLogs from './components/ActivityLogs';

import { 
  getCurrentUser, 
  logoutUser, 
  getTasks, 
  saveTasks, 
  getMessages, 
  saveMessages, 
  getLogs, 
  saveLogs, 
  addLog,
  initializeFirestoreDb
} from './utils/mockDb';
import { socketSimulator } from './utils/socketSimulator';

// Firebase core integrations
import { auth, db, isFirebaseConfigured } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  getDoc,
  getDocs,
  setDoc,
  updateDoc, 
  deleteDoc, 
  addDoc 
} from 'firebase/firestore';

export default function App() {
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [activeView, setActiveView] = useState('dashboard');
  
  // Database States
  const [tasks, setTasks] = useState([]);
  const [messages, setMessages] = useState({});
  const [logs, setLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Modal Control States
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [defaultColStatus, setDefaultColStatus] = useState('todo');

  // Load Initial Local Storage values (fallback mode)
  const reloadLocalDbState = () => {
    setTasks(getTasks());
    setMessages(getMessages());
    setLogs(getLogs());
  };

  // 1. Initialize Firebase Firestore Seeding (one-time on mount)
  useEffect(() => {
    if (isFirebaseConfigured) {
      initializeFirestoreDb();
    } else {
      reloadLocalDbState();
    }
  }, []);

  // 2. Listen to Firebase Auth state updates
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const userDocSnap = await getDoc(doc(db, 'users', fbUser.uid));
          if (userDocSnap.exists()) {
            const userProfile = userDocSnap.data();
            setCurrentUser(userProfile);
            localStorage.setItem('current_user', JSON.stringify(userProfile));
          } else {
            // Document missing fallback - Auto-create default user document in Firestore
            const userProfile = {
              id: fbUser.uid,
              name: fbUser.email.split('@')[0],
              email: fbUser.email,
              role: 'employee',
              avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
            };
            await setDoc(doc(db, 'users', fbUser.uid), userProfile);
            setCurrentUser(userProfile);
            localStorage.setItem('current_user', JSON.stringify(userProfile));
          }
        } catch (e) {
          console.error("Auth state fetch user error:", e);
          // Auto sign out on permission errors to prevent half-authenticated lockups
          try {
            await auth.signOut();
          } catch (signoutErr) {}
          setCurrentUser(null);
          localStorage.removeItem('current_user');
          localStorage.removeItem('jwt_token');
        }
      } else {
        setCurrentUser(null);
        localStorage.removeItem('current_user');
        localStorage.removeItem('jwt_token');
      }
    });

    return () => unsubscribe();
  }, []);

  // 3. Listen to Firestore Cloud Database collections in real-time
  useEffect(() => {
    if (!isFirebaseConfigured || !currentUser) return;

    // Real-time sync Tasks
    const unsubTasks = onSnapshot(collection(db, 'tasks'), (snapshot) => {
      const tasksList = [];
      snapshot.forEach(docSnap => {
        tasksList.push({ id: docSnap.id, ...docSnap.data() });
      });
      setTasks(tasksList);
    });

    // Real-time sync Chat messages
    const unsubMessages = onSnapshot(collection(db, 'messages'), (snapshot) => {
      const roomMessages = {};
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        const room = data.room || 'general';
        roomMessages[room] = roomMessages[room] || [];
        roomMessages[room].push({ id: docSnap.id, ...data });
      });
      
      // Sort messages within each room chronologically
      Object.keys(roomMessages).forEach(room => {
        roomMessages[room].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      });
      setMessages(roomMessages);
    });

    // Real-time sync Audit logs
    const unsubLogs = onSnapshot(query(collection(db, 'logs'), orderBy('timestamp', 'desc')), (snapshot) => {
      const logsList = [];
      snapshot.forEach(docSnap => {
        logsList.push({ id: docSnap.id, ...docSnap.data() });
      });

      // Realtime alert notifications: trigger if a log is created by another user within the last 5 seconds
      if (logsList.length > 0) {
        const latestLog = logsList[0];
        const logTime = new Date(latestLog.timestamp).getTime();
        
        if (Date.now() - logTime < 5000 && !latestLog.text.includes(currentUser.name)) {
          const isTaskLog = latestLog.type === 'task';
          const isCommentLog = latestLog.type === 'comment';
          if (isTaskLog || isCommentLog) {
            const notif = {
              id: 'n_' + latestLog.id,
              title: isTaskLog ? 'Task Update' : 'New Comment',
              text: latestLog.text,
              timestamp: latestLog.timestamp,
              read: false
            };
            setNotifications(prev => [notif, ...prev]);
          }
        }
      }
      setLogs(logsList);
    });

    return () => {
      unsubTasks();
      unsubMessages();
      unsubLogs();
    };
  }, [currentUser]);

  // 4. Socket Simulation hooks (Active only when running in Offline Mock mode)
  useEffect(() => {
    if (isFirebaseConfigured || !currentUser) {
      socketSimulator.stop();
      return;
    }

    socketSimulator.setCurrentUser(currentUser);
    socketSimulator.start();

    const unsubMessage = socketSimulator.subscribe('message', ({ room, message }) => {
      setMessages(prev => {
        const updated = {
          ...prev,
          [room]: [...(prev[room] || []), message]
        };
        saveMessages(updated);
        return updated;
      });
    });

    const unsubTaskUpdate = socketSimulator.subscribe('taskUpdate', ({ task }) => {
      setTasks(prev => {
        const updated = prev.map(t => t.id === task.id ? task : t);
        saveTasks(updated);
        return updated;
      });
      setLogs(getLogs());
    });

    const unsubNotification = socketSimulator.subscribe('notification', (notif) => {
      setNotifications(prev => [notif, ...prev]);
    });

    return () => {
      unsubMessage();
      unsubTaskUpdate();
      unsubNotification();
      socketSimulator.stop();
    };
  }, [currentUser]);

  // Auth Operations
  const handleLoginSuccess = (user, token) => {
    setCurrentUser(user);
    if (!isFirebaseConfigured) {
      reloadLocalDbState();
    }
    setActiveView('dashboard');
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setNotifications([]);
    if (!isFirebaseConfigured) {
      reloadLocalDbState();
    }
  };

  // Task Operations
  const handleTaskMove = async (taskId, targetStatus) => {
    if (!isFirebaseConfigured) {
      const updatedTasks = tasks.map(t => {
        if (t.id === taskId) {
          const oldStatus = t.status;
          const updated = { ...t, status: targetStatus };
          const logText = `${currentUser.name} moved "${t.title}" from ${oldStatus.toUpperCase()} to ${targetStatus.toUpperCase()}`;
          socketSimulator.clientUpdateTask(updated, currentUser, logText);
          return updated;
        }
        return t;
      });
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
      setLogs(getLogs());
      return;
    }

    // Cloud Database update
    try {
      const taskRef = doc(db, 'tasks', taskId);
      const taskObj = tasks.find(t => t.id === taskId);
      if (!taskObj) return;

      const oldStatus = taskObj.status;
      await updateDoc(taskRef, { status: targetStatus });

      const logText = `${currentUser.name} moved "${taskObj.title}" from ${oldStatus.toUpperCase()} to ${targetStatus.toUpperCase()}`;
      await addDoc(collection(db, 'logs'), {
        type: 'task',
        text: logText,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error("Error moving task in Firestore:", err);
    }
  };

  const handleTaskSave = async (taskData, isNewTask, customLogMessage = '') => {
    if (!isFirebaseConfigured) {
      let updatedTasks = [];
      if (isNewTask) {
        updatedTasks = [...tasks, taskData];
        const logText = `${currentUser.name} created task: "${taskData.title}"`;
        socketSimulator.clientUpdateTask(taskData, currentUser, logText);
      } else {
        updatedTasks = tasks.map(t => t.id === taskData.id ? taskData : t);
        if (customLogMessage) {
          socketSimulator.clientUpdateTask(taskData, currentUser, customLogMessage);
        } else {
          const logText = `${currentUser.name} updated details of task: "${taskData.title}"`;
          socketSimulator.clientUpdateTask(taskData, currentUser, logText);
        }
      }
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
      setLogs(getLogs());
      setShowTaskModal(false);
      setSelectedTask(null);
      return;
    }

    // Cloud Database save
    try {
      const taskRef = doc(db, 'tasks', taskData.id);
      await setDoc(taskRef, taskData);

      let logText = customLogMessage;
      if (!logText) {
        logText = isNewTask 
          ? `${currentUser.name} created task: "${taskData.title}"`
          : `${currentUser.name} updated details of task: "${taskData.title}"`;
      }

      await addDoc(collection(db, 'logs'), {
        type: 'task',
        text: logText,
        timestamp: new Date().toISOString()
      });

      setShowTaskModal(false);
      setSelectedTask(null);
    } catch (err) {
      console.error("Error saving task in Firestore:", err);
    }
  };

  const handleTaskDelete = async (taskId) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;

    if (!isFirebaseConfigured) {
      const updatedTasks = tasks.filter(t => t.id !== taskId);
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
      const logText = `${currentUser.name} deleted task: "${taskToDelete.title}"`;
      addLog('task', logText);
      setLogs(getLogs());
      setShowTaskModal(false);
      setSelectedTask(null);
      return;
    }

    // Cloud Database delete
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      await addDoc(collection(db, 'logs'), {
        type: 'task',
        text: `${currentUser.name} deleted task: "${taskToDelete.title}"`,
        timestamp: new Date().toISOString()
      });
      setShowTaskModal(false);
      setSelectedTask(null);
    } catch (err) {
      console.error("Error deleting task in Firestore:", err);
    }
  };

  // Chat message sending
  const handleSendMessage = async (room, text) => {
    if (!isFirebaseConfigured) {
      socketSimulator.clientSendMessage(room, text, currentUser);
      reloadLocalDbState();
      return;
    }

    // Cloud Database chat send
    try {
      await addDoc(collection(db, 'messages'), {
        room,
        userId: currentUser.id,
        userName: currentUser.name,
        text,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error("Error sending message to Firestore:", err);
    }
  };

  // Notification Operations
  const handleMarkNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Logs Operations
  const handleClearLogs = async () => {
    if (currentUser?.role !== 'admin') return;

    if (!isFirebaseConfigured) {
      saveLogs([]);
      addLog('system', `${currentUser.name} cleared activity logs.`);
      setLogs(getLogs());
      return;
    }

    // Cloud Database logs clear
    try {
      const querySnapshot = await getDocs(collection(db, 'logs'));
      for (const logDoc of querySnapshot.docs) {
        await deleteDoc(logDoc.ref);
      }
      await addDoc(collection(db, 'logs'), {
        type: 'system',
        text: `${currentUser.name} cleared activity logs.`,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error("Error clearing Firestore logs:", err);
    }
  };

  // Quick triggers for task modals
  const handleAddTaskClick = (colStatus = 'todo') => {
    setDefaultColStatus(colStatus);
    setSelectedTask(null);
    setShowTaskModal(true);
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  // Rendering matching views
  const renderMainView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <Dashboard 
            tasks={tasks} 
            logs={logs} 
            onViewBoard={() => setActiveView('board')} 
            onTaskClick={handleTaskClick} 
          />
        );
      case 'board':
        return (
          <KanbanBoard 
            tasks={tasks} 
            onTaskMove={handleTaskMove} 
            onTaskClick={handleTaskClick} 
            onAddTaskClick={handleAddTaskClick}
            currentUser={currentUser}
          />
        );
      case 'chat':
        return (
          <ChatRooms 
            messages={messages} 
            onSendMessage={handleSendMessage} 
            currentUser={currentUser} 
          />
        );
      case 'reports':
        return (
          <Reports 
            tasks={tasks} 
          />
        );
      case 'logs':
        return (
          <ActivityLogs 
            logs={logs} 
            onClearLogs={handleClearLogs}
            currentUser={currentUser}
          />
        );
      default:
        return (
          <Dashboard 
            tasks={tasks} 
            logs={logs} 
            onViewBoard={() => setActiveView('board')} 
            onTaskClick={handleTaskClick} 
          />
        );
    }
  };

  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Layout 
      activeView={activeView} 
      setActiveView={setActiveView} 
      currentUser={currentUser} 
      onLogout={handleLogout}
      notifications={notifications}
      onMarkNotificationsRead={handleMarkNotificationsRead}
      onAddTaskClick={() => handleAddTaskClick('todo')}
    >
      {/* Visual notice banner if running in local storage fallback mode */}
      {!isFirebaseConfigured && (
        <div style={styles.warningBanner}>
          <span>⚡ Running in **Local Storage Offline Mode**. Connect actual Firebase API credentials inside `src/firebase.js` to enable real Firestore database integration.</span>
        </div>
      )}

      {renderMainView()}

      {/* Shared Task Creator & Editor Modal */}
      {showTaskModal && (
        <TaskModal
          task={selectedTask}
          onClose={() => {
            setShowTaskModal(false);
            setSelectedTask(null);
          }}
          onSave={handleTaskSave}
          onDelete={handleTaskDelete}
          currentUser={currentUser}
          defaultStatus={defaultColStatus}
        />
      )}
    </Layout>
  );
}

const styles = {
  warningBanner: {
    padding: '10px 20px',
    background: 'rgba(99, 102, 241, 0.15)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    borderRadius: '12px',
    color: '#C7D2FE',
    fontSize: '13px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 0 10px rgba(99, 102, 241, 0.05)',
  }
};

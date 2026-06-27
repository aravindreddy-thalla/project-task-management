import { MOCK_USERS, addLog, getTasks, saveTasks, getMessages, saveMessages } from './mockDb';

const CHAT_SIMULATIONS = [
  { userId: 'u3', userName: 'Suresh Kumar', text: 'Hey guys, I just uploaded the new routing schema.', room: 'dev-team' },
  { userId: 'u4', userName: 'Raju Sharma', text: 'Can someone review the Figma mockups in the design channel?', room: 'general' },
  { userId: 'u5', userName: 'Sai Ram', text: 'Working on the setup documentation now. Should be done soon.', room: 'dev-team' },
  { userId: 'u2', userName: 'Keerthi', text: 'Great progress team! Keep it up.', room: 'general' },
  { userId: 'u4', userName: 'Raju Sharma', text: 'Added the glassmorphism card variables. Check index.css.', room: 'design-team' },
  { userId: 'u3', userName: 'Suresh Kumar', text: 'Working on testing the JWT token validation on the client routing side.', room: 'dev-team' }
];

const TASK_STATUS_SIMULATIONS = [
  { taskId: 't4', status: 'in-progress', text: 'Raju Sharma started working on "Create Fluid Visual Workflow UI Components"', user: 'Raju Sharma' },
  { taskId: 't5', status: 'in-progress', text: 'Sai Ram started working on "Write Technical Project Readme"', user: 'Sai Ram' },
  { taskId: 't3', status: 'in-review', text: 'Suresh Kumar submitted "Implement JWT Auth Middlewares" for review', user: 'Suresh Kumar' }
];

const COMMENT_SIMULATIONS = [
  { taskId: 't4', userId: 'u2', userName: 'Keerthi', text: 'Make sure the cards have subtle hover shadows.' },
  { taskId: 't2', userId: 'u1', userName: 'Aravind', text: 'This looks clean. Code formatting is perfect.' },
  { taskId: 't3', userId: 'u2', userName: 'Keerthi', text: 'Please ensure we support expiration checks on tokens.' }
];

class SocketSimulator {
  constructor() {
    this.listeners = {
      message: [],
      notification: [],
      taskUpdate: []
    };
    this.intervalId = null;
    this.currentUser = null;
  }

  setCurrentUser(user) {
    this.currentUser = user;
  }

  subscribe(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
    return () => this.unsubscribe(event, callback);
  }

  unsubscribe(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  start() {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      // Pick a random event type: 0 = Chat message, 1 = Task move, 2 = Task comment
      const eventType = Math.floor(Math.random() * 3);

      if (eventType === 0) {
        this.simulateChatMessage();
      } else if (eventType === 1) {
        this.simulateTaskMove();
      } else {
        this.simulateComment();
      }
    }, 25000); // Trigger a random event every 25 seconds to feel live but not overwhelming
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  simulateChatMessage() {
    // Pick chat simulator not belonging to active user
    const chat = CHAT_SIMULATIONS[Math.floor(Math.random() * CHAT_SIMULATIONS.length)];
    if (this.currentUser && chat.userId === this.currentUser.id) return;

    const messages = getMessages();
    const newMessage = {
      id: 'm_' + Date.now(),
      userId: chat.userId,
      userName: chat.userName,
      text: chat.text,
      timestamp: new Date().toISOString()
    };

    messages[chat.room] = messages[chat.room] || [];
    messages[chat.room].push(newMessage);
    saveMessages(messages);

    // Emit event
    this.emit('message', { room: chat.room, message: newMessage });
  }

  simulateTaskMove() {
    const simulation = TASK_STATUS_SIMULATIONS[Math.floor(Math.random() * TASK_STATUS_SIMULATIONS.length)];
    const tasks = getTasks();
    const taskIndex = tasks.findIndex(t => t.id === simulation.taskId);

    if (taskIndex === -1) return;
    const task = tasks[taskIndex];
    
    // Only simulate status change if it's not already in that status
    if (task.status === simulation.status) return;

    const oldStatus = task.status;
    task.status = simulation.status;
    saveTasks(tasks);

    // Log the change
    const logText = `${simulation.user} moved "${task.title}" from ${oldStatus.toUpperCase()} to ${simulation.status.toUpperCase()}`;
    addLog('task', logText);

    // Emit task update
    this.emit('taskUpdate', { task, updatedBy: simulation.user });

    // Emit notification
    const notification = {
      id: 'n_' + Date.now(),
      title: 'Task Updated',
      text: logText,
      timestamp: new Date().toISOString(),
      read: false
    };
    this.emit('notification', notification);
  }

  simulateComment() {
    const commentSim = COMMENT_SIMULATIONS[Math.floor(Math.random() * COMMENT_SIMULATIONS.length)];
    const tasks = getTasks();
    const taskIndex = tasks.findIndex(t => t.id === commentSim.taskId);

    if (taskIndex === -1) return;
    const task = tasks[taskIndex];

    const newComment = {
      id: 'c_' + Date.now(),
      userId: commentSim.userId,
      userName: commentSim.userName,
      text: commentSim.text,
      timestamp: new Date().toISOString()
    };

    task.comments = task.comments || [];
    task.comments.push(newComment);
    saveTasks(tasks);

    // Log comment
    const logText = `${commentSim.userName} commented on "${task.title}"`;
    addLog('comment', logText);

    // Emit task update
    this.emit('taskUpdate', { task, updatedBy: commentSim.userName });

    // Emit notification (only if current user is assignee or manager/admin)
    const notification = {
      id: 'n_' + Date.now(),
      title: 'New Comment',
      text: `${commentSim.userName}: "${commentSim.text.substring(0, 30)}..." on ${task.title}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    this.emit('notification', notification);
  }

  // Client side actions that will broadcast
  clientSendMessage(room, messageText, user) {
    const messages = getMessages();
    const newMessage = {
      id: 'm_' + Date.now(),
      userId: user.id,
      userName: user.name,
      text: messageText,
      timestamp: new Date().toISOString()
    };

    messages[room] = messages[room] || [];
    messages[room].push(newMessage);
    saveMessages(messages);
    
    // Broadcast message
    this.emit('message', { room, message: newMessage });

    // Simulated reply after 1.5 seconds if general room
    setTimeout(() => {
      const replies = [
        "Received! Will look into it shortly.",
        "Understood. Let me know if you need help.",
        "Awesome! Thanks for the update.",
        "Got it, keep us posted!"
      ];
      const randomUser = MOCK_USERS.find(u => u.id !== user.id);
      const replyMessage = {
        id: 'm_' + Date.now() + 1,
        userId: randomUser.id,
        userName: randomUser.name,
        text: replies[Math.floor(Math.random() * replies.length)],
        timestamp: new Date().toISOString()
      };
      
      const currentMessages = getMessages();
      currentMessages[room].push(replyMessage);
      saveMessages(currentMessages);

      this.emit('message', { room, message: replyMessage });
    }, 1500);
  }

  clientUpdateTask(task, user, changeDescription) {
    addLog('task', `${user.name} ${changeDescription}`);
    
    // Emit notification to others
    const notification = {
      id: 'n_' + Date.now(),
      title: 'Task Activity',
      text: `${user.name} ${changeDescription}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    this.emit('notification', notification);
    this.emit('taskUpdate', { task, updatedBy: user.name });
  }
}

export const socketSimulator = new SocketSimulator();

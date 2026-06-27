# 📋 Project Task Management System

A modern Project Task Management System built with **React.js**, designed to help teams organize projects, manage tasks, monitor progress, and collaborate efficiently through an intuitive and responsive interface.

This project demonstrates frontend development skills using React, component-based architecture, state management, routing concepts, and responsive UI design. It was developed as a portfolio project to strengthen practical MERN stack knowledge.

---

# 🚀 Features

### 🔐 Authentication
- User Login Interface
- Firebase Configuration
- Protected Dashboard Flow

### 📊 Dashboard
- Overview of project activities
- Task summary
- Team productivity visualization
- Progress tracking

### 📌 Task Management
- Create Tasks
- Update Tasks
- Delete Tasks
- Task Status Management
- Task Priority Management

### 📋 Kanban Board
- Drag-and-drop inspired workflow
- Organize tasks by status
- Visual task tracking

### 💬 Team Collaboration
- Chat Room Interface
- Activity Logs
- Team Communication Module

### 📈 Reports
- Task Reports
- Progress Overview
- Productivity Tracking

### 🎨 User Interface
- Responsive Design
- Clean Dashboard Layout
- Modern Components
- Easy Navigation

---

# 🛠️ Tech Stack

## Frontend
- React.js
- JavaScript (ES6+)
- HTML5
- CSS3
- Vite

## Backend Ready
- Firebase Configuration


## Tools
- Git
- GitHub
- VS Code
- npm

---

# 📁 Project Structure

```
PROJECT TASK MANAGEMENT
│
├── src
│   ├── components
│   │   ├── ActivityLogs.jsx
│   │   ├── ChatRooms.jsx
│   │   ├── Dashboard.jsx
│   │   ├── KanbanBoard.jsx
│   │   ├── Layout.jsx
│   │   ├── Login.jsx
│   │   ├── Reports.jsx
│   │   └── TaskModal.jsx
│   │
│   ├── utils
│   │   ├── mockDb.js
│   │   └── socketSimulator.js
│   │
│   ├── firebase.js
│   ├── App.jsx
│   ├── main.jsx
│   ├── App.css
│   └── index.css
│
├── public
├── package.json
├── vite.config.js
└── README.md
```

---

# 🏗️ Project Architecture

```
                        PROJECT TASK MANAGEMENT SYSTEM

                               User
                                 │
                                 ▼
                        ┌─────────────────┐
                        │   React Client  │
                        └────────┬────────┘
                                 │
         ┌───────────────────────┼────────────────────────┐
         │                       │                        │
         ▼                       ▼                        ▼
   Login Module           Dashboard Module         Reports Module
         │                       │                        │
         ├──────────────┬────────┴──────────────┐         │
         ▼              ▼                       ▼         ▼
  Kanban Board     Task Management      Activity Logs   Chat Rooms
         │              │                       │
         └──────────────┴──────────────┬────────┘
                                       ▼
                               Mock Database
                                       │
                                       ▼
                           Firebase Configuration
```

---

# 🔄 Application Workflow

```
User Login
      │
      ▼
Dashboard
      │
      ▼
Manage Projects
      │
      ▼
Create / Update Tasks
      │
      ▼
Kanban Board
      │
      ▼
Activity Logs
      │
      ▼
Reports
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/aravindreddy-thalla/project-task-management.git
```

## Navigate to Project

```bash
cd project-task-management
```

## Install Dependencies

```bash
npm install
```

## Run Development Server

```bash
npm run dev
```

The application will start on:

```
http://localhost:5173
```

---

# 📦 Build for Production

```bash
npm run build
```

---

# 🎯 Key Learning Outcomes

This project helped me gain practical experience in:

- React.js Development
- Component-Based Architecture
- State Management
- Responsive UI Design
- JavaScript ES6+
- Frontend Project Structure
- Firebase Integration
- Git & GitHub Version Control
- Vite Development Environment
- Clean Code Organization

---

# 🚀 Future Enhancements

- Complete MERN Backend
- JWT Authentication
- MongoDB Database
- Real-Time Socket.IO Integration
- File Upload Support
- Email Notifications
- Calendar Integration
- Team Invitations
- Dark Mode
- Deployment on Vercel/Render

---


# 👨‍💻 Author

## Thalla Aravind Reddy

**B.Tech – Computer Science and Engineering (Cyber Security)**

📧 Email: thallaaravindreddy123@gmail.com

🔗 GitHub: https://github.com/aravindreddy-thalla

🔗 LinkedIn: https://linkedin.com/in/aravind-reddy-8b1a5b35a

---

# ⭐ Support

If you found this project helpful, please consider giving it a ⭐ on GitHub.

It motivates me to build more open-source projects and continuously improve my development skills.

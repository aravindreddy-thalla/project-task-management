import React from 'react';
import { CheckCircle2, Clock, Eye, ListTodo, AlertCircle, ArrowUpRight } from 'lucide-react';
import { MOCK_USERS } from '../utils/mockDb';

export default function Dashboard({ tasks, logs, onViewBoard, onTaskClick }) {
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const reviewTasks = tasks.filter(t => t.status === 'in-review').length;
  const progressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;

  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Find due soon / high priority tasks
  const urgentTasks = tasks
    .filter(t => t.status !== 'done' && t.priority === 'high')
    .slice(0, 3);

  // Get active users count
  const activeUsersCount = MOCK_USERS.length;

  return (
    <div style={styles.dashboard} className="animate-fade-in">
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Workspace Dashboard</h1>
          <p style={styles.subtitle}>Overview of project status, activity updates, and progress analytics.</p>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div style={styles.kpiGrid}>
        <div className="glass-panel" style={styles.kpiCard}>
          <div style={{ ...styles.kpiIconWrapper, backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}>
            <ListTodo size={22} />
          </div>
          <div>
            <span style={styles.kpiLabel}>Total Tasks</span>
            <h3 style={styles.kpiValue}>{totalTasks}</h3>
          </div>
        </div>

        <div className="glass-panel" style={styles.kpiCard}>
          <div style={{ ...styles.kpiIconWrapper, backgroundColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--priority-medium)' }}>
            <Clock size={22} />
          </div>
          <div>
            <span style={styles.kpiLabel}>In Progress</span>
            <h3 style={styles.kpiValue}>{progressTasks}</h3>
          </div>
        </div>

        <div className="glass-panel" style={styles.kpiCard}>
          <div style={{ ...styles.kpiIconWrapper, backgroundColor: 'rgba(139, 92, 246, 0.15)', color: 'var(--secondary)' }}>
            <Eye size={22} />
          </div>
          <div>
            <span style={styles.kpiLabel}>In Review</span>
            <h3 style={styles.kpiValue}>{reviewTasks}</h3>
          </div>
        </div>

        <div className="glass-panel" style={styles.kpiCard}>
          <div style={{ ...styles.kpiIconWrapper, backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--priority-low)' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <span style={styles.kpiLabel}>Completed</span>
            <h3 style={styles.kpiValue}>{doneTasks}</h3>
          </div>
        </div>
      </div>

      {/* Analytics & Activity Row */}
      <div style={styles.mainGrid}>
        {/* Left Column: Progress Ring & Stats */}
        <div className="glass-panel" style={styles.analyticsCard}>
          <h3 style={styles.sectionTitle}>Project Progression</h3>
          
          <div style={styles.progressRingWrapper}>
            <svg style={styles.progressRing} width="160" height="160">
              <circle
                stroke="rgba(255,255,255,0.03)"
                fill="transparent"
                strokeWidth="12"
                r="65"
                cx="80"
                cy="80"
              />
              <circle
                stroke="url(#progressGradient)"
                fill="transparent"
                strokeWidth="12"
                strokeDasharray={2 * Math.PI * 65}
                strokeDashoffset={2 * Math.PI * 65 * (1 - completionRate / 100)}
                strokeLinecap="round"
                r="65"
                cx="80"
                cy="80"
                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.8s ease-in-out' }}
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--primary)" />
                  <stop offset="100%" stopColor="var(--secondary)" />
                </linearGradient>
              </defs>
            </svg>
            <div style={styles.progressRingText}>
              <span style={styles.progressPct}>{completionRate}%</span>
              <span style={styles.progressLabel}>Completed</span>
            </div>
          </div>

          <div style={styles.statsSummary}>
            <div style={styles.statItem}>
              <span style={styles.statDot}></span>
              <span style={styles.statLabel}>To Do:</span>
              <span style={styles.statValue}>{todoTasks}</span>
            </div>
            <div style={{ ...styles.statItem, '--dot-color': 'var(--priority-medium)' }}>
              <span style={{ ...styles.statDot, backgroundColor: 'var(--priority-medium)' }}></span>
              <span style={styles.statLabel}>In Progress:</span>
              <span style={styles.statValue}>{progressTasks}</span>
            </div>
            <div style={{ ...styles.statItem, '--dot-color': 'var(--secondary)' }}>
              <span style={{ ...styles.statDot, backgroundColor: 'var(--secondary)' }}></span>
              <span style={styles.statLabel}>In Review:</span>
              <span style={styles.statValue}>{reviewTasks}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Urgent Tasks & Active Feed */}
        <div style={styles.rightColumnGrid}>
          {/* Urgent Actions */}
          <div className="glass-panel" style={styles.subCard}>
            <div style={styles.cardHeader}>
              <h3 style={styles.sectionTitle}>High Priority Actions</h3>
              <button onClick={onViewBoard} style={styles.linkBtn}>
                <span>Open Board</span>
                <ArrowUpRight size={14} style={{ marginLeft: 4 }} />
              </button>
            </div>
            
            <div style={styles.urgentList}>
              {urgentTasks.length === 0 ? (
                <div style={styles.emptyCard}>
                  <CheckCircle2 size={32} color="var(--priority-low)" style={{ marginBottom: 8 }} />
                  <p>All high-priority tasks are resolved!</p>
                </div>
              ) : (
                urgentTasks.map(task => {
                  const assignee = MOCK_USERS.find(u => u.id === task.assigneeId);
                  return (
                    <div 
                      key={task.id} 
                      style={styles.taskListItem} 
                      onClick={() => onTaskClick(task)}
                    >
                      <div style={styles.taskListInfo}>
                        <h4 style={styles.taskItemTitle}>{task.title}</h4>
                        <span style={styles.taskItemDue}>Due: {task.dueDate}</span>
                      </div>
                      <div style={styles.taskListMeta}>
                        <img 
                          src={assignee?.avatar} 
                          alt={assignee?.name} 
                          title={assignee?.name}
                          style={styles.taskItemAvatar} 
                        />
                        <span className="badge badge-high">High</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recent Activity stream */}
          <div className="glass-panel" style={styles.subCard}>
            <h3 style={styles.sectionTitle}>Recent Activity Log</h3>
            <div style={styles.logList}>
              {logs.slice(0, 4).map((log, index) => (
                <div key={log.id || index} style={styles.logItem}>
                  <div style={styles.logIconCol}>
                    <div style={{
                      ...styles.logIconCircle,
                      backgroundColor: log.type === 'system' ? 'rgba(99, 102, 241, 0.15)' : 
                                       log.type === 'task' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      color: log.type === 'system' ? 'var(--primary)' : 
                             log.type === 'task' ? 'var(--secondary)' : 'var(--text-secondary)'
                    }}>
                      {log.type === 'system' ? <AlertCircle size={12} /> : <Clock size={12} />}
                    </div>
                    {index < 3 && <div style={styles.logTimelineConnector}></div>}
                  </div>
                  <div style={styles.logContent}>
                    <p style={styles.logText}>{log.text}</p>
                    <span style={styles.logTime}>
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  dashboard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  header: {
    marginBottom: '8px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    marginTop: '4px',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
  },
  kpiCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px 24px',
  },
  kpiIconWrapper: {
    padding: '12px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiLabel: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  kpiValue: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#fff',
    marginTop: '2px',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '24px',
    '@media (max-width: 1024px)': {
      gridTemplateColumns: '1fr',
    }
  },
  analyticsCard: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
    alignSelf: 'flex-start',
    marginBottom: '20px',
  },
  progressRingWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '20px 0',
  },
  progressRing: {
    transform: 'scale(1)',
  },
  progressRingText: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPct: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#fff',
    background: 'linear-gradient(to bottom, #fff, #c7d2fe)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  progressLabel: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: '0.05em',
    marginTop: '2px',
  },
  statsSummary: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '20px',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '20px',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
  },
  statDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary)',
    marginRight: '10px',
  },
  statLabel: {
    color: 'var(--text-secondary)',
    flex: 1,
  },
  statValue: {
    fontWeight: '600',
    color: '#fff',
  },
  rightColumnGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  subCard: {
    padding: '24px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  linkBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    background: 'transparent',
    border: 'none',
    color: 'var(--primary)',
    fontSize: '13px',
    fontWeight: '600',
  },
  urgentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '8px',
  },
  emptyCard: {
    padding: '30px 10px',
    textAlign: 'center',
    color: 'var(--text-secondary)',
    fontSize: '14px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  taskListItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 18px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'var(--transition-smooth)',
    ':hover': {
      backgroundColor: 'rgba(255,255,255,0.05)',
      transform: 'translateX(2px)'
    }
  },
  taskListInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  taskItemTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#fff',
  },
  taskItemDue: {
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  taskListMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  taskItemAvatar: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  logList: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: '10px',
  },
  logItem: {
    display: 'flex',
    gap: '14px',
  },
  logIconCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  logIconCircle: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
  },
  logTimelineConnector: {
    width: '2px',
    flex: 1,
    backgroundColor: 'var(--border-color)',
    margin: '4px 0',
  },
  logContent: {
    flex: 1,
    paddingBottom: '16px',
  },
  logText: {
    fontSize: '13px',
    color: 'var(--text-primary)',
    lineHeight: '1.4',
  },
  logTime: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginTop: '4px',
    display: 'block',
  },
};

// Insert nested style rule for list item hover
const style = document.createElement('style');
style.innerHTML = `
  .task-list-item-hover:hover {
    background-color: rgba(255,255,255,0.04) !important;
    transform: translateX(4px) !important;
    border-color: var(--border-hover) !important;
  }
`;
document.head.appendChild(style);

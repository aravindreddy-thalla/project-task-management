import React, { useState } from 'react';
import { Plus, Search, Filter, MessageSquare, Paperclip, Calendar, User } from 'lucide-react';
import { MOCK_USERS } from '../utils/mockDb';

export default function KanbanBoard({ tasks, onTaskMove, onTaskClick, onAddTaskClick, currentUser }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');

  const columns = [
    { id: 'todo', title: 'To Do', color: '#64748B' },
    { id: 'in-progress', title: 'In Progress', color: 'var(--priority-medium)' },
    { id: 'in-review', title: 'In Review', color: 'var(--secondary)' },
    { id: 'done', title: 'Done', color: 'var(--priority-low)' }
  ];

  // Apply filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesAssignee = assigneeFilter === 'all' || task.assigneeId === assigneeFilter;
    return matchesSearch && matchesPriority && matchesAssignee;
  });

  // Drag and Drop handlers
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Required to allow drop
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onTaskMove(taskId, targetStatus);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'badge-high';
      case 'medium': return 'badge-medium';
      case 'low': return 'badge-low';
      default: return 'badge-low';
    }
  };

  return (
    <div style={styles.boardContainer} className="animate-fade-in">
      <div style={styles.boardHeader}>
        <div>
          <h1 style={styles.title}>Visual Workflow Systems</h1>
          <p style={styles.subtitle}>Manage sprint cycles. Drag and drop cards to update task stage.</p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="glass-panel" style={styles.filterToolbar}>
        <div style={styles.searchWrapper}>
          <Search size={16} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.selectorsGroup}>
          <div style={styles.filterItem}>
            <Filter size={14} style={{ marginRight: 6, color: 'var(--text-muted)' }} />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={styles.select}
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div style={styles.filterItem}>
            <User size={14} style={{ marginRight: 6, color: 'var(--text-muted)' }} />
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              style={styles.select}
            >
              <option value="all">All Assignees</option>
              {MOCK_USERS.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Kanban Columns */}
      <div style={styles.columnsGrid}>
        {columns.map(col => {
          const colTasks = filteredTasks.filter(t => t.status === col.id);
          
          return (
            <div 
              key={col.id} 
              className="glass-panel" 
              style={styles.column}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div style={styles.columnHeader}>
                <div style={styles.colTitleWrapper}>
                  <span style={{ ...styles.colIndicator, backgroundColor: col.color }}></span>
                  <h3 style={styles.colTitle}>{col.title}</h3>
                  <span style={styles.colCount}>{colTasks.length}</span>
                </div>

                {(currentUser?.role === 'admin' || currentUser?.role === 'manager') && (
                  <button 
                    style={styles.addCardBtn}
                    onClick={() => onAddTaskClick(col.id)}
                  >
                    <Plus size={16} />
                  </button>
                )}
              </div>

              <div style={styles.cardsContainer}>
                {colTasks.length === 0 ? (
                  <div style={styles.emptyColPlaceholder}>
                    Drop tasks here
                  </div>
                ) : (
                  colTasks.map(task => {
                    const assignee = MOCK_USERS.find(u => u.id === task.assigneeId);
                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onClick={() => onTaskClick(task)}
                        className="glass-panel"
                        style={styles.taskCard}
                      >
                        <div style={styles.cardTopRow}>
                          <span className={`badge ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>

                        <h4 style={styles.cardTitle}>{task.title}</h4>
                        <p style={styles.cardDesc}>
                          {task.description.length > 70 
                            ? task.description.substring(0, 70) + '...' 
                            : task.description}
                        </p>

                        <div style={styles.cardDivider}></div>

                        <div style={styles.cardFooter}>
                          <div style={styles.dueDateWrapper}>
                            <Calendar size={12} style={{ marginRight: 4 }} />
                            <span>{task.dueDate}</span>
                          </div>

                          <div style={styles.footerRight}>
                            {task.comments?.length > 0 && (
                              <div style={styles.metaIcon}>
                                <MessageSquare size={12} />
                                <span>{task.comments.length}</span>
                              </div>
                            )}

                            {task.attachments?.length > 0 && (
                              <div style={styles.metaIcon}>
                                <Paperclip size={12} />
                                <span>{task.attachments.length}</span>
                              </div>
                            )}

                            <img 
                              src={assignee?.avatar} 
                              alt={assignee?.name} 
                              title={assignee?.name}
                              style={styles.cardAvatar}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  boardContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  boardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  filterToolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 20px',
    flexWrap: 'wrap',
    gap: '14px',
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    minWidth: '240px',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    color: 'var(--text-muted)',
  },
  searchInput: {
    paddingLeft: '36px',
    fontSize: '13px',
  },
  selectorsGroup: {
    display: 'flex',
    gap: '12px',
  },
  filterItem: {
    display: 'flex',
    alignItems: 'center',
  },
  select: {
    fontSize: '13px',
    padding: '8px 12px 8px 10px',
    width: '140px',
  },
  columnsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    alignItems: 'start',
  },
  column: {
    padding: '16px',
    background: 'rgba(15, 23, 42, 0.25)',
    minHeight: '500px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  columnHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  colTitleWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  colIndicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  colTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#fff',
  },
  colCount: {
    fontSize: '11px',
    fontWeight: '700',
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: '2px 8px',
    borderRadius: '20px',
    color: 'var(--text-secondary)',
  },
  addCardBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    transition: 'var(--transition-smooth)',
    ':hover': {
      backgroundColor: 'rgba(255,255,255,0.05)',
      color: '#fff'
    }
  },
  cardsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    flex: 1,
  },
  emptyColPlaceholder: {
    border: '1px dashed var(--border-color)',
    borderRadius: '12px',
    padding: '30px',
    textAlign: 'center',
    fontSize: '12px',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  taskCard: {
    padding: '16px',
    background: 'rgba(30, 41, 59, 0.35)',
    border: '1px solid rgba(255,255,255,0.04)',
    cursor: 'grab',
    transition: 'var(--transition-smooth)',
    ':active': {
      cursor: 'grabbing'
    }
  },
  cardTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  cardTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff',
    lineHeight: '1.4',
    letterSpacing: '-0.01em',
  },
  cardDesc: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    marginTop: '6px',
  },
  cardDivider: {
    height: '1px',
    backgroundColor: 'rgba(255,255,255,0.04)',
    margin: '14px 0 10px 0',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dueDateWrapper: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  footerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  metaIcon: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  cardAvatar: {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '1px solid rgba(255,255,255,0.1)',
  }
};

// Global style for hover effect on drag items
const stylesInjection = document.createElement('style');
stylesInjection.innerText = `
  .glass-panel[draggable="true"]:hover {
    transform: translateY(-2px);
    border-color: rgba(99, 102, 241, 0.3) !important;
    background: rgba(30, 41, 59, 0.5) !important;
  }
  .add-card-hover:hover {
    background-color: rgba(255,255,255,0.06) !important;
    color: #fff !important;
  }
`;
document.head.appendChild(stylesInjection);

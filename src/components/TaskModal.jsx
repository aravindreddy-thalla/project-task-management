import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Paperclip, AlertTriangle, Calendar, User, Trash2, ShieldAlert } from 'lucide-react';
import { MOCK_USERS } from '../utils/mockDb';

export default function TaskModal({ 
  task, 
  onClose, 
  onSave, 
  onDelete, 
  currentUser, 
  defaultStatus 
}) {
  const isNewTask = !task;
  
  // Checking permissions
  // Admins & Managers have edit capability. Employees can only view details and comment, but can change STATUS of a task if they are assigned or if they need to check off tasks.
  const canEditAllFields = currentUser.role === 'admin' || currentUser.role === 'manager';
  const canDeleteTask = currentUser.role === 'admin';

  // Core fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [assigneeRole, setAssigneeRole] = useState('employee');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  
  // Attachments & Comments
  const [attachments, setAttachments] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  // Validations & UI errors
  const [validationError, setValidationError] = useState('');
  const fileInputRef = useRef(null);

  // Load task fields if editing
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
      setPriority(task.priority);
      
      // Load assignee and their role
      const assignedId = task.assigneeId || '';
      setAssigneeId(assignedId);
      const assignedUser = MOCK_USERS.find(u => u.id === assignedId);
      setAssigneeRole(assignedUser ? assignedUser.role : 'employee');
      
      setDueDate(task.dueDate || '');
      setAttachments(task.attachments || []);
      setComments(task.comments || []);
    } else {
      // Default initialization for new tasks
      setTitle('');
      setDescription('');
      setStatus(defaultStatus || 'todo');
      setPriority('medium');
      setAssigneeRole('employee');
      const firstEmployee = MOCK_USERS.find(u => u.role === 'employee');
      setAssigneeId(firstEmployee ? firstEmployee.id : '');
      setDueDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // 1 week from now
      setAttachments([]);
      setComments([]);
    }
    setValidationError('');
  }, [task, defaultStatus]);

  const handleRoleChange = (role) => {
    setAssigneeRole(role);
    const firstUserOfRole = MOCK_USERS.find(u => u.role === role);
    setAssigneeId(firstUserOfRole ? firstUserOfRole.id : '');
  };

  // Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    // Form Validations (Simulating client side form validations)
    if (!title.trim()) {
      setValidationError('Task Title is required.');
      return;
    }
    if (title.length < 5) {
      setValidationError('Task Title must be at least 5 characters.');
      return;
    }
    if (!description.trim()) {
      setValidationError('Description is required.');
      return;
    }
    if (!assigneeId) {
      setValidationError('Please assign this task to a team member.');
      return;
    }
    if (!dueDate) {
      setValidationError('Please select a valid due date.');
      return;
    }

    const taskData = {
      id: task ? task.id : 't_' + Date.now(),
      title,
      description,
      status,
      priority,
      assigneeId,
      dueDate,
      attachments,
      comments
    };

    onSave(taskData, isNewTask);
  };

  // Handle Status only change (For employees who cannot edit other fields)
  const handleStatusChangeOnly = (newStatus) => {
    setStatus(newStatus);
    
    // Auto-save changes for employees when status updates
    if (!canEditAllFields && task) {
      const taskData = {
        ...task,
        status: newStatus
      };
      onSave(taskData, false, `updated status of "${task.title}" to ${newStatus.toUpperCase()}`);
    }
  };

  // Add Comment
  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const commentObj = {
      id: 'c_' + Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      text: newComment,
      timestamp: new Date().toISOString()
    };

    const updatedComments = [...comments, commentObj];
    setComments(updatedComments);
    setNewComment('');

    // If editing existing task, save the comment
    if (task) {
      const taskData = {
        ...task,
        comments: updatedComments
      };
      onSave(taskData, false, `commented on "${task.title}"`);
    }
  };

  // File Upload (Simulated using FileReader -> Base64 data strings)
  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // File Validation: size check (limit mock uploads to 5MB to avoid localStorage quota issues)
    if (file.size > 5 * 1024 * 1024) {
      setValidationError('File size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target.result;
      const sizeKB = Math.round(file.size / 1024);
      
      const newAttachment = {
        name: file.name,
        size: sizeKB >= 1024 ? (sizeKB / 1024).toFixed(1) + ' MB' : sizeKB + ' KB',
        data: base64Data
      };

      const updatedAttachments = [...attachments, newAttachment];
      setAttachments(updatedAttachments);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // If editing existing task, sync with main tasks state immediately
      if (task) {
        const taskData = {
          ...task,
          attachments: updatedAttachments
        };
        onSave(taskData, false, `uploaded file "${file.name}" to task "${task.title}"`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAttachment = (index) => {
    const updated = attachments.filter((_, idx) => idx !== index);
    setAttachments(updated);
    if (task) {
      const taskData = {
        ...task,
        attachments: updated
      };
      onSave(taskData, false, `removed an attachment from "${task.title}"`);
    }
  };

  return (
    <div style={styles.modalOverlay}>
      <div className="glass-panel-neon animate-slide-in" style={styles.modalContent}>
        
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>
            {isNewTask ? 'Create New Task' : 'Task Details'}
          </h2>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Validation Errors banner */}
        {validationError && (
          <div style={styles.errorBanner} className="animate-fade-in">
            <AlertTriangle size={16} style={{ marginRight: 8, flexShrink: 0 }} />
            <span>{validationError}</span>
          </div>
        )}

        <div style={styles.modalBody}>
          {/* Main Form Fields */}
          <form onSubmit={handleSubmit} style={styles.formSection}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Task Title</label>
              <input
                type="text"
                placeholder="Name the sprint goal..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={!canEditAllFields}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Description</label>
              <textarea
                placeholder="Provide task specifics and success criteria..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!canEditAllFields}
                rows={4}
                style={styles.textarea}
              />
            </div>

            {/* Grid properties */}
            <div style={styles.propertiesGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  disabled={!canEditAllFields}
                  style={styles.select}
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Status</label>
                <select
                  value={status}
                  onChange={(e) => handleStatusChangeOnly(e.target.value)}
                  disabled={!canEditAllFields && task?.assigneeId !== currentUser.id && currentUser.role !== 'admin'}
                  style={styles.select}
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="in-review">In Review</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Assignee Role</label>
                <select
                  value={assigneeRole}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  disabled={!canEditAllFields}
                  style={styles.select}
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="employee">Employee</option>
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Assignee Name</label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  disabled={!canEditAllFields}
                  style={styles.select}
                >
                  {MOCK_USERS.filter(u => u.role === assigneeRole).map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={!canEditAllFields}
                  style={styles.input}
                />
              </div>
            </div>

            {/* Read-Only notice for Employees */}
            {!canEditAllFields && (
              <div style={styles.employeeAlert}>
                <ShieldAlert size={16} color="var(--priority-medium)" style={{ marginRight: 8, flexShrink: 0 }} />
                <span>You are in **View-Only Mode**. You can only update the Task Status, add Comments, or upload Attachments.</span>
              </div>
            )}

            {/* Action buttons */}
            <div style={styles.actionButtonsRow}>
              {canDeleteTask && !isNewTask && (
                <button
                  type="button"
                  className="btn-danger"
                  onClick={() => onDelete(task.id)}
                  style={styles.deleteBtn}
                >
                  <Trash2 size={16} style={{ marginRight: 6 }} />
                  <span>Delete Task</span>
                </button>
              )}

              <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
                <button type="button" className="btn-secondary" onClick={onClose}>
                  Close
                </button>
                {(canEditAllFields || isNewTask) && (
                  <button type="submit" className="btn-primary">
                    {isNewTask ? 'Create Task' : 'Save Changes'}
                  </button>
                )}
              </div>
            </div>
          </form>

          {/* Right Column: File Uploads & Comments */}
          {!isNewTask && (
            <div style={styles.attachmentsCommentsSection}>
              {/* File Attachments */}
              <div style={styles.attachmentsBlock}>
                <div style={styles.blockHeader}>
                  <label style={styles.label}>File Attachments</label>
                  <button 
                    type="button" 
                    style={styles.attachBtn}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip size={14} style={{ marginRight: 4 }} />
                    <span>Upload File</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </div>

                <div style={styles.filesList}>
                  {attachments.length === 0 ? (
                    <div style={styles.emptyFiles}>No attachments uploaded</div>
                  ) : (
                    attachments.map((file, idx) => (
                      <div key={idx} style={styles.fileItem}>
                        <div style={styles.fileIcon}>📄</div>
                        <div style={styles.fileDetails}>
                          <a 
                            href={file.data} 
                            download={file.name} 
                            style={styles.fileName}
                            title="Click to download"
                          >
                            {file.name}
                          </a>
                          <span style={styles.fileSize}>{file.size}</span>
                        </div>
                        {/* Optional thumbnail image preview */}
                        {file.data.startsWith('data:image/') && (
                          <img src={file.data} alt="thumb" style={styles.imageThumb} />
                        )}
                        <button
                          type="button"
                          style={styles.removeFileBtn}
                          onClick={() => handleRemoveAttachment(idx)}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Comments Thread */}
              <div style={styles.commentsBlock}>
                <label style={{ ...styles.label, marginBottom: '10px', display: 'block' }}>Comments Activity</label>
                
                <div style={styles.commentsList}>
                  {comments.length === 0 ? (
                    <div style={styles.emptyComments}>No comments yet. Start the conversation!</div>
                  ) : (
                    comments.map(c => {
                      const commenter = MOCK_USERS.find(u => u.id === c.userId);
                      return (
                        <div key={c.id} style={styles.commentItem}>
                          <img 
                            src={commenter?.avatar} 
                            alt={c.userName} 
                            style={styles.commentAvatar} 
                          />
                          <div style={styles.commentBubble}>
                            <div style={styles.commentMeta}>
                              <span style={styles.commenterName}>{c.userName}</span>
                              <span style={styles.commentTime}>
                                {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p style={styles.commentText}>{c.text}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <form onSubmit={handleAddComment} style={styles.commentForm}>
                  <input
                    type="text"
                    placeholder="Write a reply..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    style={styles.commentInput}
                  />
                  <button type="submit" style={styles.sendCommentBtn}>
                    <Send size={14} color="#fff" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(5, 7, 18, 0.8)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 300,
    padding: '20px',
  },
  modalContent: {
    width: '100%',
    maxWidth: '960px',
    maxHeight: '90vh',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 30px',
    background: 'rgba(15, 23, 42, 0.95)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '16px',
    marginBottom: '20px',
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '-0.01em',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    ':hover': {
      backgroundColor: 'rgba(255,255,255,0.05)',
      color: '#fff'
    }
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 14px',
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    color: '#FCA5A5',
    fontSize: '13px',
    marginBottom: '20px',
  },
  modalBody: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '30px',
    overflowY: 'auto',
    '@media (max-width: 800px)': {
      gridTemplateColumns: '1fr',
    }
  },
  formSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  input: {
    fontSize: '14px',
  },
  textarea: {
    fontSize: '14px',
    resize: 'vertical',
  },
  select: {
    fontSize: '14px',
  },
  propertiesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '14px',
  },
  employeeAlert: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 14px',
    background: 'rgba(245, 158, 11, 0.12)',
    border: '1px solid rgba(245, 158, 11, 0.25)',
    borderRadius: '8px',
    color: '#FDE68A',
    fontSize: '12px',
    lineHeight: '1.4',
  },
  actionButtonsRow: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '16px',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '20px',
  },
  deleteBtn: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '13px',
    padding: '8px 16px',
  },
  attachmentsCommentsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    borderLeft: '1px solid var(--border-color)',
    paddingLeft: '30px',
    '@media (max-width: 800px)': {
      borderLeft: 'none',
      paddingLeft: 0,
      borderTop: '1px solid var(--border-color)',
      paddingTop: '24px',
    }
  },
  attachmentsBlock: {
    display: 'flex',
    flexDirection: 'column',
  },
  blockHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  attachBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '12px',
  },
  filesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxHeight: '150px',
    overflowY: 'auto',
  },
  emptyFiles: {
    padding: '14px',
    textAlign: 'center',
    fontSize: '12px',
    color: 'var(--text-muted)',
    border: '1px dashed var(--border-color)',
    borderRadius: '8px',
  },
  fileItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
  },
  fileIcon: {
    marginRight: '10px',
    fontSize: '16px',
  },
  fileDetails: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden',
  },
  fileName: {
    fontSize: '13px',
    fontWeight: '500',
    color: 'var(--primary)',
    textDecoration: 'none',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    ':hover': {
      textDecoration: 'underline'
    }
  },
  fileSize: {
    fontSize: '10px',
    color: 'var(--text-muted)',
  },
  imageThumb: {
    width: '30px',
    height: '30px',
    objectFit: 'cover',
    borderRadius: '4px',
    marginLeft: '10px',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  removeFileBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '4px',
    marginLeft: '8px',
    ':hover': {
      color: '#EF4444'
    }
  },
  commentsBlock: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  commentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: '220px',
    overflowY: 'auto',
    marginBottom: '14px',
    paddingRight: '4px',
  },
  emptyComments: {
    padding: '24px 10px',
    textAlign: 'center',
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  commentItem: {
    display: 'flex',
    gap: '10px',
  },
  commentAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  commentBubble: {
    flex: 1,
    padding: '10px 14px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    borderTopLeftRadius: '0',
  },
  commentMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  commenterName: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#fff',
  },
  commentTime: {
    fontSize: '9px',
    color: 'var(--text-muted)',
  },
  commentText: {
    fontSize: '12px',
    color: 'var(--text-primary)',
    lineHeight: '1.4',
  },
  commentForm: {
    display: 'flex',
    gap: '8px',
    position: 'relative',
  },
  commentInput: {
    fontSize: '13px',
    paddingRight: '40px',
  },
  sendCommentBtn: {
    position: 'absolute',
    right: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'var(--primary)',
    border: 'none',
    borderRadius: '6px',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
};

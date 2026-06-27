import React, { useState } from 'react';
import { Search, History, ShieldAlert, Trash2, Filter } from 'lucide-react';

export default function ActivityLogs({ logs, onClearLogs, currentUser }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || log.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getLogColorAndIcon = (type) => {
    switch (type) {
      case 'system':
        return { color: 'var(--primary)', dotBg: 'rgba(99, 102, 241, 0.15)', text: '🛠️' };
      case 'task':
        return { color: 'var(--secondary)', dotBg: 'rgba(139, 92, 246, 0.15)', text: '📋' };
      case 'comment':
        return { color: 'var(--priority-medium)', dotBg: 'rgba(245, 158, 11, 0.15)', text: '💬' };
      default:
        return { color: 'var(--text-secondary)', dotBg: 'rgba(255, 255, 255, 0.05)', text: '⚙️' };
    }
  };

  return (
    <div style={styles.logsContainer} className="animate-fade-in">
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>System Audit Logs</h1>
          <p style={styles.subtitle}>Trace historical events, user alterations, and system events.</p>
        </div>

        {currentUser.role === 'admin' && (
          <button 
            className="btn-danger" 
            onClick={onClearLogs}
            style={styles.clearBtn}
          >
            <Trash2 size={16} style={{ marginRight: 6 }} />
            <span>Purge Logs</span>
          </button>
        )}
      </div>


      {/* Filter toolbar */}
      <div className="glass-panel" style={styles.filterToolbar}>
        <div style={styles.searchWrapper}>
          <Search size={16} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search audit trail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.selectors}>
          <Filter size={14} style={{ marginRight: 6, color: 'var(--text-muted)' }} />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={styles.select}
          >
            <option value="all">All Activities</option>
            <option value="system">System</option>
            <option value="task">Tasks</option>
            <option value="comment">Comments</option>
          </select>
        </div>
      </div>

      {/* Logs Feed */}
      <div className="glass-panel" style={styles.feedCard}>
        {filteredLogs.length === 0 ? (
          <div style={styles.emptyFeed}>
            <History size={36} color="var(--text-muted)" style={{ marginBottom: 10 }} />
            <p>No activity logs found matching the filter criteria.</p>
          </div>
        ) : (
          <div style={styles.timeline}>
            {filteredLogs.map((log, idx) => {
              const meta = getLogColorAndIcon(log.type);
              return (
                <div key={log.id || idx} style={styles.timelineItem}>
                  <div style={styles.timelineIconCol}>
                    <div style={{ ...styles.iconCircle, backgroundColor: meta.dotBg, borderColor: meta.color }}>
                      <span style={{ fontSize: '12px' }}>{meta.text}</span>
                    </div>
                    {idx < filteredLogs.length - 1 && <div style={styles.timelineConnector}></div>}
                  </div>
                  
                  <div style={styles.timelineContent}>
                    <div style={styles.logMetaRow}>
                      <span className="badge badge-role" style={{ fontSize: '9px', backgroundColor: meta.dotBg, color: meta.color }}>
                        {log.type}
                      </span>
                      <span style={styles.logDate}>
                        {new Date(log.timestamp).toLocaleDateString()} at{' '}
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <p style={styles.logText}>{log.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  logsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  header: {
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
  clearBtn: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '13px',
    padding: '8px 16px',
  },
  filterToolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 20px',
    gap: '14px',
    flexWrap: 'wrap',
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
  selectors: {
    display: 'flex',
    alignItems: 'center',
  },
  select: {
    fontSize: '13px',
    padding: '8px 12px 8px 10px',
    width: '150px',
  },
  feedCard: {
    padding: '30px 24px',
    maxHeight: '600px',
    overflowY: 'auto',
  },
  emptyFeed: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '50px 0',
    color: 'var(--text-muted)',
    fontSize: '14px',
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
  },
  timelineItem: {
    display: 'flex',
    gap: '16px',
  },
  timelineIconCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  iconCircle: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid transparent',
  },
  timelineConnector: {
    width: '2px',
    flex: 1,
    backgroundColor: 'var(--border-color)',
    margin: '6px 0',
  },
  timelineContent: {
    flex: 1,
    paddingBottom: '24px',
  },
  logMetaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  logDate: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  logText: {
    fontSize: '14px',
    color: 'var(--text-primary)',
    lineHeight: '1.5',
    fontWeight: '400',
  }
};

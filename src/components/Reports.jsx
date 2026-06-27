import React from 'react';
import { BarChart3, TrendingUp, Users, CheckSquare } from 'lucide-react';
import { MOCK_USERS } from '../utils/mockDb';

export default function Reports({ tasks }) {
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const reviewTasks = tasks.filter(t => t.status === 'in-review').length;
  const progressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;

  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Priority Breakdown
  const highPriority = tasks.filter(t => t.priority === 'high').length;
  const mediumPriority = tasks.filter(t => t.priority === 'medium').length;
  const lowPriority = tasks.filter(t => t.priority === 'low').length;

  const highPct = totalTasks > 0 ? Math.round((highPriority / totalTasks) * 100) : 0;
  const mediumPct = totalTasks > 0 ? Math.round((mediumPriority / totalTasks) * 100) : 0;
  const lowPct = totalTasks > 0 ? Math.round((lowPriority / totalTasks) * 100) : 0;

  // Workload and completion metrics per user
  const userMetrics = MOCK_USERS.map(user => {
    const userTasks = tasks.filter(t => t.assigneeId === user.id);
    const completed = userTasks.filter(t => t.status === 'done').length;
    const rate = userTasks.length > 0 ? Math.round((completed / userTasks.length) * 100) : 0;
    return {
      ...user,
      totalCount: userTasks.length,
      completedCount: completed,
      completionRate: rate
    };
  });

  
  return (
    <div style={styles.reports} className="animate-fade-in">
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Project Productivity Reports</h1>
          <p style={styles.subtitle}>Audit sprint velocities, task priority ratios, and workload allocation.</p>
        </div>
      </div>

      {/* Main Grid */}
      <div style={styles.reportGrid}>
        
        {/* Sprint health radial dial */}
        <div className="glass-panel" style={styles.card}>
          <div style={styles.cardHeader}>
            <TrendingUp size={18} color="var(--secondary)" />
            <h3 style={styles.cardTitle}>Overall Sprint Health</h3>
          </div>
          <div style={styles.gaugeContainer}>
            <div style={styles.radialGauge}>
              <svg width="150" height="150">
                <circle
                  stroke="rgba(255,255,255,0.03)"
                  fill="transparent"
                  strokeWidth="10"
                  r="60"
                  cx="75"
                  cy="75"
                />
                <circle
                  stroke="var(--secondary)"
                  fill="transparent"
                  strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 60}
                  strokeDashoffset={2 * Math.PI * 60 * (1 - completionRate / 100)}
                  strokeLinecap="round"
                  r="60"
                  cx="75"
                  cy="75"
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                />
              </svg>
              <div style={styles.gaugeText}>
                <span style={styles.gaugeNumber}>{completionRate}%</span>
                <span style={styles.gaugeLabel}>Velocity</span>
              </div>
            </div>
            <div style={styles.gaugeLegend}>
              <div style={styles.legendItem}>
                <span style={styles.legendDot}></span>
                <span>Completed Tasks ({doneTasks})</span>
              </div>
              <div style={{ ...styles.legendItem, color: 'var(--text-secondary)' }}>
                <span style={{ ...styles.legendDot, backgroundColor: 'rgba(255,255,255,0.08)' }}></span>
                <span>Pending ({totalTasks - doneTasks})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Priority distribution bar charts */}
        <div className="glass-panel" style={styles.card}>
          <div style={styles.cardHeader}>
            <BarChart3 size={18} color="var(--primary)" />
            <h3 style={styles.cardTitle}>Tasks by Priority</h3>
          </div>
          <div style={styles.priorityBars}>
            <div style={styles.barItem}>
              <div style={styles.barLabels}>
                <span style={styles.barName}>🔴 High Priority</span>
                <span style={styles.barCount}>{highPriority} tasks ({highPct}%)</span>
              </div>
              <div style={styles.barTrack}>
                <div style={{ ...styles.barFill, width: `${highPct}%`, backgroundColor: 'var(--priority-high)' }}></div>
              </div>
            </div>

            <div style={styles.barItem}>
              <div style={styles.barLabels}>
                <span style={styles.barName}>🟡 Medium Priority</span>
                <span style={styles.barCount}>{mediumPriority} tasks ({mediumPct}%)</span>
              </div>
              <div style={styles.barTrack}>
                <div style={{ ...styles.barFill, width: `${mediumPct}%`, backgroundColor: 'var(--priority-medium)' }}></div>
              </div>
            </div>

            <div style={styles.barItem}>
              <div style={styles.barLabels}>
                <span style={styles.barName}>🟢 Low Priority</span>
                <span style={styles.barCount}>{lowPriority} tasks ({lowPct}%)</span>
              </div>
              <div style={styles.barTrack}>
                <div style={{ ...styles.barFill, width: `${lowPct}%`, backgroundColor: 'var(--priority-low)' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Workload grid */}
        <div className="glass-panel report-grid-span-2" style={{ ...styles.card, gridColumn: 'span 2' }}>
          <div style={styles.cardHeader}>
            <Users size={18} color="#A5B4FC" />
            <h3 style={styles.cardTitle}>Team Workload Allocation</h3>
          </div>
          <div style={styles.workloadTableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.tableHead}>Team Member</th>
                  <th style={styles.tableHead}>Role</th>
                  <th style={styles.tableHead}>Tasks Assigned</th>
                  <th style={styles.tableHead}>Completed</th>
                  <th style={styles.tableHead}>Velocity Rate</th>
                </tr>
              </thead>
              <tbody>
                {userMetrics.map(user => (
                  <tr key={user.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>
                      <div style={styles.userCell}>
                        <img src={user.avatar} alt={user.name} style={styles.avatar} />
                        <span style={styles.userName}>{user.name}</span>
                      </div>
                    </td>
                    <td style={styles.tableCell}>
                      <span className="badge badge-role" style={{ fontSize: '9px', textTransform: 'capitalize' }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={styles.tableCell}>{user.totalCount}</td>
                    <td style={styles.tableCell}>{user.completedCount}</td>
                    <td style={styles.tableCell}>
                      <div style={styles.velocityCell}>
                        <div style={styles.tinyTrack}>
                          <div style={{ ...styles.tinyFill, width: `${user.completionRate}%` }}></div>
                        </div>
                        <span style={styles.velocityText}>{user.completionRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

const styles = {
  reports: {
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
  reportGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '24px',
    '@media (max-width: 1024px)': {
      gridTemplateColumns: '1fr',
      'div[style*="gridColumn: span 2"]': {
        gridColumn: 'span 1 !important'
      }
    }
  },
  card: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '12px',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
  },
  gaugeContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '40px',
    padding: '20px 0',
    flexWrap: 'wrap',
  },
  radialGauge: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeText: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  gaugeNumber: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#fff',
  },
  gaugeLabel: {
    fontSize: '10px',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  gaugeLegend: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13px',
    color: '#fff',
  },
  legendDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: 'var(--secondary)',
  },
  priorityBars: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    justifyContent: 'center',
    flex: 1,
  },
  barItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  barLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
  },
  barName: {
    fontWeight: '500',
    color: '#fff',
  },
  barCount: {
    color: 'var(--text-secondary)',
  },
  barTrack: {
    height: '8px',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  workloadTableWrapper: {
    overflowX: 'auto',
    marginTop: '10px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  tableHeaderRow: {
    borderBottom: '1px solid var(--border-color)',
  },
  tableHead: {
    padding: '12px 16px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  tableRow: {
    borderBottom: '1px solid rgba(255,255,255,0.03)',
    transition: 'var(--transition-smooth)',
    ':hover': {
      backgroundColor: 'rgba(255,255,255,0.01)'
    }
  },
  tableCell: {
    padding: '16px',
    fontSize: '14px',
    color: 'var(--text-primary)',
  },
  userCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '1.5px solid rgba(255,255,255,0.1)',
  },
  userName: {
    fontWeight: '500',
    color: '#fff',
  },
  velocityCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  tinyTrack: {
    width: '100px',
    height: '6px',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  tinyFill: {
    height: '100%',
    backgroundColor: 'var(--primary)',
    borderRadius: '3px',
  },
  velocityText: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#fff',
  }
};
// Add responsive styling for reports table in mobile
const reportsStyle = document.createElement("style");
reportsStyle.innerText = `
  @media (max-width: 1024px) {
    .report-grid-span-2 {
      grid-column: span 1 !important;
    }
  }
`;
document.head.appendChild(reportsStyle);

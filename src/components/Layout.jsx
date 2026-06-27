import { useState } from 'react';
import { 
  LayoutDashboard, 
  Kanban, 
  MessageSquare, 
  BarChart3, 
  History, 
  LogOut, 
  Bell, 
  Plus, 
  Check, 
  User, 
  Menu, 
  X 
} from 'lucide-react';

export default function Layout({ 
  children, 
  activeView, 
  setActiveView, 
  currentUser, 
  onLogout, 
  notifications, 
  onMarkNotificationsRead, 
  onAddTaskClick 
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'employee'] },
    { id: 'board', label: 'Visual Workflow Systems', icon: Kanban, roles: ['admin', 'manager', 'employee'] },
    { id: 'chat', label: 'Chat Rooms', icon: MessageSquare, roles: ['admin', 'manager', 'employee'] },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, roles: ['admin', 'manager'] },
    { id: 'logs', label: 'Activity Logs', icon: History, roles: ['admin', 'manager', 'employee'] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(currentUser?.role));

  const handleNavClick = (viewId) => {
    setActiveView(viewId);
    setMobileMenuOpen(false);
  };

  return (
    <div style={styles.appLayout}>
      {/* Top Navbar */}
      <header className="glass-panel" style={styles.topbar}>
        <div style={styles.topbarLeft}>
          <button 
            style={styles.mobileToggle} 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} color="#fff" /> : <Menu size={20} color="#fff" />}
          </button>
          
          <div style={styles.brand}>
            <div style={styles.brandIcon}>🚀</div>
            <span style={styles.brandName}>Aifagen Intelligence</span>
          </div>
        </div>

        <div style={styles.topbarRight}>
          {/* Quick Add Task Button for Admin & Manager */}
          {(currentUser?.role === 'admin' || currentUser?.role === 'manager') && (
            <button 
              className="btn-primary" 
              style={styles.quickAddBtn}
              onClick={onAddTaskClick}
            >
              <Plus size={16} style={{ marginRight: 6 }} />
              <span>Create Task</span>
            </button>
          )}

          {/* Notifications Bell */}
          <div style={styles.bellWrapper}>
            <button 
              style={styles.iconBtn} 
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} color={showNotifications ? '#8B5CF6' : 'var(--text-secondary)'} />
              {unreadCount > 0 && (
                <span style={styles.badgeCount}>{unreadCount}</span>
              )}
            </button>

            {showNotifications && (
              <div className="glass-panel animate-slide-in" style={styles.notificationsDropdown}>
                <div style={styles.dropdownHeader}>
                  <h4 style={styles.dropdownTitle}>Notifications</h4>
                  {unreadCount > 0 && (
                    <button 
                      style={styles.markReadBtn}
                      onClick={() => {
                        onMarkNotificationsRead();
                        setShowNotifications(false);
                      }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div style={styles.notificationList}>
                  {notifications.length === 0 ? (
                    <div style={styles.emptyNotifications}>
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div 
                        key={notif.id} 
                        style={{
                          ...styles.notificationItem,
                          backgroundColor: notif.read ? 'transparent' : 'rgba(99, 102, 241, 0.06)'
                        }}
                      >
                        <div style={styles.notifIndicator}>
                          {!notif.read && <span style={styles.unreadDot}></span>}
                        </div>
                        <div style={styles.notifContent}>
                          <p style={styles.notifTitle}>{notif.title}</p>
                          <p style={styles.notifText}>{notif.text}</p>
                          <span style={styles.notifTime}>
                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Summary */}
          <div style={styles.userBadge}>
            <img src={currentUser?.avatar} alt={currentUser?.name} style={styles.userAvatar} />
            <div style={styles.userDetails}>
              <span style={styles.userName}>{currentUser?.name}</span>
              <span className={`badge badge-role`} style={{ fontSize: '9px', padding: '1px 6px' }}>
                {currentUser?.role}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar - Desktop */}
      <aside className="glass-panel" style={{ ...styles.sidebar, left: mobileMenuOpen ? '0px' : '' }}>
        <div style={styles.navMenu}>
          {filteredNavItems.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                style={{
                  ...styles.navBtn,
                  backgroundColor: isActive ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  borderLeft: isActive ? '3px solid var(--secondary)' : '3px solid transparent'
                }}
              >
                <Icon size={18} style={{ marginRight: 12, strokeWidth: isActive ? 2.5 : 2 }} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div style={styles.sidebarFooter}>
          <button style={styles.logoutBtn} onClick={onLogout}>
            <LogOut size={16} style={{ marginRight: 10 }} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Overlay for Mobile Menu */}
      {mobileMenuOpen && (
        <div style={styles.mobileOverlay} onClick={() => setMobileMenuOpen(false)}></div>
      )}

      {/* Main View Area */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

const styles = {
  appLayout: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'radial-gradient(circle at 10% 20%, rgba(9, 14, 35, 1) 0%, rgba(5, 7, 18, 1) 100%)',
  },
  topbar: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '70px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderLeft: 'none',
    borderRight: 'none',
    borderTop: 'none',
    zIndex: 100,
    background: 'rgba(11, 15, 25, 0.75)',
  },
  topbarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  mobileToggle: {
    display: 'none',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    '@media (max-width: 768px)': {
      display: 'block',
    }
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  brandIcon: {
    fontSize: '24px',
  },
  brandName: {
    fontSize: '18px',
    fontWeight: '800',
    letterSpacing: '-0.02em',
    color: '#fff',
    background: 'linear-gradient(to right, #fff, #a5b4fc)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  topbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  quickAddBtn: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '13px',
    padding: '8px 16px',
  },
  bellWrapper: {
    position: 'relative',
  },
  iconBtn: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    transition: 'var(--transition-smooth)',
  },
  badgeCount: {
    position: 'absolute',
    top: '-3px',
    right: '-3px',
    background: '#EF4444',
    color: '#fff',
    fontSize: '10px',
    fontWeight: '700',
    borderRadius: '9999px',
    minWidth: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid var(--bg-main)',
  },
  notificationsDropdown: {
    position: 'absolute',
    top: '46px',
    right: '0',
    width: '320px',
    maxHeight: '400px',
    overflowY: 'auto',
    borderRadius: '12px',
    background: 'rgba(15, 23, 42, 0.95)',
    zIndex: 200,
    padding: '12px 0',
  },
  dropdownHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 16px 10px 16px',
    borderBottom: '1px solid var(--border-color)',
  },
  dropdownTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff',
  },
  markReadBtn: {
    background: 'transparent',
    border: 'none',
    color: '#8B5CF6',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  notificationList: {
    display: 'flex',
    flexDirection: 'column',
  },
  emptyNotifications: {
    padding: '24px',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '13px',
  },
  notificationItem: {
    display: 'flex',
    padding: '12px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.03)',
    transition: 'var(--transition-smooth)',
  },
  notifIndicator: {
    width: '12px',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
  },
  unreadDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#8B5CF6',
    display: 'inline-block',
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#fff',
  },
  notifText: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    marginTop: '2px',
    lineHeight: '1.4',
  },
  notifTime: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    marginTop: '4px',
    display: 'block',
  },
  userBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    paddingLeft: '16px',
    borderLeft: '1px solid var(--border-color)',
  },
  userAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '1.5px solid var(--border-neon)',
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
  },
  userName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#fff',
  },
  sidebar: {
    position: 'fixed',
    top: '70px',
    bottom: 0,
    left: 0,
    width: '260px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '24px 16px',
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTop: 'none',
    borderBottom: 'none',
    borderLeft: 'none',
    zIndex: 90,
    background: 'rgba(15, 23, 42, 0.3)',
    transition: 'var(--transition-smooth)',
  },
  navMenu: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  navBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '500',
    textAlign: 'left',
    transition: 'var(--transition-smooth)',
  },
  sidebarFooter: {
    borderTop: '1px solid var(--border-color)',
    paddingTop: '16px',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    width: '100%',
    background: 'transparent',
    color: 'var(--text-muted)',
    fontSize: '14px',
    borderRadius: '10px',
  },
  mobileOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(4px)',
    zIndex: 85,
  }
};
//  media queries for sidebar
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @media (max-width: 768px) {
    header button[style*="display: none"] {
      display: block !important;
    }
    aside {
      transform: translateX(-100%);
    }
    aside[style*="left: 0px"] {
      transform: translateX(0);
    }
    .quick-add-text {
      display: none;
    }
  }
`;
document.head.appendChild(styleSheet);

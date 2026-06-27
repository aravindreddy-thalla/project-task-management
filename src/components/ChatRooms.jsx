import React, { useState, useEffect, useRef } from 'react';
import { Send, Hash, MessageSquare, ShieldAlert } from 'lucide-react';
import { MOCK_USERS } from '../utils/mockDb';

export default function ChatRooms({ 
  messages, 
  onSendMessage, 
  currentUser 
}) {
  const rooms = [
    { id: 'general', name: 'general', desc: 'Company-wide announcements and talk' },
    { id: 'dev-team', name: 'dev-team', desc: 'Sprint developments and logic mapping' },
    { id: 'design-team', name: 'design-team', desc: 'UI assets and Figma discussion' }
  ];

  const [activeRoom, setActiveRoom] = useState('general');
  const [inputText, setInputText] = useState('');
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);

  const activeMessages = messages[activeRoom] || [];

  // Scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages]);

  // Simulate typing indicator when automated responses trigger
  useEffect(() => {
    // Listen for custom simulated replies in window to trigger typing indicator
    const handleTypingStart = (e) => {
      if (e.detail?.room === activeRoom) {
        // Pick a random mock user that is NOT the active user
        const otherUser = MOCK_USERS.find(u => u.id !== currentUser.id);
        setTypingUser(otherUser.name);
        
        setTimeout(() => {
          setTypingUser(null);
        }, 1200);
      }
    };

    window.addEventListener('simulated-typing', handleTypingStart);
    return () => window.removeEventListener('simulated-typing', handleTypingStart);
  }, [activeRoom, currentUser]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage(activeRoom, inputText);
    setInputText('');

    // Trigger simulated typing event in window for design aesthetics
    const event = new CustomEvent('simulated-typing', { detail: { room: activeRoom } });
    window.dispatchEvent(event);
  };

  return (
    <div style={styles.chatContainer} className="glass-panel animate-fade-in">
      {/* Rooms Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <MessageSquare size={18} style={{ marginRight: 8, color: 'var(--primary)' }} />
          <h3 style={styles.sidebarTitle}>Channels</h3>
        </div>
        <div style={styles.roomsList}>
          {rooms.map(room => {
            const isActive = activeRoom === room.id;
            return (
              <button
                key={room.id}
                onClick={() => setActiveRoom(room.id)}
                style={{
                  ...styles.roomBtn,
                  backgroundColor: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  borderLeft: isActive ? '3px solid var(--secondary)' : '3px solid transparent'
                }}
              >
                <Hash size={16} style={{ marginRight: 8, opacity: isActive ? 1 : 0.6 }} />
                <span style={styles.roomName}>{room.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Messages Panel */}
      <div style={styles.chatArea}>
        {/* Header */}
        <div style={styles.chatHeader}>
          <div style={styles.chatHeaderInfo}>
            <Hash size={20} color="#fff" style={{ marginRight: 6 }} />
            <h3 style={styles.activeRoomTitle}>{activeRoom}</h3>
          </div>
          <span style={styles.roomDesc}>
            {rooms.find(r => r.id === activeRoom)?.desc}
          </span>
        </div>

        {/* Message Feed */}
        <div style={styles.messageFeed}>
          {activeMessages.length === 0 ? (
            <div style={styles.emptyFeed}>
              <p>No messages in #{activeRoom} yet. Say hello!</p>
            </div>
          ) : (
            activeMessages.map(msg => {
              const isOwnMessage = msg.userId === currentUser.id;
              const sender = MOCK_USERS.find(u => u.id === msg.userId);
              
              return (
                <div 
                  key={msg.id} 
                  style={{
                    ...styles.messageWrapper,
                    flexDirection: isOwnMessage ? 'row-reverse' : 'row'
                  }}
                >
                  <img 
                    src={sender?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                    alt={msg.userName} 
                    style={styles.messageAvatar} 
                  />
                  <div style={styles.messageBubbleWrapper}>
                    <div style={{
                      ...styles.messageBubbleHeader,
                      flexDirection: isOwnMessage ? 'row-reverse' : 'row'
                    }}>
                      <span style={styles.senderName}>{msg.userName}</span>
                      <span style={styles.messageTime}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div style={{
                      ...styles.messageBubble,
                      backgroundColor: isOwnMessage ? 'var(--primary-glow)' : 'rgba(255,255,255,0.03)',
                      borderColor: isOwnMessage ? 'var(--primary)' : 'var(--border-color)',
                      borderTopLeftRadius: isOwnMessage ? '12px' : '0px',
                      borderTopRightRadius: isOwnMessage ? '0px' : '12px',
                    }}>
                      <p style={styles.messageText}>{msg.text}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          {typingUser && (
            <div style={styles.typingIndicator} className="animate-fade-in">
              <span style={styles.typingDot}></span>
              <span style={styles.typingDot}></span>
              <span style={styles.typingDot}></span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '6px' }}>
                {typingUser} is typing...
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} style={styles.inputForm}>
          <input
            type="text"
            placeholder={`Message #${activeRoom}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={styles.chatInput}
          />
          <button type="submit" className="btn-primary" style={styles.sendBtn}>
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  chatContainer: {
    display: 'flex',
    height: 'calc(100vh - 120px)',
    minHeight: '400px',
    overflow: 'hidden',
  },
  sidebar: {
    width: '240px',
    borderRight: '1px solid var(--border-color)',
    background: 'rgba(15, 23, 42, 0.25)',
    display: 'flex',
    flexDirection: 'column',
    '@media (max-width: 640px)': {
      width: '60px',
      'h3, span': { display: 'none' }
    }
  },
  sidebarHeader: {
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-color)',
  },
  sidebarTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#fff',
  },
  roomsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '12px 8px',
  },
  roomBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 14px',
    borderRadius: '8px',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'var(--transition-smooth)',
  },
  roomName: {
    flex: 1,
  },
  chatArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    background: 'transparent',
  },
  chatHeader: {
    padding: '16px 24px',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatHeaderInfo: {
    display: 'flex',
    alignItems: 'center',
  },
  activeRoomTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#fff',
  },
  roomDesc: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    '@media (max-width: 640px)': {
      display: 'none'
    }
  },
  messageFeed: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  emptyFeed: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-muted)',
    fontSize: '13px',
  },
  messageWrapper: {
    display: 'flex',
    gap: '12px',
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  messageAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginTop: '4px',
  },
  messageBubbleWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  messageBubbleHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  senderName: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#fff',
  },
  messageTime: {
    fontSize: '9px',
    color: 'var(--text-muted)',
  },
  messageBubble: {
    padding: '12px 16px',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  messageText: {
    fontSize: '13px',
    color: 'var(--text-primary)',
    lineHeight: '1.5',
    whiteSpace: 'pre-wrap',
  },
  typingIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    paddingLeft: '44px',
    marginTop: '-8px',
  },
  typingDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: 'var(--text-muted)',
    display: 'inline-block',
    animation: 'bounce 1s infinite alternate',
    '&:nth-child(2)': { animationDelay: '0.2s' },
    '&:nth-child(3)': { animationDelay: '0.4s' }
  },
  inputForm: {
    padding: '16px 24px',
    display: 'flex',
    gap: '12px',
    borderTop: '1px solid var(--border-color)',
  },
  chatInput: {
    fontSize: '13px',
    flex: 1,
  },
  sendBtn: {
    padding: '10px 14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
};

// CSS injection for typing indicator animation
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes bounce {
    from { transform: translateY(0); }
    to { transform: translateY(-4px); }
  }
  .typing-dot-bounce {
    animation: bounce 0.6s infinite alternate;
  }
`;
document.head.appendChild(styleSheet);

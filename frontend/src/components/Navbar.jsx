import React from 'react';
import { Search, LogOut, User, Zap, Sun, Moon } from 'lucide-react';

export default function Navbar({ user, onLogout, onSearch, theme, setTheme }) {
  return (
    <div style={{ padding: '0 20px' }}>
      <nav className="glass-nav animate-slide-down" style={{ 
        position: 'sticky', 
        top: 20, 
        zIndex: 1000, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        height: '70px'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ 
            width: 40, 
            height: 40, 
            background: 'var(--accent-purple)', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            boxShadow: '0 0 20px rgba(124, 58, 237, 0.4)' 
          }}>
            <Zap size={22} color="white" fill="white" />
          </div>
          <span style={{ fontSize: 20, fontWeight: 950, letterSpacing: 2, color: 'var(--text-primary)' }}>CHAINQUAKE</span>
        </div>

        {/* Search Pill */}
        <div style={{ flex: 1, maxWidth: 400, margin: '0 40px', position: 'relative' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search Network Nodes..." 
            onChange={(e) => onSearch(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--glass-bg)',
              border: 'var(--border-subtle)',
              borderRadius: 40,
              padding: '12px 24px 12px 54px',
              color: 'var(--text-primary)',
              fontSize: 14,
              outline: 'none',
              transition: 'all 0.3s ease',
              fontWeight: 500
            }}
          />
        </div>

        {/* Actions & Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {/* Theme Toggle */}
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={{
              background: 'var(--glass-bg)',
              border: 'var(--border-subtle)',
              width: 44,
              height: 44,
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => e.target.style.borderColor = 'var(--accent-purple)'}
            onMouseLeave={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
          >
            {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} color="var(--accent-gold)" />}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ 
              width: 38, 
              height: 38, 
              background: 'var(--glass-bg)', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              border: 'var(--border-subtle)' 
            }}>
              <User size={18} color="var(--accent-purple)" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>{user?.username || 'Analyst'}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Command Level</span>
            </div>
          </div>
          <button 
            onClick={onLogout}
            style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgba(239, 68, 68, 0.2)', 
              color: '#ef4444', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: 38,
              height: 38,
              borderRadius: '50%',
              transition: 'all 0.2s ease' 
            }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </nav>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Dashboard from './pages/Dashboard';
import AuthPage from './pages/AuthPage';
import LandingPage from './pages/LandingPage';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, background: '#1e1e1e', color: '#ff5555', height: '100vh', overflow: 'auto' }}>
          <h2>Something went wrong.</h2>
          <details open style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
          <button onClick={() => { localStorage.clear(); window.location.reload(); }} style={{ marginTop: 20, padding: 10 }}>Clear LocalStorage and Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
          photoURL: firebaseUser.photoURL
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        // Check localStorage fallback (for email/password mock auth)
        const savedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (savedUser && token) {
          setUser(JSON.parse(savedUser));
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (e) {
      console.log('Firebase signOut error (non-critical):', e);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setShowAuth(false);
  };

  if (loading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-obsidian)', color: 'var(--accent-purple)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '4px solid rgba(124, 58, 237, 0.1)', borderTopColor: 'var(--accent-purple)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
          <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 2, color: 'var(--text-muted)' }}>INITIALIZING CHAINQUAKE</div>
        </div>
      </div>
    );
  }

  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  if (showAuth) {
    return <AuthPage onAuthSuccess={setUser} onBack={() => setShowAuth(false)} />;
  }

  return <LandingPage onGetStarted={() => setShowAuth(true)} />;
}

export default function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

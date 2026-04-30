import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Dashboard from './pages/Dashboard';
import AuthPage from './pages/AuthPage';
import LandingPage from './pages/LandingPage';
import { Toaster } from 'react-hot-toast';

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
      console.log('Firebase signOut error:', e);
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
        background: '#050505', color: '#7c3aed'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 60, height: 60, border: '4px solid rgba(124, 58, 237, 0.1)', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite', margin: '0 auto 20px' }} />
          <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: 4, color: '#888', textTransform: 'uppercase' }}>Synchronizing Neural Link</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#111',
            color: '#fff',
            border: '1px solid #333',
            borderRadius: '16px',
            fontSize: '13px',
            fontWeight: '800',
            padding: '12px 24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
          }
        }}
      />
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : showAuth ? (
        <AuthPage onAuthSuccess={setUser} onBack={() => setShowAuth(false)} />
      ) : (
        <LandingPage onGetStarted={() => setShowAuth(true)} />
      )}
    </>
  );
}

export default function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

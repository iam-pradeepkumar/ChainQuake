import React, { useState } from 'react';
import { Zap, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { signInWithGoogle } from '../firebase';
import { doc, setDoc, getDoc, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../firebase';

export default function AuthPage({ onAuthSuccess, onBack }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Save/update user profile in Firestore 'users' collection
   */
  const saveUserToFirestore = async (user) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        // Update existing user — bump login count and last_login
        await setDoc(userRef, {
          last_login: serverTimestamp(),
          login_count: increment(1)
        }, { merge: true });
        console.log('Firestore: Updated existing user', user.uid);
      } else {
        // Create new user document
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || user.email?.split('@')[0] || 'Operator',
          photoURL: user.photoURL || null,
          provider: user.providerData?.[0]?.providerId || 'unknown',
          role: 'operator',
          status: 'active',
          created_at: serverTimestamp(),
          last_login: serverTimestamp(),
          login_count: 1
        });
        console.log('Firestore: Created new user', user.uid);
      }
      return true;
    } catch (err) {
      console.error('Firestore: Failed to save user data:', err);
      return false;
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const user = await signInWithGoogle();
      const token = await user.getIdToken();
      
      // Persist user data to Firestore
      await saveUserToFirestore(user);

      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      };
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      onAuthSuccess(userData);
    } catch (err) {
      console.error("Auth Error:", err);
      setError('Google Authentication failed. Please try again.');
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const uid = email.replace('@', '_at_').replace(/\./g, '_');
      const userDoc = {
        uid,
        email,
        displayName: fullName || email.split('@')[0],
        photoURL: null
      };

      // Save to Firestore
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        await setDoc(userRef, {
          last_login: serverTimestamp(),
          login_count: increment(1)
        }, { merge: true });
      } else {
        await setDoc(userRef, {
          ...userDoc,
          provider: 'email',
          role: 'operator',
          status: 'active',
          created_at: serverTimestamp(),
          last_login: serverTimestamp(),
          login_count: 1
        });
      }

      localStorage.setItem('token', 'email-auth-token');
      localStorage.setItem('user', JSON.stringify(userDoc));
      onAuthSuccess(userDoc);
    } catch (err) {
      console.error("Email Auth Error:", err);
      setError('Authentication failed. Please check your credentials.');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#050505', padding: 20, position: 'relative', overflow: 'hidden'
    }}>
      {/* Background Decor */}
      <div style={{
        position: 'absolute', top: '20%', left: '10%', width: '30%', height: '30%',
        background: 'radial-gradient(circle, rgba(124, 58, 237, 0.1) 0%, transparent 70%)',
        filter: 'blur(60px)', zIndex: 0
      }} />

      <div style={{ position: 'absolute', top: 40, left: 40, zIndex: 10 }}>
        <button onClick={onBack} style={{ 
          background: 'none', border: 'none', color: '#64748b', 
          fontSize: 13, fontWeight: 800, cursor: 'pointer', display: 'flex', 
          alignItems: 'center', gap: 8 
        }}>
          &larr; BACK TO MISSION INTEL
        </button>
      </div>

      <div className="grit-card animate-slide-in" style={{
        width: '100%', maxWidth: 420, padding: '48px 40px', zIndex: 1, position: 'relative',
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 32, boxShadow: '0 40px 100px rgba(0,0,0,0.8)'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 20, boxShadow: '0 8px 25px rgba(124, 58, 237, 0.3)'
          }}>
            <Zap size={28} color="white" fill="white" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 950, letterSpacing: '-1px', marginBottom: 8, color: '#fff' }}>
            {isLogin ? 'Command Access' : 'Network Induction'}
          </h1>
          <p style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500, textAlign: 'center' }}>
            {isLogin ? 'Authenticate to enter the autonomous war room' : 'Provision your credentials for the supply network'}
          </p>
        </div>

        {error && (
          <div style={{
            padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 12, color: '#ef4444', fontSize: 12, fontWeight: 700, marginBottom: 20, textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
           <button 
             onClick={handleGoogleLogin} disabled={loading}
             style={{
               width: '100%', padding: '14px', background: '#fff', color: '#000', 
               border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 900, 
               cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
               transition: 'all 0.2s'
             }}
           >
             <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" alt="Google" />
             CONTINUE WITH GOOGLE
           </button>

           <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '8px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              <span style={{ fontSize: 10, color: '#475569', fontWeight: 800 }}>OR</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
           </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {!isLogin && (
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text" required placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)}
                  style={{
                    width: '100%', padding: '14px 16px 14px 48px', background: 'rgba(255,255,255,0.02)', 
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', 
                    fontSize: 14, fontWeight: 500, outline: 'none'
                  }}
                />
              </div>
            )}

            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="email" required placeholder="Intelligence ID (Email)" value={email} onChange={e => setEmail(e.target.value)}
                style={{
                  width: '100%', padding: '14px 16px 14px 48px', background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', 
                  fontSize: 14, fontWeight: 500, outline: 'none'
                }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="password" required placeholder="Security Key (Password)" value={password} onChange={e => setPassword(e.target.value)}
                style={{
                  width: '100%', padding: '14px 16px 14px 48px', background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', 
                  fontSize: 14, fontWeight: 500, outline: 'none'
                }}
              />
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '16px', background: 'linear-gradient(135deg, #7c3aed, #3b82f6)', 
              color: '#fff', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 900, 
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              marginTop: 8
            }}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : (
                <>
                  {isLogin ? 'INITIATE ACCESS' : 'PROVISION ACCOUNT'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        <div style={{ marginTop: 32, textAlign: 'center', fontSize: 13, color: '#64748b', fontWeight: 600 }}>
          {isLogin ? "Unauthorized Operator?" : "Already Inductioned?"}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            style={{ background: 'none', border: 'none', color: '#7c3aed', fontWeight: 800, cursor: 'pointer', padding: 0 }}
          >
            {isLogin ? 'CREATE CREDENTIALS' : 'SIGN IN HERE'}
          </button>
        </div>
      </div>
    </div>
  );
}

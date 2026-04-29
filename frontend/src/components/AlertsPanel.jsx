import React, { useState } from 'react';
import { AlertCircle, ShieldAlert, Clock, Mail, Phone, Send, CheckCircle, X, Loader2 } from 'lucide-react';
import { alertsApi } from '../services/api';

export default function AlertsPanel({ alerts }) {
  const items = (alerts || []).slice(0, 20);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedAlertId, setSelectedAlertId] = useState(null);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  const handleEmailAlert = async () => {
    if (!email) return;
    setSending(true);
    setResult(null);
    try {
      const res = await alertsApi.notifyEmail({
        to_email: email,
        alert_id: selectedAlertId || undefined
      });
      setResult(res.data);
    } catch (err) {
      setResult({ status: 'failed', error: err.message });
    }
    setSending(false);
  };

  const handlePhoneAlert = async () => {
    if (!phone) return;
    setSending(true);
    setResult(null);
    try {
      const res = await alertsApi.notifyPhone({
        to_phone: phone,
        alert_id: selectedAlertId || undefined
      });
      setResult(res.data);
    } catch (err) {
      setResult({ status: 'failed', error: err.message });
    }
    setSending(false);
  };

  const openEmailModal = (alertId = null) => {
    setSelectedAlertId(alertId);
    setResult(null);
    setShowEmailModal(true);
    setShowPhoneModal(false);
  };

  const openPhoneModal = (alertId = null) => {
    setSelectedAlertId(alertId);
    setResult(null);
    setShowPhoneModal(true);
    setShowEmailModal(false);
  };

  const closeModals = () => {
    setShowEmailModal(false);
    setShowPhoneModal(false);
    setResult(null);
  };

  const criticalCount = items.filter(a => a.severity === 'critical').length;
  const highCount = items.filter(a => a.severity === 'high').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: 400, position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertCircle size={20} color="var(--accent-purple)" fill="rgba(124, 58, 237, 0.2)" />
          <span style={{ fontSize: 16, fontWeight: 950, color: 'var(--text-primary)', letterSpacing: 1 }}>THREAT MONITOR</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {criticalCount > 0 && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '4px 12px', borderRadius: 20, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: '#ef4444' }}>{criticalCount} CRITICAL</span>
            </div>
          )}
          {highCount > 0 && (
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '4px 12px', borderRadius: 20, border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: '#f59e0b' }}>{highCount} HIGH</span>
            </div>
          )}
        </div>
      </div>

      {/* Alert Action Buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexShrink: 0 }}>
        <button
          onClick={() => openEmailModal()}
          style={{
            flex: 1, padding: '10px 12px', borderRadius: 16, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05))',
            border: '1px solid rgba(59, 130, 246, 0.3)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 8, transition: 'all 0.2s'
          }}
        >
          <Mail size={14} color="#3b82f6" />
          <span style={{ fontSize: 10, fontWeight: 900, color: '#3b82f6', letterSpacing: 0.5 }}>EMAIL ALERT</span>
        </button>
        <button
          onClick={() => openPhoneModal()}
          style={{
            flex: 1, padding: '10px 12px', borderRadius: 16, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))',
            border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 8, transition: 'all 0.2s'
          }}
        >
          <Phone size={14} color="#10b981" />
          <span style={{ fontSize: 10, fontWeight: 900, color: '#10b981', letterSpacing: 0.5 }}>CALL ALERT</span>
        </button>
      </div>

      {/* Alert List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', flex: 1, paddingRight: 8, maxHeight: 280 }}>
        {items.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13, fontWeight: 600 }}>NO ACTIVE THREATS</div>
        )}
        {items.map((alert, i) => {
          const isCritical = alert.severity === 'critical';
          const isHigh = alert.severity === 'high';
          const borderColor = isCritical ? 'rgba(239, 68, 68, 0.3)' : (isHigh ? 'rgba(245, 158, 11, 0.2)' : 'var(--border-subtle)');
          const iconColor = isCritical ? '#ef4444' : (isHigh ? '#f59e0b' : 'var(--accent-purple)');

          return (
            <div key={alert.id || i} className="animate-slide-in" style={{
              display: 'flex', gap: 12, padding: '14px', animationDelay: `${i * 0.04}s`,
              background: 'var(--glass-bg)', borderRadius: 18,
              border: `1px solid ${borderColor}`, transition: 'all 0.2s ease'
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: isCritical ? 'rgba(239, 68, 68, 0.1)' : 'rgba(124, 58, 237, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <ShieldAlert size={14} color={iconColor} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: 6 }}>{alert.message}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 9, fontWeight: 900, color: iconColor, textTransform: 'uppercase' }}>
                    {alert.severity}
                  </div>
                  {alert.risk_score > 0 && (
                    <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)' }}>
                      Risk: {(alert.risk_score * 100).toFixed(0)}%
                    </div>
                  )}
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Clock size={10} />
                    {alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString() : '—'}
                  </div>
                  {/* Per-alert notification buttons */}
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                    {alert.notified_email && (
                      <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Mail size={8} color="#3b82f6" />
                      </div>
                    )}
                    {alert.notified_phone && (
                      <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Phone size={8} color="#10b981" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', borderRadius: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(10px)'
        }}>
          <div style={{ width: '90%', maxWidth: 320, padding: 28, background: 'var(--bg-surface)', borderRadius: 24, border: '1px solid rgba(59,130,246,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mail size={18} color="#3b82f6" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-primary)' }}>Email Alert</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>Send threat report via email</div>
                </div>
              </div>
              <button onClick={closeModals} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>

            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="operator@example.com"
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.03)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', marginBottom: 16
              }}
            />

            <button
              onClick={handleEmailAlert} disabled={sending || !email}
              style={{
                width: '100%', padding: '14px', borderRadius: 14, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white',
                fontSize: 12, fontWeight: 900, letterSpacing: 1, display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8, opacity: (!email || sending) ? 0.5 : 1
              }}
            >
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={14} />}
              {sending ? 'DISPATCHING...' : 'SEND EMAIL ALERT'}
            </button>

            {result && (
              <div style={{
                marginTop: 14, padding: '12px 16px', borderRadius: 12, fontSize: 11, fontWeight: 700,
                background: result.status === 'sent' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${result.status === 'sent' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                color: result.status === 'sent' ? '#10b981' : '#ef4444',
                display: 'flex', alignItems: 'center', gap: 8
              }}>
                {result.status === 'sent' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                {result.status === 'sent' ? 'Email dispatched successfully!' : (result.error || 'Failed to send email.')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Phone Call Modal */}
      {showPhoneModal && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', borderRadius: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(10px)'
        }}>
          <div style={{ width: '90%', maxWidth: 320, padding: 28, background: 'var(--bg-surface)', borderRadius: 24, border: '1px solid rgba(16,185,129,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Phone size={18} color="#10b981" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-primary)' }}>Phone Alert</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>Automated voice call alert</div>
                </div>
              </div>
              <button onClick={closeModals} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>

            <input
              type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="+91 9876543210"
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.03)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', marginBottom: 8
              }}
            />
            <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 16, fontWeight: 600, paddingLeft: 4 }}>
              Use E.164 format: +[country][number] (e.g. +919876543210)
            </div>

            <button
              onClick={handlePhoneAlert} disabled={sending || !phone}
              style={{
                width: '100%', padding: '14px', borderRadius: 14, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white',
                fontSize: 12, fontWeight: 900, letterSpacing: 1, display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8, opacity: (!phone || sending) ? 0.5 : 1
              }}
            >
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Phone size={14} />}
              {sending ? 'INITIATING CALL...' : 'INITIATE PHONE ALERT'}
            </button>

            {result && (
              <div style={{
                marginTop: 14, padding: '12px 16px', borderRadius: 12, fontSize: 11, fontWeight: 700,
                background: result.status === 'initiated' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${result.status === 'initiated' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                color: result.status === 'initiated' ? '#10b981' : '#ef4444',
                display: 'flex', alignItems: 'center', gap: 8
              }}>
                {result.status === 'initiated' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                {result.status === 'initiated' ? `Call initiated! SID: ${result.call_sid?.slice(0,10)}...` : (result.error || 'Failed to initiate call.')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

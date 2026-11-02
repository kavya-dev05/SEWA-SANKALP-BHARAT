import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../lib/api';

type VerificationStatus = 'pending' | 'approved' | 'rejected';

interface NGOUser {
  uid: string;
  name: string;
  email: string;
  orgName?: string;
  orgType?: string;
  orgRegNumber?: string;
  city?: string;
  verificationStatus?: VerificationStatus;
  isVerified?: boolean;
  createdAt?: string;
}

export default function Admin() {
  const { user, getToken, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [ngos, setNgos] = useState<NGOUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<{ uid: string; reason: string } | null>(null);
  const [toast, setToast] = useState('');
  const [filter, setFilter] = useState<'all' | VerificationStatus>('pending');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadNGOs = useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    try {
      const res = await authFetch('/api/admin/pending-ngos', token);
      if (res.ok) {
        const data = await res.json();
        setNgos(data.ngos || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (!authLoading && user?.isAdmin) {
      loadNGOs();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading, user, loadNGOs]);

  const handleVerify = async (uid: string, action: 'approve' | 'reject', reason?: string) => {
    const token = await getToken();
    if (!token) return;
    setActionLoading(uid + action);
    try {
      const res = await authFetch('/api/admin/verify-ngo', token, {
        method: 'POST',
        body: JSON.stringify({ uid, action, reason }),
      });
      if (res.ok) {
        showToast(action === 'approve' ? '✅ NGO approved!' : '❌ NGO rejected.');
        setNgos(prev => prev.map(n =>
          n.uid === uid
            ? { ...n, verificationStatus: action === 'approve' ? 'approved' : 'rejected', isVerified: action === 'approve' }
            : n
        ));
        setRejectReason(null);
      } else {
        showToast('Failed to update. Try again.');
      }
    } catch {
      showToast('Connection error.');
    } finally {
      setActionLoading(null);
    }
  };

  // ─── Access denied ─────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>Loading...</div>
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', background: 'white', padding: '48px', borderRadius: '20px', border: '1px solid var(--border)', maxWidth: '420px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
          <h2 style={{ fontFamily: 'Georgia, serif', color: 'var(--ink)', marginBottom: '12px' }}>Access Denied</h2>
          <p style={{ color: 'var(--ink-soft)', fontSize: '14px', marginBottom: '24px' }}>
            You must be an admin to access this panel.
          </p>
          <button
            onClick={() => navigate('/')}
            style={{ padding: '12px 24px', background: 'var(--sage)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
          >
            Return to Home
          </button>
          <div style={{ marginTop: '20px', padding: '12px', background: 'var(--canvas)', borderRadius: '8px', fontSize: '12px', color: 'var(--ink-soft)', textAlign: 'left' }}>
            <strong>To get admin access:</strong><br />
            Run this in your terminal (with the server running):<br />
            <code style={{ background: '#f0f0f0', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', display: 'block', marginTop: '6px', wordBreak: 'break-all' }}>
              curl -X POST http://localhost:3000/api/admin/bootstrap -H "Authorization: Bearer YOUR_TOKEN" -H "x-admin-secret: YOUR_ADMIN_BOOTSTRAP_SECRET"
            </code>
          </div>
        </div>
      </div>
    );
  }

  const filtered = filter === 'all' ? ngos : ngos.filter(n => (n.verificationStatus || 'pending') === filter);
  const counts = {
    all: ngos.length,
    pending: ngos.filter(n => !n.verificationStatus || n.verificationStatus === 'pending').length,
    approved: ngos.filter(n => n.verificationStatus === 'approved').length,
    rejected: ngos.filter(n => n.verificationStatus === 'rejected').length,
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--canvas)', padding: '32px 24px' }}>
      <style>{`
        .admin-card { background: white; border-radius: 16px; border: 1px solid var(--border); overflow: hidden; }
        .admin-table-row { padding: 20px 24px; border-bottom: 1px solid var(--border-soft); display: grid; grid-template-columns: 1fr 1fr auto; gap: 16px; align-items: start; }
        .admin-table-row:last-child { border-bottom: none; }
        .filter-btn { padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; cursor: pointer; border: 1.5px solid var(--border); background: white; color: var(--ink-soft); transition: all .2s; }
        .filter-btn.active { background: var(--ink); color: white; border-color: var(--ink); }
        .status-badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; }
        .status-pending { background: var(--amber-light); color: var(--amber); }
        .status-approved { background: var(--sage-light); color: var(--sage); }
        .status-rejected { background: var(--rose-light); color: var(--rose); }
        .action-btn { padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; }
        .reject-form { margin-top: 12px; padding: 12px; background: var(--rose-light); border-radius: 8px; border: 1px solid rgba(220,53,69,.2); }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', background: 'var(--ink)', color: 'white',
          padding: '12px 20px', borderRadius: '10px', zIndex: 2000, fontSize: '14px', fontWeight: 600,
          boxShadow: '0 4px 20px rgba(0,0,0,.25)'
        }}>
          {toast}
        </div>
      )}

      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', color: 'var(--ink)', margin: 0 }}>⚙️ Admin Panel</h1>
            <p style={{ color: 'var(--ink-soft)', fontSize: '14px', marginTop: '6px' }}>Manage NGO verifications and platform operations</p>
          </div>
          <button onClick={() => navigate('/profile')} style={{ padding: '10px 20px', background: 'var(--canvas)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
            ← Back to Profile
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
          {[
            { label: 'Total NGOs', value: counts.all, color: 'var(--ink)' },
            { label: 'Pending', value: counts.pending, color: 'var(--amber)' },
            { label: 'Approved', value: counts.approved, color: 'var(--sage)' },
            { label: 'Rejected', value: counts.rejected, color: 'var(--rose)' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--border)', padding: '20px 24px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--ink-mute)', marginBottom: '8px' }}>{s.label}</div>
              <div style={{ fontSize: '36px', fontFamily: 'Georgia, serif', color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
            </button>
          ))}
        </div>

        {/* NGO table */}
        <div className="admin-card">
          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--ink-soft)' }}>Loading NGOs...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '64px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏛️</div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: 'var(--ink)', marginBottom: '8px' }}>No NGOs to show</div>
              <div style={{ color: 'var(--ink-soft)', fontSize: '14px' }}>When NGOs register, they'll appear here for review.</div>
            </div>
          ) : (
            filtered.map(ngo => {
              const status = ngo.verificationStatus || 'pending';
              const isActing = actionLoading?.startsWith(ngo.uid);
              return (
                <div key={ngo.uid} className="admin-table-row">
                  {/* NGO info */}
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--ink)', marginBottom: '4px' }}>
                      {ngo.orgName || ngo.name}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--ink-soft)', marginBottom: '4px' }}>{ngo.name} · {ngo.email}</div>
                    <div style={{ fontSize: '12px', color: 'var(--ink-mute)' }}>
                      {ngo.orgType && <span style={{ marginRight: '8px' }}>📋 {ngo.orgType}</span>}
                      {ngo.city && <span style={{ marginRight: '8px' }}>📍 {ngo.city}</span>}
                    </div>
                    {ngo.orgRegNumber && (
                      <div style={{ fontSize: '11px', color: 'var(--ink-mute)', marginTop: '4px', fontFamily: 'monospace', background: 'var(--canvas)', padding: '3px 8px', borderRadius: '4px', display: 'inline-block' }}>
                        Reg: {ngo.orgRegNumber}
                      </div>
                    )}
                    <div style={{ fontSize: '11px', color: 'var(--ink-mute)', marginTop: '6px' }}>Registered: {ngo.createdAt}</div>
                  </div>

                  {/* Status */}
                  <div>
                    <span className={`status-badge status-${status}`}>
                      {status === 'pending' ? '⏳ Pending' : status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div>
                    {status === 'pending' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="action-btn"
                            style={{ background: 'var(--sage)', color: 'white' }}
                            disabled={!!isActing}
                            onClick={() => handleVerify(ngo.uid, 'approve')}
                          >
                            {isActing ? '...' : '✓ Approve'}
                          </button>
                          <button
                            className="action-btn"
                            style={{ background: 'var(--rose)', color: 'white' }}
                            disabled={!!isActing}
                            onClick={() => setRejectReason({ uid: ngo.uid, reason: '' })}
                          >
                            ✗ Reject
                          </button>
                        </div>
                        {rejectReason?.uid === ngo.uid && (
                          <div className="reject-form" style={{ width: '260px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' }}>Rejection reason:</div>
                            <input
                              style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px', boxSizing: 'border-box' }}
                              placeholder="e.g. Insufficient registration details"
                              value={rejectReason.reason}
                              onChange={e => setRejectReason({ ...rejectReason, reason: e.target.value })}
                            />
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                              <button
                                className="action-btn"
                                style={{ background: 'var(--rose)', color: 'white', flex: 1 }}
                                onClick={() => handleVerify(ngo.uid, 'reject', rejectReason.reason)}
                                disabled={!rejectReason.reason}
                              >
                                Confirm Reject
                              </button>
                              <button
                                className="action-btn"
                                style={{ background: 'var(--canvas)', color: 'var(--ink)', border: '1px solid var(--border)' }}
                                onClick={() => setRejectReason(null)}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {status === 'approved' && (
                      <button
                        className="action-btn"
                        style={{ background: 'var(--rose-light)', color: 'var(--rose)', border: '1px solid var(--rose)' }}
                        onClick={() => setRejectReason({ uid: ngo.uid, reason: '' })}
                      >
                        Revoke
                      </button>
                    )}
                    {status === 'rejected' && (
                      <button
                        className="action-btn"
                        style={{ background: 'var(--sage-light)', color: 'var(--sage)', border: '1px solid var(--sage)' }}
                        onClick={() => handleVerify(ngo.uid, 'approve')}
                      >
                        Re-approve
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

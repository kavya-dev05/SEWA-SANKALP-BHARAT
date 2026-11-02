import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../lib/api';

// ─── Status badge colours ──────────────────────────────────────────────────
function statusStyle(status: string) {
  const s = (status || '').toLowerCase();
  if (s === 'paid' || s === 'accepted' || s === 'verified' || s === 'fulfilled' || s === 'approved' || s === 'needs met')
    return { bg: 'var(--sage-light)', color: 'var(--sage)' };
  if (s === 'pending' || s === 'submitted' || s === 'matched & processing')
    return { bg: 'var(--blue-light)', color: 'var(--blue)' };
  if (s === 'declined' || s === 'rejected')
    return { bg: 'var(--rose-light)', color: 'var(--rose)' };
  return { bg: 'var(--amber-light)', color: 'var(--amber)' };
}

// ─── Skeleton loader ───────────────────────────────────────────────────────
function Skeleton({ w = '100%', h = '20px' }: { w?: string; h?: string }) {
  return (
    <div style={{
      width: w, height: h,
      background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
      backgroundSize: '200% 100%',
      borderRadius: '6px',
      animation: 'shimmer 1.4s infinite',
    }} />
  );
}

// ─── Inline modal for forms ────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'white', borderRadius: '16px', padding: '32px',
        maxWidth: '480px', width: '100%', position: 'relative',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '16px', right: '16px',
          background: 'none', border: 'none', fontSize: '20px',
          cursor: 'pointer', color: 'var(--ink-mute)', lineHeight: 1
        }}>×</button>
        <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: 'var(--ink)', marginBottom: '20px' }}>{title}</h3>
        {children}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PROFILE PAGE
// ═══════════════════════════════════════════════════════════════════════════
export default function Profile() {
  const { user, getToken } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-[var(--canvas)]">
        <div className="text-center bg-white p-12 rounded-2xl border border-[var(--border)] shadow-sm max-w-md w-full">
          <h2 className="font-serif text-3xl text-[var(--ink)] mb-4">Access Denied</h2>
          <p className="text-[var(--ink-soft)] mb-8">Please sign in to view your profile and dashboard.</p>
          <button onClick={() => navigate('/')} className="f-btn">Return to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--canvas)] py-16 px-6 md:px-20">
      <style>{`
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .profile-card { background:white; border-radius:16px; border:1px solid var(--border); }
        .profile-card-head { padding:20px 24px; border-bottom:1px solid var(--border); background:var(--canvas); display:flex; justify-content:space-between; align-items:center; }
        .f-label-sm { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:var(--ink-mute); display:block; margin-bottom:6px; }
        .f-input-sm { width:100%; padding:10px 12px; border:1px solid var(--border); border-radius:8px; font-size:14px; color:var(--ink); background:white; outline:none; box-sizing:border-box; }
        .f-input-sm:focus { border-color:var(--sage); box-shadow:0 0 0 3px rgba(46,107,94,.1); }
        .f-select { width:100%; padding:10px 12px; border:1px solid var(--border); border-radius:8px; font-size:14px; color:var(--ink); background:white; outline:none; appearance:auto; }
        .btn-sm { padding:8px 16px; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; border:none; }
        .btn-primary { background:var(--sage); color:white; }
        .btn-primary:hover { background:#255a4e; }
        .btn-danger { background:var(--rose); color:white; }
        .btn-ghost { background:var(--canvas); color:var(--ink); border:1px solid var(--border); }
        .activity-row { padding:16px 24px; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center; }
        .activity-row:last-child { border-bottom:none; }
        .notif-dot { width:8px; height:8px; border-radius:50%; background:var(--rose); display:inline-block; }
        .pending-banner { background:var(--amber-light); border:1px solid var(--amber); border-radius:12px; padding:16px 20px; margin-bottom:24px; display:flex; gap:12px; align-items:flex-start; }
        .rejected-banner { background:var(--rose-light); border:1px solid var(--rose); border-radius:12px; padding:16px 20px; margin-bottom:24px; }
      `}</style>

      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <div className="flex items-center gap-4 mb-2">
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'var(--sage-light)', color: 'var(--sage)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px', fontFamily: 'Georgia, serif', fontWeight: 700
            }}>
              {user.name.charAt(0)}
            </div>
            <div>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', color: 'var(--ink)', margin: 0 }}>{user.name}</h1>
              <p style={{ fontSize: '11px', color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700, margin: '4px 0 0' }}>
                {user.orgName ? `${user.orgName} · ` : ''}{user.role} Dashboard
              </p>
            </div>
            {user.isAdmin && (
              <a href="/admin" style={{
                marginLeft: 'auto', padding: '8px 16px', background: 'var(--ink)',
                color: 'white', borderRadius: '8px', fontSize: '12px', fontWeight: 700,
                textDecoration: 'none'
              }}>⚙️ Admin Panel</a>
            )}
          </div>
        </header>

        {user.role === 'donor' && <DonorProfile getToken={getToken} />}
        {user.role === 'ngo' && <NGOProfile getToken={getToken} user={user} />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DONOR PROFILE
// ═══════════════════════════════════════════════════════════════════════════
function DonorProfile({ getToken }: { getToken: () => Promise<string | null> }) {
  const [stats, setStats] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (!token) return;
      try {
        const [statsRes, actRes] = await Promise.all([
          authFetch('/api/profile/stats', token),
          authFetch('/api/profile/activity', token),
        ]);
        const statsData = await statsRes.json();
        const actData = await actRes.json();
        setStats(statsData);
        setActivity(actData.activity || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [getToken]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
      {/* Stats */}
      <div className="profile-card" style={{ padding: '24px', alignSelf: 'start' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--ink-mute)', marginBottom: '20px' }}>Your Impact</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {[
            {
              value: loading ? null : `₹${Number(stats?.totalDonated || 0).toLocaleString('en-IN')}`,
              label: 'Total Donated'
            },
            {
              value: loading ? null : String(stats?.ngosSupported || 0),
              label: 'NGOs Supported'
            },
            {
              value: loading ? null : String(stats?.volunteerEngagements || 0),
              label: 'Volunteer Engagements'
            }
          ].map((s, i) => (
            <div key={i} style={{ paddingBottom: i < 2 ? '20px' : 0, borderBottom: i < 2 ? '1px solid var(--border-soft)' : 'none' }}>
              {loading
                ? <Skeleton h="36px" w="80%" />
                : <div style={{ fontSize: '32px', fontFamily: 'Georgia, serif', color: 'var(--ink)' }}>{s.value}</div>
              }
              <div style={{ fontSize: '13px', color: 'var(--ink-soft)', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity */}
      <div className="profile-card">
        <div className="profile-card-head">
          <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: 'var(--ink)', margin: 0 }}>Recent Activity</h3>
        </div>
        <div>
          {loading ? (
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[1, 2, 3].map(i => <div key={i}><Skeleton h="48px" /></div>)}
            </div>
          ) : activity.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--ink-soft)' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🌱</div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)' }}>No activity yet</div>
              <div style={{ fontSize: '13px', marginTop: '6px' }}>Make your first donation or volunteer to see it here.</div>
            </div>
          ) : (
            activity.map((item, i) => {
              const st = statusStyle(item.status);
              return (
                <div key={item.id || i} className="activity-row">
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--ink)' }}>{item.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '2px' }}>{item.desc}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', background: st.bg, color: st.color, display: 'inline-block', marginBottom: '4px' }}>
                      {item.status}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--ink-mute)', display: 'block' }}>{item.date}</div>
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

// ═══════════════════════════════════════════════════════════════════════════
// NGO PROFILE
// ═══════════════════════════════════════════════════════════════════════════
function NGOProfile({ getToken, user }: { getToken: () => Promise<string | null>; user: any }) {
  const [dashboard, setDashboard] = useState<any>(null);
  const [incoming, setIncoming] = useState<any[]>([]);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNeedForm, setShowNeedForm] = useState(false);
  const [showVolForm, setShowVolForm] = useState(false);

  const loadData = useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    try {
      const [dashRes, incomingRes, notifRes] = await Promise.all([
        authFetch('/api/ngo/dashboard', token),
        authFetch('/api/ngo/incoming', token),
        authFetch('/api/notifications', token),
      ]);
      setDashboard(await dashRes.json());
      setIncoming((await incomingRes.json()).offers || []);
      setNotifs((await notifRes.json()).notifications || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleIncoming = async (id: string, action: 'accept' | 'decline') => {
    const token = await getToken();
    if (!token) return;
    await authFetch(`/api/ngo/incoming/${id}/${action}`, token, { method: 'PATCH' });
    setIncoming(prev => prev.filter(o => o.id !== id));
  };

  const markNotifsRead = async () => {
    const token = await getToken();
    if (!token) return;
    const unreadIds = notifs.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length > 0) {
      await authFetch('/api/notifications/mark-read', token, {
        method: 'POST',
        body: JSON.stringify({ ids: unreadIds }),
      });
      setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const isPending = user.verificationStatus === 'pending';
  const isRejected = user.verificationStatus === 'rejected';
  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <div>
      {/* Verification banners */}
      {isPending && (
        <div className="pending-banner">
          <span style={{ fontSize: '24px' }}>⏳</span>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: '4px' }}>Verification Pending</div>
            <div style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>
              Your NGO is awaiting admin verification. You can explore the dashboard, but donors won't see your organisation until approved.
            </div>
          </div>
        </div>
      )}
      {isRejected && (
        <div className="rejected-banner">
          <div style={{ fontWeight: 700, color: 'var(--rose)' }}>❌ Verification Rejected</div>
          <div style={{ fontSize: '13px', color: 'var(--ink-soft)', marginTop: '4px' }}>
            Reason: {user.verificationRejectedReason || 'Did not meet requirements.'}
          </div>
        </div>
      )}
      {user.verificationStatus === 'approved' && (
        <div style={{ background: 'var(--sage-light)', border: '1px solid var(--sage)', borderRadius: '12px', padding: '12px 20px', marginBottom: '24px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span>✅</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--sage)' }}>✅ Your NGO is verified and live on Sewa Sankalp Bharat.</span>
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Funds Received', value: loading ? null : `₹${Number(dashboard?.fundsReceived || 0).toLocaleString('en-IN')}` },
          { label: 'Incoming Offers', value: loading ? null : String(incoming.length || dashboard?.pendingOfferCount || 0) },
          { label: 'Resources Matched', value: loading ? null : String(dashboard?.resourcesMatched || 0) },
          { label: 'Volunteers Engaged', value: loading ? null : String(dashboard?.volunteersEngaged || 0) },
        ].map((stat, i) => (
          <div key={i} className="profile-card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--ink-mute)', marginBottom: '8px' }}>{stat.label}</div>
            {loading ? <Skeleton h="36px" w="70%" /> : (
              <div style={{ fontSize: '28px', fontFamily: 'Georgia, serif', color: 'var(--ink)' }}>{stat.value}</div>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Incoming offers */}
        <div className="profile-card">
          <div className="profile-card-head">
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: 'var(--ink)', margin: 0 }}>Incoming Donation Offers</h3>
          </div>
          {loading ? (
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1, 2].map(i => <div key={i}><Skeleton h="64px" /></div>)}
            </div>
          ) : incoming.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--ink-soft)' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📭</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>No pending offers</div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>When donors match physical items to your NGO, they'll appear here.</div>
            </div>
          ) : (
            incoming.map(offer => (
              <div key={offer.id} style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--ink)' }}>{offer.qty} × {offer.item}</div>
                  <div style={{ fontSize: '12px', color: 'var(--ink-mute)', marginTop: '2px' }}>Offered on {offer.createdAt}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button className="btn-sm btn-primary" onClick={() => handleIncoming(offer.id, 'accept')}>Accept ✓</button>
                  <button className="btn-sm btn-ghost" onClick={() => handleIncoming(offer.id, 'decline')}>Decline</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Post needs + Notifications */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="profile-card" style={{ padding: '20px' }}>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: 'var(--ink)', marginBottom: '12px' }}>Post Needs</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={() => setShowNeedForm(true)} style={{
                textAlign: 'left', padding: '14px 16px', borderRadius: '10px',
                border: '1px solid var(--border)', background: 'white', cursor: 'pointer',
                transition: 'border-color .2s',
              }}
                onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--sage)')}
                onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ink)' }}>📦 Post a Resource Need</div>
                <div style={{ fontSize: '11px', color: 'var(--ink-soft)', marginTop: '2px' }}>E.g. 20 pairs of shoes, books</div>
              </button>
              <button onClick={() => setShowVolForm(true)} style={{
                textAlign: 'left', padding: '14px 16px', borderRadius: '10px',
                border: '1px solid var(--border)', background: 'white', cursor: 'pointer',
                transition: 'border-color .2s',
              }}
                onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--sage)')}
                onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ink)' }}>🙋 Request Volunteers</div>
                <div style={{ fontSize: '11px', color: 'var(--ink-soft)', marginTop: '2px' }}>E.g. Teachers for Sunday</div>
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="profile-card" style={{ overflow: 'hidden' }}>
            <div className="profile-card-head">
              <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: 'var(--ink)', margin: 0 }}>
                Notifications {unreadCount > 0 && (
                  <span style={{ background: 'var(--rose)', color: 'white', fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '12px', marginLeft: '8px' }}>{unreadCount}</span>
                )}
              </h3>
              {unreadCount > 0 && (
                <button onClick={markNotifsRead} style={{ background: 'none', border: 'none', fontSize: '11px', color: 'var(--sage)', cursor: 'pointer' }}>
                  Mark all read
                </button>
              )}
            </div>
            {notifs.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--ink-mute)', fontSize: '13px' }}>No notifications yet</div>
            ) : (
              notifs.slice(0, 5).map(n => (
                <div key={n.id} style={{
                  padding: '12px 16px', borderBottom: '1px solid var(--border-soft)',
                  background: n.read ? 'white' : 'var(--sage-light)',
                }}>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ink)' }}>{n.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--ink-soft)', marginTop: '2px' }}>{n.body}</div>
                  <div style={{ fontSize: '10px', color: 'var(--ink-mute)', marginTop: '4px' }}>{n.createdAt}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Post Resource Need Modal */}
      {showNeedForm && (
        <PostNeedModal
          getToken={getToken}
          onClose={() => setShowNeedForm(false)}
          onSuccess={() => { setShowNeedForm(false); loadData(); }}
        />
      )}

      {/* Request Volunteers Modal */}
      {showVolForm && (
        <PostVolunteerModal
          getToken={getToken}
          onClose={() => setShowVolForm(false)}
          onSuccess={() => { setShowVolForm(false); loadData(); }}
        />
      )}
    </div>
  );
}

// ─── Post Resource Need Modal ──────────────────────────────────────────────
function PostNeedModal({ getToken, onClose, onSuccess }: { getToken: () => Promise<string | null>; onClose: () => void; onSuccess: () => void }) {
  const [item, setItem] = useState('');
  const [qty, setQty] = useState('');
  const [urgency, setUrgency] = useState('Medium');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!item || !qty) return setError('Item and quantity are required.');
    setLoading(true);
    try {
      const token = await getToken();
      const res = await authFetch('/api/ngo/needs', token!, {
        method: 'POST',
        body: JSON.stringify({ item, qty: Number(qty), urgency, description }),
      });
      if (res.ok) onSuccess();
      else setError('Failed to post need. Please try again.');
    } catch {
      setError('Connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="📦 Post a Resource Need" onClose={onClose}>
      {error && <div style={{ color: 'var(--rose)', fontSize: '13px', marginBottom: '12px', background: 'var(--rose-light)', padding: '8px 12px', borderRadius: '8px' }}>{error}</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label className="f-label-sm">What do you need?</label>
          <input className="f-input-sm" placeholder="e.g. Warm blankets, textbooks, shoes" value={item} onChange={e => setItem(e.target.value)} />
        </div>
        <div>
          <label className="f-label-sm">Approximate quantity needed</label>
          <input className="f-input-sm" type="number" min="1" placeholder="e.g. 50" value={qty} onChange={e => setQty(e.target.value)} />
        </div>
        <div>
          <label className="f-label-sm">Urgency</label>
          <select className="f-select" value={urgency} onChange={e => setUrgency(e.target.value)}>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>
        <div>
          <label className="f-label-sm">Additional details (optional)</label>
          <textarea className="f-input-sm" rows={3} placeholder="e.g. Sizes needed, specific requirements..." value={description} onChange={e => setDescription(e.target.value)} style={{ resize: 'vertical' }} />
        </div>
        <button className="btn-sm btn-primary" style={{ padding: '12px' }} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Posting...' : 'Post Need'}
        </button>
      </div>
    </Modal>
  );
}

// ─── Post Volunteer Request Modal ──────────────────────────────────────────
function PostVolunteerModal({ getToken, onClose, onSuccess }: { getToken: () => Promise<string | null>; onClose: () => void; onSuccess: () => void }) {
  const [role, setRole] = useState('');
  const [skills, setSkills] = useState('');
  const [schedule, setSchedule] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!role) return setError('Please specify the volunteer role.');
    setLoading(true);
    try {
      const token = await getToken();
      const res = await authFetch('/api/ngo/volunteer-request', token!, {
        method: 'POST',
        body: JSON.stringify({ role, skills: skills.split(',').map(s => s.trim()).filter(Boolean), schedule, description }),
      });
      if (res.ok) onSuccess();
      else setError('Failed to post request.');
    } catch {
      setError('Connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="🙋 Request Volunteers" onClose={onClose}>
      {error && <div style={{ color: 'var(--rose)', fontSize: '13px', marginBottom: '12px', background: 'var(--rose-light)', padding: '8px 12px', borderRadius: '8px' }}>{error}</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label className="f-label-sm">Volunteer role</label>
          <input className="f-input-sm" placeholder="e.g. Teacher for Sunday morning sessions" value={role} onChange={e => setRole(e.target.value)} />
        </div>
        <div>
          <label className="f-label-sm">Skills required (comma-separated)</label>
          <input className="f-input-sm" placeholder="e.g. Teaching, English, Patience" value={skills} onChange={e => setSkills(e.target.value)} />
        </div>
        <div>
          <label className="f-label-sm">Schedule / availability</label>
          <input className="f-input-sm" placeholder="e.g. Sundays 9am–12pm" value={schedule} onChange={e => setSchedule(e.target.value)} />
        </div>
        <div>
          <label className="f-label-sm">Additional details (optional)</label>
          <textarea className="f-input-sm" rows={2} placeholder="e.g. Location, what volunteers will do..." value={description} onChange={e => setDescription(e.target.value)} style={{ resize: 'vertical' }} />
        </div>
        <button className="btn-sm btn-primary" style={{ padding: '12px' }} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Posting...' : 'Post Volunteer Request'}
        </button>
      </div>
    </Modal>
  );
}


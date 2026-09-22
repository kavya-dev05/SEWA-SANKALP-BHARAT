import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Donate() {
  const { showToast } = useOutletContext<{ showToast: (msg: string) => void }>();
  const { user, getToken } = useAuth();
  
  const [selectedAmount, setSelectedAmount] = useState('1000');
  const [selectedCause, setSelectedCause] = useState('');
  const [customAmt, setCustomAmt] = useState('');
  const [razorpayKeyId, setRazorpayKeyId] = useState('');

  const [revItem, setRevItem] = useState('');
  const [revQty, setRevQty] = useState('');
  const [revLoc, setRevLoc] = useState('Kanpur, UP');
  const [revCauses, setRevCauses] = useState<string[]>(['Child welfare']);
  const [revMatches, setRevMatches] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDonating, setIsDonating] = useState(false);
  // Tracks the NGO the donor confirmed sending an offer to
  const [confirmedNGO, setConfirmedNGO] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    fetch('/api/config')
      .then(r => r.json())
      .then(d => setRazorpayKeyId(d.razorpayKeyId || ''))
      .catch(() => {});
  }, []);

  const handleQuickDonate = async () => {
    if (!user) return showToast('Please sign in to make a donation.');
    if (!selectedCause) return showToast('Please select a cause.');
    const amt = selectedAmount === 'custom' ? customAmt : selectedAmount;
    if (!amt || Number(amt) < 1) return showToast('Please enter a valid amount.');

    setIsDonating(true);
    try {
      const token = await getToken();

      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ amount: Number(amt), cause: selectedCause })
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) return showToast(orderData.error || 'Could not create order.');

      const options = {
        key: razorpayKeyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Sewa Sankalp Bharat',
        description: `Donation for ${selectedCause}`,
        order_id: orderData.orderId,
        prefill: { email: user.email, name: user.name },
        theme: { color: '#2e6b5e' },
        handler: async (response: any) => {
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: orderData.amount,
              cause: selectedCause
            })
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            showToast(`✅ ₹${Number(amt).toLocaleString('en-IN')} donated to ${selectedCause}! Thank you.`);
          } else {
            showToast('Payment verification failed. Contact support.');
          }
          setIsDonating(false);
        },
        modal: { ondismiss: () => setIsDonating(false) }
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      showToast('Connection error. Please try again.');
      setIsDonating(false);
    }
  };

  // Physical donation: saves offer + triggers NGO notification
  const handlePhysicalDonate = async (ngoName: string, ngoRole: string) => {
    if (!user) return showToast('Please sign in to connect with an NGO.');
    try {
      const token = await getToken();
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ type: 'physical', item: revItem, qty: Number(revQty), ngoName, cause: revCauses.join(',') })
      });
      if (res.ok) {
        setConfirmedNGO({ name: ngoName, role: ngoRole });
        showToast(`✅ Offer sent to ${ngoName}! They've been notified.`);
      } else {
        showToast('Error connecting with NGO.');
      }
    } catch (err) {
      showToast('Connection error.');
    }
  };

  const toggleRevCause = (cause: string) => {
    setRevCauses(prev => prev.includes(cause) ? prev.filter(c => c !== cause) : [...prev, cause]);
  };

  const findReverseDonationMatch = async () => {
    if (!revItem) return showToast('Please describe what you\'re donating.');
    if (!revQty || Number(revQty) < 1) return showToast('Please enter a valid quantity.');
    setLoading(true);
    setConfirmedNGO(null);
    showToast('AI is finding the best matches...');
    try {
      const res = await fetch('/api/match-ngos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: revItem, qty: revQty, loc: revLoc, causes: revCauses })
      });
      const data = await res.json();
      if (data.matches) {
        setRevMatches(data.matches);
        if (data.matches.length === 0) {
          showToast(data.message || 'No matches found. Try different filters.');
        } else {
          showToast(`Found ${data.matches.length} matches near ${revLoc || 'your location'}!`);
        }
      } else {
        showToast('Could not find matches at this time.');
      }
    } catch (error) {
      showToast('Error connecting to matching engine.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="donate">
      <div className="section-header">
        <span className="section-eyebrow">Contribute now</span>
        <h2 className="section-h2">Money, goods, or time — you choose how to give</h2>
        <p className="section-sub">Two simple ways to contribute. Pick an amount and cause for a monetary donation, or tell us what physical items you have and we'll find the best match.</p>
      </div>
      <div className="donate-layout">
        {/* ── Monetary donation ── */}
        <div className="donate-card">
          <div className="donate-card-head">
            <div className="donate-card-title">Donate money</div>
            <div className="donate-card-sub">Goes directly to a verified NGO campaign of your choice</div>
          </div>
          <div className="donate-form">
            <div>
              <label className="f-label">Select amount</label>
              <div className="amount-grid">
                {['500', '1000', '2000', '5000', '10000', 'custom'].map(amt => (
                  <button key={amt} className={`amount-btn ${selectedAmount === amt ? 'active' : ''}`} onClick={() => setSelectedAmount(amt)}>
                    {amt === 'custom' ? 'Custom' : `₹${Number(amt).toLocaleString()}`}
                  </button>
                ))}
              </div>
            </div>
            {selectedAmount === 'custom' && (
              <div>
                <label className="f-label">Enter amount (₹)</label>
                <input className="f-input" type="number" placeholder="e.g. 3000" value={customAmt} onChange={e => setCustomAmt(e.target.value)} min="1" />
              </div>
            )}
            <div>
              <label className="f-label">Choose cause</label>
              <div className="cause-grid">
                {[
                  { name: 'Education', color: '#2e6b5e' },
                  { name: 'Healthcare', color: '#8a2d44' },
                  { name: 'Women', color: '#2d4d8a' },
                  { name: 'Child welfare', color: '#a86a1e' },
                  { name: 'Environment', color: '#2e6b5e' },
                  { name: 'Food', color: '#a86a1e' }
                ].map(cause => (
                  <button key={cause.name} className={`cause-btn ${selectedCause === cause.name ? 'active' : ''}`} onClick={() => setSelectedCause(cause.name)}>
                    <span className="cause-dot" style={{ background: cause.color }}></span>{cause.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="f-label">Your email <span style={{fontWeight: 400, textTransform: 'none', fontSize: '10px', color: 'var(--ink-mute)'}}>(for impact report)</span></label>
              <input className="f-input" type="email" placeholder={user ? user.email : "you@example.com"} disabled />
            </div>
            <button className="f-btn" onClick={handleQuickDonate} disabled={isDonating}>
              {isDonating ? 'Processing...' : 'Donate now'}
            </button>
          </div>
        </div>

        {/* ── Physical donation ── */}
        <div className="donate-card">
          <div className="donate-card-head">
            <div className="donate-card-title">Donate physical items</div>
            <div className="donate-card-sub">Tell us what you have — we'll find the closest verified need</div>
          </div>
          <div className="reverse-form">
            <div>
              <label className="f-label">What are you donating?</label>
              <input className="f-input" type="text" placeholder="e.g. Children's clothes, books, blankets" value={revItem} onChange={e => setRevItem(e.target.value)} />
            </div>
            <div>
              <label className="f-label">Approximate quantity</label>
              <input className="f-input" type="number" placeholder="e.g. 20" min="1" value={revQty} onChange={e => setRevQty(e.target.value)} />
            </div>
            <div>
              <label className="f-label">Your location</label>
              <input className="f-input" type="text" placeholder="Your city or area" value={revLoc} onChange={e => setRevLoc(e.target.value)} />
            </div>
            <div>
              <label className="f-label">Preferred cause</label>
              <div className="chip-group">
                {['Education', 'Healthcare', 'Child welfare', 'Women', 'Food'].map(cause => (
                  <div key={cause} className={`chip ${revCauses.includes(cause) ? 'on' : ''}`} onClick={() => toggleRevCause(cause)}>
                    {cause}
                  </div>
                ))}
              </div>
            </div>
            <button className="f-btn" onClick={findReverseDonationMatch} disabled={loading}>
              {loading ? 'Analyzing with AI...' : 'Find matching NGO'}
            </button>

            {/* Confirmed offer: show contact panel */}
            {confirmedNGO && (
              <div style={{ marginTop: '16px', background: 'var(--sage-light)', border: '1px solid var(--sage)', borderRadius: '12px', padding: '20px' }}>
                <div style={{ fontWeight: 700, color: 'var(--sage)', fontSize: '14px', marginBottom: '8px' }}>
                  ✅ Offer sent to {confirmedNGO.name}!
                </div>
                <div style={{ fontSize: '13px', color: 'var(--ink)', lineHeight: 1.6 }}>
                  <strong>{confirmedNGO.name}</strong> has been notified of your offer of{' '}
                  <strong>{revQty} × {revItem}</strong>. They will review from their dashboard and contact you at <strong>{user?.email}</strong> to arrange handover.
                </div>
                <div style={{ marginTop: '12px', padding: '10px 14px', background: 'white', borderRadius: '8px', fontSize: '12px', color: 'var(--ink-soft)' }}>
                  💡 <strong>Next step:</strong> The NGO will email you within 24–48 hours to confirm pickup/drop-off details.
                </div>
              </div>
            )}

            {/* Matches list */}
            {revMatches && !confirmedNGO && (
              <div className="rev-summary show">
                <div className="rev-match-label">Matches found near you</div>
                <div>
                  {revMatches.length === 0 ? (
                    <div style={{ fontSize: '13px', color: 'var(--sage)' }}>No exact matches found. Try different cause filters.</div>
                  ) : (
                    revMatches.map(m => (
                      <div key={m.name} className="rev-match-item" onClick={() => handlePhysicalDonate(m.name, m.role)} style={{ cursor: 'pointer' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ink)' }}>{m.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--ink-mute)' }}>{m.role} · {m.dist}</div>
                          <div style={{ fontSize: '10px', color: 'var(--sage)', marginTop: '2px' }}>Click to send offer →</div>
                        </div>
                        <div className="rev-match-score">{m.score}%</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Donate() {
  const { showToast } = useOutletContext<{ showToast: (msg: string) => void }>();
  const { user, getToken } = useAuth();
  
  const [selectedAmount, setSelectedAmount] = useState('1000');
  const [selectedCause, setSelectedCause] = useState('');
  const [customAmt, setCustomAmt] = useState('');

  const [revItem, setRevItem] = useState('');
  const [revQty, setRevQty] = useState('');
  const [revLoc, setRevLoc] = useState('Kanpur, UP');
  const [revCauses, setRevCauses] = useState<string[]>(['Child welfare']);
  const [revMatches, setRevMatches] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDonating, setIsDonating] = useState(false);

  const handleQuickDonate = async () => {
    if (!user) return showToast('Please sign in to make a donation.');
    if (!selectedCause) return showToast('Please select a cause.');
    const amt = selectedAmount === 'custom' ? customAmt : selectedAmount;
    if (!amt || Number(amt) <= 0) return showToast('Please enter a valid amount.');
    
    setIsDonating(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type: 'monetary', amount: Number(amt), cause: selectedCause })
      });
      if (res.ok) {
        showToast(`₹${Number(amt).toLocaleString('en-IN')} donation to ${selectedCause} recorded! Impact report coming your way.`);
      } else {
        showToast('Error recording donation.');
      }
    } catch (err) {
      showToast('Connection error.');
    } finally {
      setIsDonating(false);
    }
  };

  const handlePhysicalDonate = async (ngoName: string) => {
    if (!user) return showToast('Please sign in to connect with an NGO.');
    try {
      const token = await getToken();
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type: 'physical', item: revItem, qty: Number(revQty), ngoName, cause: revCauses.join(',') })
      });
      if (res.ok) {
        showToast(`Connected to ${ngoName}! They will contact you shortly.`);
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
        showToast(`Found ${data.matches.length} matches near ${revLoc || 'your location'}!`);
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
                  <button 
                    key={amt}
                    className={`amount-btn ${selectedAmount === amt ? 'active' : ''}`} 
                    onClick={() => setSelectedAmount(amt)}
                  >
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
                  <button 
                    key={cause.name}
                    className={`cause-btn ${selectedCause === cause.name ? 'active' : ''}`}
                    onClick={() => setSelectedCause(cause.name)}
                  >
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
                  <div 
                    key={cause}
                    className={`chip ${revCauses.includes(cause) ? 'on' : ''}`}
                    onClick={() => toggleRevCause(cause)}
                  >
                    {cause}
                  </div>
                ))}
              </div>
            </div>
            
            <button className="f-btn" onClick={findReverseDonationMatch} disabled={loading}>
              {loading ? 'Analyzing with AI...' : 'Find matching NGO'}
            </button>
            
            {revMatches && (
              <div className="rev-summary show">
                <div className="rev-match-label">Matches found near you</div>
                <div>
                  {revMatches.length === 0 ? (
                    <div style={{ fontSize: '13px', color: 'var(--sage)' }}>No exact matches found. Try different cause filters.</div>
                  ) : (
                    revMatches.map(m => (
                      <div key={m.name} className="rev-match-item" onClick={() => handlePhysicalDonate(m.name)} style={{ cursor: 'pointer' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ink)' }}>{m.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--ink-mute)' }}>{m.role} · {m.dist}</div>
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

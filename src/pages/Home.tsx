import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const [flowIdx, setFlowIdx] = useState(0);
  const flowCards = 4;

  useEffect(() => {
    const interval = setInterval(() => {
      setFlowIdx((prev) => (prev + 1) % flowCards);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="hero">
        <div className="hero-left">
          <div className="hero-badge">
            <span className="hero-badge-dot"></span>
            Verified giving platform
          </div>
          <h1 className="hero-h1">Where your contribution meets <em>real need</em></h1>
          <p className="hero-sub">Sewa Sankalp Bharat intelligently connects money, resources, time, and skills with verified NGO campaigns — so nothing is wasted and every contribution counts.</p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => navigate('/donate')}>
              Start contributing
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 4l4 3-4 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button className="btn-ghost" onClick={() => navigate('/how-it-works')}>See how it works</button>
          </div>
          <div className="hero-stats">
            <div>
              <div className="stat-val">4</div>
              <div className="stat-label">Ways to contribute</div>
            </div>
            <div>
              <div className="stat-val">6</div>
              <div className="stat-label">Core modules</div>
            </div>
            <div>
              <div className="stat-val">100%</div>
              <div className="stat-label">Verified needs</div>
            </div>
          </div>
        </div>
        <div className="hero-right">
          <div className="flow-eyebrow">Live contribution flow</div>
          
          <div className={`flow-card ${flowIdx === 0 ? 'active' : ''}`}>
            <div className="flow-icon-wrap fi-sage">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M4 9.5l3.5 3.5 6.5-7" stroke="#2e6b5e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="9" cy="9" r="7.25" stroke="#2e6b5e" strokeWidth="1.25" fill="none"/>
              </svg>
            </div>
            <div className="flow-text">
              <div className="flow-name">NGO need documented</div>
              <div className="flow-meta">20 children's clothes needed · Kanpur</div>
            </div>
          </div>
          <div className="flow-connector"><div className="flow-connector-line"></div></div>
          
          <div className={`flow-card ${flowIdx === 1 ? 'active' : ''}`}>
            <div className="flow-icon-wrap fi-sage">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="2.75" y="5.75" width="12.5" height="9.5" rx="1.5" stroke="#2e6b5e" strokeWidth="1.35" fill="none"/>
                <path d="M5.5 5.75V4.5a3.5 3.5 0 0 1 7 0v1.25" stroke="#2e6b5e" strokeWidth="1.35" strokeLinecap="round" fill="none"/>
                <circle cx="9" cy="10.5" r="1.25" fill="#2e6b5e"/>
              </svg>
            </div>
            <div className="flow-text">
              <div className="flow-name">Reverse donation matched</div>
              <div className="flow-meta">Donor has: 20 children's clothes</div>
            </div>
          </div>
          <div className="flow-connector"><div className="flow-connector-line"></div></div>
          
          <div className={`flow-card ${flowIdx === 2 ? 'active' : ''}`}>
            <div className="flow-icon-wrap fi-amber">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="7.25" stroke="#a86a1e" strokeWidth="1.25" fill="none"/>
                <path d="M6 7.5C6 6.12 7.34 5 9 5s3 1.12 3 2.5c0 1.5-1.5 2-2 2.5V11" stroke="#a86a1e" strokeWidth="1.35" strokeLinecap="round" fill="none"/>
                <circle cx="9" cy="13" r=".9" fill="#a86a1e"/>
              </svg>
            </div>
            <div className="flow-text">
              <div className="flow-name">Smart match found</div>
              <div className="flow-meta">Asha Foundation · 3 km · 96% match</div>
            </div>
          </div>
          <div className="flow-connector"><div className="flow-connector-line"></div></div>
          
          <div className={`flow-card ${flowIdx === 3 ? 'active' : ''}`}>
            <div className="flow-icon-wrap fi-blue">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="2.75" y="2.75" width="12.5" height="12.5" rx="2" stroke="#2d4d8a" strokeWidth="1.25" fill="none"/>
                <path d="M5.5 9h7M5.5 6h4M5.5 12h5.5" stroke="#2d4d8a" strokeWidth="1.25" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="flow-text">
              <div className="flow-name">Impact reported</div>
              <div className="flow-meta">20 children assisted · Report sent to donor</div>
            </div>
          </div>
        </div>
      </div>

      <section id="trust">
        <div className="section-header">
          <span className="section-eyebrow">Built on trust</span>
          <h2 className="section-h2">Every side of the platform is verified</h2>
          <p className="section-sub">From donors to NGOs to volunteers — the entire ecosystem is designed to eliminate doubt and enforce accountability at every step.</p>
        </div>
        <div className="trust-grid">
          <div className="trust-cell">
            <div className="trust-icon"><svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 2L19 6v5c0 5-4 8.5-8 9.5C7 19.5 3 16 3 11V6l8-4z" stroke="#2e6b5e" strokeWidth="1.4" strokeLinejoin="round" fill="none"/><path d="M7.5 11.5l2.5 2.5 5-5" stroke="#2e6b5e" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
            <div className="trust-title">Verified NGOs</div>
            <p className="trust-text">Every organization is reviewed and approved by platform admins before they can post campaigns or accept any donations.</p>
          </div>
          <div className="trust-cell">
            <div className="trust-icon"><svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="8" r="3.5" stroke="#2e6b5e" strokeWidth="1.3" fill="none"/><path d="M4.5 19c0-3.59 2.91-6.5 6.5-6.5s6.5 2.91 6.5 6.5" stroke="#2e6b5e" strokeWidth="1.3" strokeLinecap="round" fill="none"/><path d="M15 5l1.5 1.5L19 4" stroke="#2e6b5e" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
            <div className="trust-title">Verified needs</div>
            <p className="trust-text">NGO campaigns are reviewed and verified by platform admins before appearing on the platform. Only documented, genuine needs receive contributions.</p>
          </div>
          <div className="trust-cell">
            <div className="trust-icon"><svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3.75" y="2.75" width="14.5" height="16.5" rx="2" stroke="#2e6b5e" strokeWidth="1.3" fill="none"/><path d="M7 7h8M7 10.5h8M7 14h5" stroke="#2e6b5e" strokeWidth="1.3" strokeLinecap="round"/></svg></div>
            <div className="trust-title">Utilization reports</div>
            <p className="trust-text">NGOs are required to submit reports showing how every donation — money, goods, or volunteer time — was used and how many people were reached.</p>
          </div>
          <div className="trust-cell">
            <div className="trust-icon"><svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="10" cy="10" r="7.25" stroke="#2e6b5e" strokeWidth="1.3" fill="none"/><path d="M15.5 15.5L19.5 19.5" stroke="#2e6b5e" strokeWidth="1.5" strokeLinecap="round"/><path d="M7.5 10h5M10 7.5v5" stroke="#2e6b5e" strokeWidth="1.3" strokeLinecap="round"/></svg></div>
            <div className="trust-title">Admin oversight</div>
            <p className="trust-text">Platform admins monitor campaigns, audit activity, and handle disputes — maintaining integrity across all transactions and users.</p>
          </div>
        </div>
      </section>

      <section id="cta">
        <div>
          <span className="section-eyebrow">Join Sewa Sankalp Bharat</span>
          <h2 className="section-h2">Your contribution — money, goods, or time — reaches a verified NGO need</h2>
          <p className="section-sub">Sign up as a donor, an NGO, or a volunteer. The platform finds the right match so your effort creates real, documented change.</p>
        </div>
        <div className="cta-btns">
          <button className="cta-btn-w" onClick={() => navigate('/donate')}>Donate or volunteer</button>
          <button className="cta-btn-o" onClick={() => navigate('/features')}>Learn more</button>
        </div>
      </section>
    </>
  );
}

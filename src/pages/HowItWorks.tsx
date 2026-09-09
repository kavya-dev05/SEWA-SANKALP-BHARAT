import React from 'react';

export default function HowItWorks() {
  return (
    <section id="how">
      <div className="section-header">
        <span className="section-eyebrow">How it works</span>
        <h2 className="section-h2">From a stated need to a verified outcome</h2>
        <p className="section-sub">Two different journeys, one platform. Whether you're giving clothes or cash, your contribution reaches the right place with a paper trail.</p>
      </div>
      <div className="scenario-grid">
        <div className="scenario-card">
          <div className="scenario-head">
            <div className="scenario-head-icon">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="2.5" y="5.5" width="13" height="10" rx="1.5" stroke="#2e6b5e" strokeWidth="1.3" fill="none"/>
                <path d="M5.5 5.5V4A3.5 3.5 0 0 1 12.5 4v1.5" stroke="#2e6b5e" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
                <circle cx="9" cy="10.5" r="1.25" fill="#2e6b5e"/>
              </svg>
            </div>
            <div className="scenario-title">Donating physical resources</div>
          </div>
          <div className="scenario-steps">
            <div className="step-row"><div className="step-dot">1</div><div><div className="step-name">NGO posts a verified need</div><div className="step-detail">20 children's clothes needed for a verified family in Kanpur. Urgency: high.</div></div></div>
            <div className="step-row"><div className="step-dot">2</div><div><div className="step-name">Donor submits a reverse donation</div><div className="step-detail">"I have 20 children's clothes." Platform accepts the offer — no manual NGO search needed.</div></div></div>
            <div className="step-row"><div className="step-dot">3</div><div><div className="step-name">System finds the best match</div><div className="step-detail">Asha Foundation, 3 km away, needs exactly 20 items.</div><span className="step-chip"><svg width="11" height="11" viewBox="0 0 11 11" fill="none"><circle cx="5.5" cy="5.5" r="4.5" stroke="#2e6b5e" strokeWidth="1.1" fill="none"/><circle cx="5.5" cy="5.5" r="1.5" fill="#2e6b5e"/></svg> 3 km · 96% match</span></div></div>
            <div className="step-row"><div className="step-dot">4</div><div><div className="step-name">Donation accepted and distributed</div><div className="step-detail">NGO collects items. Status: Accepted → Collected → Distributed.</div></div></div>
            <div className="step-row"><div className="step-dot">5</div><div><div className="step-name">Impact report sent to donor</div><div className="step-detail">20 clothes distributed to 20 children. Confirmation with beneficiary count delivered.</div></div></div>
          </div>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: '22px'}}>
          <div className="scenario-card">
            <div className="scenario-head">
              <div className="scenario-head-icon">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="7.25" stroke="#2e6b5e" strokeWidth="1.25" fill="none"/>
                  <path d="M9 5v8M7 7h3.5a1.5 1.5 0 0 1 0 3H8a1.5 1.5 0 0 0 0 3H11.5" stroke="#2e6b5e" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="scenario-title">Donating money</div>
            </div>
            <div className="scenario-steps">
              <div className="step-row"><div className="step-dot">1</div><div><div className="step-name">Choose a cause</div><div className="step-detail">Donor selects Healthcare. Platform shows verified campaigns accepting funds.</div></div></div>
              <div className="step-row"><div className="step-dot">2</div><div><div class="step-name">Donate ₹5,000</div><div className="step-detail">Payment goes directly to a verified NGO healthcare campaign.</div></div></div>
              <div className="step-row"><div className="step-dot">3</div><div><div className="step-name">NGO submits utilization report</div><div className="step-detail">₹2,500 medicines · ₹1,500 supplies · ₹1,000 transport → 25 people assisted.</div></div></div>
            </div>
          </div>
          <div className="scenario-card">
            <div className="scenario-head">
              <div className="scenario-head-icon">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="7" cy="6" r="2.75" stroke="#2e6b5e" strokeWidth="1.25" fill="none"/>
                  <path d="M2 15.5c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="#2e6b5e" strokeWidth="1.25" strokeLinecap="round" fill="none"/>
                  <circle cx="13.5" cy="7" r="2.25" stroke="#2e6b5e" strokeWidth="1.25" fill="none"/>
                  <path d="M14 12.5c1.66.46 3 1.9 3 3.5" stroke="#2e6b5e" strokeWidth="1.25" strokeLinecap="round" fill="none"/>
                </svg>
              </div>
              <div className="scenario-title">Volunteering</div>
            </div>
            <div className="scenario-steps">
              <div className="step-row"><div className="step-dot">1</div><div><div className="step-name">State your skills and availability</div><div className="step-detail">Teaching · Kanpur · Sundays · Education NGOs preferred.</div></div></div>
              <div className="step-row"><div className="step-dot">2</div><div><div className="step-name">Get matched to an NGO</div><div className="step-detail">Vidya Daan needs a Sunday teacher for children. Match: 94%.</div><span className="step-chip"><svg width="11" height="11" viewBox="0 0 11 11" fill="none"><circle cx="5.5" cy="5.5" r="4.5" stroke="#2e6b5e" strokeWidth="1.1" fill="none"/><circle cx="5.5" cy="5.5" r="1.5" fill="#2e6b5e"/></svg> 4 km · 94% match</span></div></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

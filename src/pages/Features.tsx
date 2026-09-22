import React from 'react';

export default function Features() {
  return (
    <section id="features">
      <div className="section-header">
        <span className="section-eyebrow">Six modules</span>
        <h2 className="section-h2">A complete giving ecosystem, not just a website</h2>
        <p className="section-sub">Each module solves a real gap in how giving works today. Together they form a closed loop — from verified need to confirmed impact.</p>
      </div>
      <div className="features-grid">
        <div className="feature-cell">
          <div className="feature-num">01</div>
          <div className="feature-icon-box fib-sage">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M4 11.5l4.5 4.5 9.5-9" stroke="#2e6b5e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="11" cy="11" r="9.25" stroke="#2e6b5e" strokeWidth="1.25" fill="none"/>
            </svg>
          </div>
          <div className="feature-title">NGO Campaign Verification</div>
          <p className="feature-desc">Every NGO is reviewed and approved by platform admins before campaigns go live. Only genuine, documented organisations receive contributions.</p>
          <span className="feature-pill fp-sage">Trust layer</span>
        </div>
        <div className="feature-cell">
          <div className="feature-num">02</div>
          <div className="feature-icon-box fib-amber">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect x="3" y="7" width="16" height="12" rx="2" stroke="#a86a1e" strokeWidth="1.4" fill="none"/>
              <path d="M7 7V5.5A4 4 0 0 1 15 5.5V7" stroke="#a86a1e" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
              <circle cx="11" cy="13" r="1.6" fill="#a86a1e"/>
            </svg>
          </div>
          <div className="feature-title">Reverse Donation</div>
          <p className="feature-desc">Instead of searching dozens of NGOs, donors say what they have. The platform finds the verified need that fits — eliminating wasted effort.</p>
          <span className="feature-pill fp-amber">Physical resources</span>
        </div>
        <div className="feature-cell">
          <div className="feature-num">03</div>
          <div className="feature-icon-box fib-blue">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="9.25" stroke="#2d4d8a" strokeWidth="1.25" fill="none"/>
              <path d="M7.5 9.5C7.5 7.84 9.07 6.5 11 6.5s3.5 1.34 3.5 3c0 1.8-1.8 2.5-2.5 3V14" stroke="#2d4d8a" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
              <circle cx="11" cy="16.2" r="1.1" fill="#2d4d8a"/>
            </svg>
          </div>
          <div className="feature-title">Smart Matching Engine</div>
          <p className="feature-desc">A scoring algorithm weighs compatibility, distance, urgency, quantity, and cause to surface the highest-impact match for every contribution.</p>
          <span className="feature-pill fp-blue">Algorithm</span>
        </div>
        <div className="feature-cell">
          <div className="feature-num">04</div>
          <div className="feature-icon-box fib-sage">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="9.25" stroke="#2e6b5e" strokeWidth="1.25" fill="none"/>
              <path d="M11 6v10M8.5 8.5h4a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3H14" stroke="#2e6b5e" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="feature-title">Monetary Donations</div>
          <p className="feature-desc">Cause-based financial contributions go directly to verified NGO campaigns. Donors choose their focus area and see exactly where money goes.</p>
          <span className="feature-pill fp-sage">Finance</span>
        </div>
        <div className="feature-cell">
          <div className="feature-num">05</div>
          <div className="feature-icon-box fib-rose">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect x="3" y="3" width="16" height="16" rx="2.5" stroke="#8a2d44" strokeWidth="1.3" fill="none"/>
              <path d="M7 11h2l2 4 2-8 2 4h2" stroke="#8a2d44" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="feature-title">Impact & Utilization Reports</div>
          <p className="feature-desc">NGOs report how every donation was used. Donors receive a personal impact report — turning trust from a promise into a documented record.</p>
          <span className="feature-pill fp-rose">Accountability</span>
        </div>
        <div className="feature-cell">
          <div className="feature-num">06</div>
          <div className="feature-icon-box fib-amber">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="8" cy="7" r="3" stroke="#a86a1e" strokeWidth="1.3" fill="none"/>
              <circle cx="15" cy="8" r="2.25" stroke="#a86a1e" strokeWidth="1.3" fill="none"/>
              <path d="M2 18c0-3.31 2.69-6 6-6s6 2.69 6 6" stroke="#a86a1e" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
              <path d="M15.5 14c1.93.55 3.5 2.2 3.5 4" stroke="#a86a1e" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
            </svg>
          </div>
          <div className="feature-title">Volunteer Matching</div>
          <p className="feature-desc">People without money or goods can still contribute — by giving time and skills. The platform matches them to NGOs based on skill, location, and availability.</p>
          <span className="feature-pill fp-amber">Skills &amp; time</span>
        </div>
      </div>
    </section>
  );
}

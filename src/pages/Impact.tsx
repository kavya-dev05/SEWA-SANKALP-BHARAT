import React, { useEffect, useState } from 'react';

export default function Impact() {
  const [animated, setAnimated] = useState(false);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimated(true);
      
      let n = 0;
      const target = 25;
      const step = () => { 
        n = Math.min(n + 1, target); 
        setCounter(n); 
        if (n < target) requestAnimationFrame(step); 
      };
      step();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section id="impact">
      <div className="section-header">
        <span className="section-eyebrow">Impact &amp; utilization</span>
        <h2 className="section-h2">Donors see exactly where their giving went</h2>
        <p className="section-sub">NGOs submit reports for every donation. Donors receive a personal impact card — turning a transaction into a story with a confirmed outcome.</p>
      </div>
      <div className="impact-grid">
        <div className="impact-card">
          <div className="impact-card-head">
            <div className="ic-label">Physical donation</div>
            <div className="ic-title">20 Children's Clothes · Asha Foundation</div>
          </div>
          <div className="impact-card-body">
            <div className="i-line"><span className="i-lbl">Items donated</span><span className="i-val">20</span></div>
            <div className="i-line"><span className="i-lbl">Items distributed</span><span className="i-val ok">20</span></div>
            <div className="i-line"><span className="i-lbl">Beneficiaries</span><span className="i-val">20 children</span></div>
            <div className="i-line"><span className="i-lbl">Status</span><span className="i-val ok"><span className="ok-dot"></span>Completed</span></div>
          </div>
        </div>
        <div className="impact-card">
          <div className="impact-card-head">
            <div className="ic-label">Monetary donation</div>
            <div className="ic-title">₹5,000 · Healthcare Campaign</div>
          </div>
          <div className="impact-card-body">
            <div className="impact-big" id="impactCounter">{counter}</div>
            <div className="impact-big-sub">people assisted</div>
            <div className="bar-group">
              <div><div className="bar-row-head"><span>Medicines</span><span>₹2,500</span></div><div className="bar-track"><div className="bar-fill bf-sage" style={{ width: animated ? '50%' : '0%' }}></div></div></div>
              <div><div className="bar-row-head"><span>Medical supplies</span><span>₹1,500</span></div><div className="bar-track"><div className="bar-fill bf-amber" style={{ width: animated ? '30%' : '0%' }}></div></div></div>
              <div><div className="bar-row-head"><span>Transportation</span><span>₹1,000</span></div><div className="bar-track"><div className="bar-fill bf-blue" style={{ width: animated ? '20%' : '0%' }}></div></div></div>
            </div>
          </div>
        </div>
        <div className="impact-card">
          <div className="impact-card-head">
            <div className="ic-label">Volunteer contribution</div>
            <div className="ic-title">Teaching · Vidya Daan · 8 sessions</div>
          </div>
          <div className="impact-card-body">
            <div className="i-line"><span className="i-lbl">Sessions completed</span><span className="i-val">8 Sundays</span></div>
            <div className="i-line"><span className="i-lbl">Students reached</span><span className="i-val ok">34</span></div>
            <div className="i-line"><span className="i-lbl">Subject</span><span className="i-val">Mathematics</span></div>
            <div className="i-line"><span className="i-lbl">NGO rating</span><span className="i-val ok">4.9 / 5</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}

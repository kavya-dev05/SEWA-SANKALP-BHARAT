import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';

export default function Matching() {
  const { showToast } = useOutletContext<{ showToast: (msg: string) => void }>();
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    // Delay animation to allow component to render
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section id="matching">
      <div className="section-header">
        <span className="section-eyebrow">Smart matching engine</span>
        <h2 className="section-h2">A scoring system, not a guess</h2>
        <p className="section-sub">Each match is calculated across six weighted parameters. You see the score and the reason — no black box, no random suggestions.</p>
      </div>
      <div className="matching-layout">
        <div>
          <div className="param-list">
            <div className="param-row"><div className="param-label">Resource compatibility</div><div className="param-track"><div className="param-fill" style={{ width: animated ? '30%' : '0%' }}></div></div><div className="param-pct">30%</div></div>
            <div className="param-row"><div className="param-label">Location / distance</div><div className="param-track"><div className="param-fill" style={{ width: animated ? '20%' : '0%' }}></div></div><div className="param-pct">20%</div></div>
            <div className="param-row"><div className="param-label">Urgency of need</div><div className="param-track"><div className="param-fill" style={{ width: animated ? '20%' : '0%' }}></div></div><div className="param-pct">20%</div></div>
            <div className="param-row"><div className="param-label">Quantity match</div><div className="param-track"><div className="param-fill" style={{ width: animated ? '15%' : '0%' }}></div></div><div className="param-pct">15%</div></div>
            <div className="param-row"><div className="param-label">Availability</div><div className="param-track"><div className="param-fill" style={{ width: animated ? '10%' : '0%' }}></div></div><div className="param-pct">10%</div></div>
            <div className="param-row"><div className="param-label">Cause / interest</div><div className="param-track"><div className="param-fill" style={{ width: animated ? '5%' : '0%' }}></div></div><div className="param-pct">5%</div></div>
          </div>
          <div className="match-note">AI assistance is used for categorizing resource types and understanding natural-language descriptions — not for deciding who gets what. All allocation decisions are driven by the transparent scoring parameters above.</div>
        </div>
        <div>
          <div className="results-eyebrow">Match results · 20 children's clothes · Kanpur</div>
          <div className="match-results">
            <div className="match-card best" onClick={() => showToast('Connecting to Asha Foundation...')}>
              <div><div className="mc-name">Asha Foundation</div><div className="mc-meta">3 km · Urgency: High · Needs: 20 items</div></div>
              <div className="mc-score best-score">96%</div>
            </div>
            <div className="match-card" onClick={() => showToast('Connecting to Bal Kalyan Trust...')}>
              <div><div className="mc-name">Bal Kalyan Trust</div><div className="mc-meta">7 km · Urgency: Medium · Needs: 15 items</div></div>
              <div className="mc-score">82%</div>
            </div>
            <div className="match-card" onClick={() => showToast('Connecting to Shiksha Sewa Society...')}>
              <div><div className="mc-name">Shiksha Sewa Society</div><div className="mc-meta">12 km · Urgency: Low · Needs: 30 items</div></div>
              <div className="mc-score">65%</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Volunteer() {
  const { showToast } = useOutletContext<{ showToast: (msg: string) => void }>();
  const { user, getToken } = useAuth();
  
  const [selSkills, setSelSkills] = useState<string[]>(['Teaching']);
  const [volLoc, setVolLoc] = useState('Kanpur, UP');
  const [selAvail, setSelAvail] = useState<string[]>(['Saturdays', 'Sundays']);
  const [selCauses, setSelCauses] = useState<string[]>(['Education']);
  const [results, setResults] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleArray = (arr: string[], setArr: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    setArr(arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item]);
  };

  const handleVolunteerConnect = async (ngoName: string, role: string) => {
    if (!user) return showToast('Please sign in to volunteer.');
    try {
      const token = await getToken();
      const res = await fetch('/api/volunteers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ngoName, role })
      });
      if (res.ok) {
        showToast(`Connected to ${ngoName}! We've recorded your interest.`);
      } else {
        showToast('Error connecting with NGO.');
      }
    } catch (err) {
      showToast('Connection error.');
    }
  };

  const findMatches = async () => {
    if (selSkills.length === 0 && selCauses.length === 0) {
      return showToast('Select at least one skill or cause to find matches.');
    }
    
    setLoading(true);
    showToast('AI is finding the best matches...');
    
    try {
      const res = await fetch('/api/match-volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills: selSkills, loc: volLoc, avail: selAvail, causes: selCauses })
      });
      const data = await res.json();
      
      if (data.matches) {
        setResults(data.matches);
        showToast(`Found ${data.matches.length} volunteer opportunit${data.matches.length !== 1 ? 'ies' : 'y'}!`);
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
    <section id="volunteer">
      <div className="section-header">
        <span className="section-eyebrow">Volunteer matching</span>
        <h2 className="section-h2">No money? Give your time and skills instead</h2>
        <p className="section-sub">If you have skills and availability, there's an NGO that needs you. The platform matches you based on what you can do — right in your city.</p>
      </div>
      <div className="vol-layout">
        <div className="vol-card">
          <div className="vol-card-head">
            <div className="vol-card-title">Find volunteer opportunities</div>
            <div className="vol-card-sub">Select your skills and availability to see matched NGOs near you</div>
          </div>
          <div className="vol-form">
            <div>
              <label className="f-label">Your skills</label>
              <div className="chip-group">
                {['Teaching', 'Medical', 'Legal', 'Design', 'Coding', 'Counselling'].map(skill => (
                  <div key={skill} className={`chip ${selSkills.includes(skill) ? 'on' : ''}`} onClick={() => toggleArray(selSkills, setSelSkills, skill)}>{skill}</div>
                ))}
              </div>
            </div>
            <div>
              <label className="f-label">Location</label>
              <input className="f-input" type="text" value={volLoc} onChange={e => setVolLoc(e.target.value)} placeholder="Enter your city" />
            </div>
            <div>
              <label className="f-label">Availability</label>
              <div className="chip-group">
                {['Weekdays', 'Saturdays', 'Sundays', 'Evenings'].map(time => (
                  <div key={time} className={`chip ${selAvail.includes(time) ? 'on' : ''}`} onClick={() => toggleArray(selAvail, setSelAvail, time)}>{time}</div>
                ))}
              </div>
            </div>
            <div>
              <label className="f-label">Cause interest</label>
              <div className="chip-group">
                {['Education', 'Healthcare', 'Women', 'Environment'].map(cause => (
                  <div key={cause} className={`chip ${selCauses.includes(cause) ? 'on' : ''}`} onClick={() => toggleArray(selCauses, setSelCauses, cause)}>{cause}</div>
                ))}
              </div>
            </div>
            <button className="f-btn" onClick={findMatches} disabled={loading}>
              {loading ? 'Analyzing with AI...' : 'Find matches'}
            </button>
          </div>
        </div>

        <div>
          <div className="vol-results-label">
            {results === null ? 'Select your skills and click "Find matches"' : `${results.length} match${results.length !== 1 ? 'es' : ''} found near ${volLoc || 'you'}`}
          </div>
          
          {results && results.length === 0 ? (
            <div className="no-matches" style={{ display: 'block' }}>No matches found for your current filters. Try selecting different skills or availability.</div>
          ) : (
            <div className="vol-matches">
              {(results || []).map(n => (
                <div key={n.name} className="vol-match" onClick={() => handleVolunteerConnect(n.name, n.role)}>
                  <div className="vm-top"><div className="vm-name">{n.name}</div><div className="vm-badge">{n.score}%</div></div>
                  <div className="vm-role">{n.role}</div>
                  <div className="vm-chips">
                    {n.chips.map((c: string) => <span key={c} className="vm-chip">{c}</span>)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Toast } from './Toast';
import { AuthModal } from './AuthModal';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const doc = document.documentElement;
      const totalScroll = doc.scrollHeight - doc.clientHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileNav = () => setIsMobileNavOpen(!isMobileNavOpen);
  const closeMobileNav = () => setIsMobileNavOpen(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    showToast('Logged out successfully');
  };

  return (
    <>
      <div className="progress-bar" style={{ width: `${scrollProgress}%` }}></div>
      
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg('')} />}
      
      {isAuthModalOpen && (
        <AuthModal 
          onClose={() => setIsAuthModalOpen(false)} 
          onSuccess={(msg) => {
            setIsAuthModalOpen(false);
            showToast(msg);
          }}
        />
      )}

      <nav>
        {/* Logo with real image */}
        <div className="nav-logo" onClick={() => { navigate('/'); closeMobileNav(); }}>
          <img
            src="/logo.png"
            alt="Sewa Sankalp Bharat Logo"
            className="nav-logo-img"
          />
          <span className="nav-logo-text">Sewa Sankalp Bharat</span>
        </div>
        
        <ul className="nav-links">
          <li><NavLink to="/features" onClick={closeMobileNav}>Features</NavLink></li>
          <li><NavLink to="/how-it-works" onClick={closeMobileNav}>How it works</NavLink></li>
          <li><NavLink to="/matching" onClick={closeMobileNav}>Matching</NavLink></li>
          <li><NavLink to="/impact" onClick={closeMobileNav}>Impact</NavLink></li>
          <li><NavLink to="/donate" onClick={closeMobileNav}>Donate</NavLink></li>
          <li><NavLink to="/volunteer" onClick={closeMobileNav}>Volunteer</NavLink></li>
        </ul>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button className="nav-cta" style={{ background: 'var(--canvas)', color: 'var(--ink)', border: '1px solid var(--border)' }} onClick={() => navigate('/profile')}>Profile</button>
              <button className="nav-cta" onClick={handleLogout}>Log out</button>
            </div>
          ) : (
            <button className="nav-cta" onClick={() => setIsAuthModalOpen(true)}>Get started</button>
          )}
          
          <div className={`nav-hamburger ${isMobileNavOpen ? 'open' : ''}`} onClick={toggleMobileNav}>
            <span></span><span></span><span></span>
          </div>
        </div>
      </nav>

      <div className={`mobile-nav ${isMobileNavOpen ? 'open' : ''}`}>
        <NavLink to="/features" onClick={closeMobileNav}>Features</NavLink>
        <NavLink to="/how-it-works" onClick={closeMobileNav}>How it works</NavLink>
        <NavLink to="/matching" onClick={closeMobileNav}>Matching</NavLink>
        <NavLink to="/impact" onClick={closeMobileNav}>Impact</NavLink>
        <NavLink to="/donate" onClick={closeMobileNav}>Donate</NavLink>
        <NavLink to="/volunteer" onClick={closeMobileNav}>Volunteer</NavLink>
        {user && <NavLink to="/profile" onClick={closeMobileNav}>Profile</NavLink>}
      </div>

      <main>
        <div key={location.pathname} className="page-transition">
          <Outlet context={{ showToast, openAuthModal: () => setIsAuthModalOpen(true) }} />
        </div>
      </main>

      <footer>
        <div className="footer-grid">
          <div>
            {/* Footer logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <img src="/logo.png" alt="Sewa Sankalp Bharat" style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }} />
              <div className="footer-brand" style={{ margin: 0 }}>Sewa Sankalp Bharat</div>
            </div>
            <p className="footer-tagline">Refining the act of giving — connecting verified needs with money, resources, time, and skills across India.</p>
          </div>
          <div>
            <div className="footer-col-head">Platform</div>
            <ul className="footer-list">
              <li><NavLink to="/features">Features</NavLink></li>
              <li><NavLink to="/how-it-works">How it works</NavLink></li>
              <li><NavLink to="/matching">Matching engine</NavLink></li>
              <li><NavLink to="/impact">Impact reports</NavLink></li>
            </ul>
          </div>
          <div>
            <div className="footer-col-head">Contribute</div>
            <ul className="footer-list">
              <li><NavLink to="/donate">Donate money</NavLink></li>
              <li><NavLink to="/donate">Donate resources</NavLink></li>
              <li><NavLink to="/volunteer">Volunteer</NavLink></li>
              <li><NavLink to="/matching">Find NGOs</NavLink></li>
            </ul>
          </div>
          <div>
            <div className="footer-col-head">Organisation</div>
            <ul className="footer-list">
              <li><a style={{cursor: 'pointer'}} onClick={() => showToast('Register your NGO via the Get started button!')}>Register NGO</a></li>
              <li><a style={{cursor: 'pointer'}} onClick={() => showToast('NGO dashboard in Profile section!')}>NGO dashboard</a></li>
              <li><a style={{cursor: 'pointer'}} onClick={() => showToast('Post a need from your NGO dashboard!')}>Post a need</a></li>
              <li><a style={{cursor: 'pointer'}} onClick={() => showToast('Submit report — feature in progress')}>Submit report</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">© 2026 <span>Sewa Sankalp Bharat</span> — Refining the act of giving.</div>
        </div>
      </footer>
    </>
  );
}

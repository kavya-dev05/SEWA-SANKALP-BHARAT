import React, { useEffect, useState } from 'react';

export function Toast({ message, onClose }: { message: string, onClose: () => void }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (message) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 350); // wait for transition
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message && !show) return null;

  return (
    <div className={`toast ${show ? 'show' : ''}`}>
      <div className="toast-icon">
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
          <path d="M2 5.5l3 3 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <span>{message}</span>
    </div>
  );
}

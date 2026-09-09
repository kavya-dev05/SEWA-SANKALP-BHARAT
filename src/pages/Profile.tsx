import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-[var(--canvas)]">
        <div className="text-center bg-white p-12 rounded-2xl border border-[var(--border)] shadow-sm max-w-md w-full">
          <h2 className="font-serif text-3xl text-[var(--ink)] mb-4">Access Denied</h2>
          <p className="text-[var(--ink-soft)] mb-8">Please sign in to view your profile and dashboard.</p>
          <button onClick={() => navigate('/')} className="f-btn">Return to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--canvas)] py-16 px-6 md:px-20">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 rounded-full bg-[var(--sage-light)] text-[var(--sage)] flex items-center justify-center text-2xl font-serif">
              {user.name.charAt(0)}
            </div>
            <div>
              <h1 className="font-serif text-3xl text-[var(--ink)]">{user.name}</h1>
              <p className="text-[var(--ink-soft)] text-sm uppercase tracking-wider font-semibold">
                {user.role} Dashboard
              </p>
            </div>
          </div>
        </header>

        {user.role === 'donor' && <DonorProfile />}
        {user.role === 'ngo' && <NGOProfile />}
        {user.role === 'beneficiary' && <BeneficiaryProfile />}
      </div>
    </div>
  );
}

function DonorProfile() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 space-y-6">
        <div className="bg-white rounded-2xl border border-[var(--border)] p-6">
          <h3 className="text-xs uppercase font-semibold text-[var(--ink-mute)] tracking-wider mb-4">Your Impact</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-end border-b border-[var(--border-soft)] pb-4">
              <div>
                <div className="text-3xl font-serif text-[var(--ink)]">₹12,500</div>
                <div className="text-sm text-[var(--ink-soft)]">Total Donated</div>
              </div>
            </div>
            <div className="flex justify-between items-end border-b border-[var(--border-soft)] pb-4">
              <div>
                <div className="text-3xl font-serif text-[var(--ink)]">4</div>
                <div className="text-sm text-[var(--ink-soft)]">NGOs Supported</div>
              </div>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <div className="text-3xl font-serif text-[var(--ink)]">16<span className="text-lg">hrs</span></div>
                <div className="text-sm text-[var(--ink-soft)]">Volunteered</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="md:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
          <div className="px-6 py-5 border-b border-[var(--border)] bg-[var(--canvas)]">
            <h3 className="font-serif text-xl text-[var(--ink)]">Recent Activity & Reports</h3>
          </div>
          <div className="p-0">
            {[
              { title: '₹5,000 Donated', desc: 'Healthcare Campaign via Asha Foundation', status: 'Report Available', date: '2 days ago' },
              { title: '20 Children\'s Clothes', desc: 'Donated to Bal Kalyan Trust', status: 'Distributed', date: '1 week ago' },
              { title: 'Volunteered: Teaching', desc: 'Vidya Daan Foundation (4 hours)', status: 'Verified', date: '2 weeks ago' }
            ].map((item, i) => (
              <div key={i} className="px-6 py-5 border-b border-[var(--border-soft)] last:border-0 flex justify-between items-center hover:bg-[#fafbfe] transition-colors cursor-pointer">
                <div>
                  <div className="font-semibold text-[var(--ink)] text-[15px]">{item.title}</div>
                  <div className="text-sm text-[var(--ink-soft)]">{item.desc}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-[var(--sage)] bg-[var(--sage-light)] px-3 py-1 rounded-full mb-1 inline-block">{item.status}</div>
                  <div className="text-xs text-[var(--ink-mute)]">{item.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function NGOProfile() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Funds Received', value: '₹45,000' },
            { label: 'Active Campaigns', value: '3' },
            { label: 'Resources Matched', value: '128 items' },
            { label: 'Volunteers Engaged', value: '12' }
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[var(--border)] p-6">
              <div className="text-xs uppercase font-semibold text-[var(--ink-mute)] tracking-wider mb-2">{stat.label}</div>
              <div className="text-3xl font-serif text-[var(--ink)]">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="md:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
          <div className="px-6 py-5 border-b border-[var(--border)] bg-[var(--canvas)] flex justify-between items-center">
            <h3 className="font-serif text-xl text-[var(--ink)]">Pending Action Items</h3>
          </div>
          <div className="p-6">
            <div className="p-4 bg-[var(--rose-light)] rounded-xl border border-[var(--rose)] border-opacity-20 mb-4 flex justify-between items-center">
              <div>
                <div className="font-semibold text-[var(--ink)] text-sm mb-1">Submit Utilization Report</div>
                <div className="text-xs text-[var(--ink-soft)]">₹10,000 received for Healthcare campaign on Oct 12</div>
              </div>
              <button className="text-xs font-semibold text-white bg-[var(--rose)] px-4 py-2 rounded-lg">Draft Report</button>
            </div>
            <div className="p-4 bg-[var(--amber-light)] rounded-xl border border-[var(--amber)] border-opacity-20 flex justify-between items-center">
              <div>
                <div className="font-semibold text-[var(--ink)] text-sm mb-1">Incoming Resource Match</div>
                <div className="text-xs text-[var(--ink-soft)]">Donor offered: 50 Blankets (96% Match)</div>
              </div>
              <button className="text-xs font-semibold text-white bg-[var(--amber)] px-4 py-2 rounded-lg">Review Match</button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="md:col-span-1 space-y-6">
         <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
          <div className="px-6 py-5 border-b border-[var(--border)] bg-[var(--canvas)]">
            <h3 className="font-serif text-xl text-[var(--ink)]">Post Needs</h3>
          </div>
          <div className="p-6 space-y-3">
             <button className="w-full text-left p-4 rounded-xl border border-[var(--border)] hover:border-[var(--sage)] transition-colors">
               <div className="font-semibold text-[var(--ink)] text-sm">Post a Resource Need</div>
               <div className="text-xs text-[var(--ink-soft)] mt-1">E.g., 20 pairs of shoes, books</div>
             </button>
             <button className="w-full text-left p-4 rounded-xl border border-[var(--border)] hover:border-[var(--sage)] transition-colors">
               <div className="font-semibold text-[var(--ink)] text-sm">Request Volunteers</div>
               <div className="text-xs text-[var(--ink-soft)] mt-1">E.g., Teachers for Sunday</div>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BeneficiaryProfile() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 space-y-6">
        <div className="bg-white rounded-2xl border border-[var(--border)] p-6">
          <h3 className="text-xs uppercase font-semibold text-[var(--ink-mute)] tracking-wider mb-4">Your Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-end border-b border-[var(--border-soft)] pb-4">
              <div>
                <div className="text-3xl font-serif text-[var(--ink)]">3</div>
                <div className="text-sm text-[var(--ink-soft)]">Total Requests</div>
              </div>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <div className="text-3xl font-serif text-[var(--sage)]">2</div>
                <div className="text-sm text-[var(--ink-soft)]">Needs Met</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="md:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
          <div className="px-6 py-5 border-b border-[var(--border)] bg-[var(--canvas)]">
            <h3 className="font-serif text-xl text-[var(--ink)]">Your Active Requests</h3>
          </div>
          <div className="p-0">
            {[
              { title: 'School Supplies & Textbooks', status: 'Matched & Processing', priority: 'High', date: 'Submitted Oct 14' },
              { title: 'Winter Clothing', status: 'Fulfilled', priority: 'Medium', date: 'Received Sep 20' }
            ].map((item, i) => (
              <div key={i} className="px-6 py-5 border-b border-[var(--border-soft)] last:border-0 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-[var(--ink)] text-[15px]">{item.title}</div>
                  <div className="text-xs text-[var(--ink-soft)] mt-1">{item.date}</div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div className={`text-xs font-semibold px-3 py-1 rounded-full mb-1 ${item.status === 'Fulfilled' ? 'bg-[var(--sage-light)] text-[var(--sage)]' : 'bg-[var(--blue-light)] text-[var(--blue)]'}`}>
                    {item.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-6 bg-[var(--canvas)] border-t border-[var(--border)]">
             <button className="f-btn w-auto px-6">Submit New Request via NGO</button>
          </div>
        </div>
      </div>
    </div>
  );
}

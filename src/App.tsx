import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Features from './pages/Features';
import HowItWorks from './pages/HowItWorks';
import Matching from './pages/Matching';
import Impact from './pages/Impact';
import Donate from './pages/Donate';
import Volunteer from './pages/Volunteer';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="features" element={<Features />} />
            <Route path="how-it-works" element={<HowItWorks />} />
            <Route path="matching" element={<Matching />} />
            <Route path="impact" element={<Impact />} />
            <Route path="donate" element={<Donate />} />
            <Route path="volunteer" element={<Volunteer />} />
            <Route path="profile" element={<Profile />} />
            <Route path="admin" element={<Admin />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

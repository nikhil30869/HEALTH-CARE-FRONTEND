import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './main/LandingPage';
import UserDashboard from './user/UserDashboard';
import AdminDashboard from './admin/AdminDashboard';
import TemperaturePage from './user/TemperaturePage';
import OxygenPage from './user/OxygenPage';
import GlycogenPage from './user/GlycogenPage';
import BpPage from './user/BpPage';
import HeartRatePage from './user/HeartRatePage';
import UpdateUserProfile from './user/UpdateUserProfile';
import AdminSignup from './admin/AdminSignup';   // ✅ import AdminSignup
import './index.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Main Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/user" element={<UserDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />

          {/* User Health Parameter Pages */}
          <Route path="/user/temperature" element={<TemperaturePage />} />
          <Route path="/user/oxygen" element={<OxygenPage />} />
          <Route path="/user/glycogen" element={<GlycogenPage />} />
          <Route path="/user/bp" element={<BpPage />} />
          <Route path="/user/heart-rate" element={<HeartRatePage />} />
          <Route path="/user/update-profile" element={<UpdateUserProfile />} />

          {/* ✅ Admin Signup (open route) */}
          <Route path="/admin-signup" element={<AdminSignup />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

import React, { useState } from 'react';
import { FaHeartbeat, FaUser, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';

const LandingPage = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  const openLogin = () => {
    setIsSignupOpen(false);
    setIsLoginOpen(true);
  };

  const openSignup = () => {
    setIsLoginOpen(false);
    setIsSignupOpen(true);
  };

  const closeModals = () => {
    setIsLoginOpen(false);
    setIsSignupOpen(false);
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* Navbar */}
      <nav className="glass-effect border-b border-white/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <FaHeartbeat className="text-3xl text-white" />
              <span className="text-2xl font-bold text-white">NexusWave</span>
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={openLogin}
                className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg transition-all duration-300 backdrop-blur-sm"
              >
                <FaSignInAlt />
                <span>Login</span>
              </button>
              <button 
                onClick={openSignup}
                className="flex items-center space-x-2 bg-secondary-600 hover:bg-secondary-700 text-white px-6 py-2 rounded-lg transition-all duration-300"
              >
                <FaUserPlus />
                <span>Sign Up</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center text-white animate-fade-in">
          <h1 className="text-6xl font-bold mb-6">
            Track Your Health, 
            <span className="text-secondary-300"> Transform Your Life</span>
          </h1>
          <p className="text-xl mb-8 text-white/80 max-w-2xl mx-auto">
            Monitor your vital health parameters in one place. Get insights, track progress, 
            and take control of your wellbeing with our comprehensive health monitoring platform.
          </p>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={openSignup}
              className="bg-secondary-600 hover:bg-secondary-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Start Your Health Journey
            </button>
            <button 
              onClick={openLogin}
              className="border-2 border-white/50 hover:border-white text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 backdrop-blur-sm"
            >
              Existing User
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isLoginOpen && <LoginModal onClose={closeModals} onSwitchToSignup={openSignup} />}
      {isSignupOpen && <SignupModal onClose={closeModals} onSwitchToLogin={openLogin} />}
    </div>
  );
};

export default LandingPage;
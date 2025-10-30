import React, { useState } from 'react';
import { FaTimes, FaEye, FaEyeSlash, FaUser, FaLock, FaUserShield } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import config from '../config';
import axios from 'axios';

const LoginModal = ({ onClose, onSwitchToSignup }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'USER'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${config.url}/api/login`, formData);

      // 🔍 DEBUG: Log the entire response to see what's actually there
      console.log('🔵 FULL LOGIN RESPONSE:', response.data);

      // Extract data safely
      const { role, userData, token } = response.data;

      // ✅ SAFE: Try multiple ways to find userId
      let userId = null;
      
      // Check all possible locations for userId
      if (response.data.userId) {
        userId = response.data.userId;
        console.log('✅ Found userId in response.data.userId:', userId);
      } else if (userData?.userId) {
        userId = userData.userId;
        console.log('✅ Found userId in userData.userId:', userId);
      } else if (userData?.id) {
        userId = userData.id;
        console.log('✅ Found userId in userData.id:', userId);
      } else if (response.data.id) {
        userId = response.data.id;
        console.log('✅ Found userId in response.data.id:', userId);
      } else {
        console.warn('⚠️ No userId found in login response');
        console.log('Available keys:', Object.keys(response.data));
      }

      // Store what we have
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      
      // ✅ SAFE: Only store userId if we found it
      if (userId) {
        localStorage.setItem("userId", userId.toString());
        console.log('✅ Stored userId:', userId);
      } else {
        console.warn('⚠️ No userId available to store');
        // We'll handle this case separately
      }

      console.log('✅ Login successful - Role:', role, 'UserId:', userId);

      if (role === 'USER') {
        navigate('/user', { state: { userData } });
      } else if (role === 'ADMIN') {
        navigate('/admin', { state: { adminData: userData } });
      } else {
        setError("Unauthorized role. Please contact support.");
      }

    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err.response?.data?.message || err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md transform animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Username */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <FaUser className="text-primary-500" />
              <span>Username</span>
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter your username"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <FaLock className="text-primary-500" />
              <span>Password</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg pr-12 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <FaUserShield className="text-primary-500" />
              <span>Role</span>
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          {/* Switch */}
          <div className="text-center">
            <span className="text-gray-600">Don't have an account? </span>
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="text-primary-600 font-semibold hover:text-primary-700"
            >
              Sign up here
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
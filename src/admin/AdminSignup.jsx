import React, { useState } from 'react';
import { FaTimes, FaEye, FaEyeSlash, FaUserShield, FaLock, FaEnvelope, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';
import config from '../config';

const AdminSignup = ({ onClose, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    role: 'ADMIN'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
    setFieldErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});

    try {
      await axios.post(`${config.url}/api/register/admin`, formData);

      setSuccess(`✅ Admin registration successful!`);
      setTimeout(() => {
        onSwitchToLogin();
      }, 2000);
    } catch (err) {
      const errorMessage = err.response?.data;
      if (errorMessage?.includes('Username')) {
        setFieldErrors({ username: errorMessage });
      } else if (errorMessage?.includes('Email')) {
        setFieldErrors({ email: errorMessage });
      } else {
        setError(errorMessage || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Create Admin Account</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg flex items-center space-x-2 animate-pulse">
              <FaCheck className="text-green-500 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center space-x-2">
              <FaExclamationTriangle className="text-red-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Username */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <FaUserShield className="text-primary-500" />
              <span>Username</span>
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 border rounded-lg ${
                fieldErrors.username ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Choose an admin username"
            />
            {fieldErrors.username && (
              <div className="text-red-600 text-sm flex items-center space-x-1">
                <FaExclamationTriangle className="text-red-500" />
                <span>{fieldErrors.username}</span>
              </div>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <FaEnvelope className="text-primary-500" />
              <span>Email</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 border rounded-lg ${
                fieldErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Enter admin email"
            />
            {fieldErrors.email && (
              <div className="text-red-600 text-sm flex items-center space-x-1">
                <FaExclamationTriangle className="text-red-500" />
                <span>{fieldErrors.email}</span>
              </div>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <FaLock className="text-primary-500" />
              <span>Password</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg pr-12"
                placeholder="Create an admin password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-3 rounded-lg font-semibold mt-6"
          >
            {loading ? 'Creating Admin...' : 'Create Admin Account'}
          </button>

          <div className="text-center pt-4">
            <span className="text-gray-600">Already have an account? </span>
            <button onClick={onSwitchToLogin} type="button" className="text-primary-600 font-semibold">
              Login here
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSignup;

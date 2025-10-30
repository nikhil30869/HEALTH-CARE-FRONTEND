import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUser, FaEnvelope, FaCalendar, FaMapMarker, FaSave, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';
import config from '../config';

const UpdateUserProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userData = location.state?.userData;
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    dateOfBirth: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (userData) {
      setFormData({
        username: userData.username || '',
        email: userData.email || '',
        dateOfBirth: userData.dateOfBirth || '',
        location: userData.location || ''
      });
    }
  }, [userData]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setFieldErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});

    try {
      const response = await axios.put(`${config.url}/api/users/${userData.userId}`, formData);
      
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/user', { 
          state: { 
            userData: { ...userData, ...formData } 
          } 
        });
      }, 2000);
    } catch (err) {
      const errorMessage = err.response?.data;
      
      if (errorMessage?.includes('Username')) {
        setFieldErrors({ username: errorMessage });
      } else if (errorMessage?.includes('Email')) {
        setFieldErrors({ email: errorMessage });
      } else {
        setError(errorMessage || 'Update failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-purple-50 relative">
      {/* Fixed background elements that don't interfere with scrolling */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-secondary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Scrollable content */}
      <div className="container mx-auto px-6 py-8 relative z-10">
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => navigate('/user')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20 shadow-sm hover:shadow-md"
          >
            <FaArrowLeft />
            <span>Back to Dashboard</span>
          </button>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <FaUser className="text-white text-3xl" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Update Your Profile
            </h1>
            <p className="text-xl text-gray-600">Keep your information up to date</p>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 mb-8">
            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl flex items-center space-x-2 animate-pulse">
                <FaCheck className="text-green-500" />
                <span className="font-semibold">Profile updated successfully! Redirecting...</span>
              </div>
            )}

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center space-x-2">
                <FaExclamationTriangle className="text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
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
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm ${
                    fieldErrors.username ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter your username"
                />
                {fieldErrors.username && (
                  <div className="text-red-600 text-sm flex items-center space-x-1">
                    <FaExclamationTriangle className="text-red-500" />
                    <span>{fieldErrors.username}</span>
                  </div>
                )}
              </div>

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
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm ${
                    fieldErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                />
                {fieldErrors.email && (
                  <div className="text-red-600 text-sm flex items-center space-x-1">
                    <FaExclamationTriangle className="text-red-500" />
                    <span>{fieldErrors.email}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <FaCalendar className="text-primary-500" />
                  <span>Date of Birth</span>
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <FaMapMarker className="text-primary-500" />
                  <span>Location</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                  placeholder="Enter your location"
                />
              </div>

              <button
                type="submit"
                disabled={loading || success}
                className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2 shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Updating...</span>
                  </>
                ) : success ? (
                  <>
                    <FaCheck className="text-white animate-bounce" />
                    <span>Updated Successfully!</span>
                  </>
                ) : (
                  <>
                    <FaSave />
                    <span>Update Profile</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-primary-50 p-3 rounded-lg">
                  <div className="text-primary-600 font-medium">Username</div>
                  <div className="text-gray-700">{userData?.username}</div>
                </div>
                <div className="bg-secondary-50 p-3 rounded-lg">
                  <div className="text-secondary-600 font-medium">Email</div>
                  <div className="text-gray-700">{userData?.email}</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-green-600 font-medium">Date of Birth</div>
                  <div className="text-gray-700">{userData?.dateOfBirth || 'Not set'}</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="text-purple-600 font-medium">Location</div>
                  <div className="text-gray-700">{userData?.location || 'Not set'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateUserProfile;
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaHeartbeat, FaTemperatureHigh, FaLungs, FaTint, FaHeart, FaSignOutAlt, FaUser, FaTimes } from 'react-icons/fa';

const UserDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    recordsThisWeek: 0,
    parametersTracked: 0,
    overallHealthScore: 0,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

  // Get user data from localStorage on component mount
  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      const parsedData = JSON.parse(storedUserData);
      setUserData(parsedData);
      loadDashboardData(parsedData.userId);
    } else if (location.state?.userData) {
      setUserData(location.state.userData);
      localStorage.setItem('userData', JSON.stringify(location.state.userData));
      loadDashboardData(location.state.userData.userId);
    } else {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      if (token && userId) {
        const minimalUserData = {
          username: `User${userId}`,
          userId: parseInt(userId)
        };
        setUserData(minimalUserData);
        localStorage.setItem('userData', JSON.stringify(minimalUserData));
        loadDashboardData(parseInt(userId));
      }
    }
  }, [location]);

  // Load real dashboard data from backend API
  const loadDashboardData = async (userId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // ✅ CHANGED PORT FROM 8080 TO 2007
      const response = await fetch(`http://localhost:2007/api/users/${userId}/dashboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'UserId': userId.toString(),
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setDashboardData(result.data);
        } else {
          console.error('Error loading dashboard:', result.message);
          // Fallback to mock data if API fails
          loadMockDashboardData(userId);
        }
      } else {
        throw new Error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Fallback to mock data
      loadMockDashboardData(userId);
    } finally {
      setLoading(false);
    }
  };

  // Fallback to mock data if API fails
  const loadMockDashboardData = (userId) => {
    const baseRecords = 8 + (userId % 10);
    const baseParameters = 3 + (userId % 3);
    const baseHealthScore = 85 + (userId % 15);
    
    const mockDashboardData = {
      recordsThisWeek: baseRecords,
      parametersTracked: baseParameters,
      overallHealthScore: baseHealthScore,
      recentActivities: [
        { type: 'Temperature', value: '98.6°F', timestamp: new Date(Date.now() - 3600000) },
        { type: 'Heart Rate', value: '72 bpm', timestamp: new Date(Date.now() - 7200000) },
        { type: 'Oxygen Level', value: '98%', timestamp: new Date(Date.now() - 10800000) },
        { type: 'Blood Pressure', value: '120/80', timestamp: new Date(Date.now() - 14400000) }
      ]
    };
    
    setDashboardData(mockDashboardData);
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    if (typeof timestamp === 'string') {
      return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const healthParameters = [
    {
      id: 1,
      name: 'Temperature',
      icon: FaTemperatureHigh,
      color: 'from-orange-400 to-red-500',
      bgColor: 'bg-orange-50',
      route: '/user/temperature'
    },
    {
      id: 2,
      name: 'Oxygen Level',
      icon: FaLungs,
      color: 'from-blue-400 to-cyan-500',
      bgColor: 'bg-blue-50',
      route: '/user/oxygen'
    },
    {
      id: 3,
      name: 'Glycogen',
      icon: FaTint,
      color: 'from-green-400 to-emerald-500',
      bgColor: 'bg-green-50',
      route: '/user/glycogen'
    },
    {
      id: 4,
      name: 'BP Monitor',
      icon: FaHeartbeat,
      color: 'from-purple-400 to-pink-500',
      bgColor: 'bg-purple-50',
      route: '/user/bp'
    },
    {
      id: 5,
      name: 'Heart Rate',
      icon: FaHeart,
      color: 'from-red-400 to-pink-500',
      bgColor: 'bg-red-50',
      route: '/user/heart-rate'
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('userData');
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  const ProfileModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md transform animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">User Profile</h2>
          <button 
            onClick={() => setShowProfile(false)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaUser className="text-white text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">{userData?.username || 'User'}</h3>
            <p className="text-gray-600">NexusWave User</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Username:</span>
              <span className="text-gray-900">{userData?.username || 'N/A'}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Email:</span>
              <span className="text-gray-900">{userData?.email || 'N/A'}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Date of Birth:</span>
              <span className="text-gray-900">{userData?.dateOfBirth || 'Not set'}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Location:</span>
              <span className="text-gray-900">{userData?.location || 'Not set'}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Member Since:</span>
              <span className="text-gray-900">October 2024</span>
            </div>

            {/* Dashboard Stats in Profile */}
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Health Score:</span>
              <span className="text-gray-900">{dashboardData.overallHealthScore}%</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Active Parameters:</span>
              <span className="text-gray-900">{dashboardData.parametersTracked}</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 flex space-x-3">
            <button
              onClick={() => {
                setShowProfile(false);
                navigate('/user/update-profile', { state: { userData } });
              }}
              className="flex-1 bg-secondary-600 hover:bg-secondary-700 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Update Profile
            </button>
            <button
              onClick={() => setShowProfile(false)}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (!userData || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaHeartbeat className="text-3xl text-primary-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">NexusWave</h1>
                <p className="text-sm text-gray-600">
                  Welcome <span className="font-semibold text-primary-600">{userData?.username || 'User'}</span>! 👋
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowProfile(true)}
                className="flex items-center space-x-2 bg-secondary-600 hover:bg-secondary-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <FaUser />
                <span>Profile</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Welcome <span className="text-primary-600">{userData?.username || 'there'}</span>!
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Track and monitor your vital health parameters. Click on any parameter to view detailed insights and records.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 max-w-6xl mx-auto">
          {healthParameters.map((param) => (
            <div key={param.id} className="flex flex-col items-center group relative">
              <button
                onClick={() => navigate(param.route)}
                className={`
                  relative w-32 h-32 rounded-full shadow-lg transition-all duration-500 transform 
                  group-hover:scale-110 group-hover:shadow-2xl
                  bg-gradient-to-br ${param.color} hover:shadow-xl
                  flex items-center justify-center
                `}
              >
                <div className="absolute inset-0 rounded-full bg-white/20 animate-ping group-hover:animate-none"></div>
                
                <param.icon className="text-white text-4xl z-10 transform group-hover:scale-125 transition-transform duration-300" />
                
                <div className="absolute inset-4 rounded-full bg-white/20 backdrop-blur-sm"></div>
              </button>

              <div className="mt-6 text-center">
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">
                  {param.name}
                </h3>
                <div className={`w-16 h-1 mx-auto mt-2 rounded-full bg-gradient-to-r ${param.color} transform group-hover:scale-110 transition-transform duration-300`}></div>
              </div>

              <div className="absolute top-full mt-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 pointer-events-none z-10">
                <div className="bg-gray-800 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
                  Click to view {param.name} data
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-2 h-2 bg-gray-800 rotate-45"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Dashboard Section */}
        <div className="max-w-4xl mx-auto mt-20 bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Recent Activity</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-primary-50 rounded-xl">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {dashboardData.recordsThisWeek}
              </div>
              <div className="text-gray-600">Records This Week</div>
            </div>
            <div className="text-center p-6 bg-secondary-50 rounded-xl">
              <div className="text-3xl font-bold text-secondary-600 mb-2">
                {dashboardData.parametersTracked}
              </div>
              <div className="text-gray-600">Parameters Tracked</div>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-xl">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {dashboardData.overallHealthScore}%
              </div>
              <div className="text-gray-600">Overall Health Score</div>
            </div>
          </div>

          {/* Recent Activities List */}
          <div className="mt-8">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Latest Readings</h4>
            <div className="space-y-3">
              {dashboardData.recentActivities && dashboardData.recentActivities.length > 0 ? (
                dashboardData.recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      <span className="font-medium text-gray-700">{activity.type}</span>
                    </div>
                    <span className="text-gray-900 font-semibold">{activity.value}</span>
                    <span className="text-sm text-gray-500">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No recent activities found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showProfile && <ProfileModal />}
    </div>
  );
};

export default UserDashboard;
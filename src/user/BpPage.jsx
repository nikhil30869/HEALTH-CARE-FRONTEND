import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaHeartbeat, FaPlus, FaCalendar, FaChartLine, FaTimes } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import config from '../config';

const BpPage = () => {
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [bpData, setBpData] = useState([]);
  const [statsData, setStatsData] = useState({
    currentSystolic: 0,
    currentDiastolic: 0,
    currentPulse: 0,
    averageSystolic: 0,
    averageDiastolic: 0,
    trend: 'stable'
  });
  const [loading, setLoading] = useState(true);
  const [rangeLoading, setRangeLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  const API_BASE_URL = `${config.url}/api`;

  // Get current user ID from authentication
  const getCurrentUserId = () => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) return parseInt(storedUserId);
    return null;
  };

  // Fetch all BP data
  const fetchBpData = async () => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) {
      console.log('❌ No user ID found - user not authenticated');
      setLoading(false);
      return;
    }

    setUserId(currentUserId);
    
    try {
      setLoading(true);
      console.log('🔵 Fetching BP data for user:', currentUserId);
      
      const response = await fetch(`${API_BASE_URL}/blood-pressure/user/${currentUserId}`, {
        headers: {
          'UserId': currentUserId.toString()
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ BP data received:', data);
        setBpData(data);
        await fetchStatsData();
      } else if (response.status === 403) {
        console.log('❌ Access denied - user cannot access this data');
        setBpData([]);
        setStatsData({ 
          currentSystolic: 0, 
          currentDiastolic: 0, 
          currentPulse: 0,
          averageSystolic: 0, 
          averageDiastolic: 0, 
          trend: 'stable' 
        });
      } else {
        console.log('❌ BP data failed with status:', response.status);
        setBpData([]);
        setStatsData({ 
          currentSystolic: 0, 
          currentDiastolic: 0, 
          currentPulse: 0,
          averageSystolic: 0, 
          averageDiastolic: 0, 
          trend: 'stable' 
        });
      }
    } catch (error) {
      console.log('❌ Fetch error:', error);
      setBpData([]);
      setStatsData({ 
        currentSystolic: 0, 
        currentDiastolic: 0, 
        currentPulse: 0,
        averageSystolic: 0, 
        averageDiastolic: 0, 
        trend: 'stable' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats separately
  const fetchStatsData = async () => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return;

    try {
      console.log('🔵 Fetching BP stats for user:', currentUserId);
      
      const statsResponse = await fetch(`${API_BASE_URL}/blood-pressure/user/${currentUserId}/stats`, {
        headers: {
          'UserId': currentUserId.toString()
        }
      });
      
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        console.log('✅ BP stats data received:', stats);
        setStatsData(stats);
      } else {
        console.log('❌ BP stats failed with status:', statsResponse.status);
        calculateFallbackStats();
      }
    } catch (error) {
      console.log('❌ BP stats error:', error);
      calculateFallbackStats();
    }
  };

  // Fallback stats calculation
  const calculateFallbackStats = () => {
    if (bpData.length === 0) {
      setStatsData({ 
        currentSystolic: 0, 
        currentDiastolic: 0, 
        currentPulse: 0,
        averageSystolic: 0, 
        averageDiastolic: 0, 
        trend: 'stable' 
      });
      return;
    }
    
    const systolicReadings = bpData.map(item => item.systolic);
    const diastolicReadings = bpData.map(item => item.diastolic);
    const pulseReadings = bpData.map(item => item.pulse);
    const currentSystolic = systolicReadings[0];
    const currentDiastolic = diastolicReadings[0];
    const currentPulse = pulseReadings[0];
    const averageSystolic = systolicReadings.reduce((a, b) => a + b, 0) / systolicReadings.length;
    const averageDiastolic = diastolicReadings.reduce((a, b) => a + b, 0) / diastolicReadings.length;
    
    setStatsData({
      currentSystolic: Math.round(currentSystolic),
      currentDiastolic: Math.round(currentDiastolic),
      currentPulse: Math.round(currentPulse),
      averageSystolic: Math.round(averageSystolic),
      averageDiastolic: Math.round(averageDiastolic),
      trend: 'stable'
    });
  };

  // Fetch data by date range
  const fetchDataByRange = async (range) => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return;

    try {
      setRangeLoading(true);
      const endDate = new Date();
      const startDate = new Date();
      
      switch (range) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        default:
          startDate.setDate(endDate.getDate() - 7);
      }

      const startISO = startDate.toISOString().replace(/\.\d{3}Z$/, 'Z');
      const endISO = endDate.toISOString().replace(/\.\d{3}Z$/, 'Z');

      console.log('🔵 Fetching BP range:', range, 'for user:', currentUserId);

      const response = await fetch(
        `${API_BASE_URL}/blood-pressure/user/${currentUserId}/range?start=${encodeURIComponent(startISO)}&end=${encodeURIComponent(endISO)}`,
        {
          headers: {
            'UserId': currentUserId.toString()
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ BP range data received:', data);
        setBpData(data);
        await fetchStatsData();
      } else {
        console.log('❌ BP range fetch failed with status:', response.status);
      }
    } catch (error) {
      console.log('❌ BP range error:', error);
    } finally {
      setRangeLoading(false);
    }
  };

  useEffect(() => {
    console.log('Initial BP data load');
    fetchBpData();
  }, []);

  useEffect(() => {
    console.log('Time range changed to:', selectedTimeRange);
    if (selectedTimeRange) {
      fetchDataByRange(selectedTimeRange);
    }
  }, [selectedTimeRange]);

  const timeOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
  ];

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return 'text-red-500';
      case 'down': return 'text-green-500';
      default: return 'text-blue-500';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      default: return '→';
    }
  };

  const getBpStatus = (systolic, diastolic) => {
    if (systolic < 120 && diastolic < 80) return { text: 'Normal', color: 'text-green-500', bg: 'bg-green-100 text-green-800' };
    if (systolic < 130 && diastolic < 80) return { text: 'Elevated', color: 'text-yellow-500', bg: 'bg-yellow-100 text-yellow-800' };
    if (systolic < 140 || diastolic < 90) return { text: 'High Stage 1', color: 'text-orange-500', bg: 'bg-orange-100 text-orange-800' };
    if (systolic < 180 || diastolic < 120) return { text: 'High Stage 2', color: 'text-red-500', bg: 'bg-red-100 text-red-800' };
    return { text: 'Hypertensive Crisis', color: 'text-purple-500', bg: 'bg-purple-100 text-purple-800' };
  };

  const getPulseStatus = (pulse) => {
    if (pulse >= 60 && pulse <= 100) return { text: 'Normal', color: 'text-green-500', bg: 'bg-green-100 text-green-800' };
    if (pulse < 60) return { text: 'Low', color: 'text-blue-500', bg: 'bg-blue-100 text-blue-800' };
    return { text: 'High', color: 'text-red-500', bg: 'bg-red-100 text-red-800' };
  };

  // Format data for charts
  const formatChartData = (data) => {
    if (!data || data.length === 0) return [];
    
    return data.map(item => ({
      date: new Date(item.measuredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      systolic: item.systolic,
      diastolic: item.diastolic,
      pulse: item.pulse,
      time: new Date(item.measuredAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      fullDate: new Date(item.measuredAt)
    })).sort((a, b) => a.fullDate - b.fullDate);
  };

  const chartData = formatChartData(bpData);
  const currentBpStatus = getBpStatus(statsData.currentSystolic, statsData.currentDiastolic);
  const currentPulseStatus = getPulseStatus(statsData.currentPulse);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading blood pressure data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-red-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/user')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <FaArrowLeft />
                <span>Back to Dashboard</span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center">
                  <FaHeartbeat className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Blood Pressure</h1>
                  <p className="text-sm text-gray-600">Monitor your systolic and diastolic blood pressure trends</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <FaPlus />
              <span>Add Reading</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Time Range Selector */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-red-200">
            <div className="flex space-x-2">
              {timeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedTimeRange(option.value)}
                  disabled={rangeLoading}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    selectedTimeRange === option.value
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-red-50'
                  } ${rangeLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {option.label}
                  {rangeLoading && selectedTimeRange === option.value && (
                    <span className="ml-2">⟳</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-red-200 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Current BP</p>
                <p className="text-3xl font-bold text-gray-800">
                  {statsData.currentSystolic || 0}/{statsData.currentDiastolic || 0}
                </p>
              </div>
              <FaHeartbeat className="text-red-500 text-2xl" />
            </div>
            <div className={`mt-2 text-sm font-medium ${currentBpStatus.color}`}>
              {currentBpStatus.text}
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-red-200 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Average BP</p>
                <p className="text-3xl font-bold text-gray-800">
                  {statsData.averageSystolic || 0}/{statsData.averageDiastolic || 0}
                </p>
              </div>
              <FaChartLine className="text-green-500 text-2xl" />
            </div>
            <div className="mt-2 text-sm text-gray-500">{selectedTimeRange} average</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-red-200 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pulse Rate</p>
                <p className="text-3xl font-bold text-gray-800">
                  {statsData.currentPulse || 0} BPM
                </p>
              </div>
              <FaChartLine className="text-blue-500 text-2xl" />
            </div>
            <div className={`mt-2 text-sm font-medium ${currentPulseStatus.color}`}>
              {currentPulseStatus.text}
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-red-200 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Trend</p>
                <p className="text-2xl font-bold text-gray-800">
                  <span className={getTrendColor(statsData.trend)}>
                    {getTrendIcon(statsData.trend)} {statsData.trend || 'stable'}
                  </span>
                </p>
              </div>
              <div className="text-2xl">{getTrendIcon(statsData.trend)}</div>
            </div>
            <div className="mt-2 text-sm text-gray-500">Compared to previous period</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* BP Trend Chart */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-red-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Blood Pressure Trend</h3>
            <div className="h-80">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#666" 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      stroke="#666" 
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid #fecaca',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                      }}
                      formatter={(value, name) => {
                        if (name === 'systolic') return [`${value} mmHg`, 'Systolic'];
                        if (name === 'diastolic') return [`${value} mmHg`, 'Diastolic'];
                        return [value, name];
                      }}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="systolic" 
                      stroke="#ef4444" 
                      strokeWidth={3}
                      dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: '#dc2626' }}
                      name="Systolic"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="diastolic" 
                      stroke="#8b5cf6" 
                      strokeWidth={3}
                      dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: '#7c3aed' }}
                      name="Diastolic"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <FaHeartbeat className="text-4xl mb-4 text-gray-300" />
                  <p className="text-lg">No BP data available</p>
                  <p className="text-sm mt-2">Add your first reading to see trends</p>
                </div>
              )}
            </div>
          </div>

          {/* Pulse Rate Chart */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-red-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Pulse Rate Trend</h3>
            <div className="h-80">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#666" 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      stroke="#666" 
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid #fecaca',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                      }}
                      formatter={(value) => [`${value} BPM`, 'Pulse Rate']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="pulse" 
                      stroke="#3b82f6" 
                      fill="url(#colorPulse)" 
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: '#1d4ed8' }}
                    />
                    <defs>
                      <linearGradient id="colorPulse" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <FaChartLine className="text-4xl mb-4 text-gray-300" />
                  <p className="text-lg">No pulse data available</p>
                  <p className="text-sm mt-2">Add your first reading to see charts</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Readings Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-red-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Readings</h3>
            <span className="text-sm text-gray-500">
              {bpData.length} total readings
            </span>
          </div>
          <div className="overflow-x-auto">
            {bpData.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-red-200">
                    <th className="text-left py-3 text-gray-600 font-medium">Date</th>
                    <th className="text-left py-3 text-gray-600 font-medium">Time</th>
                    <th className="text-left py-3 text-gray-600 font-medium">Blood Pressure</th>
                    <th className="text-left py-3 text-gray-600 font-medium">Pulse</th>
                    <th className="text-left py-3 text-gray-600 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bpData.slice(0, 10).map((reading, index) => {
                    const status = getBpStatus(reading.systolic, reading.diastolic);
                    const pulseStatus = getPulseStatus(reading.pulse);
                    return (
                      <tr key={reading.bpId || index} className="border-b border-red-100 hover:bg-red-50 transition-colors">
                        <td className="py-3 text-gray-700">
                          {new Date(reading.measuredAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="py-3 text-gray-700">
                          {new Date(reading.measuredAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </td>
                        <td className="py-3">
                          <span className="font-semibold text-gray-800">
                            {reading.systolic}/{reading.diastolic} mmHg
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${pulseStatus.bg}`}>
                            {reading.pulse} BPM
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg}`}>
                            {status.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FaHeartbeat className="text-5xl mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">No blood pressure readings yet</p>
                <p className="text-sm mb-6">Start tracking your blood pressure to see data here</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <FaPlus className="inline mr-2" />
                  Add First Reading
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add BP Reading Modal */}
      {showAddForm && (
        <AddBpForm 
          onClose={() => setShowAddForm(false)} 
          onSuccess={() => {
            fetchBpData();
            fetchDataByRange(selectedTimeRange);
          }}
          userId={userId}
        />
      )}
    </div>
  );
};

// Add BP Form Component
const AddBpForm = ({ onClose, onSuccess, userId }) => {
  const [formData, setFormData] = useState({
    systolic: '',
    diastolic: '',
    pulse: '',
    timeOfDay: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [submitting, setSubmitting] = useState(false);

  const API_BASE_URL = `${config.url}/api`;

  const timeOfDayOptions = [
    { value: 'morning', label: '🌅 Morning (6AM - 12PM)', icon: '🌅' },
    { value: 'afternoon', label: '☀️ Afternoon (12PM - 6PM)', icon: '☀️' },
    { value: 'evening', label: '🌆 Evening (6PM - 10PM)', icon: '🌆' },
    { value: 'night', label: '🌙 Night (10PM - 6AM)', icon: '🌙' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userId) {
      alert('User not authenticated. Please login again.');
      return;
    }

    setSubmitting(true);

    try {
      let timeString = '12:00:00';
      switch (formData.timeOfDay) {
        case 'morning': timeString = '08:00:00'; break;
        case 'afternoon': timeString = '14:00:00'; break;
        case 'evening': timeString = '18:00:00'; break;
        case 'night': timeString = '22:00:00'; break;
      }

      const bpData = {
        user: { userId: userId },
        systolic: parseInt(formData.systolic),
        diastolic: parseInt(formData.diastolic),
        pulse: parseInt(formData.pulse),
        measuredAt: new Date(`${formData.date}T${timeString}`).toISOString().replace(/\.\d{3}Z$/, 'Z'),
        notes: formData.notes || ""
      };

      console.log('🔵 FINAL BP data to send:', JSON.stringify(bpData, null, 2));

      const response = await fetch(`${API_BASE_URL}/blood-pressure/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'UserId': userId.toString()
        },
        body: JSON.stringify(bpData),
      });

      console.log('🔵 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('🔵 Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Successfully added BP reading:', result);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('❌ Error adding BP reading:', error);
      alert('Error adding BP reading: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getBpColor = (systolic, diastolic) => {
    if (!systolic || !diastolic) return 'border-gray-300';
    if (systolic < 120 && diastolic < 80) return 'border-green-500 bg-green-50 text-green-700';
    if (systolic < 130 && diastolic < 80) return 'border-yellow-500 bg-yellow-50 text-yellow-700';
    if (systolic < 140 || diastolic < 90) return 'border-orange-500 bg-orange-50 text-orange-700';
    if (systolic < 180 || diastolic < 120) return 'border-red-500 bg-red-50 text-red-700';
    return 'border-purple-500 bg-purple-50 text-purple-700';
  };

  const getCurrentBpStatus = () => {
    if (!formData.systolic || !formData.diastolic) return null;
    return getBpColor(parseInt(formData.systolic), parseInt(formData.diastolic));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl transform animate-fade-in my-8">
        <div className="flex items-center justify-between p-6 border-b border-red-200">
          <h2 className="text-2xl font-bold text-gray-800">Add Blood Pressure Reading</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            disabled={submitting}
          >
            <FaTimes size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Blood Pressure Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Systolic (mmHg) *</label>
              <input
                type="number"
                value={formData.systolic}
                onChange={(e) => setFormData({...formData, systolic: e.target.value})}
                disabled={submitting}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all disabled:opacity-50"
                placeholder="120"
                min="50"
                max="250"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Diastolic (mmHg) *</label>
              <input
                type="number"
                value={formData.diastolic}
                onChange={(e) => setFormData({...formData, diastolic: e.target.value})}
                disabled={submitting}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all disabled:opacity-50"
                placeholder="80"
                min="30"
                max="150"
                required
              />
            </div>
          </div>

          {/* BP Status Display */}
          {formData.systolic && formData.diastolic && (
            <div className={`p-4 border-2 rounded-xl ${getCurrentBpStatus()}`}>
              <div className="text-center">
                <div className="text-lg font-semibold">
                  {formData.systolic}/{formData.diastolic} mmHg
                </div>
                <div className="text-sm mt-1">
                  {getCurrentBpStatus().includes('green') && 'Normal Blood Pressure'}
                  {getCurrentBpStatus().includes('yellow') && 'Elevated Blood Pressure'}
                  {getCurrentBpStatus().includes('orange') && 'High Blood Pressure (Stage 1)'}
                  {getCurrentBpStatus().includes('red') && 'High Blood Pressure (Stage 2)'}
                  {getCurrentBpStatus().includes('purple') && 'Hypertensive Crisis'}
                </div>
              </div>
            </div>
          )}

          {/* Pulse Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Pulse Rate (BPM) *</label>
            <input
              type="number"
              value={formData.pulse}
              onChange={(e) => setFormData({...formData, pulse: e.target.value})}
              disabled={submitting}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all disabled:opacity-50"
              placeholder="72"
              min="30"
              max="200"
              required
            />
          </div>

          {/* Time of Day Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Time of Day *</label>
            <div className="grid grid-cols-2 gap-3">
              {timeOfDayOptions.map((time) => (
                <button
                  type="button"
                  key={time.value}
                  onClick={() => setFormData({...formData, timeOfDay: time.value})}
                  disabled={submitting}
                  className={`p-4 border-2 rounded-xl text-left transition-all duration-300 flex items-center ${
                    formData.timeOfDay === time.value
                      ? 'border-red-500 bg-red-50 text-red-700 transform scale-105'
                      : 'border-gray-300 text-gray-600 hover:border-red-300'
                  } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className="text-xl mr-3">{time.icon}</span>
                  <span className="text-sm">{time.label}</span>
                </button>
              ))}
            </div>
            {!formData.timeOfDay && (
              <p className="text-red-500 text-sm">Please select time of day</p>
            )}
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Date *</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              disabled={submitting}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all disabled:opacity-50"
              required
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
              disabled={submitting}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all disabled:opacity-50"
              placeholder="Any additional notes about how you're feeling, symptoms, activity level, etc."
            />
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-6 py-4 border border-gray-300 text-gray-700 rounded-xl font-semibold transition-all duration-300 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.systolic || !formData.diastolic || !formData.pulse || !formData.timeOfDay || submitting}
              className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Adding...
                </div>
              ) : (
                'Add BP Reading'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BpPage;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaBreadSlice, FaPlus, FaCalendar, FaChartLine, FaTimes } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import config from '../config';

const GlycogenPage = () => {
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [glycogenData, setGlycogenData] = useState([]);
  const [statsData, setStatsData] = useState({
    current: 0,
    average: 0,
    min: 0,
    max: 0,
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

  // Fetch all glycogen data
  const fetchGlycogenData = async () => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) {
      console.log('❌ No user ID found - user not authenticated');
      setLoading(false);
      return;
    }

    setUserId(currentUserId);
    
    try {
      setLoading(true);
      console.log('🔵 Fetching glycogen data for user:', currentUserId);
      
      const response = await fetch(`${API_BASE_URL}/glycogen/user/${currentUserId}`, {
        headers: {
          'UserId': currentUserId.toString()
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Glycogen data received:', data);
        setGlycogenData(data);
        await fetchStatsData();
      } else if (response.status === 403) {
        console.log('❌ Access denied - user cannot access this data');
        setGlycogenData([]);
        setStatsData({ current: 0, average: 0, min: 0, max: 0, trend: 'stable' });
      } else {
        console.log('❌ Glycogen data failed with status:', response.status);
        setGlycogenData([]);
        setStatsData({ current: 0, average: 0, min: 0, max: 0, trend: 'stable' });
      }
    } catch (error) {
      console.log('❌ Fetch error:', error);
      setGlycogenData([]);
      setStatsData({ current: 0, average: 0, min: 0, max: 0, trend: 'stable' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats separately
  const fetchStatsData = async () => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return;

    try {
      console.log('🔵 Fetching glycogen stats for user:', currentUserId);
      
      const statsResponse = await fetch(`${API_BASE_URL}/glycogen/user/${currentUserId}/stats`, {
        headers: {
          'UserId': currentUserId.toString()
        }
      });
      
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        console.log('✅ Glycogen stats data received:', stats);
        setStatsData(stats);
      } else {
        console.log('❌ Glycogen stats failed with status:', statsResponse.status);
        calculateFallbackStats();
      }
    } catch (error) {
      console.log('❌ Glycogen stats error:', error);
      calculateFallbackStats();
    }
  };

  // Fallback stats calculation
  const calculateFallbackStats = () => {
    if (glycogenData.length === 0) {
      setStatsData({ current: 0, average: 0, min: 0, max: 0, trend: 'stable' });
      return;
    }
    
    const levels = glycogenData.map(item => item.glycogenLevel);
    const current = levels[0];
    const average = levels.reduce((a, b) => a + b, 0) / levels.length;
    const min = Math.min(...levels);
    const max = Math.max(...levels);
    
    setStatsData({
      current: Math.round(current * 10) / 10,
      average: Math.round(average * 10) / 10,
      min: Math.round(min * 10) / 10,
      max: Math.round(max * 10) / 10,
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

      console.log('🔵 Fetching glycogen range:', range, 'for user:', currentUserId);

      const response = await fetch(
        `${API_BASE_URL}/glycogen/user/${currentUserId}/range?start=${encodeURIComponent(startISO)}&end=${encodeURIComponent(endISO)}`,
        {
          headers: {
            'UserId': currentUserId.toString()
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Glycogen range data received:', data);
        setGlycogenData(data);
        await fetchStatsData();
      } else {
        console.log('❌ Glycogen range fetch failed with status:', response.status);
      }
    } catch (error) {
      console.log('❌ Glycogen range error:', error);
    } finally {
      setRangeLoading(false);
    }
  };

  useEffect(() => {
    console.log('Initial glycogen data load');
    fetchGlycogenData();
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
      case 'up': return 'text-green-500';
      case 'down': return 'text-red-500';
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

  const getGlycogenStatus = (level) => {
    if (level >= 100) return { text: 'High', color: 'text-purple-500', bg: 'bg-purple-100 text-purple-800' };
    if (level >= 80) return { text: 'Normal', color: 'text-green-500', bg: 'bg-green-100 text-green-800' };
    if (level >= 60) return { text: 'Low', color: 'text-yellow-500', bg: 'bg-yellow-100 text-yellow-800' };
    return { text: 'Critical', color: 'text-red-500', bg: 'bg-red-100 text-red-800' };
  };

  // Format data for charts
  const formatChartData = (data) => {
    if (!data || data.length === 0) return [];
    
    return data.map(item => ({
      date: new Date(item.measuredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      level: item.glycogenLevel,
      time: new Date(item.measuredAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      fullDate: new Date(item.measuredAt)
    })).sort((a, b) => a.fullDate - b.fullDate);
  };

  const chartData = formatChartData(glycogenData);
  const currentStatus = getGlycogenStatus(statsData.current);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading glycogen data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-purple-200">
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
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                  <FaBreadSlice className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Glycogen Level</h1>
                  <p className="text-sm text-gray-600">Monitor your muscle glycogen storage trends</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
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
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-purple-200">
            <div className="flex space-x-2">
              {timeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedTimeRange(option.value)}
                  disabled={rangeLoading}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    selectedTimeRange === option.value
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-purple-50'
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
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-200 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Current Glycogen</p>
                <p className="text-3xl font-bold text-gray-800">
                  {statsData.current || 0} mg/dL
                </p>
              </div>
              <FaBreadSlice className="text-purple-500 text-2xl" />
            </div>
            <div className={`mt-2 text-sm font-medium ${currentStatus.color}`}>
              {currentStatus.text}
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-200 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Average</p>
                <p className="text-3xl font-bold text-gray-800">
                  {statsData.average || 0} mg/dL
                </p>
              </div>
              <FaChartLine className="text-green-500 text-2xl" />
            </div>
            <div className="mt-2 text-sm text-gray-500">{selectedTimeRange} average</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-200 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Min / Max</p>
                <p className="text-2xl font-bold text-gray-800">
                  {statsData.min || 0} / {statsData.max || 0} mg/dL
                </p>
              </div>
              <FaCalendar className="text-blue-500 text-2xl" />
            </div>
            <div className="mt-2 text-sm text-gray-500">Range this period</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-200 transform hover:scale-105 transition-all duration-300">
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
          {/* Main Glycogen Trend Chart */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Glycogen Level Trend</h3>
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
                        border: '1px solid #e9d5ff',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                      }}
                      formatter={(value) => [`${value} mg/dL`, 'Glycogen Level']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="level" 
                      stroke="#8b5cf6" 
                      fill="url(#colorGlycogen)" 
                      strokeWidth={3}
                      dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: '#7c3aed' }}
                    />
                    <defs>
                      <linearGradient id="colorGlycogen" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <FaBreadSlice className="text-4xl mb-4 text-gray-300" />
                  <p className="text-lg">No glycogen data available</p>
                  <p className="text-sm mt-2">Add your first reading to see trends</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Readings Chart */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Readings</h3>
            <div className="h-80">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.slice(-7)}>
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
                        border: '1px solid #e9d5ff',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                      }}
                      formatter={(value) => [`${value} mg/dL`, 'Glycogen Level']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Bar 
                      dataKey="level" 
                      fill="url(#colorBar)" 
                      radius={[4, 4, 0, 0]}
                    />
                    <defs>
                      <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6"/>
                        <stop offset="100%" stopColor="#ec4899"/>
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <FaChartLine className="text-4xl mb-4 text-gray-300" />
                  <p className="text-lg">No glycogen data available</p>
                  <p className="text-sm mt-2">Add your first reading to see charts</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Readings Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Readings</h3>
            <span className="text-sm text-gray-500">
              {glycogenData.length} total readings
            </span>
          </div>
          <div className="overflow-x-auto">
            {glycogenData.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-purple-200">
                    <th className="text-left py-3 text-gray-600 font-medium">Date</th>
                    <th className="text-left py-3 text-gray-600 font-medium">Time</th>
                    <th className="text-left py-3 text-gray-600 font-medium">Glycogen Level</th>
                    <th className="text-left py-3 text-gray-600 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {glycogenData.slice(0, 10).map((reading, index) => {
                    const status = getGlycogenStatus(reading.glycogenLevel);
                    return (
                      <tr key={reading.glycogenId || index} className="border-b border-purple-100 hover:bg-purple-50 transition-colors">
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
                            {reading.glycogenLevel} mg/dL
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
                <FaBreadSlice className="text-5xl mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">No glycogen readings yet</p>
                <p className="text-sm mb-6">Start tracking your glycogen levels to see data here</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <FaPlus className="inline mr-2" />
                  Add First Reading
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Glycogen Reading Modal */}
      {showAddForm && (
        <AddGlycogenForm 
          onClose={() => setShowAddForm(false)} 
          onSuccess={() => {
            fetchGlycogenData();
            fetchDataByRange(selectedTimeRange);
          }}
          userId={userId}
        />
      )}
    </div>
  );
};

// Add Glycogen Form Component
const AddGlycogenForm = ({ onClose, onSuccess, userId }) => {
  const [formData, setFormData] = useState({
    glycogenLevel: '',
    timeOfDay: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [submitting, setSubmitting] = useState(false);

  const API_BASE_URL = `${config.url}/api`;

  const glycogenRanges = [
    { value: 40, label: '40 mg/dL - Critical' },
    { value: 50, label: '50 mg/dL - Very Low' },
    { value: 60, label: '60 mg/dL - Low' },
    { value: 70, label: '70 mg/dL - Below Normal' },
    { value: 80, label: '80 mg/dL - Normal' },
    { value: 90, label: '90 mg/dL - Good' },
    { value: 100, label: '100 mg/dL - High' },
    { value: 110, label: '110 mg/dL - Very High' },
    { value: 120, label: '120 mg/dL - Elevated' },
    { value: 130, label: '130 mg/dL - High' },
    { value: 140, label: '140 mg/dL - Very High' },
  ];

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

      const glycogenData = {
        user: { userId: userId },
        glycogenLevel: parseFloat(formData.glycogenLevel),
        unit: "mg/dL",
        measuredAt: new Date(`${formData.date}T${timeString}`).toISOString().replace(/\.\d{3}Z$/, 'Z'),
        notes: formData.notes || ""
      };

      console.log('🔵 FINAL glycogen data to send:', JSON.stringify(glycogenData, null, 2));

      const response = await fetch(`${API_BASE_URL}/glycogen/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'UserId': userId.toString()
        },
        body: JSON.stringify(glycogenData),
      });

      console.log('🔵 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('🔵 Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Successfully added glycogen reading:', result);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('❌ Error adding glycogen reading:', error);
      alert('Error adding glycogen reading: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getGlycogenColor = (level) => {
    if (!level) return 'border-gray-300';
    if (level >= 100) return 'border-purple-500 bg-purple-50 text-purple-700';
    if (level >= 80) return 'border-green-500 bg-green-50 text-green-700';
    if (level >= 60) return 'border-yellow-500 bg-yellow-50 text-yellow-700';
    return 'border-red-500 bg-red-50 text-red-700';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl transform animate-fade-in my-8">
        <div className="flex items-center justify-between p-6 border-b border-purple-200">
          <h2 className="text-2xl font-bold text-gray-800">Add Glycogen Reading</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            disabled={submitting}
          >
            <FaTimes size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Glycogen Level Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Select Glycogen Level (mg/dL) *</label>
            <div className="grid grid-cols-3 gap-3 max-h-60 overflow-y-auto">
              {glycogenRanges.map((range) => (
                <button
                  type="button"
                  key={range.value}
                  onClick={() => setFormData({...formData, glycogenLevel: range.value})}
                  disabled={submitting}
                  className={`p-4 border-2 rounded-xl text-center transition-all duration-300 min-h-[80px] flex flex-col items-center justify-center ${
                    formData.glycogenLevel === range.value
                      ? `${getGlycogenColor(range.value)} transform scale-105 shadow-lg`
                      : 'border-gray-300 text-gray-600 hover:border-purple-300 hover:bg-purple-25'
                  } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="font-semibold text-lg">{range.value} mg/dL</div>
                  <div className="text-xs mt-1 opacity-75 text-center">{range.label.split(' - ')[1]}</div>
                </button>
              ))}
            </div>
            {!formData.glycogenLevel && (
              <p className="text-red-500 text-sm">Please select a glycogen level</p>
            )}
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
                      ? 'border-purple-500 bg-purple-50 text-purple-700 transform scale-105'
                      : 'border-gray-300 text-gray-600 hover:border-purple-300'
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50"
              placeholder="Any additional notes about your activity, diet, or how you're feeling"
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
              disabled={!formData.glycogenLevel || !formData.timeOfDay || submitting}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Adding...
                </div>
              ) : (
                'Add Glycogen Reading'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GlycogenPage;
import React from 'react';
import { useLocation } from 'react-router-dom';

const AdminDashboard = () => {
  const location = useLocation();
  const adminData = location.state?.adminData;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Admin Dashboard
        </h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600">Welcome, {adminData?.username}. Admin panel to view all users will be implemented here.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
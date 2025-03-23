import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import VoiceInput from './VoiceInput';
import { Forecast } from './Forecast';
import { Home, BarChart2, Cloud, ChevronRight, Settings, AlertTriangle, Calendar, BookOpen, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReportError from './ReportError';
import { CulturalPractices } from './CulturalPractices';
import CropCalendar from './CropCalendar';
import AdminControl from './AdminControl';
import { FarmerDashboard } from './FarmerDashboard';

export const MainApp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    const path = location.pathname.split('/')[1];
    return path || 'home';
  });

  // Check for token and redirect if not present
  useEffect(() => {
    const token = localStorage.getItem('userLocation'); // Adjust key name as needed
    if (!token && location.pathname !== '/login') {
      navigate('/login', { replace: true });
    }
  }, [location.pathname, navigate]);

  const handleTabChange = (tab: string) => {
    if (tab === 'logout') {
      localStorage.removeItem('userLocation'); // Clear token on logout
      navigate('/login');
      return;
    }
    setActiveTab(tab);
    navigate(`/${tab}`);
  };

  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'dashboard', icon: BarChart2, label: 'Farm' },
    { id: 'forecast', icon: Cloud, label: 'Weather' },
    { id: 'CulturalPractices', icon: BookOpen, label: 'Cultural Practices' },
    { id: 'ReportError', icon: AlertTriangle, label: 'Report Error' },
    { id: 'CropCalender', icon: Calendar, label: 'Crop Calendar' },
    { id: 'AdminControl', icon: Settings, label: 'Admin Control' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex">
      {/* Sidebar for laptop screens */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-green-100 fixed h-full">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-blue-400 flex items-center mx-7">
            <span className="text-black">Blue</span>Mind
          </h1>
        </div>

        <nav className="flex-1 px-4 py-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-xl transition-all duration-200 group ${
                activeTab === tab.id
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-600 hover:bg-green-50/50 hover:text-green-600'
              }`}
            >
              <tab.icon size={22} className="transition-colors duration-200" />
              <span className="font-medium">{tab.label}</span>
              <ChevronRight
                size={18}
                className={`ml-auto transition-transform duration-200 ${
                  activeTab === tab.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
                }`}
              />
            </button>
          ))}
        </nav>

        <div onClick={() => handleTabChange('logout')} className="p-4 border-t border-green-100">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-green-50/50 hover:text-green-600 transition-colors duration-200">
            <LogOut size={22} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-64">
        <div className="max-w-7xl mx-auto pb-24 lg:pb-6">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/home" element={<VoiceInput />} />
            <Route path="/dashboard" element={<FarmerDashboard />} />
            <Route path="/forecast" element={<Forecast />} />
            <Route path="/CulturalPractices" element={<CulturalPractices />} />
            <Route path="/ReportError" element={<ReportError />} />
            <Route path="/CropCalender" element={<CropCalendar />} />
            <Route path="/AdminControl" element={<AdminControl />} />
          </Routes>
        </div>
      </main>

      {/* Bottom navigation for mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-green-100 backdrop-blur-lg bg-white/90 shadow-md">
        <div className="max-w-full mx-auto px-4 py-2">
          <div className="flex justify-between items-center gap-2 sm:gap-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex flex-col items-center p-3 rounded-lg transition-all duration-200 hover:bg-green-50/50 min-w-[60px] ${
                  activeTab === tab.id
                    ? 'text-green-600 scale-105'
                    : 'text-gray-500 hover:text-green-500'
                }`}
              >
                <tab.icon size={26} />
                <span className="text-xs mt-1 font-medium text-center">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default MainApp;
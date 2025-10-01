import React, { useState, useEffect } from 'react';
import './ModernApp.css';
import Dashboard from './components/Dashboard_New';
import EmployeeList from './components/EmployeeList';
import AttendanceView from './components/AttendanceView';
import DepartmentAnalytics from './components/DepartmentAnalytics';
import {
  Users, BarChart3, Calendar, Database, Building2,
  Menu, X, Sun, Moon, Settings, Home, ChevronRight
} from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  description: string;
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
      localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }
  }, [darkMode, mounted]);

  const tabs: Tab[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <BarChart3 size={20} />,
      component: <Dashboard />,
      description: 'Overview and analytics'
    },
    {
      id: 'department-analytics',
      label: 'Department Analytics',
      icon: <Building2 size={20} />,
      component: <DepartmentAnalytics />,
      description: 'Department insights and metrics'
    },
    {
      id: 'employees',
      label: 'Employees',
      icon: <Users size={20} />,
      component: <EmployeeList />,
      description: 'Employee management'
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: <Calendar size={20} />,
      component: <AttendanceView />,
      description: 'Attendance tracking'
    }
  ];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleTheme = () => setDarkMode(!darkMode);

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <div className={`App ${darkMode ? 'dark' : 'light'}`}>
      {/* Sidebar Navigation */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Database size={24} />
            <span>EMS</span>
          </div>
          <button className="sidebar-close" onClick={toggleSidebar}>
            <X size={20} />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`sidebar-nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tab.id);
                setSidebarOpen(false);
              }}
            >
              {tab.icon}
              <div className="nav-item-content">
                <span className="nav-item-label">{tab.label}</span>
                <span className="nav-item-description">{tab.description}</span>
              </div>
              <ChevronRight size={16} className="nav-item-arrow" />
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="theme-toggle" onClick={toggleTheme}>
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Header */}
        <header className="top-header">
          <div className="header-left">
            <button className="sidebar-toggle" onClick={toggleSidebar}>
              <Menu size={20} />
            </button>
            <div className="breadcrumb">
              <Home size={16} />
              <span>/</span>
              <span>{tabs.find(tab => tab.id === activeTab)?.label}</span>
            </div>
          </div>
          <div className="header-right">
            <div className="header-actions">
              <button className="action-btn" title="Settings">
                <Settings size={20} />
              </button>
              <button className="theme-toggle-mobile" onClick={toggleTheme}>
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </header>

        {/* Desktop Tab Navigation */}
        <nav className="desktop-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`desktop-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Page Content */}
        <main className="page-content">
          {tabs.find(tab => tab.id === activeTab)?.component}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && <div className="mobile-overlay" onClick={toggleSidebar} />}
    </div>
  );
}

export default App;
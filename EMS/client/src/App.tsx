import React, { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import EmployeeList from './components/EmployeeList';
import AttendanceView from './components/AttendanceView';
import { Users, BarChart3, Calendar } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs: Tab[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <BarChart3 size={20} />,
      component: <Dashboard />
    },
    {
      id: 'employees',
      label: 'Employees',
      icon: <Users size={20} />,
      component: <EmployeeList />
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: <Calendar size={20} />,
      component: <AttendanceView />
    }
  ];

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1>Employee Management System</h1>
          <p>PostgreSQL Database Showcase</p>
        </div>
      </header>

      <nav className="app-nav">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      <main className="app-main">
        {tabs.find(tab => tab.id === activeTab)?.component}
      </main>

      <footer className="app-footer">
        <p>Built with React, Node.js, Express & PostgreSQL</p>
        <p>Showcasing robust database design with complex queries and relationships</p>
      </footer>
    </div>
  );
}

export default App;
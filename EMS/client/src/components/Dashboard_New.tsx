import React, { useState, useEffect } from 'react';
import './Dashboard_New.css';

interface DashboardData {
  summary: {
    total_employees: number;
    active_employees: number;
    new_hires_this_month: number;
    average_salary: number;
    total_payroll: number;
  };
  departments: Array<{
    department_name: string;
    employee_count: number;
    avg_salary: number;
    total_salary: number;
  }>;
  recent_hires: Array<{
    employee_number: string;
    first_name: string;
    last_name: string;
    hire_date: string;
    salary: number;
    department_name: string;
    position_title: string;
  }>;
  salary_distribution: Array<{
    salary_range: string;
    employee_count: number;
    avg_range_salary: number;
  }>;
  top_performers: Array<{
    employee_name: string;
    employee_number: string;
    salary: number;
    department_name: string;
    position_title: string;
    hire_date: string;
  }>;
}

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Fetching dashboard data...');
      
      const response = await fetch('/api/analytics/dashboard');
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Dashboard data received:', result);
      
      if (result.success) {
        setDashboardData(result.data);
        setError(null);
      } else {
        throw new Error(result.error || 'API returned unsuccessful response');
      }
    } catch (err) {
      console.error('❌ Dashboard fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <h2>Loading Employee Database...</h2>
          <p>Fetching comprehensive analytics from our robust database</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h2>Unable to Load Dashboard</h2>
          <p className="error-message">{error}</p>
          <div className="error-actions">
            <button onClick={fetchDashboardData} className="retry-btn">
              Retry Loading
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="dashboard-container">
        <div className="no-data-state">
          <h2>No Data Available</h2>
          <p>Dashboard data is not available at this time.</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
  };

  return (
    <div className="dashboard-container">
      {/* Hero Section */}
      <header className="dashboard-hero">
        <div className="hero-content">
          <h1>Employee Management System</h1>
          <h2>Comprehensive Database Analytics Dashboard</h2>
          <p>Real-time insights from our robust employee database with {formatNumber(dashboardData.summary.total_employees)} employees</p>
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-number">{formatNumber(dashboardData.summary.total_employees)}</span>
            <span className="hero-label">Total Employees</span>
          </div>
          <div className="hero-stat">
            <span className="hero-number">{formatNumber(dashboardData.summary.new_hires_this_month)}</span>
            <span className="hero-label">New Hires This Month</span>
          </div>
          <div className="hero-stat">
            <span className="hero-number">{formatCurrency(dashboardData.summary.total_payroll)}</span>
            <span className="hero-label">Total Payroll</span>
          </div>
        </div>
      </header>

      {/* Key Metrics */}
      <section className="metrics-section">
        <h3>Key Metrics</h3>
        <div className="metrics-grid">
          <div className="metric-card active">
            <div className="metric-icon">✅</div>
            <div className="metric-value">{formatNumber(dashboardData.summary.active_employees)}</div>
            <div className="metric-label">Active Employees</div>
            <div className="metric-change">
              {Math.round((dashboardData.summary.active_employees / dashboardData.summary.total_employees) * 100)}% of workforce
            </div>
          </div>
          
          <div className="metric-card salary">
            <div className="metric-icon">$</div>
            <div className="metric-value">{formatCurrency(dashboardData.summary.average_salary)}</div>
            <div className="metric-label">Average Salary</div>
            <div className="metric-change">Competitive compensation</div>
          </div>
          
          <div className="metric-card departments">
            <div className="metric-icon">B</div>
            <div className="metric-value">{dashboardData.departments.length}</div>
            <div className="metric-label">Active Departments</div>
            <div className="metric-change">Organizational structure</div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        
        {/* Recent Hires Showcase */}
        <div className="dashboard-card featured">
          <div className="card-header">
            <h3>🆕 Recent Talent Additions</h3>
            <span className="card-count">{dashboardData.recent_hires.length} recent hires</span>
          </div>
          <div className="hires-grid">
            {dashboardData.recent_hires.slice(0, 6).map((hire, index) => (
              <div key={hire.employee_number} className="hire-card">
                <div className="hire-avatar">{hire.first_name[0]}{hire.last_name[0]}</div>
                <div className="hire-info">
                  <h4>{hire.first_name} {hire.last_name}</h4>
                  <p className="hire-position">{hire.position_title}</p>
                  <p className="hire-department">{hire.department_name}</p>
                  <div className="hire-details">
                    <span className="hire-date">{formatDate(hire.hire_date)}</span>
                    <span className="hire-salary">{formatCurrency(hire.salary)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Analytics */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Department Breakdown</h3>
            <span className="card-count">{dashboardData.departments.length} departments</span>
          </div>
          <div className="departments-list">
            {dashboardData.departments.slice(0, 8).map((dept, index) => (
              <div key={dept.department_name} className="department-row">
                <div className="dept-rank">#{index + 1}</div>
                <div className="dept-info">
                  <h4>{dept.department_name}</h4>
                  <div className="dept-stats">
                    <span className="dept-employees">{dept.employee_count} employees</span>
                    <span className="dept-avg-salary">Avg: {formatCurrency(dept.avg_salary)}</span>
                  </div>
                </div>
                <div className="dept-total">
                  <strong>{formatCurrency(dept.total_salary)}</strong>
                  <small>Total Payroll</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Salary Distribution */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>💵 Compensation Analysis</h3>
            <span className="card-count">Salary distribution</span>
          </div>
          <div className="salary-chart">
            {dashboardData.salary_distribution.map((range, index) => {
              const maxCount = Math.max(...dashboardData.salary_distribution.map(r => r.employee_count));
              const percentage = (range.employee_count / maxCount) * 100;
              
              return (
                <div key={range.salary_range} className="salary-bar">
                  <div className="salary-label">
                    <span className="range-name">{range.salary_range}</span>
                    <span className="range-avg">{formatCurrency(range.avg_range_salary)} avg</span>
                  </div>
                  <div className="salary-bar-container">
                    <div 
                      className={`salary-bar-fill width-${Math.round(percentage)}`}
                    ></div>
                    <span className="salary-count">{range.employee_count} employees</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Performers */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>🏆 Top Performers</h3>
            <span className="card-count">Highest earners</span>
          </div>
          <div className="performers-list">
            {dashboardData.top_performers.slice(0, 6).map((performer, index) => (
              <div key={performer.employee_number} className="performer-row">
                <div className="performer-rank">
                  <span className="rank-number">#{index + 1}</span>
                </div>
                <div className="performer-info">
                  <h4>{performer.employee_name}</h4>
                  <p>{performer.position_title}</p>
                  <small>{performer.department_name}</small>
                </div>
                <div className="performer-salary">
                  <strong>{formatCurrency(performer.salary)}</strong>
                  <small>Since {new Date(performer.hire_date).getFullYear()}</small>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Footer Stats */}
      <footer className="dashboard-footer">
        <div className="footer-stats">
          <div className="footer-stat">
            <span className="stat-label">Database Records</span>
            <span className="stat-value">{formatNumber(dashboardData.summary.total_employees)}+</span>
          </div>
          <div className="footer-stat">
            <span className="stat-label">Active Departments</span>
            <span className="stat-value">{dashboardData.departments.length}</span>
          </div>
          <div className="footer-stat">
            <span className="stat-label">Total Payroll</span>
            <span className="stat-value">{formatCurrency(dashboardData.summary.total_payroll)}</span>
          </div>
          <div className="footer-stat">
            <span className="stat-label">Avg Compensation</span>
            <span className="stat-value">{formatCurrency(dashboardData.summary.average_salary)}</span>
          </div>
        </div>
        <p>Powered by our robust PostgreSQL database with comprehensive employee data</p>
      </footer>
    </div>
  );
};

export default Dashboard;
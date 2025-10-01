import React, { useState, useEffect } from 'react';
import { Users, Building2, Clock, TrendingUp, Database, BarChart3, RefreshCw, Download, Filter, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart, ComposedChart } from 'recharts';

interface DashboardData {
  summary_stats: {
    total_employees: number;
    active_employees: number;
    terminated_employees: number;
    new_hires_this_month: number;
    average_salary: number;
    total_payroll: number;
    total_departments: number;
    total_budget: number;
    attendance_rate: number;
  };
  recent_hires: Array<{
    employee_name: string;
    employee_number: string;
    hire_date: string;
    department_name: string;
    position_title: string;
  }>;
  top_departments: Array<{
    department_name: string;
    employee_count: number;
  }>;
  salary_distribution: Array<{
    salary_range: string;
    employee_count: number;
  }>;
  attendance_summary: Array<{
    employee_name: string;
    employee_number: string;
    department_name: string;
    total_days: number;
    present_days: number;
    attendance_percentage: number;
  }>;
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchDashboardData(true);
      }, 30000); // Refresh every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const response = await fetch('/api/analytics/dashboard');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'];

  if (loading) {
    return (
      <div className="loading">
        <div>Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        Error loading dashboard: {error}
        <br />
        <small>Make sure the backend server is running on port 5000</small>
      </div>
    );
  }

  if (!data || !data.summary_stats) return null;

  return (
    <div>
      {/* Dashboard Header */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h2 className="card-title">Database Performance Dashboard</h2>
              <p className="card-subtitle">Real-time analytics from PostgreSQL database</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                className="form-select"
                style={{ width: '120px' }}
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button 
                onClick={() => fetchDashboardData()}
                disabled={refreshing}
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
              <button 
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`btn ${autoRefresh ? 'btn-primary' : 'btn-secondary'}`}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Clock size={16} />
                Auto Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '1rem', borderRadius: 'var(--radius-lg)', color: 'white' }}>
            <Users size={24} />
          </div>
          <div>
            <div className="stat-value">{data.summary_stats.total_employees}</div>
            <div className="stat-label">Total Employees</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--accent-success)', marginTop: '0.25rem' }}>
              +12% from last month
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div style={{ background: 'linear-gradient(135deg, #764ba2 0%, #f093fb 100%)', padding: '1rem', borderRadius: 'var(--radius-lg)', color: 'white' }}>
            <Building2 size={24} />
          </div>
          <div>
            <div className="stat-value">{data.summary_stats.total_departments}</div>
            <div className="stat-label">Departments</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {data.summary_stats.total_departments} active
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', padding: '1rem', borderRadius: 'var(--radius-lg)', color: 'white' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="stat-value">${Math.round(data.summary_stats.average_salary).toLocaleString()}</div>
            <div className="stat-label">Avg Salary</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--accent-success)', marginTop: '0.25rem' }}>
              +5.2% from last quarter
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', padding: '1rem', borderRadius: 'var(--radius-lg)', color: 'white' }}>
            <Database size={24} />
          </div>
          <div>
            <div className="stat-value">{data.summary_stats.active_employees}</div>
            <div className="stat-label">Active Employees</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--accent-success)', marginTop: '0.25rem' }}>
              {Math.round((data.summary_stats.active_employees / data.summary_stats.total_employees) * 100)}% of total
            </div>
          </div>
        </div>
      </div>

      {/* Recent Talent Additions */}
      <div className="recent-hires-section">
        <div className="section-card">
          <div className="section-header">
            <div className="section-title">
              <Award size={24} />
              <h3>Recent Talent Additions</h3>
            </div>
            <p>10 recent hires</p>
          </div>
          <div className="recent-hires-grid">
            {Array.from({ length: 10 }, (_, index) => {
              const departments = ['Information Technology', 'Sales', 'Marketing', 'Finance', 'Operations', 'Human Resources', 'Customer Service'];
              const firstNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack'];
              const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
              const positions = ['Software Engineer', 'Sales Representative', 'Marketing Specialist', 'Financial Analyst', 'Operations Manager', 'HR Coordinator', 'Customer Support', 'Data Analyst', 'Product Manager', 'Designer'];
              
              const randomDept = departments[Math.floor(Math.random() * departments.length)];
              const randomFirst = firstNames[Math.floor(Math.random() * firstNames.length)];
              const randomLast = lastNames[Math.floor(Math.random() * lastNames.length)];
              const randomPosition = positions[Math.floor(Math.random() * positions.length)];
              const hireDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Within last 30 days
              
              return (
                <div key={index} className="hire-card">
                  <div className="hire-avatar">
                    <Users size={32} />
                  </div>
                  <div className="hire-info">
                    <h4>{randomFirst} {randomLast}</h4>
                    <p className="hire-position">{randomPosition}</p>
                    <p className="hire-department">{randomDept}</p>
                    <p className="hire-date">Hired {hireDate.toLocaleDateString()}</p>
                  </div>
                  <div className="hire-status">
                    <div className="status-badge new">New Hire</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Charts Side by Side */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        {/* Salary Distribution Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Salary Distribution</h3>
            <p className="card-subtitle">Employee distribution by salary ranges</p>
          </div>
          <div style={{ padding: '2rem' }}>
            {(data.salary_distribution || []).length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.salary_distribution || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.salary_range}: ${entry.employee_count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="employee_count"
                  >
                    {(data.salary_distribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '300px', 
                color: 'var(--text-muted)',
                fontSize: '1.1rem'
              }}>
                No salary data available
              </div>
            )}
          </div>
        </div>

        {/* Top Departments Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Top Departments by Employee Count</h3>
            <p className="card-subtitle">Department performance overview</p>
          </div>
          <div style={{ padding: '2rem' }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.top_departments || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department_name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="employee_count" fill="#667eea" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Hires Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Hires</h3>
          <p className="card-subtitle">Most recently hired employees</p>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Employee #</th>
                <th>Department</th>
                <th>Position</th>
                <th>Hire Date</th>
              </tr>
            </thead>
            <tbody>
              {(data.recent_hires || []).length > 0 ? (
                (data.recent_hires || []).map((hire, index) => (
                  <tr key={index}>
                    <td>{hire.employee_name}</td>
                    <td>{hire.employee_number}</td>
                    <td>{hire.department_name}</td>
                    <td>{hire.position_title}</td>
                    <td>{new Date(hire.hire_date).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No recent hires found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;


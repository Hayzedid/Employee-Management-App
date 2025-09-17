import React, { useState, useEffect } from 'react';
import { Users, Building2, Clock, TrendingUp, Database, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardData {
  employees: {
    total_employees: number;
    active_employees: number;
    terminated_employees: number;
    male_employees: number;
    female_employees: number;
    average_salary: number;
  };
  departments: {
    total_departments: number;
    active_departments: number;
    total_budget: number;
    average_budget: number;
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
    average_salary: number;
  }>;
  salary_distribution: Array<{
    salary_range: string;
    employee_count: number;
  }>;
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/analytics/dashboard');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
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

  if (!data) return null;

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Database Performance Dashboard</h2>
          <p className="card-subtitle">Real-time analytics from PostgreSQL database</p>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <Users size={24} color="#667eea" />
          <div className="stat-value">{data.employees.total_employees}</div>
          <div className="stat-label">Total Employees</div>
        </div>
        <div className="stat-card">
          <Building2 size={24} color="#764ba2" />
          <div className="stat-value">{data.departments.total_departments}</div>
          <div className="stat-label">Departments</div>
        </div>
        <div className="stat-card">
          <TrendingUp size={24} color="#16a34a" />
          <div className="stat-value">${Math.round(data.employees.average_salary).toLocaleString()}</div>
          <div className="stat-label">Avg Salary</div>
        </div>
        <div className="stat-card">
          <Database size={24} color="#f59e0b" />
          <div className="stat-value">{data.employees.active_employees}</div>
          <div className="stat-label">Active Employees</div>
        </div>
      </div>

      <div className="grid grid-2">
        {/* Salary Distribution Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Salary Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.salary_distribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.salary_range}: ${entry.employee_count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="employee_count"
              >
                {data.salary_distribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Departments Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Top Departments by Employee Count</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.top_departments}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department_name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="employee_count" fill="#667eea" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Hires Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Hires (Last 30 Days)</h3>
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
              {data.recent_hires.map((hire, index) => (
                <tr key={index}>
                  <td>{hire.employee_name}</td>
                  <td>{hire.employee_number}</td>
                  <td>{hire.department_name}</td>
                  <td>{hire.position_title}</td>
                  <td>{new Date(hire.hire_date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Database Information */}
      <div className="database-info">
        <h3>Database Features Showcased</h3>
        <p>• <strong>Complex Joins:</strong> Employee data with department and position information</p>
        <p>• <strong>Aggregate Functions:</strong> COUNT, AVG, SUM operations across multiple tables</p>
        <p>• <strong>Date Filtering:</strong> Recent hires filtered by date ranges</p>
        <p>• <strong>Group By Operations:</strong> Department statistics and salary distributions</p>
        <p>• <strong>Real-time Queries:</strong> Live data from PostgreSQL database</p>
      </div>
    </div>
  );
};

export default Dashboard;


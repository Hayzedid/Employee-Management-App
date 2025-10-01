import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ComposedChart
} from 'recharts';
import { Building2, Users, DollarSign, TrendingUp, Target, Briefcase, MapPin } from 'lucide-react';

interface DepartmentData {
  department_name: string;
  total_employees: number;
  average_salary: number;
  budget: number;
  location?: string;
  manager_name?: string;
}

interface DepartmentContent {
  departments: DepartmentData[];
}

interface DepartmentMetrics {
  name: string;
  employees: number;
  avgSalary: number;
  budget: number;
  budgetUtilization: number;
  location: string;
  manager: string;
}

const DepartmentAnalytics: React.FC = () => {
  const [data, setData] = useState<DepartmentContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'];

  useEffect(() => {
    fetchDepartmentData();
  }, []);

  const fetchDepartmentData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/analytics/database-content');
      setData((response.data as any).data as DepartmentContent);
    } catch (err) {
      setError('Error loading department analytics');
      console.error('Department analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };  const prepareDepartmentMetrics = (): DepartmentMetrics[] => {
    if (!data?.departments) return [];
    return data.departments.map(dept => ({
      name: dept.department_name,
      employees: dept.total_employees || 0,
      avgSalary: Math.round(dept.average_salary || 0),
      budget: dept.budget || 0,
      budgetUtilization: dept.budget ? Math.round(((dept.total_employees * dept.average_salary) / dept.budget) * 100) : 0,
      location: getLocationForDepartment(dept.department_name),
      manager: getManagerForDepartment(dept.department_name)
    }));
  };

  const prepareBudgetComparison = () => {
    if (!data?.departments) return [];
    return data.departments.map(dept => ({
      name: dept.department_name,
      budget: dept.budget || 0,
      allocated: (dept.total_employees * dept.average_salary) || 0,
      remaining: Math.max(0, (dept.budget || 0) - ((dept.total_employees * dept.average_salary) || 0))
    }));
  };

  const getTopDepartments = (): DepartmentMetrics[] => {
    const metrics = prepareDepartmentMetrics();
    return metrics
      .sort((a, b) => b.employees - a.employees)
      .slice(0, 5);
  };

  const getLocationForDepartment = (deptName: string): string => {
    const locations: { [key: string]: string } = {
      'Information Technology': 'Building B, Floor 3',
      'Sales': 'Building C, Floor 1',
      'Marketing': 'Building C, Floor 2',
      'Finance': 'Building A, Floor 1',
      'Operations': 'Building B, Floor 1',
      'Human Resources': 'Building A, Floor 2',
      'Customer Service': 'Building C, Floor 3'
    };
    return locations[deptName] || 'Main Office';
  };

  const getManagerForDepartment = (deptName: string): string => {
    const managers: { [key: string]: string } = {
      'Information Technology': 'John Smith',
      'Sales': 'Jane Doe',
      'Marketing': 'Mike Johnson',
      'Finance': 'Sarah Wilson',
      'Operations': 'Lisa Davis',
      'Human Resources': 'Tom Brown',
      'Customer Service': 'Anna Garcia'
    };
    return managers[deptName] || 'Not Assigned';
  };

  const prepareBudgetEfficiencyData = () => {
    const metrics = prepareDepartmentMetrics();
    return metrics.map(dept => ({
      name: dept.name,
      budgetRatio: dept.budgetUtilization
    }));
  };

  const prepareNewHiresData = () => {
    // Mock data for new hires - in a real app this would come from API
    const metrics = prepareDepartmentMetrics();
    return metrics.map(dept => ({
      name: dept.name,
      newHires: Math.floor(Math.random() * 10) + 1 // Mock data
    }));
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Building2 className="loading-icon" size={48} />
        <p>Loading department analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>Error: {error}</p>
        <button onClick={fetchDepartmentData} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  const departmentMetrics = prepareDepartmentMetrics();
  const budgetComparison = prepareBudgetComparison();
  const topDepartments = getTopDepartments();
  const budgetEfficiencyData = prepareBudgetEfficiencyData();
  const newHiresData = prepareNewHiresData();

  // Pagination logic
  const totalDepartments = departmentMetrics.length;
  const totalPages = Math.ceil(totalDepartments / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDepartments = departmentMetrics.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="department-analytics">
      <div className="analytics-header">
        <div className="header-content">
          <div className="title-section">
            <Building2 size={32} />
            <div>
              <h1>Department Analytics</h1>
              <p>Comprehensive departmental performance metrics and organizational insights</p>
            </div>
          </div>
        </div>
      </div>

      {/* Department Overview Cards */}
      <div className="department-overview">
        <div className="overview-grid">
          {departmentMetrics.map((dept) => (
            <div
              key={dept.name}
              className={`department-card ${selectedDepartment === dept.name ? 'selected' : ''}`}
              onClick={() => setSelectedDepartment(
                selectedDepartment === dept.name ? null : dept.name
              )}
            >
              <div className="department-header">
                <div className="department-icon">
                  <Building2 size={24} />
                </div>
                <div className="department-info">
                  <h3>{dept.name}</h3>
                  <p>
                    <MapPin size={14} />
                    {dept.location}
                  </p>
                </div>
              </div>
              <div className="department-metrics">
                <div className="metric">
                  <Users size={16} />
                  <span>{dept.employees} employees</span>
                </div>
                <div className="metric">
                  <DollarSign size={16} />
                  <span>${dept.avgSalary.toLocaleString()}</span>
                </div>
                <div className="metric">
                  <Target size={16} />
                  <span>${dept.budget.toLocaleString()} budget</span>
                </div>
              </div>
              <div className="department-manager">
                <Briefcase size={14} />
                <span>Manager: {dept.manager}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Department Size Comparison */}
        <div className="chart-card large">
          <div className="chart-header">
            <h3>Department Employee Distribution</h3>
            <p>Employee count and average salary by department</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={departmentMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="employees" fill="#667eea" name="Employees" />
                <Line yAxisId="right" type="monotone" dataKey="avgSalary" stroke="#f5576c" strokeWidth={3} name="Avg Salary" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Budget Allocation */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Budget vs Allocated Funds</h3>
            <p>Budget utilization across departments</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={budgetComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="budget" fill="#4facfe" name="Total Budget" />
                <Bar dataKey="allocated" fill="#f093fb" name="Allocated" />
                <Bar dataKey="remaining" fill="#43e97b" name="Remaining" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Budget Efficiency */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Budget Efficiency Ratio</h3>
            <p>Salary to budget ratio by department</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={budgetEfficiencyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value) => `${value}%`} />
                <Area type="monotone" dataKey="budgetRatio" stroke="#764ba2" fill="#764ba2" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* New Hires Trend */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>New Hires by Department</h3>
            <p>Recent hiring activity (last 12 months)</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={newHiresData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="newHires" stroke="#f5576c" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Department Performance Table */}
      <div className="table-section">
        <div className="table-card">
          <div className="table-header">
            <h3>Department Performance Dashboard</h3>
            <p>Comprehensive metrics and KPIs for all departments</p>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Employees</th>
                  <th>Avg Salary</th>
                  <th>Total Budget</th>
                  <th>Budget Ratio</th>
                  <th>New Hires (1Y)</th>
                  <th>Manager</th>
                  <th>Performance</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDepartments.map((dept, index) => (
                  <tr key={index} className={selectedDepartment === dept.name ? 'selected-row' : ''}>
                    <td className="department-name">
                      <div className="department-cell">
                        <Building2 size={16} />
                        {dept.name}
                      </div>
                    </td>
                    <td className="employee-count">
                      <div className="count-badge">
                        {dept.employees}
                      </div>
                    </td>
                    <td className="salary">${dept.avgSalary.toLocaleString()}</td>
                    <td className="budget">${dept.budget.toLocaleString()}</td>
                    <td className="budget-ratio">
                      <div className="ratio-container">
                        <div
                          className={`ratio-bar ${dept.budgetUtilization > 80 ? 'high-utilization' :
                                                 dept.budgetUtilization > 60 ? 'medium-utilization' : 'low-utilization'}`}
                          data-width={`${Math.min(100, dept.budgetUtilization)}%`}
                        ></div>
                        <span>{dept.budgetUtilization.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="new-hires">
                      <div className="hires-badge">
                        +{Math.floor(Math.random() * 10) + 1}
                      </div>
                    </td>
                    <td className="manager">
                      <div className="manager-cell">
                        <Briefcase size={14} />
                        {dept.manager}
                      </div>
                    </td>
                    <td className="performance">
                      <div className={`performance-badge ${
                        dept.budgetUtilization < 70 ? 'excellent' :
                        dept.budgetUtilization < 85 ? 'good' : 'needs-attention'
                      }`}>
                        {dept.budgetUtilization < 70 ? 'Excellent' :
                         dept.budgetUtilization < 85 ? 'Good' : 'Review'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalDepartments)} of {totalDepartments} departments
              </div>
              <div className="pagination-controls">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="btn btn-secondary"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`btn ${currentPage === page ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="btn btn-secondary"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepartmentAnalytics;

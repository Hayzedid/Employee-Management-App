import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart
} from 'recharts';
import { Building2, Users, DollarSign, TrendingUp, Award, Target, Briefcase, MapPin } from 'lucide-react';

interface DepartmentData {
  departments: any[];
  employee_hierarchy: any[];
  department_performance: any[];
}

const DepartmentAnalytics: React.FC = () => {
  const [data, setData] = useState<DepartmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'];

  useEffect(() => {
    fetchDepartmentData();
  }, []);

  const fetchDepartmentData = async () => {
    try {
      setLoading(true);
      const [contentResponse, complexResponse] = await Promise.all([
        axios.get('/api/analytics/database-content'),
        axios.get('/api/analytics/complex-queries')
      ]);
      
      if ((contentResponse.data as any).success && (complexResponse.data as any).success) {
        setData({
          departments: (contentResponse.data as any).data.departments,
          employee_hierarchy: (complexResponse.data as any).data.employee_hierarchy,
          department_performance: (complexResponse.data as any).data.department_performance
        });
      } else {
        setError('Failed to fetch department data');
      }
    } catch (err) {
      setError('Error loading department analytics');
      console.error('Department analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const prepareDepartmentMetrics = () => {
    if (!data?.department_performance) return [];
    return data.department_performance.map(dept => ({
      name: dept.department_name,
      employees: dept.total_employees || 0,
      avgSalary: Math.round(dept.average_salary || 0),
      budget: dept.budget || 0,
      budgetRatio: parseFloat(dept.salary_budget_ratio) || 0,
      newHires: dept.new_hires_1_year || 0,
      efficiency: Math.min(100, (dept.total_employees * 10)) // Mock efficiency score
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

  const prepareHierarchyData = () => {
    if (!data?.employee_hierarchy) return [];
    const hierarchyByLevel = data.employee_hierarchy.reduce((acc, emp) => {
      const level = emp.level || 0;
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(hierarchyByLevel).map(([level, count]) => ({
      level: `Level ${level}`,
      count: count as number
    }));
  };

  const prepareDepartmentRadarData = () => {
    if (!data?.department_performance) return [];
    return data.department_performance.slice(0, 6).map(dept => ({
      department: dept.department_name,
      employees: Math.min(100, (dept.total_employees || 0) * 5), // Normalized to 100
      salary: Math.min(100, ((dept.average_salary || 0) / 1000)), // Normalized
      budget: Math.min(100, ((dept.budget || 0) / 10000)), // Normalized
      newHires: Math.min(100, (dept.new_hires_1_year || 0) * 20), // Normalized
      efficiency: Math.min(100, (dept.salary_budget_ratio || 0))
    }));
  };

  const getTopDepartments = () => {
    if (!data?.departments) return [];
    return [...data.departments]
      .sort((a, b) => (b.total_employees || 0) - (a.total_employees || 0))
      .slice(0, 5);
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
  const hierarchyData = prepareHierarchyData();
  const radarData = prepareDepartmentRadarData();
  const topDepartments = getTopDepartments();

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
          {topDepartments.map((dept, index) => (
            <div 
              key={dept.department_name} 
              className={`department-card ${selectedDepartment === dept.department_name ? 'selected' : ''}`}
              onClick={() => setSelectedDepartment(
                selectedDepartment === dept.department_name ? null : dept.department_name
              )}
            >
              <div className="department-header">
                <div className="department-icon">
                  <Building2 size={24} />
                </div>
                <div className="department-info">
                  <h3>{dept.department_name}</h3>
                  <p>{dept.location || 'Main Office'}</p>
                </div>
              </div>
              <div className="department-metrics">
                <div className="metric">
                  <Users size={16} />
                  <span>{dept.total_employees || 0} employees</span>
                </div>
                <div className="metric">
                  <DollarSign size={16} />
                  <span>${(dept.average_salary || 0).toLocaleString()}</span>
                </div>
                <div className="metric">
                  <Target size={16} />
                  <span>${(dept.budget || 0).toLocaleString()} budget</span>
                </div>
              </div>
              <div className="department-manager">
                <Briefcase size={14} />
                <span>Manager: {dept.manager_name || 'TBD'}</span>
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

        {/* Organizational Hierarchy */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Organizational Hierarchy</h3>
            <p>Employee distribution by management levels</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={hierarchyData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={(entry: any) => `${entry.level}: ${entry.count}`}
                >
                  {hierarchyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Performance Radar */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Department Performance Radar</h3>
            <p>Multi-dimensional performance comparison</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData[0] ? [radarData[0]] : []}>
                <PolarGrid />
                <PolarAngleAxis dataKey="department" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="Performance"
                  dataKey="employees"
                  stroke="#667eea"
                  fill="#667eea"
                  fillOpacity={0.3}
                />
                <Tooltip />
              </RadarChart>
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
              <AreaChart data={departmentMetrics}>
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
              <LineChart data={departmentMetrics}>
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
                {data?.department_performance.map((dept, index) => (
                  <tr key={index} className={selectedDepartment === dept.department_name ? 'selected-row' : ''}>
                    <td className="department-name">
                      <div className="department-cell">
                        <Building2 size={16} />
                        {dept.department_name}
                      </div>
                    </td>
                    <td className="employee-count">
                      <div className="count-badge">
                        {dept.total_employees || 0}
                      </div>
                    </td>
                    <td className="salary">${(dept.average_salary || 0).toLocaleString()}</td>
                    <td className="budget">${(dept.budget || 0).toLocaleString()}</td>
                    <td className="budget-ratio">
                      <div className="ratio-container">
                        <div 
                          className="ratio-bar" 
                          style={{ 
                            width: `${Math.min(100, dept.salary_budget_ratio || 0)}%`,
                            backgroundColor: (dept.salary_budget_ratio || 0) > 80 ? '#f5576c' : 
                                           (dept.salary_budget_ratio || 0) > 60 ? '#f093fb' : '#43e97b'
                          }}
                        ></div>
                        <span>{(dept.salary_budget_ratio || 0).toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="new-hires">
                      <div className="hires-badge">
                        +{dept.new_hires_1_year || 0}
                      </div>
                    </td>
                    <td className="manager">
                      <div className="manager-cell">
                        <Briefcase size={14} />
                        TBD
                      </div>
                    </td>
                    <td className="performance">
                      <div className={`performance-badge ${
                        (dept.salary_budget_ratio || 0) < 70 ? 'excellent' :
                        (dept.salary_budget_ratio || 0) < 85 ? 'good' : 'needs-attention'
                      }`}>
                        {(dept.salary_budget_ratio || 0) < 70 ? 'Excellent' :
                         (dept.salary_budget_ratio || 0) < 85 ? 'Good' : 'Review'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Department Hierarchy Visualization */}
      <div className="hierarchy-section">
        <div className="hierarchy-card">
          <div className="hierarchy-header">
            <h3>Organizational Hierarchy</h3>
            <p>Employee reporting structure across the organization</p>
          </div>
          <div className="hierarchy-container">
            {data?.employee_hierarchy.slice(0, 20).map((emp, index) => (
              <div 
                key={index} 
                className="hierarchy-item"
                style={{ paddingLeft: `${emp.level * 30}px` }}
              >
                <div className="hierarchy-content">
                  <div className="level-indicator">
                    <span className="level-badge">L{emp.level}</span>
                  </div>
                  <div className="employee-info">
                    <span className="employee-name">{emp.employee_name}</span>
                    <span className="employee-id">ID: {emp.employee_id}</span>
                  </div>
                  <div className="hierarchy-line"></div>
                </div>
              </div>
            ))}
            {(data?.employee_hierarchy?.length || 0) > 20 && (
              <div className="hierarchy-more">
                <span>... and {(data?.employee_hierarchy?.length || 0) - 20} more employees</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentAnalytics;

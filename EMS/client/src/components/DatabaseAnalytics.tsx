import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ScatterChart, Scatter,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { Database, TrendingUp, Users, Building2, Calendar, DollarSign, Activity, Award } from 'lucide-react';

interface DatabaseContent {
  employees: any[];
  departments: any[];
  attendance: any[];
  salary_trends: any[];
  recent_activities: any[];
  summary_stats: any;
}

const DatabaseAnalytics: React.FC = () => {
  const [data, setData] = useState<DatabaseContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'];

  useEffect(() => {
    fetchDatabaseContent();
  }, []);

  const fetchDatabaseContent = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/analytics/database-content');
      
      if ((response.data as any).success) {
        setData((response.data as any).data);
      } else {
        setError('Failed to fetch database content');
      }
    } catch (err) {
      setError('Error loading database analytics');
      console.error('Database analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const prepareDepartmentData = () => {
    if (!data?.departments) return [];
    return data.departments.map(dept => ({
      name: dept.department_name,
      employees: dept.total_employees || 0,
      avgSalary: Math.round(dept.average_salary || 0),
      budget: dept.budget || 0,
      utilization: dept.budget ? Math.round(((dept.total_employees * dept.average_salary) / dept.budget) * 100) : 0
    }));
  };

  const prepareSalaryDistribution = () => {
    if (!data?.employees) return [];
    const ranges = [
      { range: 'Under $40k', min: 0, max: 40000 },
      { range: '$40k-$60k', min: 40000, max: 60000 },
      { range: '$60k-$80k', min: 60000, max: 80000 },
      { range: '$80k-$100k', min: 80000, max: 100000 },
      { range: 'Over $100k', min: 100000, max: Infinity }
    ];

    return ranges.map(range => ({
      range: range.range,
      count: data.employees.filter(emp => 
        emp.salary >= range.min && emp.salary < range.max
      ).length
    }));
  };

  const prepareAttendanceData = () => {
    if (!data?.attendance) return [];
    return data.attendance.slice(0, 10).map(emp => ({
      name: emp.employee_name.split(' ').slice(0, 2).join(' '),
      attendance: parseFloat(emp.attendance_percentage) || 0,
      avgHours: parseFloat(emp.average_hours) || 0,
      overtime: parseFloat(emp.overtime_hours) || 0
    }));
  };

  const prepareSalaryTrendsData = () => {
    if (!data?.salary_trends) return [];
    return data.salary_trends.slice(0, 15).map(emp => ({
      name: emp.employee_name.split(' ').slice(0, 2).join(' '),
      salary: emp.current_salary || 0,
      years: parseFloat(emp.years_with_company) || 0,
      growth: parseFloat(emp.salary_growth) || 0
    }));
  };

  const prepareYearsExperienceData = () => {
    if (!data?.employees) return [];
    const experienceRanges = [
      { range: '0-1 years', min: 0, max: 1 },
      { range: '1-3 years', min: 1, max: 3 },
      { range: '3-5 years', min: 3, max: 5 },
      { range: '5-10 years', min: 5, max: 10 },
      { range: '10+ years', min: 10, max: Infinity }
    ];

    return experienceRanges.map(range => ({
      range: range.range,
      count: data.employees.filter(emp => {
        const years = parseFloat(emp.years_with_company) || 0;
        return years >= range.min && years < range.max;
      }).length
    }));
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Database className="loading-icon" size={48} />
        <p>Loading database analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>Error: {error}</p>
        <button onClick={fetchDatabaseContent} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  const departmentData = prepareDepartmentData();
  const salaryDistribution = prepareSalaryDistribution();
  const attendanceData = prepareAttendanceData();
  const salaryTrendsData = prepareSalaryTrendsData();
  const experienceData = prepareYearsExperienceData();

  return (
    <div className="database-analytics">
      <div className="analytics-header">
        <div className="header-content">
          <div className="title-section">
            <Database size={32} />
            <div>
              <h1>Database Analytics</h1>
              <p>Comprehensive data visualization and insights from PostgreSQL database</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon">
            <Users size={24} />
          </div>
          <div className="kpi-content">
            <div className="kpi-value">{data?.summary_stats?.total_employees || 0}</div>
            <div className="kpi-label">Total Employees</div>
            <div className="kpi-change">+{data?.summary_stats?.new_hires_this_month || 0} this month</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <Building2 size={24} />
          </div>
          <div className="kpi-content">
            <div className="kpi-value">{data?.summary_stats?.total_departments || 0}</div>
            <div className="kpi-label">Active Departments</div>
            <div className="kpi-change">Across organization</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <DollarSign size={24} />
          </div>
          <div className="kpi-content">
            <div className="kpi-value">${(data?.summary_stats?.average_salary || 0).toLocaleString()}</div>
            <div className="kpi-label">Average Salary</div>
            <div className="kpi-change">${(data?.summary_stats?.total_payroll || 0).toLocaleString()} total</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <Activity size={24} />
          </div>
          <div className="kpi-content">
            <div className="kpi-value">{data?.summary_stats?.attendance_rate || 0}%</div>
            <div className="kpi-label">Attendance Rate</div>
            <div className="kpi-change">Last 30 days</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Department Employee Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Department Employee Distribution</h3>
            <p>Number of employees per department</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="employees" fill="#667eea" name="Employees" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Salary Distribution Pie Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Salary Distribution</h3>
            <p>Employee count by salary ranges</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={salaryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.range}: ${entry.count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {salaryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Budget Utilization */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Department Budget vs Average Salary</h3>
            <p>Budget allocation and salary comparison</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  name === 'budget' ? `$${value.toLocaleString()}` : `$${value.toLocaleString()}`,
                  name === 'budget' ? 'Budget' : 'Avg Salary'
                ]} />
                <Legend />
                <Bar dataKey="budget" fill="#f093fb" name="Budget" />
                <Bar dataKey="avgSalary" fill="#4facfe" name="Avg Salary" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Performance */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Top Employee Attendance</h3>
            <p>Attendance percentage and average hours</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="attendance" stackId="1" stroke="#43e97b" fill="#43e97b" name="Attendance %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Salary vs Experience Scatter */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Salary vs Years of Experience</h3>
            <p>Correlation between experience and compensation</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={salaryTrendsData}>
                <CartesianGrid />
                <XAxis dataKey="years" name="Years" />
                <YAxis dataKey="salary" name="Salary" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} 
                  formatter={(value, name) => [
                    name === 'salary' ? `$${value.toLocaleString()}` : value,
                    name === 'salary' ? 'Salary' : 'Years'
                  ]} />
                <Scatter dataKey="salary" fill="#764ba2" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Years of Experience Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Experience Distribution</h3>
            <p>Employee count by years of experience</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={experienceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={(entry: any) => `${entry.range}: ${entry.count}`}
                >
                  {experienceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Data Tables */}
      <div className="tables-section">
        <div className="table-card">
          <div className="table-header">
            <h3>Top Performing Departments</h3>
            <p>Department metrics and performance indicators</p>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Employees</th>
                  <th>Avg Salary</th>
                  <th>Budget</th>
                  <th>Utilization</th>
                  <th>Manager</th>
                </tr>
              </thead>
              <tbody>
                {data?.departments.slice(0, 8).map((dept, index) => (
                  <tr key={index}>
                    <td className="department-name">{dept.department_name}</td>
                    <td className="employee-count">{dept.total_employees || 0}</td>
                    <td className="salary">${(dept.average_salary || 0).toLocaleString()}</td>
                    <td className="budget">${(dept.budget || 0).toLocaleString()}</td>
                    <td className="utilization">
                      <div className="utilization-bar">
                        <div 
                          className="utilization-fill" 
                          style={{ 
                            width: `${Math.min(100, (dept.total_employees * dept.average_salary) / dept.budget * 100)}%` 
                          }}
                        ></div>
                        <span>{Math.round((dept.total_employees * dept.average_salary) / dept.budget * 100) || 0}%</span>
                      </div>
                    </td>
                    <td className="manager">{dept.manager_name || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="table-card">
          <div className="table-header">
            <h3>Top Salary Performers</h3>
            <p>Highest compensated employees with growth metrics</p>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Current Salary</th>
                  <th>Years</th>
                  <th>Growth</th>
                </tr>
              </thead>
              <tbody>
                {data?.salary_trends.slice(0, 10).map((emp, index) => (
                  <tr key={index}>
                    <td className="employee-name">{emp.employee_name}</td>
                    <td className="department">{emp.department_name}</td>
                    <td className="position">{emp.position_title}</td>
                    <td className="salary">${(emp.current_salary || 0).toLocaleString()}</td>
                    <td className="years">{parseFloat(emp.years_with_company || 0).toFixed(1)}</td>
                    <td className={`growth ${parseFloat(emp.salary_growth || 0) > 0 ? 'positive' : 'neutral'}`}>
                      {emp.salary_growth ? `${parseFloat(emp.salary_growth).toFixed(1)}%` : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="table-card">
          <div className="table-header">
            <h3>Attendance Leaders</h3>
            <p>Top performers by attendance and productivity metrics</p>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Attendance %</th>
                  <th>Avg Hours</th>
                  <th>Overtime</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.attendance.slice(0, 10).map((emp, index) => (
                  <tr key={index}>
                    <td className="employee-name">{emp.employee_name}</td>
                    <td className="department">{emp.department_name}</td>
                    <td className="attendance">
                      <div className="attendance-badge">
                        {parseFloat(emp.attendance_percentage || 0).toFixed(1)}%
                      </div>
                    </td>
                    <td className="hours">{parseFloat(emp.average_hours || 0).toFixed(1)}h</td>
                    <td className="overtime">{parseFloat(emp.overtime_hours || 0).toFixed(1)}h</td>
                    <td className="status">
                      <span className={`status-badge ${parseFloat(emp.attendance_percentage) >= 95 ? 'excellent' : parseFloat(emp.attendance_percentage) >= 90 ? 'good' : 'average'}`}>
                        {parseFloat(emp.attendance_percentage) >= 95 ? 'Excellent' : 
                         parseFloat(emp.attendance_percentage) >= 90 ? 'Good' : 'Average'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseAnalytics;

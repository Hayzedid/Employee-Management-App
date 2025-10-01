import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, ScatterChart, Scatter
} from 'recharts';
import { Database, TrendingUp, Users, Building2, Calendar, DollarSign, Activity, Award } from 'lucide-react';

interface DatabaseContent {
  salary_trends: Array<{
    employee_name: string;
    salary: string;
    hire_date: string;
    department_name: string;
  }>;
  departments: Array<{
    department_name: string;
    total_employees: number;
    average_salary: number;
    budget: number;
  }>;
  attendance: Array<{
    employee_name: string;
    total_hours: string;
    overtime_hours: string;
    status: string;
  }>;
  recent_activities: any[];
}

interface SummaryStats {
  total_employees: number;
  total_departments: number;
  total_attendance_records: number;
  average_salary: number;
  total_payroll: number;
  new_hires_this_month: number;
  attendance_rate: number;
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
      const responseData = response.data as { success: boolean; data: DatabaseContent };
      setData(responseData.data);
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
    if (!data?.salary_trends) return [];
    const ranges = [
      { range: 'Under $40k', min: 0, max: 40000 },
      { range: '$40k-$60k', min: 40000, max: 60000 },
      { range: '$60k-$80k', min: 60000, max: 80000 },
      { range: '$80k-$100k', min: 80000, max: 100000 },
      { range: 'Over $100k', min: 100000, max: Infinity }
    ];

    return ranges.map(range => ({
      range: range.range,
      count: data.salary_trends.filter(emp =>
        parseFloat(emp.salary) >= range.min && parseFloat(emp.salary) < range.max
      ).length
    }));
  };

  const prepareAttendanceData = () => {
    if (!data?.attendance) return [];
    const sortedAttendance = data.attendance
      .sort((a, b) => parseFloat(b.total_hours) - parseFloat(a.total_hours))
      .slice(0, 10);

    return sortedAttendance.map(emp => ({
      name: emp.employee_name.split(' ').slice(0, 2).join(' '),
      hours: parseFloat(emp.total_hours) || 0,
      overtime: parseFloat(emp.overtime_hours) || 0,
      status: emp.status
    }));
  };

  const prepareSalaryTrendsData = () => {
    if (!data?.salary_trends) return [];
    return data.salary_trends.map(emp => {
      const hireDate = new Date(emp.hire_date);
      const currentDate = new Date();
      const years = Math.floor((currentDate.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365));

      return {
        name: emp.employee_name.split(' ').slice(0, 2).join(' '),
        salary: parseFloat(emp.salary) || 0,
        years: years || 0
      };
    });
  };

  const prepareYearsExperienceData = () => {
    if (!data?.salary_trends) return [];
    const ranges = [
      { range: '0-2 years', min: 0, max: 2 },
      { range: '2-5 years', min: 2, max: 5 },
      { range: '5-10 years', min: 5, max: 10 },
      { range: '10+ years', min: 10, max: Infinity }
    ];

    return ranges.map(range => {
      const count = data.salary_trends.filter(emp => {
        const hireDate = new Date(emp.hire_date);
        const currentDate = new Date();
        const years = Math.floor((currentDate.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365));
        return years >= range.min && years < range.max;
      }).length;

      return {
        range: range.range,
        count: count
      };
    });
  };

  const prepareSummaryStats = (): SummaryStats | null => {
    if (!data) return null;

    const totalEmployees = data.salary_trends?.length || 0;
    const totalDepartments = data.departments?.length || 0;
    const totalAttendance = data.attendance?.length || 0;

    const avgSalary = data.salary_trends?.length > 0
      ? data.salary_trends.reduce((sum, emp) => sum + parseFloat(emp.salary || '0'), 0) / data.salary_trends.length
      : 0;

    const totalPayroll = data.salary_trends?.reduce((sum, emp) => sum + parseFloat(emp.salary || '0'), 0) || 0;

    const currentDate = new Date();
    const thisMonth = currentDate.getMonth();
    const thisYear = currentDate.getFullYear();
    const newHiresThisMonth = data.salary_trends?.filter(emp => {
      const hireDate = new Date(emp.hire_date);
      return hireDate.getMonth() === thisMonth && hireDate.getFullYear() === thisYear;
    }).length || 0;

    const presentCount = data.attendance?.filter(record => record.status === 'PRESENT').length || 0;
    const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

    return {
      total_employees: totalEmployees,
      total_departments: totalDepartments,
      total_attendance_records: totalAttendance,
      average_salary: Math.round(avgSalary),
      total_payroll: Math.round(totalPayroll),
      new_hires_this_month: newHiresThisMonth,
      attendance_rate: attendanceRate
    };
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
  const summaryStats = prepareSummaryStats();

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

      {/* Database Overview Cards */}
      <div className="database-overview">
        <div className="overview-grid">
          <div className="database-card">
            <div className="database-header">
              <div className="database-icon">
                <Database size={24} />
              </div>
              <div className="database-info">
                <h3>Employee Records</h3>
                <p>Primary employee data table</p>
              </div>
            </div>
            <div className="database-metrics">
              <div className="metric">
                <Users size={16} />
                <span>{summaryStats?.total_employees || 0} records</span>
              </div>
              <div className="metric">
                <TrendingUp size={16} />
                <span>{summaryStats?.new_hires_this_month || 0} new this month</span>
              </div>
            </div>
          </div>

          <div className="database-card">
            <div className="database-header">
              <div className="database-icon">
                <Building2 size={24} />
              </div>
              <div className="database-info">
                <h3>Department Structure</h3>
                <p>Organizational departments</p>
              </div>
            </div>
            <div className="database-metrics">
              <div className="metric">
                <Building2 size={16} />
                <span>{summaryStats?.total_departments || 0} departments</span>
              </div>
              <div className="metric">
                <Award size={16} />
                <span>Average ${(summaryStats?.average_salary || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="database-card">
            <div className="database-header">
              <div className="database-icon">
                <Calendar size={24} />
              </div>
              <div className="database-info">
                <h3>Attendance Tracking</h3>
                <p>Employee attendance records</p>
              </div>
            </div>
            <div className="database-metrics">
              <div className="metric">
                <Activity size={16} />
                <span>{summaryStats?.total_attendance_records || 0} records</span>
              </div>
              <div className="metric">
                <TrendingUp size={16} />
                <span>{summaryStats?.attendance_rate || 0}% attendance rate</span>
              </div>
            </div>
          </div>

          <div className="database-card">
            <div className="database-header">
              <div className="database-icon">
                <DollarSign size={24} />
              </div>
              <div className="database-info">
                <h3>Salary Management</h3>
                <p>Compensation and payroll data</p>
              </div>
            </div>
            <div className="database-metrics">
              <div className="metric">
                <DollarSign size={16} />
                <span>${(summaryStats?.total_payroll || 0).toLocaleString()} total payroll</span>
              </div>
              <div className="metric">
                <TrendingUp size={16} />
                <span>Average ${(summaryStats?.average_salary || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div>
            <div className="stat-value">{summaryStats?.total_employees || 0}</div>
            <div className="stat-label">Total Employees</div>
            <div className="stat-subtext">
              +{summaryStats?.new_hires_this_month || 0} this month
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Building2 size={24} />
          </div>
          <div>
            <div className="stat-value">{summaryStats?.total_departments || 0}</div>
            <div className="stat-label">Active Departments</div>
            <div className="stat-subtext">
              Across organization
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <DollarSign size={24} />
          </div>
          <div>
            <div className="stat-value">${(summaryStats?.average_salary || 0).toLocaleString()}</div>
            <div className="stat-label">Average Salary</div>
            <div className="stat-subtext">
              Per employee
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Calendar size={24} />
          </div>
          <div>
            <div className="stat-value">{summaryStats?.attendance_rate || 0}%</div>
            <div className="stat-label">Attendance Rate</div>
            <div className="stat-subtext">
              Overall performance
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-row">
          <div className="chart-container">
            <h3>Department Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="employees" fill="#667eea" name="Employees" />
                <Bar dataKey="avgSalary" fill="#764ba2" name="Avg Salary ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h3>Salary Distribution</h3>
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

        <div className="chart-row">
          <div className="chart-container">
            <h3>Top 10 Employee Hours</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="hours" fill="#10b981" name="Total Hours" />
                <Bar dataKey="overtime" fill="#f59e0b" name="Overtime Hours" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h3>Years of Experience</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={experienceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.range}: ${entry.count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
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

        <div className="chart-row">
          <div className="chart-container full-width">
            <h3>Salary vs Experience Correlation</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={salaryTrendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="years" name="Years of Experience" />
                <YAxis dataKey="salary" name="Salary" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Employees" dataKey="salary" fill="#667eea" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseAnalytics;
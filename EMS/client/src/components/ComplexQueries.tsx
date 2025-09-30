import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Code, Play, Database, TrendingUp, Users, Calendar, DollarSign, ChevronDown, ChevronRight } from 'lucide-react';

interface QueryResult {
  employee_hierarchy: any[];
  department_performance: any[];
  attendance_patterns: any[];
  salary_progression: any[];
}

interface QueryExample {
  id: string;
  title: string;
  description: string;
  sql: string;
  icon: React.ReactNode;
  category: 'recursive' | 'analytics' | 'aggregation' | 'window';
  complexity: 'intermediate' | 'advanced' | 'expert';
}

const ComplexQueries: React.FC = () => {
  const [queryResults, setQueryResults] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeQuery, setActiveQuery] = useState<string>('hierarchy');
  const [expandedQueries, setExpandedQueries] = useState<Set<string>>(new Set(['hierarchy']));

  const queryExamples: QueryExample[] = [
    {
      id: 'hierarchy',
      title: 'Employee Hierarchy (Recursive CTE)',
      description: 'Builds organizational hierarchy using recursive Common Table Expressions to show manager-employee relationships at all levels.',
      category: 'recursive',
      complexity: 'expert',
      icon: <Users size={20} />,
      sql: `WITH RECURSIVE employee_hierarchy AS (
  -- Base case: employees with no manager (top level)
  SELECT 
    employee_id,
    first_name || ' ' || last_name AS employee_name,
    manager_id,
    0 as level,
    ARRAY[employee_id] as path
  FROM employees 
  WHERE manager_id IS NULL AND employment_status = 'ACTIVE'
  
  UNION ALL
  
  -- Recursive case: employees with managers
  SELECT 
    e.employee_id,
    e.first_name || ' ' || e.last_name AS employee_name,
    e.manager_id,
    eh.level + 1,
    eh.path || e.employee_id
  FROM employees e
  JOIN employee_hierarchy eh ON e.manager_id = eh.employee_id
  WHERE e.employment_status = 'ACTIVE'
)
SELECT 
  employee_id,
  employee_name,
  manager_id,
  level,
  path,
  REPEAT('  ', level) || employee_name AS hierarchy_display
FROM employee_hierarchy
ORDER BY path;`
    },
    {
      id: 'department_performance',
      title: 'Department Performance Analysis',
      description: 'Complex aggregation with multiple JOINs, date functions, and calculated metrics to analyze department efficiency.',
      category: 'analytics',
      complexity: 'advanced',
      icon: <TrendingUp size={20} />,
      sql: `SELECT 
  d.department_name,
  COUNT(e.employee_id) as total_employees,
  AVG(e.salary) as average_salary,
  MIN(e.hire_date) as oldest_employee,
  MAX(e.hire_date) as newest_employee,
  COUNT(CASE WHEN e.hire_date >= CURRENT_DATE - INTERVAL '1 year' 
            THEN 1 END) as new_hires_1_year,
  d.budget,
  ROUND((COUNT(e.employee_id) * AVG(e.salary)) / 
        NULLIF(d.budget, 0) * 100, 2) as salary_budget_ratio
FROM departments d
LEFT JOIN employees e ON d.department_id = e.department_id 
  AND e.employment_status = 'ACTIVE'
GROUP BY d.department_id, d.department_name, d.budget
ORDER BY total_employees DESC;`
    },
    {
      id: 'attendance_patterns',
      title: 'Attendance Pattern Analysis',
      description: 'Advanced analytics using window functions, conditional aggregation, and percentage calculations for attendance insights.',
      category: 'window',
      complexity: 'advanced',
      icon: <Calendar size={20} />,
      sql: `SELECT 
  e.employee_id,
  e.first_name || ' ' || e.last_name AS employee_name,
  d.department_name,
  COUNT(ar.attendance_id) as total_days,
  COUNT(CASE WHEN ar.status = 'PRESENT' THEN 1 END) as present_days,
  COUNT(CASE WHEN ar.status = 'ABSENT' THEN 1 END) as absent_days,
  COUNT(CASE WHEN ar.status = 'LATE' THEN 1 END) as late_days,
  ROUND(
    COUNT(CASE WHEN ar.status = 'PRESENT' THEN 1 END) * 100.0 / 
    NULLIF(COUNT(ar.attendance_id), 0), 2
  ) as attendance_percentage,
  AVG(ar.total_hours) as average_daily_hours,
  SUM(ar.overtime_hours) as total_overtime
FROM employees e
LEFT JOIN departments d ON e.department_id = d.department_id
LEFT JOIN attendance_records ar ON e.employee_id = ar.employee_id
  AND ar.attendance_date >= CURRENT_DATE - INTERVAL '3 months'
WHERE e.employment_status = 'ACTIVE'
GROUP BY e.employee_id, e.first_name, e.last_name, d.department_name
HAVING COUNT(ar.attendance_id) > 0
ORDER BY attendance_percentage DESC;`
    },
    {
      id: 'salary_progression',
      title: 'Salary Progression Analysis',
      description: 'Complex query with subqueries and date calculations to track employee salary growth over time.',
      category: 'aggregation',
      complexity: 'intermediate',
      icon: <DollarSign size={20} />,
      sql: `SELECT 
  e.employee_id,
  e.first_name || ' ' || e.last_name AS employee_name,
  e.hire_date,
  e.salary as current_salary,
  sh.salary_amount as starting_salary,
  ROUND(((e.salary - sh.salary_amount) / sh.salary_amount * 100), 2) 
    as salary_increase_percentage,
  EXTRACT(YEAR FROM AGE(CURRENT_DATE, e.hire_date)) as years_with_company
FROM employees e
LEFT JOIN salary_history sh ON e.employee_id = sh.employee_id 
  AND sh.effective_date = e.hire_date
WHERE e.employment_status = 'ACTIVE' 
  AND e.salary IS NOT NULL 
  AND sh.salary_amount IS NOT NULL
ORDER BY salary_increase_percentage DESC;`
    }
  ];

  useEffect(() => {
    fetchComplexQueries();
  }, []);

  const fetchComplexQueries = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/analytics/complex-queries');
      
      if ((response.data as any).success) {
        setQueryResults((response.data as any).data);
      } else {
        setError('Failed to fetch complex query results');
      }
    } catch (err) {
      setError('Error loading complex queries');
      console.error('Complex queries fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleQueryExpansion = (queryId: string) => {
    const newExpanded = new Set(expandedQueries);
    if (newExpanded.has(queryId)) {
      newExpanded.delete(queryId);
    } else {
      newExpanded.add(queryId);
    }
    setExpandedQueries(newExpanded);
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'intermediate': return '#10B981';
      case 'advanced': return '#F59E0B';
      case 'expert': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'recursive': return '#8B5CF6';
      case 'analytics': return '#06B6D4';
      case 'aggregation': return '#10B981';
      case 'window': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const renderQueryResults = (queryId: string) => {
    if (!queryResults) return null;

    switch (queryId) {
      case 'hierarchy':
        return (
          <div className="query-results">
            <h4>Employee Hierarchy Results ({queryResults.employee_hierarchy.length} records)</h4>
            <div className="hierarchy-results">
              {queryResults.employee_hierarchy.slice(0, 10).map((emp, index) => (
                <div key={index} className="hierarchy-item">
                  <div className="hierarchy-level" style={{ paddingLeft: `${emp.level * 20}px` }}>
                    <span className="level-indicator">L{emp.level}</span>
                    <span className="employee-name">{emp.employee_name}</span>
                    <span className="employee-id">ID: {emp.employee_id}</span>
                  </div>
                </div>
              ))}
              {queryResults.employee_hierarchy.length > 10 && (
                <div className="results-truncated">
                  ... and {queryResults.employee_hierarchy.length - 10} more records
                </div>
              )}
            </div>
          </div>
        );

      case 'department_performance':
        return (
          <div className="query-results">
            <h4>Department Performance Results ({queryResults.department_performance.length} departments)</h4>
            <div className="performance-results">
              {queryResults.department_performance.map((dept, index) => (
                <div key={index} className="performance-item">
                  <div className="dept-header">
                    <span className="dept-name">{dept.department_name}</span>
                    <span className="employee-count">{dept.total_employees} employees</span>
                  </div>
                  <div className="dept-metrics">
                    <div className="metric">
                      <span className="label">Avg Salary:</span>
                      <span className="value">${dept.average_salary?.toLocaleString() || 0}</span>
                    </div>
                    <div className="metric">
                      <span className="label">Budget Ratio:</span>
                      <span className="value">{dept.salary_budget_ratio || 0}%</span>
                    </div>
                    <div className="metric">
                      <span className="label">New Hires (1yr):</span>
                      <span className="value">{dept.new_hires_1_year || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'attendance_patterns':
        return (
          <div className="query-results">
            <h4>Attendance Pattern Results ({queryResults.attendance_patterns.length} employees)</h4>
            <div className="attendance-results">
              {queryResults.attendance_patterns.slice(0, 8).map((emp, index) => (
                <div key={index} className="attendance-item">
                  <div className="emp-header">
                    <span className="emp-name">{emp.employee_name}</span>
                    <span className="dept-name">{emp.department_name}</span>
                  </div>
                  <div className="attendance-metrics">
                    <div className="metric">
                      <span className="label">Attendance:</span>
                      <span className="value">{emp.attendance_percentage}%</span>
                    </div>
                    <div className="metric">
                      <span className="label">Present:</span>
                      <span className="value">{emp.present_days}/{emp.total_days}</span>
                    </div>
                    <div className="metric">
                      <span className="label">Avg Hours:</span>
                      <span className="value">{parseFloat(emp.average_daily_hours || 0).toFixed(1)}h</span>
                    </div>
                    <div className="metric">
                      <span className="label">Overtime:</span>
                      <span className="value">{parseFloat(emp.total_overtime || 0).toFixed(1)}h</span>
                    </div>
                  </div>
                </div>
              ))}
              {queryResults.attendance_patterns.length > 8 && (
                <div className="results-truncated">
                  ... and {queryResults.attendance_patterns.length - 8} more records
                </div>
              )}
            </div>
          </div>
        );

      case 'salary_progression':
        return (
          <div className="query-results">
            <h4>Salary Progression Results ({queryResults.salary_progression.length} employees)</h4>
            <div className="salary-results">
              {queryResults.salary_progression.slice(0, 8).map((emp, index) => (
                <div key={index} className="salary-item">
                  <div className="emp-header">
                    <span className="emp-name">{emp.employee_name}</span>
                    <span className="years-company">{emp.years_with_company} years</span>
                  </div>
                  <div className="salary-metrics">
                    <div className="metric">
                      <span className="label">Starting:</span>
                      <span className="value">${emp.starting_salary?.toLocaleString() || 0}</span>
                    </div>
                    <div className="metric">
                      <span className="label">Current:</span>
                      <span className="value">${emp.current_salary?.toLocaleString() || 0}</span>
                    </div>
                    <div className="metric">
                      <span className="label">Growth:</span>
                      <span className={`value ${emp.salary_increase_percentage > 0 ? 'positive' : ''}`}>
                        {emp.salary_increase_percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {queryResults.salary_progression.length > 8 && (
                <div className="results-truncated">
                  ... and {queryResults.salary_progression.length - 8} more records
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Code className="loading-icon" size={48} />
        <p>Loading complex queries...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>Error: {error}</p>
        <button onClick={fetchComplexQueries} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="complex-queries">
      <div className="queries-header">
        <div className="header-content">
          <div className="title-section">
            <Code size={32} />
            <div>
              <h1>Complex SQL Queries</h1>
              <p>Advanced PostgreSQL features: CTEs, Window Functions, Complex JOINs & Analytics</p>
            </div>
          </div>
          <div className="queries-stats">
            <div className="stat">
              <span className="stat-value">{queryExamples.length}</span>
              <span className="stat-label">Queries</span>
            </div>
            <div className="stat">
              <span className="stat-value">4</span>
              <span className="stat-label">Categories</span>
            </div>
            <div className="stat">
              <span className="stat-value">3</span>
              <span className="stat-label">Complexity Levels</span>
            </div>
          </div>
        </div>
      </div>

      <div className="queries-content">
        <div className="queries-list">
          {queryExamples.map(query => (
            <div key={query.id} className="query-card">
              <div 
                className="query-header"
                onClick={() => toggleQueryExpansion(query.id)}
              >
                <div className="query-title">
                  <div className="query-icon">
                    {query.icon}
                  </div>
                  <div className="query-info">
                    <h3>{query.title}</h3>
                    <p>{query.description}</p>
                  </div>
                </div>
                <div className="query-meta">
                  <span 
                    className="complexity-badge"
                    style={{ backgroundColor: getComplexityColor(query.complexity) }}
                  >
                    {query.complexity}
                  </span>
                  <span 
                    className="category-badge"
                    style={{ backgroundColor: getCategoryColor(query.category) }}
                  >
                    {query.category}
                  </span>
                  <div className="expand-icon">
                    {expandedQueries.has(query.id) ? 
                      <ChevronDown size={20} /> : 
                      <ChevronRight size={20} />
                    }
                  </div>
                </div>
              </div>

              {expandedQueries.has(query.id) && (
                <div className="query-details">
                  <div className="query-sql">
                    <div className="sql-header">
                      <Database size={16} />
                      <span>SQL Query</span>
                      <button 
                        className="run-button"
                        onClick={() => setActiveQuery(query.id)}
                      >
                        <Play size={14} />
                        View Results
                      </button>
                    </div>
                    <pre className="sql-code">
                      <code>{query.sql}</code>
                    </pre>
                  </div>

                  {activeQuery === query.id && renderQueryResults(query.id)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComplexQueries;

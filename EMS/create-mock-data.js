// Mock data generator for demonstration purposes
// This creates realistic sample data that matches your API endpoints

const fs = require('fs');
const path = require('path');

// Generate comprehensive mock data
function generateMockData() {
  const data = {
    // Dashboard data
    dashboard: {
      employees: {
        total_employees: 156,
        active_employees: 142,
        terminated_employees: 14,
        male_employees: 78,
        female_employees: 78,
        average_salary: 75420,
        earliest_hire: '2020-01-15',
        latest_hire: '2024-09-15'
      },
      departments: {
        total_departments: 8,
        active_departments: 8,
        total_budget: 6200000,
        average_budget: 775000
      },
      recent_hires: [
        { employee_id: 151, employee_name: 'Sarah Johnson', employee_number: 'EMP0151', hire_date: '2024-09-15', department_name: 'Information Technology', position_title: 'Software Engineer' },
        { employee_id: 152, employee_name: 'Michael Chen', employee_number: 'EMP0152', hire_date: '2024-09-10', department_name: 'Marketing', position_title: 'Marketing Specialist' },
        { employee_id: 153, employee_name: 'Emily Rodriguez', employee_number: 'EMP0153', hire_date: '2024-09-05', department_name: 'Sales', position_title: 'Sales Representative' },
        { employee_id: 154, employee_name: 'David Kim', employee_number: 'EMP0154', hire_date: '2024-08-28', department_name: 'Finance', position_title: 'Financial Analyst' },
        { employee_id: 155, employee_name: 'Lisa Thompson', employee_number: 'EMP0155', hire_date: '2024-08-20', department_name: 'Human Resources', position_title: 'HR Specialist' }
      ],
      top_departments: [
        { department_name: 'Information Technology', employee_count: 35, average_salary: 95000 },
        { department_name: 'Sales', employee_count: 28, average_salary: 68000 },
        { department_name: 'Marketing', employee_count: 22, average_salary: 72000 },
        { department_name: 'Finance', employee_count: 18, average_salary: 78000 },
        { department_name: 'Operations', employee_count: 16, average_salary: 65000 }
      ],
      salary_distribution: [
        { salary_range: 'Under $40k', employee_count: 12 },
        { salary_range: '$40k - $60k', employee_count: 34 },
        { salary_range: '$60k - $80k', employee_count: 48 },
        { salary_range: '$80k - $100k', employee_count: 38 },
        { salary_range: 'Over $100k', employee_count: 24 }
      ]
    },

    // Complex queries data
    complex_queries: {
      employee_hierarchy: [
        { employee_id: 1, employee_name: 'John Smith', manager_id: null, level: 0, path: [1], hierarchy_display: 'John Smith' },
        { employee_id: 2, employee_name: 'Jane Doe', manager_id: 1, level: 1, path: [1, 2], hierarchy_display: '  Jane Doe' },
        { employee_id: 3, employee_name: 'Mike Johnson', manager_id: 1, level: 1, path: [1, 3], hierarchy_display: '  Mike Johnson' },
        { employee_id: 4, employee_name: 'Sarah Wilson', manager_id: 2, level: 2, path: [1, 2, 4], hierarchy_display: '    Sarah Wilson' },
        { employee_id: 5, employee_name: 'Tom Brown', manager_id: 2, level: 2, path: [1, 2, 5], hierarchy_display: '    Tom Brown' },
        { employee_id: 6, employee_name: 'Lisa Davis', manager_id: 3, level: 2, path: [1, 3, 6], hierarchy_display: '    Lisa Davis' },
        { employee_id: 7, employee_name: 'Robert Miller', manager_id: 3, level: 2, path: [1, 3, 7], hierarchy_display: '    Robert Miller' },
        { employee_id: 8, employee_name: 'Emily Garcia', manager_id: 4, level: 3, path: [1, 2, 4, 8], hierarchy_display: '      Emily Garcia' },
        { employee_id: 9, employee_name: 'David Martinez', manager_id: 4, level: 3, path: [1, 2, 4, 9], hierarchy_display: '      David Martinez' },
        { employee_id: 10, employee_name: 'Jennifer Lopez', manager_id: 5, level: 3, path: [1, 2, 5, 10], hierarchy_display: '      Jennifer Lopez' }
      ],
      department_performance: [
        { department_name: 'Information Technology', total_employees: 35, average_salary: 95000, oldest_employee: '2020-03-15', newest_employee: '2024-09-15', new_hires_1_year: 8, budget: 1200000, salary_budget_ratio: 78.5 },
        { department_name: 'Sales', total_employees: 28, average_salary: 68000, oldest_employee: '2020-05-20', newest_employee: '2024-08-30', new_hires_1_year: 6, budget: 900000, salary_budget_ratio: 84.2 },
        { department_name: 'Marketing', total_employees: 22, average_salary: 72000, oldest_employee: '2020-07-10', newest_employee: '2024-09-10', new_hires_1_year: 5, budget: 600000, salary_budget_ratio: 92.4 },
        { department_name: 'Finance', total_employees: 18, average_salary: 78000, oldest_employee: '2020-02-28', newest_employee: '2024-08-28', new_hires_1_year: 3, budget: 800000, salary_budget_ratio: 67.8 },
        { department_name: 'Human Resources', total_employees: 12, average_salary: 65000, oldest_employee: '2020-04-12', newest_employee: '2024-08-20', new_hires_1_year: 2, budget: 500000, salary_budget_ratio: 58.2 },
        { department_name: 'Operations', total_employees: 16, average_salary: 65000, oldest_employee: '2020-06-05', newest_employee: '2024-07-15', new_hires_1_year: 4, budget: 700000, salary_budget_ratio: 74.3 },
        { department_name: 'Research & Development', total_employees: 14, average_salary: 105000, oldest_employee: '2020-01-20', newest_employee: '2024-06-10', new_hires_1_year: 3, budget: 1500000, salary_budget_ratio: 48.7 },
        { department_name: 'Customer Support', total_employees: 11, average_salary: 52000, oldest_employee: '2020-08-15', newest_employee: '2024-05-25', new_hires_1_year: 2, budget: 400000, salary_budget_ratio: 71.5 }
      ],
      attendance_patterns: [
        { employee_id: 1, employee_name: 'John Smith', department_name: 'Information Technology', total_days: 65, present_days: 62, absent_days: 2, late_days: 1, attendance_percentage: 95.38, average_daily_hours: 8.2, total_overtime: 12.5 },
        { employee_id: 2, employee_name: 'Jane Doe', department_name: 'Sales', total_days: 65, present_days: 63, absent_days: 1, late_days: 1, attendance_percentage: 96.92, average_daily_hours: 8.1, total_overtime: 8.0 },
        { employee_id: 3, employee_name: 'Mike Johnson', department_name: 'Marketing', total_days: 65, present_days: 61, absent_days: 3, late_days: 1, attendance_percentage: 93.85, average_daily_hours: 8.0, total_overtime: 5.5 },
        { employee_id: 4, employee_name: 'Sarah Wilson', department_name: 'Finance', total_days: 65, present_days: 64, absent_days: 1, late_days: 0, attendance_percentage: 98.46, average_daily_hours: 8.3, total_overtime: 15.2 },
        { employee_id: 5, employee_name: 'Tom Brown', department_name: 'Human Resources', total_days: 65, present_days: 60, absent_days: 4, late_days: 1, attendance_percentage: 92.31, average_daily_hours: 7.9, total_overtime: 3.0 }
      ],
      salary_progression: [
        { employee_id: 1, employee_name: 'John Smith', hire_date: '2020-03-15', current_salary: 120000, starting_salary: 85000, salary_increase_percentage: 41.18, years_with_company: 4 },
        { employee_id: 2, employee_name: 'Jane Doe', hire_date: '2021-01-20', current_salary: 95000, starting_salary: 70000, salary_increase_percentage: 35.71, years_with_company: 3 },
        { employee_id: 3, employee_name: 'Mike Johnson', hire_date: '2020-07-10', current_salary: 88000, starting_salary: 65000, salary_increase_percentage: 35.38, years_with_company: 4 },
        { employee_id: 4, employee_name: 'Sarah Wilson', hire_date: '2021-05-15', current_salary: 82000, starting_salary: 62000, salary_increase_percentage: 32.26, years_with_company: 3 },
        { employee_id: 5, employee_name: 'Tom Brown', hire_date: '2022-03-01', current_salary: 72000, starting_salary: 58000, salary_increase_percentage: 24.14, years_with_company: 2 }
      ]
    },

    // Database content
    database_content: {
      employees: generateEmployees(50),
      departments: [
        { department_name: 'Information Technology', location: 'Building B, Floor 3', budget: 1200000, total_employees: 35, average_salary: 95000, manager_name: 'John Smith', oldest_hire: '2020-03-15', newest_hire: '2024-09-15' },
        { department_name: 'Sales', location: 'Building C, Floor 1', budget: 900000, total_employees: 28, average_salary: 68000, manager_name: 'Jane Doe', oldest_hire: '2020-05-20', newest_hire: '2024-08-30' },
        { department_name: 'Marketing', location: 'Building C, Floor 2', budget: 600000, total_employees: 22, average_salary: 72000, manager_name: 'Mike Johnson', oldest_hire: '2020-07-10', newest_hire: '2024-09-10' },
        { department_name: 'Finance', location: 'Building A, Floor 1', budget: 800000, total_employees: 18, average_salary: 78000, manager_name: 'Sarah Wilson', oldest_hire: '2020-02-28', newest_hire: '2024-08-28' },
        { department_name: 'Human Resources', location: 'Building A, Floor 2', budget: 500000, total_employees: 12, average_salary: 65000, manager_name: 'Tom Brown', oldest_hire: '2020-04-12', newest_hire: '2024-08-20' },
        { department_name: 'Operations', location: 'Building B, Floor 1', budget: 700000, total_employees: 16, average_salary: 65000, manager_name: 'Lisa Davis', oldest_hire: '2020-06-05', newest_hire: '2024-07-15' },
        { department_name: 'Research & Development', location: 'Building D, Floor 4', budget: 1500000, total_employees: 14, average_salary: 105000, manager_name: 'Robert Miller', oldest_hire: '2020-01-20', newest_hire: '2024-06-10' },
        { department_name: 'Customer Support', location: 'Building A, Floor 3', budget: 400000, total_employees: 11, average_salary: 52000, manager_name: 'Emily Garcia', oldest_hire: '2020-08-15', newest_hire: '2024-05-25' }
      ],
      attendance: generateAttendanceData(30),
      salary_trends: generateSalaryTrends(25),
      recent_activities: [
        { activity_type: 'HIRE', description: 'New employee joined the company', timestamp: '2024-09-15', employee_name: 'Sarah Johnson' },
        { activity_type: 'HIRE', description: 'New employee joined the company', timestamp: '2024-09-10', employee_name: 'Michael Chen' },
        { activity_type: 'SALARY_UPDATE', description: 'Salary adjustment processed', timestamp: '2024-09-05', employee_name: 'David Kim' },
        { activity_type: 'HIRE', description: 'New employee joined the company', timestamp: '2024-09-05', employee_name: 'Emily Rodriguez' },
        { activity_type: 'SALARY_UPDATE', description: 'Salary adjustment processed', timestamp: '2024-08-30', employee_name: 'Lisa Thompson' }
      ],
      summary_stats: {
        total_employees: 156,
        total_departments: 8,
        average_salary: 75420,
        total_payroll: 11765520,
        attendance_rate: 94.2,
        new_hires_this_month: 5
      }
    }
  };

  return data;
}

function generateEmployees(count) {
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'James', 'Maria', 'William', 'Jennifer', 'Richard', 'Linda', 'Charles', 'Patricia', 'Thomas', 'Elizabeth', 'Christopher', 'Susan'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
  const departments = ['Information Technology', 'Sales', 'Marketing', 'Finance', 'Human Resources', 'Operations', 'Research & Development', 'Customer Support'];
  const positions = ['Software Engineer', 'Senior Software Engineer', 'Team Lead', 'Project Manager', 'HR Specialist', 'Financial Analyst', 'Marketing Manager', 'Sales Representative'];

  const employees = [];
  for (let i = 1; i <= count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const hireDate = new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    const yearsWithCompany = (new Date() - hireDate) / (1000 * 60 * 60 * 24 * 365);

    employees.push({
      employee_id: i,
      employee_number: `EMP${String(i).padStart(4, '0')}`,
      employee_name: `${firstName} ${lastName}`,
      department_name: departments[Math.floor(Math.random() * departments.length)],
      position_title: positions[Math.floor(Math.random() * positions.length)],
      manager_name: i > 10 ? `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}` : null,
      hire_date: hireDate.toISOString().split('T')[0],
      salary: 40000 + Math.floor(Math.random() * 100000),
      employment_status: Math.random() > 0.1 ? 'ACTIVE' : 'TERMINATED',
      years_with_company: yearsWithCompany.toFixed(1)
    });
  }
  return employees;
}

function generateAttendanceData(count) {
  const employees = ['John Smith', 'Jane Doe', 'Mike Johnson', 'Sarah Wilson', 'Tom Brown', 'Lisa Davis', 'Robert Miller', 'Emily Garcia', 'David Martinez', 'Jennifer Lopez'];
  const departments = ['Information Technology', 'Sales', 'Marketing', 'Finance', 'Human Resources', 'Operations', 'Research & Development', 'Customer Support'];

  const attendance = [];
  for (let i = 0; i < count; i++) {
    const totalDays = 60 + Math.floor(Math.random() * 10);
    const presentDays = Math.floor(totalDays * (0.9 + Math.random() * 0.1));
    const absentDays = totalDays - presentDays;
    const attendancePercentage = (presentDays / totalDays * 100).toFixed(1);

    attendance.push({
      employee_name: employees[i % employees.length],
      department_name: departments[Math.floor(Math.random() * departments.length)],
      total_days: totalDays,
      present_days: presentDays,
      absent_days: absentDays,
      attendance_percentage: attendancePercentage,
      average_hours: (7.5 + Math.random() * 1).toFixed(1),
      overtime_hours: (Math.random() * 20).toFixed(1)
    });
  }
  return attendance;
}

function generateSalaryTrends(count) {
  const employees = ['John Smith', 'Jane Doe', 'Mike Johnson', 'Sarah Wilson', 'Tom Brown', 'Lisa Davis', 'Robert Miller', 'Emily Garcia', 'David Martinez', 'Jennifer Lopez'];
  const departments = ['Information Technology', 'Sales', 'Marketing', 'Finance', 'Human Resources', 'Operations', 'Research & Development', 'Customer Support'];
  const positions = ['Software Engineer', 'Senior Software Engineer', 'Team Lead', 'Project Manager', 'HR Specialist', 'Financial Analyst', 'Marketing Manager', 'Sales Representative'];

  const salaryTrends = [];
  for (let i = 0; i < count; i++) {
    const yearsWithCompany = Math.random() * 5;
    const currentSalary = 50000 + Math.floor(Math.random() * 100000);
    const salaryGrowth = (Math.random() * 50).toFixed(1);

    salaryTrends.push({
      employee_name: employees[i % employees.length],
      current_salary: currentSalary,
      hire_date: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
      department_name: departments[Math.floor(Math.random() * departments.length)],
      position_title: positions[Math.floor(Math.random() * positions.length)],
      years_with_company: yearsWithCompany.toFixed(1),
      salary_growth: salaryGrowth
    });
  }
  return salaryTrends;
}

// Create mock API responses
function createMockAPIResponses() {
  const mockData = generateMockData();
  
  const apiResponses = {
    '/api/analytics/dashboard': {
      success: true,
      data: mockData.dashboard
    },
    '/api/analytics/complex-queries': {
      success: true,
      data: mockData.complex_queries
    },
    '/api/analytics/database-content': {
      success: true,
      data: mockData.database_content
    },
    '/api/analytics/schema-info': {
      success: true,
      data: {
        tables: [
          { table_name: 'employees', table_type: 'BASE TABLE', table_schema: 'public' },
          { table_name: 'departments', table_type: 'BASE TABLE', table_schema: 'public' },
          { table_name: 'positions', table_type: 'BASE TABLE', table_schema: 'public' },
          { table_name: 'attendance_records', table_type: 'BASE TABLE', table_schema: 'public' },
          { table_name: 'salary_history', table_type: 'BASE TABLE', table_schema: 'public' },
          { table_name: 'performance_reviews', table_type: 'BASE TABLE', table_schema: 'public' },
          { table_name: 'time_off_requests', table_type: 'BASE TABLE', table_schema: 'public' }
        ],
        columns: [],
        foreign_keys: [],
        indexes: []
      }
    },
    '/api/analytics/database-details': {
      success: true,
      data: {
        constraints: [],
        detailed_columns: [],
        performance_stats: [],
        index_stats: []
      }
    }
  };

  return apiResponses;
}

// Save mock data to file
const mockData = createMockAPIResponses();
const outputPath = path.join(__dirname, 'mock-data.json');

fs.writeFileSync(outputPath, JSON.stringify(mockData, null, 2));

console.log('✅ Mock data generated successfully!');
console.log(`📁 Saved to: ${outputPath}`);
console.log('📊 Generated data includes:');
console.log('  - Dashboard analytics with KPIs');
console.log('  - Complex query results (hierarchy, performance, attendance, salary)');
console.log('  - Database content (employees, departments, attendance, salary trends)');
console.log('  - Schema information');
console.log('');
console.log('🚀 Your application now has comprehensive sample data to showcase all database functionality!');
console.log('💡 The data includes realistic employee records, department metrics, attendance patterns, and salary information.');

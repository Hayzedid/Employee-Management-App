const { Pool } = require('pg');
require('dotenv').config();

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'employee_management',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Helper function to execute queries
const query = async (text, params) => {
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

// Sample data arrays
const departments = [
  { name: 'Human Resources', code: 'HR', budget: 500000, location: 'Building A, Floor 2' },
  { name: 'Information Technology', code: 'IT', budget: 1200000, location: 'Building B, Floor 3' },
  { name: 'Finance', code: 'FIN', budget: 800000, location: 'Building A, Floor 1' },
  { name: 'Marketing', code: 'MKT', budget: 600000, location: 'Building C, Floor 2' },
  { name: 'Sales', code: 'SAL', budget: 900000, location: 'Building C, Floor 1' },
  { name: 'Operations', code: 'OPS', budget: 700000, location: 'Building B, Floor 1' },
  { name: 'Research & Development', code: 'RND', budget: 1500000, location: 'Building D, Floor 4' },
  { name: 'Customer Support', code: 'CS', budget: 400000, location: 'Building A, Floor 3' }
];

const positions = [
  { title: 'Software Engineer', code: 'SE', min_salary: 60000, max_salary: 120000 },
  { title: 'Senior Software Engineer', code: 'SSE', min_salary: 80000, max_salary: 150000 },
  { title: 'Team Lead', code: 'TL', min_salary: 90000, max_salary: 160000 },
  { title: 'Project Manager', code: 'PM', min_salary: 85000, max_salary: 140000 },
  { title: 'HR Specialist', code: 'HRS', min_salary: 45000, max_salary: 75000 },
  { title: 'Financial Analyst', code: 'FA', min_salary: 55000, max_salary: 95000 },
  { title: 'Marketing Manager', code: 'MM', min_salary: 70000, max_salary: 120000 },
  { title: 'Sales Representative', code: 'SR', min_salary: 40000, max_salary: 80000 },
  { title: 'Operations Manager', code: 'OM', min_salary: 75000, max_salary: 130000 },
  { title: 'Research Scientist', code: 'RS', min_salary: 70000, max_salary: 140000 }
];

// Generate random employees
const generateEmployees = (count, deptIds, posIds) => {
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'James', 'Maria', 'William', 'Jennifer', 'Richard', 'Linda', 'Charles', 'Patricia', 'Thomas', 'Elizabeth', 'Christopher', 'Susan'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
  
  const employees = [];
  for (let i = 1; i <= count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const hireDate = new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    
    employees.push({
      employee_number: `EMP${String(i).padStart(4, '0')}`,
      first_name: firstName,
      last_name: lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company.com`,
      phone: `+1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      hire_date: hireDate,
      employment_status: Math.random() > 0.1 ? 'ACTIVE' : (Math.random() > 0.5 ? 'TERMINATED' : 'ON_LEAVE'),
      department_id: deptIds[Math.floor(Math.random() * deptIds.length)],
      position_id: posIds[Math.floor(Math.random() * posIds.length)],
      salary: 40000 + Math.floor(Math.random() * 100000)
    });
  }
  return employees;
};

// Main seeding function
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Create tables first
    await createTables();
    
    // Seed departments
    console.log('📊 Seeding departments...');
    for (const dept of departments) {
      await query(`
        INSERT INTO departments (department_name, department_code, budget, location, is_active)
        VALUES ($1, $2, $3, $4, true)
        ON CONFLICT (department_code) DO NOTHING
      `, [dept.name, dept.code, dept.budget, dept.location]);
    }

    // Seed positions
    console.log('💼 Seeding positions...');
    const deptResult = await query('SELECT department_id FROM departments ORDER BY department_id');
    const deptIds = deptResult.rows.map(row => row.department_id);
    
    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i];
      const deptId = deptIds[i % deptIds.length];
      await query(`
        INSERT INTO positions (position_title, position_code, department_id, min_salary, max_salary, is_active)
        VALUES ($1, $2, $3, $4, $5, true)
        ON CONFLICT (position_code) DO NOTHING
      `, [pos.title, pos.code, deptId, pos.min_salary, pos.max_salary]);
    }

    // Generate and seed employees
    console.log('👥 Seeding employees...');
    const posResult = await query('SELECT position_id FROM positions ORDER BY position_id');
    const posIds = posResult.rows.map(row => row.position_id);
    
    const employees = generateEmployees(100, deptIds, posIds);
    for (const emp of employees) {
      await query(`
        INSERT INTO employees (employee_number, first_name, last_name, personal_email, phone, hire_date, employment_status, department_id, position_id, salary)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (employee_number) DO NOTHING
      `, [emp.employee_number, emp.first_name, emp.last_name, emp.email, emp.phone, emp.hire_date, emp.employment_status, emp.department_id, emp.position_id, emp.salary]);
    }

    // Seed attendance records
    console.log('📅 Seeding attendance records...');
    await seedAttendanceRecords();

    // Seed salary history
    console.log('💰 Seeding salary history...');
    await seedSalaryHistory();

    // Seed performance reviews
    console.log('⭐ Seeding performance reviews...');
    await seedPerformanceReviews();

    // Seed time off requests
    console.log('🏖️ Seeding time off requests...');
    await seedTimeOffRequests();

    console.log('✅ Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await pool.end();
  }
}

async function createTables() {
  console.log('🏗️ Creating database tables...');
  
  // Create departments table
  await query(`
    CREATE TABLE IF NOT EXISTS departments (
      department_id SERIAL PRIMARY KEY,
      department_name VARCHAR(100) NOT NULL,
      department_code VARCHAR(20) UNIQUE NOT NULL,
      description TEXT,
      parent_department_id INTEGER REFERENCES departments(department_id),
      manager_id INTEGER,
      budget DECIMAL(15,2),
      location VARCHAR(100),
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create positions table
  await query(`
    CREATE TABLE IF NOT EXISTS positions (
      position_id SERIAL PRIMARY KEY,
      position_title VARCHAR(100) NOT NULL,
      position_code VARCHAR(20) UNIQUE NOT NULL,
      department_id INTEGER REFERENCES departments(department_id),
      job_description TEXT,
      requirements TEXT,
      min_salary DECIMAL(10,2),
      max_salary DECIMAL(10,2),
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create employees table
  await query(`
    CREATE TABLE IF NOT EXISTS employees (
      employee_id SERIAL PRIMARY KEY,
      employee_number VARCHAR(20) UNIQUE NOT NULL,
      first_name VARCHAR(50) NOT NULL,
      last_name VARCHAR(50) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      phone VARCHAR(20),
      date_of_birth DATE,
      gender VARCHAR(10),
      address TEXT,
      city VARCHAR(50),
      state VARCHAR(50),
      postal_code VARCHAR(20),
      country VARCHAR(50),
      hire_date DATE NOT NULL,
      termination_date DATE,
      employment_status VARCHAR(20) DEFAULT 'ACTIVE',
      department_id INTEGER REFERENCES departments(department_id),
      position_id INTEGER REFERENCES positions(position_id),
      manager_id INTEGER REFERENCES employees(employee_id),
      salary DECIMAL(10,2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create attendance_records table
  await query(`
    CREATE TABLE IF NOT EXISTS attendance_records (
      attendance_id SERIAL PRIMARY KEY,
      employee_id INTEGER REFERENCES employees(employee_id),
      attendance_date DATE NOT NULL,
      check_in_time TIMESTAMP,
      check_out_time TIMESTAMP,
      total_hours DECIMAL(4,2),
      overtime_hours DECIMAL(4,2) DEFAULT 0,
      status VARCHAR(20) DEFAULT 'PRESENT',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(employee_id, attendance_date)
    )
  `);

  // Create salary_history table
  await query(`
    CREATE TABLE IF NOT EXISTS salary_history (
      salary_id SERIAL PRIMARY KEY,
      employee_id INTEGER REFERENCES employees(employee_id),
      salary_amount DECIMAL(10,2) NOT NULL,
      effective_date DATE NOT NULL,
      end_date DATE,
      salary_type VARCHAR(20) DEFAULT 'BASE',
      reason TEXT,
      approved_by INTEGER REFERENCES employees(employee_id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create performance_reviews table
  await query(`
    CREATE TABLE IF NOT EXISTS performance_reviews (
      review_id SERIAL PRIMARY KEY,
      employee_id INTEGER REFERENCES employees(employee_id),
      reviewer_id INTEGER REFERENCES employees(employee_id),
      review_period_start DATE NOT NULL,
      review_period_end DATE NOT NULL,
      overall_rating DECIMAL(3,2),
      goals_achieved INTEGER,
      goals_total INTEGER,
      strengths TEXT,
      areas_for_improvement TEXT,
      development_plan TEXT,
      next_review_date DATE,
      status VARCHAR(20) DEFAULT 'COMPLETED',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create time_off_requests table
  await query(`
    CREATE TABLE IF NOT EXISTS time_off_requests (
      request_id SERIAL PRIMARY KEY,
      employee_id INTEGER REFERENCES employees(employee_id),
      request_type VARCHAR(20) DEFAULT 'VACATION',
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      total_days DECIMAL(4,2) NOT NULL,
      reason TEXT,
      status VARCHAR(20) DEFAULT 'PENDING',
      requested_by INTEGER REFERENCES employees(employee_id),
      approved_by INTEGER REFERENCES employees(employee_id),
      approval_date TIMESTAMP,
      rejection_reason TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function seedAttendanceRecords() {
  const employees = await query('SELECT employee_id FROM employees WHERE employment_status = $1', ['ACTIVE']);
  const statuses = ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'WORK_FROM_HOME'];
  
  for (const emp of employees.rows) {
    // Generate 90 days of attendance records
    for (let i = 0; i < 90; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const checkIn = new Date(date);
      checkIn.setHours(8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60));
      
      const checkOut = new Date(checkIn);
      checkOut.setHours(checkIn.getHours() + 8 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 60));
      
      const totalHours = (checkOut - checkIn) / (1000 * 60 * 60);
      const overtimeHours = Math.max(0, totalHours - 8);
      
      await query(`
        INSERT INTO attendance_records (employee_id, attendance_date, check_in_time, check_out_time, overtime_hours, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (employee_id, attendance_date) DO NOTHING
      `, [emp.employee_id, date.toISOString().split('T')[0], checkIn, checkOut, overtimeHours.toFixed(2), status]);
    }
  }
}

async function seedSalaryHistory() {
  const employees = await query('SELECT employee_id, salary, hire_date FROM employees');
  
  for (const emp of employees.rows) {
    // Add initial salary record
    await query(`
      INSERT INTO salary_history (employee_id, salary_amount, effective_date, salary_type, reason)
      VALUES ($1, $2, $3, 'BASE', 'Initial salary')
      ON CONFLICT DO NOTHING
    `, [emp.employee_id, emp.salary * 0.8, emp.hire_date]);
    
    // Add salary increases
    const increases = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < increases; i++) {
      const increaseDate = new Date(emp.hire_date);
      increaseDate.setFullYear(increaseDate.getFullYear() + i + 1);
      
      if (increaseDate <= new Date()) {
        const newSalary = emp.salary * (0.8 + (i + 1) * 0.1);
        await query(`
          INSERT INTO salary_history (employee_id, salary_amount, effective_date, salary_type, reason)
          VALUES ($1, $2, $3, 'RAISE', 'Annual increase')
        `, [emp.employee_id, newSalary, increaseDate.toISOString().split('T')[0]]);
      }
    }
  }
}

async function seedPerformanceReviews() {
  const employees = await query('SELECT employee_id, hire_date FROM employees WHERE employment_status = $1', ['ACTIVE']);
  
  for (const emp of employees.rows) {
    const reviewDate = new Date(emp.hire_date);
    reviewDate.setFullYear(reviewDate.getFullYear() + 1);
    
    if (reviewDate <= new Date()) {
      await query(`
        INSERT INTO performance_reviews (employee_id, reviewer_id, review_period_start, review_period_end, overall_rating, goals_achieved, goals_total, strengths, areas_for_improvement)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        emp.employee_id,
        Math.floor(Math.random() * 20) + 1, // Random reviewer
        emp.hire_date,
        reviewDate.toISOString().split('T')[0],
        (Math.random() * 2 + 3).toFixed(1), // Rating 3.0-5.0
        Math.floor(Math.random() * 8) + 2, // Goals achieved
        10, // Total goals
        'Strong technical skills, good team player',
        'Could improve communication skills'
      ]);
    }
  }
}

async function seedTimeOffRequests() {
  const employees = await query('SELECT employee_id FROM employees WHERE employment_status = $1', ['ACTIVE']);
  const requestTypes = ['VACATION', 'SICK_LEAVE', 'PERSONAL', 'MATERNITY', 'PATERNITY'];
  const statuses = ['PENDING', 'APPROVED', 'REJECTED'];
  
  for (const emp of employees.rows) {
    // Generate 2-5 time off requests per employee
    const requestCount = Math.floor(Math.random() * 4) + 2;
    
    for (let i = 0; i < requestCount; i++) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 365));
      
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 10) + 1);
      
      const totalDays = (endDate - startDate) / (1000 * 60 * 60 * 24) + 1;
      
      await query(`
        INSERT INTO time_off_requests (employee_id, request_type, start_date, end_date, total_days, reason, status, requested_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $1)
      `, [
        emp.employee_id,
        requestTypes[Math.floor(Math.random() * requestTypes.length)],
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0],
        totalDays,
        'Personal time off request',
        statuses[Math.floor(Math.random() * statuses.length)]
      ]);
    }
  }
}

// Run the seeding
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };

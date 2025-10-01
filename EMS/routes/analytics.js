const express = require('express');
const { query } = require('../config/database');
const router = express.Router();

// Simple, robust dashboard analytics - showcasing our rich database
router.get('/dashboard', async (req, res) => {
  try {
    console.log('Fetching dashboard analytics...');

    // 1. Employee Statistics - Core Numbers
    const employeeStats = await query(`
      SELECT 
        COUNT(*) as total_employees,
        COUNT(CASE WHEN employment_status = 'ACTIVE' THEN 1 END) as active_employees,
        COUNT(CASE WHEN employment_status = 'TERMINATED' THEN 1 END) as terminated_employees,
        COUNT(CASE WHEN hire_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_hires_this_month,
        ROUND(AVG(salary), 2) as average_salary,
        ROUND(SUM(salary), 2) as total_payroll
      FROM employees
    `);

    // 2. Department Overview
    const departmentStats = await query(`
      SELECT 
        d.department_name,
        COUNT(e.employee_id) as employee_count,
        ROUND(AVG(e.salary), 2) as avg_salary,
        ROUND(SUM(e.salary), 2) as total_salary
      FROM departments d
      LEFT JOIN employees e ON d.department_id = e.department_id AND e.employment_status = 'ACTIVE'
      WHERE d.is_active = true
      GROUP BY d.department_id, d.department_name
      ORDER BY employee_count DESC
    `);

    // 3. Recent Hires - Show our new talent
    const recentHires = await query(`
      SELECT 
        e.employee_number,
        e.first_name,
        e.last_name,
        e.hire_date,
        e.salary,
        d.department_name,
        p.position_title
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.department_id
      LEFT JOIN positions p ON e.position_id = p.position_id
      ORDER BY e.hire_date DESC
      LIMIT 10
    `);

    // 4. Salary Distribution - Show our compensation ranges
    const salaryRanges = await query(`
      SELECT 
        CASE 
          WHEN salary < 50000 THEN 'Entry Level ($0-$50k)'
          WHEN salary < 100000 THEN 'Mid Level ($50k-$100k)'
          WHEN salary < 150000 THEN 'Senior Level ($100k-$150k)'
          ELSE 'Executive Level ($150k+)'
        END as salary_range,
        COUNT(*) as employee_count,
        ROUND(AVG(salary), 2) as avg_range_salary
      FROM employees
      WHERE employment_status = 'ACTIVE'
      GROUP BY 
        CASE 
          WHEN salary < 50000 THEN 'Entry Level ($0-$50k)'
          WHEN salary < 100000 THEN 'Mid Level ($50k-$100k)'
          WHEN salary < 150000 THEN 'Senior Level ($100k-$150k)'
          ELSE 'Executive Level ($150k+)'
        END
      ORDER BY AVG(salary)
    `);

    // 5. Top Earners - Showcase high performers
    const topEarners = await query(`
      SELECT 
        e.first_name || ' ' || e.last_name as employee_name,
        e.employee_number,
        e.salary,
        d.department_name,
        p.position_title,
        e.hire_date
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.department_id
      LEFT JOIN positions p ON e.position_id = p.position_id
      WHERE e.employment_status = 'ACTIVE'
      ORDER BY e.salary DESC
      LIMIT 8
    `);

    // Build clean response
    const stats = employeeStats.rows[0];
    const dashboardData = {
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        // Core metrics
        summary: {
          total_employees: parseInt(stats.total_employees) || 0,
          active_employees: parseInt(stats.active_employees) || 0,
          terminated_employees: parseInt(stats.terminated_employees) || 0,
          new_hires_this_month: parseInt(stats.new_hires_this_month) || 0,
          average_salary: parseFloat(stats.average_salary) || 0,
          total_payroll: parseFloat(stats.total_payroll) || 0
        },
        
        // Rich data showcasing our database
        departments: departmentStats.rows || [],
        recent_hires: recentHires.rows || [],
        salary_distribution: salaryRanges.rows || [],
        top_performers: topEarners.rows || []
      }
    };

    console.log('Dashboard data fetched successfully');
    res.json(dashboardData);

  } catch (error) {
    console.error('Dashboard error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch dashboard data',
      details: error.message 
    });
  }
});

// Advanced analytics - showcasing complex database relationships
router.get('/complex-queries', async (req, res) => {
  try {
    console.log('🔍 Fetching advanced analytics...');

    // 1. Experience vs Salary Analysis
    const experienceAnalysis = await query(`
      SELECT 
        CASE 
          WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, e.hire_date)) < 1 THEN 'New Hire (< 1 year)'
          WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, e.hire_date)) < 3 THEN 'Junior (1-3 years)'
          WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, e.hire_date)) < 7 THEN 'Mid-Level (3-7 years)'
          ELSE 'Senior (7+ years)'
        END as experience_level,
        COUNT(*) as employee_count,
        ROUND(AVG(e.salary), 2) as avg_salary,
        ROUND(MIN(e.salary), 2) as min_salary,
        ROUND(MAX(e.salary), 2) as max_salary
      FROM employees e
      WHERE e.employment_status = 'ACTIVE'
      GROUP BY 
        CASE 
          WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, e.hire_date)) < 1 THEN 'New Hire (< 1 year)'
          WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, e.hire_date)) < 3 THEN 'Junior (1-3 years)'
          WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, e.hire_date)) < 7 THEN 'Mid-Level (3-7 years)'
          ELSE 'Senior (7+ years)'
        END
      ORDER BY AVG(e.salary)
    `);

    // 2. Department Breakdown with Budgets
    const departmentAnalysis = await query(`
      SELECT 
        d.department_name,
        d.department_code,
        COUNT(e.employee_id) as employee_count,
        ROUND(AVG(e.salary), 2) as avg_salary,
        ROUND(SUM(e.salary), 2) as total_payroll,
        d.budget,
        d.location,
        CASE 
          WHEN d.budget > 0 THEN ROUND(((SUM(e.salary) / d.budget) * 100), 2)
          ELSE 0
        END as budget_utilization_percent
      FROM departments d
      LEFT JOIN employees e ON d.department_id = e.department_id AND e.employment_status = 'ACTIVE'
      WHERE d.is_active = true
      GROUP BY d.department_id, d.department_name, d.department_code, d.budget, d.location
      ORDER BY total_payroll DESC NULLS LAST
    `);

    // 3. Hiring Trends by Month
    const hiringTrends = await query(`
      SELECT 
        TO_CHAR(hire_date, 'YYYY-MM') as hire_month,
        COUNT(*) as hires_count,
        ROUND(AVG(salary), 2) as avg_starting_salary
      FROM employees
      WHERE hire_date >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY TO_CHAR(hire_date, 'YYYY-MM')
      ORDER BY hire_month DESC
    `);

    // 4. Position Analysis
    const positionAnalysis = await query(`
      SELECT 
        p.position_title,
        p.position_code,
        d.department_name,
        COUNT(e.employee_id) as current_employees,
        ROUND(AVG(e.salary), 2) as avg_salary,
        ROUND(p.min_salary, 2) as min_salary_range,
        ROUND(p.max_salary, 2) as max_salary_range
      FROM positions p
      LEFT JOIN employees e ON p.position_id = e.position_id AND e.employment_status = 'ACTIVE'
      LEFT JOIN departments d ON p.department_id = d.department_id
      WHERE p.is_active = true
      GROUP BY p.position_id, p.position_title, p.position_code, d.department_name, p.min_salary, p.max_salary
      ORDER BY avg_salary DESC NULLS LAST
    `);

    const complexData = {
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        experience_analysis: experienceAnalysis.rows || [],
        department_breakdown: departmentAnalysis.rows || [],
        hiring_trends: hiringTrends.rows || [],
        position_analysis: positionAnalysis.rows || []
      }
    };

    console.log('Advanced analytics fetched successfully');
    res.json(complexData);

  } catch (error) {
    console.error('Advanced analytics error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch advanced analytics',
      details: error.message 
    });
  }
});

// Get database schema information
router.get('/schema-info', async (req, res) => {
  try {
    // Get real database schema information
    const tables = await query(`
      SELECT 
        table_name,
        table_type
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    const columns = await query(`
      SELECT 
        table_name,
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `);

    const constraints = await query(`
      SELECT 
        tc.table_name,
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints tc
      LEFT JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      LEFT JOIN information_schema.constraint_column_usage ccu 
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.table_schema = 'public'
      ORDER BY tc.table_name, tc.constraint_name
    `);

    const schemaData = {
      success: true,
      data: {
        tables: tables.rows,
        columns: columns.rows,
        constraints: constraints.rows
      }
    };

    res.json(schemaData);
  } catch (error) {
    console.error('Error fetching schema info:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get detailed database information for visualization
router.get('/database-details', async (req, res) => {
  try {
    // Get real database details
    const tableStats = await query(`
      SELECT 
        schemaname,
        tablename,
        attname as column_name,
        n_distinct,
        correlation
      FROM pg_stats 
      WHERE schemaname = 'public'
      ORDER BY tablename, attname
    `);

    const indexInfo = await query(`
      SELECT 
        t.relname as table_name,
        i.relname as index_name,
        a.attname as column_name,
        ix.indisunique as is_unique,
        ix.indisprimary as is_primary
      FROM pg_class t
      JOIN pg_index ix ON t.oid = ix.indrelid
      JOIN pg_class i ON i.oid = ix.indexrelid
      JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
      WHERE t.relkind = 'r'
      AND t.relname NOT LIKE 'pg_%'
      ORDER BY t.relname, i.relname
    `);

    const tableSizes = await query(`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    `);

    const detailsData = {
      success: true,
      data: {
        table_statistics: tableStats.rows,
        index_information: indexInfo.rows,
        table_sizes: tableSizes.rows
      }
    };

    res.json(detailsData);
  } catch (error) {
    console.error('Error fetching database details:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get comprehensive database content for showcase
router.get('/database-content', async (req, res) => {
  try {
    // Get real-time data from database
    const salaryTrends = await query(`
      SELECT 
        e.employee_id,
        e.first_name || ' ' || e.last_name as employee_name,
        e.salary,
        d.department_name,
        p.position_title,
        e.hire_date
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.department_id
      LEFT JOIN positions p ON e.position_id = p.position_id
      WHERE e.employment_status = 'ACTIVE'
      ORDER BY e.salary DESC
    `);

    const attendanceData = await query(`
      SELECT 
        ar.attendance_id,
        e.first_name || ' ' || e.last_name as employee_name,
        e.employee_number,
        d.department_name,
        ar.attendance_date,
        ar.check_in_time,
        ar.check_out_time,
        ar.total_hours,
        ar.overtime_hours,
        ar.status,
        ar.notes
      FROM attendance_records ar
      JOIN employees e ON ar.employee_id = e.employee_id
      LEFT JOIN departments d ON e.department_id = d.department_id
      ORDER BY ar.attendance_date DESC
    `);

    const departmentData = await query(`
      SELECT 
        d.department_id,
        d.department_name,
        d.budget,
        d.location,
        COUNT(e.employee_id) as total_employees,
        AVG(e.salary) as average_salary,
        m.first_name || ' ' || m.last_name as manager_name
      FROM departments d
      LEFT JOIN employees e ON d.department_id = e.department_id AND e.employment_status = 'ACTIVE'
      LEFT JOIN employees m ON d.manager_id = m.employee_id
      WHERE d.is_active = true
      GROUP BY d.department_id, d.department_name, d.budget, d.location, m.first_name, m.last_name
      ORDER BY total_employees DESC
    `);

    const contentData = {
      success: true,
      data: {
        salary_trends: salaryTrends.rows,
        attendance: attendanceData.rows,
        departments: departmentData.rows
      }
    };

      res.json(contentData);
  } catch (error) {
    console.error('Error fetching database content:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get attendance records with employee details
router.get('/attendance-records', async (req, res) => {
  try {
    // Get real-time attendance data from database
    const attendanceRecords = await query(`
      SELECT 
        ar.attendance_id,
        e.first_name || ' ' || e.last_name as employee_name,
        e.employee_number,
        d.department_name,
        ar.attendance_date,
        ar.check_in_time,
        ar.check_out_time,
        ar.total_hours,
        ar.overtime_hours,
        ar.status,
        ar.notes
      FROM attendance_records ar
      JOIN employees e ON ar.employee_id = e.employee_id
      LEFT JOIN departments d ON e.department_id = d.department_id
      ORDER BY ar.attendance_date DESC
      LIMIT 50
    `);

    const summary = await query(`
      SELECT 
        COUNT(*) as total_records,
        COUNT(CASE WHEN status = 'PRESENT' THEN 1 END) as present_count,
        COUNT(CASE WHEN status = 'ABSENT' THEN 1 END) as absent_count,
        COUNT(CASE WHEN status = 'LATE' THEN 1 END) as late_count,
        COUNT(CASE WHEN status = 'HALF_DAY' THEN 1 END) as half_day_count,
        COUNT(CASE WHEN status = 'WORK_FROM_HOME' THEN 1 END) as wfh_count,
        AVG(total_hours) as avg_hours,
        SUM(overtime_hours) as total_overtime
      FROM attendance_records
      WHERE attendance_date >= CURRENT_DATE - INTERVAL '30 days'
    `);

    const departmentBreakdown = await query(`
      SELECT 
        d.department_name,
        COUNT(ar.attendance_id) as total_records,
        COUNT(CASE WHEN ar.status = 'PRESENT' THEN 1 END) as present_count,
        COUNT(CASE WHEN ar.status = 'ABSENT' THEN 1 END) as absent_count,
        AVG(ar.total_hours) as avg_hours
      FROM attendance_records ar
      JOIN employees e ON ar.employee_id = e.employee_id
      LEFT JOIN departments d ON e.department_id = d.department_id
      WHERE ar.attendance_date >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY d.department_name
      ORDER BY total_records DESC
    `);

    const trends = await query(`
      SELECT 
        attendance_date,
        COUNT(*) as total_records,
        COUNT(CASE WHEN status = 'PRESENT' THEN 1 END) as present_count,
        COUNT(CASE WHEN status = 'ABSENT' THEN 1 END) as absent_count,
        COUNT(CASE WHEN status = 'LATE' THEN 1 END) as late_count,
        AVG(total_hours) as avg_hours
      FROM attendance_records
      WHERE attendance_date >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY attendance_date
      ORDER BY attendance_date DESC
    `);

    const attendanceData = {
      success: true,
      data: {
        records: attendanceRecords.rows,
        summary: {
          total_records: parseInt(summary.rows[0].total_records),
          present_count: parseInt(summary.rows[0].present_count),
          absent_count: parseInt(summary.rows[0].absent_count),
          late_count: parseInt(summary.rows[0].late_count),
          half_day_count: parseInt(summary.rows[0].half_day_count),
          wfh_count: parseInt(summary.rows[0].wfh_count),
          avg_hours: parseFloat(summary.rows[0].avg_hours || 0),
          total_overtime: parseFloat(summary.rows[0].total_overtime || 0)
        },
        department_breakdown: departmentBreakdown.rows,
        trends: trends.rows
      }
    };
    
    res.json(attendanceData);
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Seed database with comprehensive data for better analytics
router.post('/seed-database', async (req, res) => {
  try {
    console.log('Starting database seeding...');

    // Add recent hires for this month (October 2025)
    const newEmployees = [
      ['EMP200', 'Emma', 'Thompson', '1995-03-15', 'FEMALE', 'emma.thompson@personal.com', '+2348012300001', 2, 2, 155000.00, '2025-10-01', 'ACTIVE'],
      ['EMP201', 'James', 'Wilson', '1992-07-22', 'MALE', 'james.wilson@personal.com', '+2348012300002', 3, 3, 125000.00, '2025-10-01', 'ACTIVE'],
      ['EMP202', 'Sophia', 'Davis', '1994-11-08', 'FEMALE', 'sophia.davis@personal.com', '+2348012300003', 1, 1, 140000.00, '2025-10-02', 'ACTIVE'],
      ['EMP203', 'Michael', 'Brown', '1993-09-14', 'MALE', 'michael.brown@personal.com', '+2348012300004', 4, 4, 110000.00, '2025-10-02', 'ACTIVE'],
      ['EMP204', 'Isabella', 'Garcia', '1996-05-18', 'FEMALE', 'isabella.garcia@personal.com', '+2348012300005', 5, 5, 118000.00, '2025-10-03', 'ACTIVE'],
      ['EMP205', 'William', 'Martinez', '1991-12-03', 'MALE', 'william.martinez@personal.com', '+2348012300006', 2, 6, 175000.00, '2025-10-03', 'ACTIVE'],
      ['EMP206', 'Olivia', 'Rodriguez', '1997-01-25', 'FEMALE', 'olivia.rodriguez@personal.com', '+2348012300007', 3, 8, 165000.00, '2025-10-04', 'ACTIVE'],
      ['EMP207', 'Alexander', 'Lopez', '1990-08-12', 'MALE', 'alexander.lopez@personal.com', '+2348012300008', 1, 7, 95000.00, '2025-10-04', 'ACTIVE'],
      ['EMP208', 'Mia', 'Gonzalez', '1998-04-30', 'FEMALE', 'mia.gonzalez@personal.com', '+2348012300009', 4, 4, 108000.00, '2025-10-05', 'ACTIVE'],
      ['EMP209', 'Benjamin', 'Hernandez', '1989-10-17', 'MALE', 'benjamin.hernandez@personal.com', '+2348012300010', 5, 5, 122000.00, '2025-10-05', 'ACTIVE']
    ];

    // Insert new employees
    let employeeCount = 0;
    for (const emp of newEmployees) {
      try {
        await query(`
          INSERT INTO employees (employee_number, first_name, last_name, date_of_birth, gender, personal_email, phone, department_id, position_id, salary, hire_date, employment_status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          ON CONFLICT (employee_number) DO NOTHING
        `, emp);
        employeeCount++;
      } catch (err) {
        console.log(`Employee ${emp[0]} already exists or error:`, err.message);
      }
    }

    // Update some existing employees with recent hire dates for current month stats
    await query(`
      UPDATE employees 
      SET hire_date = CASE 
        WHEN employee_number IN ('EMP0087', 'EMP0088') THEN '2025-10-15'
        WHEN employee_number IN ('EMP0089', 'EMP0090') THEN '2025-10-20'
        WHEN employee_number IN ('EMP0091', 'EMP0092') THEN '2025-10-25'
        ELSE hire_date
      END
      WHERE employee_number IN ('EMP0087', 'EMP0088', 'EMP0089', 'EMP0090', 'EMP0091', 'EMP0092')
    `);

    // Get final stats
    const stats = await query(`
      SELECT 
        COUNT(*) as total_employees,
        COUNT(CASE WHEN hire_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_hires_this_month,
        COUNT(CASE WHEN employment_status = 'ACTIVE' THEN 1 END) as active_employees
      FROM employees
    `);

    console.log('Database seeding completed successfully!');

    res.json({
      success: true,
      message: 'Database seeded successfully! Please refresh your dashboard to see updated data.',
      data: {
        employees_added: employeeCount,
        final_stats: stats.rows[0]
      }
    });

  } catch (error) {
    console.error('Database seeding error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to seed database',
      details: error.message
    });
  }
});

module.exports = router;


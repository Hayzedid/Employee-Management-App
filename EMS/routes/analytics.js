const express = require('express');
const { query } = require('../config/database');
const router = express.Router();

// Get comprehensive dashboard analytics
router.get('/dashboard', async (req, res) => {
  try {
    // Employee statistics
    const employeeStats = await query(`
      SELECT 
        COUNT(*) as total_employees,
        COUNT(CASE WHEN employment_status = 'ACTIVE' THEN 1 END) as active_employees,
        COUNT(CASE WHEN employment_status = 'TERMINATED' THEN 1 END) as terminated_employees,
        COUNT(CASE WHEN gender = 'MALE' THEN 1 END) as male_employees,
        COUNT(CASE WHEN gender = 'FEMALE' THEN 1 END) as female_employees,
        AVG(salary) as average_salary,
        MIN(hire_date) as earliest_hire,
        MAX(hire_date) as latest_hire
      FROM employees
    `);
    
    // Department statistics
    const departmentStats = await query(`
      SELECT 
        COUNT(*) as total_departments,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_departments,
        SUM(budget) as total_budget,
        AVG(budget) as average_budget
      FROM departments
    `);
    
    // Recent hires (last 30 days)
    const recentHires = await query(`
      SELECT 
        e.employee_id,
        e.first_name || ' ' || e.last_name AS employee_name,
        e.employee_number,
        e.hire_date,
        d.department_name,
        p.position_title
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.department_id
      LEFT JOIN positions p ON e.position_id = p.position_id
      WHERE e.hire_date >= CURRENT_DATE - INTERVAL '30 days'
        AND e.employment_status = 'ACTIVE'
      ORDER BY e.hire_date DESC
      LIMIT 10
    `);
    
    // Top departments by employee count
    const topDepartments = await query(`
      SELECT 
        d.department_name,
        COUNT(e.employee_id) as employee_count,
        AVG(e.salary) as average_salary
      FROM departments d
      LEFT JOIN employees e ON d.department_id = e.department_id 
        AND e.employment_status = 'ACTIVE'
      GROUP BY d.department_id, d.department_name
      ORDER BY employee_count DESC
      LIMIT 5
    `);
    
    // Salary distribution
    const salaryDistribution = await query(`
      SELECT 
        CASE 
          WHEN salary < 40000 THEN 'Under $40k'
          WHEN salary < 60000 THEN '$40k - $60k'
          WHEN salary < 80000 THEN '$60k - $80k'
          WHEN salary < 100000 THEN '$80k - $100k'
          ELSE 'Over $100k'
        END as salary_range,
        COUNT(*) as employee_count
      FROM employees
      WHERE employment_status = 'ACTIVE' AND salary IS NOT NULL
      GROUP BY 
        CASE 
          WHEN salary < 40000 THEN 'Under $40k'
          WHEN salary < 60000 THEN '$40k - $60k'
          WHEN salary < 80000 THEN '$60k - $80k'
          WHEN salary < 100000 THEN '$80k - $100k'
          ELSE 'Over $100k'
        END
      ORDER BY MIN(salary)
    `);
    
    res.json({
      success: true,
      data: {
        employees: employeeStats.rows[0],
        departments: departmentStats.rows[0],
        recent_hires: recentHires.rows,
        top_departments: topDepartments.rows,
        salary_distribution: salaryDistribution.rows
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get complex database queries showcase
router.get('/complex-queries', async (req, res) => {
  try {
    // Query 1: Employee hierarchy (managers and their direct reports)
    const hierarchy = await query(`
      WITH RECURSIVE employee_hierarchy AS (
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
      ORDER BY path
    `);
    
    // Query 2: Department performance metrics
    const deptPerformance = await query(`
      SELECT 
        d.department_name,
        COUNT(e.employee_id) as total_employees,
        AVG(e.salary) as average_salary,
        MIN(e.hire_date) as oldest_employee,
        MAX(e.hire_date) as newest_employee,
        COUNT(CASE WHEN e.hire_date >= CURRENT_DATE - INTERVAL '1 year' THEN 1 END) as new_hires_1_year,
        d.budget,
        ROUND((COUNT(e.employee_id) * AVG(e.salary)) / NULLIF(d.budget, 0) * 100, 2) as salary_budget_ratio
      FROM departments d
      LEFT JOIN employees e ON d.department_id = e.department_id 
        AND e.employment_status = 'ACTIVE'
      GROUP BY d.department_id, d.department_name, d.budget
      ORDER BY total_employees DESC
    `);
    
    // Query 3: Attendance patterns analysis
    const attendancePatterns = await query(`
      SELECT 
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
      ORDER BY attendance_percentage DESC
      LIMIT 20
    `);
    
    // Query 4: Salary progression analysis
    const salaryProgression = await query(`
      SELECT 
        e.employee_id,
        e.first_name || ' ' || e.last_name AS employee_name,
        e.hire_date,
        e.salary as current_salary,
        sh.salary_amount as starting_salary,
        ROUND(((e.salary - sh.salary_amount) / sh.salary_amount * 100), 2) as salary_increase_percentage,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, e.hire_date)) as years_with_company
      FROM employees e
      LEFT JOIN salary_history sh ON e.employee_id = sh.employee_id 
        AND sh.effective_date = e.hire_date
      WHERE e.employment_status = 'ACTIVE' 
        AND e.salary IS NOT NULL 
        AND sh.salary_amount IS NOT NULL
      ORDER BY salary_increase_percentage DESC
      LIMIT 15
    `);
    
    res.json({
      success: true,
      data: {
        employee_hierarchy: hierarchy.rows,
        department_performance: deptPerformance.rows,
        attendance_patterns: attendancePatterns.rows,
        salary_progression: salaryProgression.rows
      }
    });
  } catch (error) {
    console.error('Error fetching complex queries:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get database schema information
router.get('/schema-info', async (req, res) => {
  try {
    // Get table information
    const tables = await query(`
      SELECT 
        table_name,
        table_type,
        table_schema
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    // Get column information
    const columns = await query(`
      SELECT 
        table_name,
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length
      FROM information_schema.columns 
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `);
    
    // Get foreign key relationships
    const foreignKeys = await query(`
      SELECT 
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        tc.constraint_name
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_schema = 'public'
      ORDER BY tc.table_name, kcu.column_name
    `);
    
    // Get index information
    const indexes = await query(`
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    `);
    
    res.json({
      success: true,
      data: {
        tables: tables.rows,
        columns: columns.rows,
        foreign_keys: foreignKeys.rows,
        indexes: indexes.rows
      }
    });
  } catch (error) {
    console.error('Error fetching schema info:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get detailed database information for visualization
router.get('/database-details', async (req, res) => {
  try {
    // Get table constraints and validation rules
    const constraints = await query(`
      SELECT 
        tc.table_name,
        tc.constraint_name,
        tc.constraint_type,
        CASE 
          WHEN tc.constraint_type = 'CHECK' THEN cc.check_clause
          ELSE NULL
        END as check_clause
      FROM information_schema.table_constraints tc
      LEFT JOIN information_schema.check_constraints cc 
        ON tc.constraint_name = cc.constraint_name
      WHERE tc.table_schema = 'public'
        AND tc.constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY', 'UNIQUE', 'CHECK')
      ORDER BY tc.table_name, tc.constraint_type
    `);

    // Get column details with key information
    const detailedColumns = await query(`
      SELECT 
        c.table_name,
        c.column_name,
        c.data_type,
        c.is_nullable,
        c.column_default,
        CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary_key,
        CASE WHEN fk.column_name IS NOT NULL THEN true ELSE false END as is_foreign_key
      FROM information_schema.columns c
      LEFT JOIN (
        SELECT kcu.table_name, kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.constraint_type = 'PRIMARY KEY'
          AND tc.table_schema = 'public'
      ) pk ON c.table_name = pk.table_name AND c.column_name = pk.column_name
      LEFT JOIN (
        SELECT kcu.table_name, kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema = 'public'
      ) fk ON c.table_name = fk.table_name AND c.column_name = fk.column_name
      WHERE c.table_schema = 'public'
      ORDER BY c.table_name, c.ordinal_position
    `);

    // Get database performance statistics
    const performanceStats = await query(`
      SELECT 
        schemaname,
        tablename,
        n_tup_ins as inserts,
        n_tup_upd as updates,
        n_tup_del as deletes,
        n_live_tup as live_tuples,
        n_dead_tup as dead_tuples,
        last_vacuum,
        last_autovacuum,
        last_analyze,
        last_autoanalyze
      FROM pg_stat_user_tables
      WHERE schemaname = 'public'
      ORDER BY n_live_tup DESC
    `);

    // Get index usage statistics
    const indexStats = await query(`
      SELECT 
        schemaname,
        tablename,
        indexname,
        idx_tup_read,
        idx_tup_fetch
      FROM pg_stat_user_indexes
      WHERE schemaname = 'public'
      ORDER BY idx_tup_read DESC
    `);

    res.json({
      success: true,
      data: {
        constraints: constraints.rows,
        detailed_columns: detailedColumns.rows,
        performance_stats: performanceStats.rows,
        index_stats: indexStats.rows
      }
    });
  } catch (error) {
    console.error('Error fetching database details:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get comprehensive database content for showcase
router.get('/database-content', async (req, res) => {
  try {
    // Get complete employee directory with relationships
    const employees = await query(`
      SELECT 
        e.employee_id,
        e.employee_number,
        e.first_name || ' ' || e.last_name AS employee_name,
        d.department_name,
        p.position_title,
        m.first_name || ' ' || m.last_name AS manager_name,
        e.hire_date,
        e.salary,
        e.employment_status,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, e.hire_date)) + 
        EXTRACT(MONTH FROM AGE(CURRENT_DATE, e.hire_date)) / 12.0 AS years_with_company
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.department_id
      LEFT JOIN positions p ON e.position_id = p.position_id
      LEFT JOIN employees m ON e.manager_id = m.employee_id
      WHERE e.employment_status = 'ACTIVE'
      ORDER BY e.hire_date DESC
      LIMIT 50
    `);

    // Get department analytics
    const departments = await query(`
      SELECT 
        d.department_name,
        d.location,
        d.budget,
        COUNT(e.employee_id) as total_employees,
        AVG(e.salary) as average_salary,
        m.first_name || ' ' || m.last_name AS manager_name,
        MIN(e.hire_date) as oldest_hire,
        MAX(e.hire_date) as newest_hire
      FROM departments d
      LEFT JOIN employees e ON d.department_id = e.department_id AND e.employment_status = 'ACTIVE'
      LEFT JOIN employees m ON d.manager_id = m.employee_id
      WHERE d.is_active = true
      GROUP BY d.department_id, d.department_name, d.location, d.budget, m.first_name, m.last_name
      ORDER BY total_employees DESC
    `);

    // Get attendance patterns
    const attendance = await query(`
      SELECT 
        e.first_name || ' ' || e.last_name AS employee_name,
        d.department_name,
        COUNT(ar.attendance_id) as total_days,
        COUNT(CASE WHEN ar.status = 'PRESENT' THEN 1 END) as present_days,
        COUNT(CASE WHEN ar.status = 'ABSENT' THEN 1 END) as absent_days,
        ROUND(
          (COUNT(CASE WHEN ar.status = 'PRESENT' THEN 1 END)::float / 
           NULLIF(COUNT(ar.attendance_id), 0)) * 100, 2
        ) as attendance_percentage,
        AVG(COALESCE(ar.total_hours, 8)) as average_hours,
        SUM(COALESCE(ar.overtime_hours, 0)) as overtime_hours
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.department_id
      LEFT JOIN attendance_records ar ON e.employee_id = ar.employee_id 
        AND ar.attendance_date >= CURRENT_DATE - INTERVAL '90 days'
      WHERE e.employment_status = 'ACTIVE'
      GROUP BY e.employee_id, e.first_name, e.last_name, d.department_name
      HAVING COUNT(ar.attendance_id) > 0
      ORDER BY attendance_percentage DESC
      LIMIT 30
    `);

    // Get salary trends
    const salaryTrends = await query(`
      SELECT 
        e.first_name || ' ' || e.last_name AS employee_name,
        e.salary as current_salary,
        e.hire_date,
        d.department_name,
        p.position_title,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, e.hire_date)) + 
        EXTRACT(MONTH FROM AGE(CURRENT_DATE, e.hire_date)) / 12.0 AS years_with_company,
        COALESCE(
          (SELECT 
            ((e.salary - sh.salary_amount) / sh.salary_amount) * 100
           FROM salary_history sh 
           WHERE sh.employee_id = e.employee_id 
           ORDER BY sh.effective_date ASC 
           LIMIT 1), 0
        ) as salary_growth
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.department_id
      LEFT JOIN positions p ON e.position_id = p.position_id
      WHERE e.employment_status = 'ACTIVE'
      ORDER BY e.salary DESC
      LIMIT 25
    `);

    // Get recent activities (simulated from various operations)
    const recentActivities = await query(`
      SELECT 
        'HIRE' as activity_type,
        'New employee joined the company' as description,
        e.hire_date as timestamp,
        e.first_name || ' ' || e.last_name AS employee_name
      FROM employees e
      WHERE e.hire_date >= CURRENT_DATE - INTERVAL '30 days'
        AND e.employment_status = 'ACTIVE'
      
      UNION ALL
      
      SELECT 
        'SALARY_UPDATE' as activity_type,
        'Salary adjustment processed' as description,
        sh.effective_date as timestamp,
        e.first_name || ' ' || e.last_name AS employee_name
      FROM salary_history sh
      JOIN employees e ON sh.employee_id = e.employee_id
      WHERE sh.effective_date >= CURRENT_DATE - INTERVAL '30 days'
      
      ORDER BY timestamp DESC
      LIMIT 10
    `);

    // Get summary statistics
    const summaryStats = await query(`
      SELECT 
        COUNT(*) as total_employees,
        (SELECT COUNT(*) FROM departments WHERE is_active = true) as total_departments,
        AVG(salary) as average_salary,
        SUM(salary) as total_payroll,
        (SELECT 
          ROUND(
            (COUNT(CASE WHEN ar.status = 'PRESENT' THEN 1 END)::float / 
             NULLIF(COUNT(ar.attendance_id), 0)) * 100, 2
          )
         FROM attendance_records ar
         WHERE ar.attendance_date >= CURRENT_DATE - INTERVAL '30 days'
        ) as attendance_rate,
        (SELECT COUNT(*) 
         FROM employees 
         WHERE hire_date >= DATE_TRUNC('month', CURRENT_DATE)
           AND employment_status = 'ACTIVE'
        ) as new_hires_this_month
      FROM employees
      WHERE employment_status = 'ACTIVE'
    `);

    res.json({
      success: true,
      data: {
        employees: employees.rows,
        departments: departments.rows,
        attendance: attendance.rows,
        salary_trends: salaryTrends.rows,
        recent_activities: recentActivities.rows,
        summary_stats: summaryStats.rows[0]
      }
    });
  } catch (error) {
    console.error('Error fetching database content:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get attendance records with employee details
router.get('/attendance-records', async (req, res) => {
  try {
    // Get attendance records with employee and department info
    const attendanceRecords = await query(`
      SELECT 
        ar.attendance_id,
        ar.employee_id,
        e.first_name || ' ' || e.last_name AS employee_name,
        e.employee_number,
        d.department_name,
        ar.attendance_date,
        ar.check_in_time,
        ar.check_out_time,
        COALESCE(ROUND(ar.total_hours::numeric, 2), 0) as total_hours,
        COALESCE(ROUND(ar.overtime_hours::numeric, 2), 0) as overtime_hours,
        ar.status,
        ar.notes
      FROM attendance_records ar
      LEFT JOIN employees e ON ar.employee_id = e.employee_id
      LEFT JOIN departments d ON e.department_id = d.department_id
      WHERE e.employment_status = 'ACTIVE'
      ORDER BY ar.attendance_date DESC, e.last_name, e.first_name
      LIMIT 500
    `);

    // Get attendance summary statistics
    const summaryStats = await query(`
      SELECT 
        COUNT(*) as total_records,
        COUNT(CASE WHEN ar.status = 'PRESENT' THEN 1 END) as present_count,
        COUNT(CASE WHEN ar.status = 'ABSENT' THEN 1 END) as absent_count,
        COUNT(CASE WHEN ar.status = 'LATE' THEN 1 END) as late_count,
        COUNT(CASE WHEN ar.status = 'HALF_DAY' THEN 1 END) as half_day_count,
        COUNT(CASE WHEN ar.status = 'WORK_FROM_HOME' THEN 1 END) as wfh_count,
        COALESCE(ROUND(AVG(ar.total_hours)::numeric, 2), 0) as avg_hours,
        COALESCE(ROUND(SUM(ar.overtime_hours)::numeric, 2), 0) as total_overtime
      FROM attendance_records ar
      LEFT JOIN employees e ON ar.employee_id = e.employee_id
      WHERE e.employment_status = 'ACTIVE'
        AND ar.attendance_date >= CURRENT_DATE - INTERVAL '30 days'
    `);

    // Get department-wise attendance breakdown
    const departmentBreakdown = await query(`
      SELECT 
        d.department_name,
        COUNT(*) as total_records,
        COUNT(CASE WHEN ar.status = 'PRESENT' THEN 1 END) as present_count,
        COUNT(CASE WHEN ar.status = 'ABSENT' THEN 1 END) as absent_count,
        COALESCE(ROUND(AVG(ar.total_hours)::numeric, 2), 0) as avg_hours
      FROM attendance_records ar
      LEFT JOIN employees e ON ar.employee_id = e.employee_id
      LEFT JOIN departments d ON e.department_id = d.department_id
      WHERE e.employment_status = 'ACTIVE'
        AND ar.attendance_date >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY d.department_name, d.department_id
      ORDER BY present_count DESC
    `);

    // Get recent attendance trends (last 7 days)
    const attendanceTrends = await query(`
      SELECT 
        ar.attendance_date,
        COUNT(*) as total_records,
        COUNT(CASE WHEN ar.status = 'PRESENT' THEN 1 END) as present_count,
        COUNT(CASE WHEN ar.status = 'ABSENT' THEN 1 END) as absent_count,
        COUNT(CASE WHEN ar.status = 'LATE' THEN 1 END) as late_count,
        COALESCE(ROUND(AVG(ar.total_hours)::numeric, 2), 0) as avg_hours
      FROM attendance_records ar
      LEFT JOIN employees e ON ar.employee_id = e.employee_id
      WHERE e.employment_status = 'ACTIVE'
        AND ar.attendance_date >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY ar.attendance_date
      ORDER BY ar.attendance_date DESC
    `);

    res.json({
      success: true,
      data: {
        records: attendanceRecords.rows,
        summary: summaryStats.rows[0],
        department_breakdown: departmentBreakdown.rows,
        trends: attendanceTrends.rows
      }
    });
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;


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

module.exports = router;


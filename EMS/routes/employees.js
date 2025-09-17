const express = require('express');
const { query } = require('../config/database');
const router = express.Router();

// Get all employees with department and position info
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        e.employee_id,
        e.employee_number,
        e.first_name,
        e.last_name,
        e.personal_email,
        e.phone,
        e.hire_date,
        e.employment_status,
        e.salary,
        d.department_name,
        p.position_title,
        m.first_name || ' ' || m.last_name AS manager_name
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.department_id
      LEFT JOIN positions p ON e.position_id = p.position_id
      LEFT JOIN employees m ON e.manager_id = m.employee_id
      ORDER BY e.last_name, e.first_name
    `);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get employee by ID with full details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(`
      SELECT 
        e.*,
        d.department_name,
        p.position_title,
        m.first_name || ' ' || m.last_name AS manager_name,
        u.username,
        u.role
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.department_id
      LEFT JOIN positions p ON e.position_id = p.position_id
      LEFT JOIN employees m ON e.manager_id = m.employee_id
      LEFT JOIN users u ON e.user_id = u.user_id
      WHERE e.employee_id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new employee
router.post('/', async (req, res) => {
  try {
    const {
      employee_number,
      first_name,
      last_name,
      personal_email,
      phone,
      department_id,
      position_id,
      manager_id,
      salary,
      hire_date
    } = req.body;
    
    const result = await query(`
      INSERT INTO employees (
        employee_number, first_name, last_name, personal_email, phone,
        department_id, position_id, manager_id, salary, hire_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING employee_id
    `, [employee_number, first_name, last_name, personal_email, phone, 
        department_id, position_id, manager_id, salary, hire_date]);
    
    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      employee_id: result.rows[0].employee_id
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update employee
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Build dynamic update query
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const values = Object.values(updates);
    values.unshift(id);
    
    const result = await query(`
      UPDATE employees 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE employee_id = $1
      RETURNING employee_id
    `, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }
    
    res.json({
      success: true,
      message: 'Employee updated successfully'
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete employee (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(`
      UPDATE employees 
      SET employment_status = 'TERMINATED', 
          termination_date = CURRENT_DATE,
          updated_at = CURRENT_TIMESTAMP
      WHERE employee_id = $1
      RETURNING employee_id
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }
    
    res.json({
      success: true,
      message: 'Employee terminated successfully'
    });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get employee statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const result = await query(`
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
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching employee stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;


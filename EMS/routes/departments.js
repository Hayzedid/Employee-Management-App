const express = require('express');
const { query } = require('../config/database');
const router = express.Router();

// GET /api/departments - list all departments
router.get('/', async (req, res) => {
  try {
    const result = await query(
      `SELECT department_id, department_name, department_code, description, parent_department_id, manager_id, budget, location, is_active, created_at, updated_at
       FROM departments
       ORDER BY department_name`
    );

    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/departments/:id - get one department
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT d.*, 
              mgr.first_name || ' ' || mgr.last_name AS manager_name
       FROM departments d
       LEFT JOIN employees mgr ON d.manager_id = mgr.employee_id
       WHERE d.department_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Department not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching department:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;



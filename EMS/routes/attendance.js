const express = require('express');
const { query } = require('../config/database');
const router = express.Router();

// Get attendance records for date range
router.get('/', async (req, res) => {
  try {
    const { start_date, end_date, employee_id } = req.query;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;
    
    if (start_date) {
      paramCount++;
      whereClause += ` AND ar.attendance_date >= $${paramCount}`;
      params.push(start_date);
    }
    
    if (end_date) {
      paramCount++;
      whereClause += ` AND ar.attendance_date <= $${paramCount}`;
      params.push(end_date);
    }
    
    if (employee_id) {
      paramCount++;
      whereClause += ` AND ar.employee_id = $${paramCount}`;
      params.push(employee_id);
    }
    
    const result = await query(`
      SELECT 
        ar.attendance_id,
        ar.attendance_date,
        ar.check_in_time,
        ar.check_out_time,
        ar.total_hours,
        ar.overtime_hours,
        ar.status,
        ar.notes,
        e.employee_id,
        e.first_name || ' ' || e.last_name AS employee_name,
        e.employee_number,
        d.department_name
      FROM attendance_records ar
      JOIN employees e ON ar.employee_id = e.employee_id
      LEFT JOIN departments d ON e.department_id = d.department_id
      ${whereClause}
      ORDER BY ar.attendance_date DESC, e.last_name, e.first_name
    `, params);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get attendance summary for employee
router.get('/summary/:employee_id', async (req, res) => {
  try {
    const { employee_id } = req.params;
    const { start_date, end_date } = req.query;
    
    let whereClause = 'WHERE ar.employee_id = $1';
    const params = [employee_id];
    let paramCount = 1;
    
    if (start_date) {
      paramCount++;
      whereClause += ` AND ar.attendance_date >= $${paramCount}`;
      params.push(start_date);
    }
    
    if (end_date) {
      paramCount++;
      whereClause += ` AND ar.attendance_date <= $${paramCount}`;
      params.push(end_date);
    }
    
    const result = await query(`
      SELECT 
        e.employee_id,
        e.first_name || ' ' || e.last_name AS employee_name,
        e.employee_number,
        COUNT(ar.attendance_id) as total_days,
        COUNT(CASE WHEN ar.status = 'PRESENT' THEN 1 END) as present_days,
        COUNT(CASE WHEN ar.status = 'ABSENT' THEN 1 END) as absent_days,
        COUNT(CASE WHEN ar.status = 'LATE' THEN 1 END) as late_days,
        COUNT(CASE WHEN ar.status = 'HALF_DAY' THEN 1 END) as half_days,
        COUNT(CASE WHEN ar.status = 'WORK_FROM_HOME' THEN 1 END) as wfh_days,
        SUM(ar.total_hours) as total_hours,
        SUM(ar.overtime_hours) as total_overtime,
        AVG(ar.total_hours) as average_daily_hours
      FROM employees e
      LEFT JOIN attendance_records ar ON e.employee_id = ar.employee_id
      ${whereClause}
      GROUP BY e.employee_id, e.first_name, e.last_name, e.employee_number
    `, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching attendance summary:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get attendance statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;
    
    if (start_date) {
      paramCount++;
      whereClause += ` AND ar.attendance_date >= $${paramCount}`;
      params.push(start_date);
    }
    
    if (end_date) {
      paramCount++;
      whereClause += ` AND ar.attendance_date <= $${paramCount}`;
      params.push(end_date);
    }
    
    const result = await query(`
      SELECT 
        COUNT(ar.attendance_id) as total_records,
        COUNT(CASE WHEN ar.status = 'PRESENT' THEN 1 END) as present_count,
        COUNT(CASE WHEN ar.status = 'ABSENT' THEN 1 END) as absent_count,
        COUNT(CASE WHEN ar.status = 'LATE' THEN 1 END) as late_count,
        COUNT(CASE WHEN ar.status = 'HALF_DAY' THEN 1 END) as half_day_count,
        COUNT(CASE WHEN ar.status = 'WORK_FROM_HOME' THEN 1 END) as wfh_count,
        SUM(ar.total_hours) as total_hours,
        SUM(ar.overtime_hours) as total_overtime,
        AVG(ar.total_hours) as average_hours_per_day,
        COUNT(DISTINCT ar.employee_id) as unique_employees
      FROM attendance_records ar
      ${whereClause}
    `, params);
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get attendance by department
router.get('/by-department', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;
    
    if (start_date) {
      paramCount++;
      whereClause += ` AND ar.attendance_date >= $${paramCount}`;
      params.push(start_date);
    }
    
    if (end_date) {
      paramCount++;
      whereClause += ` AND ar.attendance_date <= $${paramCount}`;
      params.push(end_date);
    }
    
    const result = await query(`
      SELECT 
        d.department_id,
        d.department_name,
        COUNT(ar.attendance_id) as total_records,
        COUNT(CASE WHEN ar.status = 'PRESENT' THEN 1 END) as present_count,
        COUNT(CASE WHEN ar.status = 'ABSENT' THEN 1 END) as absent_count,
        COUNT(CASE WHEN ar.status = 'LATE' THEN 1 END) as late_count,
        SUM(ar.total_hours) as total_hours,
        AVG(ar.total_hours) as average_hours,
        COUNT(DISTINCT ar.employee_id) as unique_employees
      FROM departments d
      LEFT JOIN employees e ON d.department_id = e.department_id AND e.employment_status = 'ACTIVE'
      LEFT JOIN attendance_records ar ON e.employee_id = ar.employee_id
      ${whereClause}
      GROUP BY d.department_id, d.department_name
      ORDER BY total_records DESC
    `, params);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching attendance by department:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;


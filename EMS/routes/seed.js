const express = require('express');
const { query } = require('../config/database');
const router = express.Router();

// Seed database with comprehensive data
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

    // Add comprehensive attendance records for last 30 days
    const activeEmployees = await query(`
      SELECT employee_id FROM employees 
      WHERE employment_status = 'ACTIVE' 
      AND employee_id <= 50
    `);

    let attendanceCount = 0;
    for (const emp of activeEmployees.rows) {
      for (let i = 0; i <= 29; i++) {
        const attendanceDate = new Date();
        attendanceDate.setDate(attendanceDate.getDate() - i);
        
        // Skip weekends
        if (attendanceDate.getDay() === 0 || attendanceDate.getDay() === 6) continue;

        const statusProb = Math.random() * 100;
        let status, checkin, checkout;

        if (statusProb < 80) {
          status = 'PRESENT';
          checkin = '08:' + String(30 + Math.floor(Math.random() * 90)).padStart(2, '0') + ':00';
          checkout = '17:' + String(Math.floor(Math.random() * 120)).padStart(2, '0') + ':00';
        } else if (statusProb < 90) {
          status = 'LATE';
          checkin = '09:' + String(30 + Math.floor(Math.random() * 60)).padStart(2, '0') + ':00';
          checkout = '17:' + String(30 + Math.floor(Math.random() * 90)).padStart(2, '0') + ':00';
        } else if (statusProb < 95) {
          status = 'ABSENT';
          checkin = null;
          checkout = null;
        } else {
          status = 'WORK_FROM_HOME';
          checkin = '09:' + String(Math.floor(Math.random() * 60)).padStart(2, '0') + ':00';
          checkout = '17:' + String(Math.floor(Math.random() * 60)).padStart(2, '0') + ':00';
        }

        try {
          await query(`
            INSERT INTO attendance_records (employee_id, attendance_date, check_in_time, check_out_time, status, overtime_hours)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (employee_id, attendance_date) DO NOTHING
          `, [
            emp.employee_id,
            attendanceDate.toISOString().split('T')[0],
            checkin,
            checkout,
            status,
            status === 'PRESENT' && Math.random() < 0.3 ? Math.round(Math.random() * 3 * 100) / 100 : 0
          ]);
          attendanceCount++;
        } catch (err) {
          // Skip conflicts
        }
      }
    }

    // Update some existing employees with recent hire dates
    await query(`
      UPDATE employees 
      SET hire_date = CASE 
        WHEN employee_number IN ('EMP0087', 'EMP0088') THEN '2025-09-15'
        WHEN employee_number IN ('EMP0089', 'EMP0090') THEN '2025-09-20'
        WHEN employee_number IN ('EMP0091', 'EMP0092') THEN '2025-09-25'
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
      message: 'Database seeded successfully!',
      data: {
        employees_added: employeeCount,
        attendance_records_added: attendanceCount,
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
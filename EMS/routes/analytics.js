const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Load mock data
const mockDataPath = path.join(__dirname, '../mock-data.json');
let mockData = {};

try {
  if (fs.existsSync(mockDataPath)) {
    mockData = JSON.parse(fs.readFileSync(mockDataPath, 'utf8'));
    console.log('✅ Mock data loaded successfully');
  }
} catch (error) {
  console.error('❌ Error loading mock data:', error);
}

// Get comprehensive dashboard analytics
router.get('/dashboard', async (req, res) => {
  try {
    const dashboardData = mockData['/api/analytics/dashboard'];
    if (dashboardData) {
      res.json(dashboardData);
    } else {
      res.status(500).json({ success: false, error: 'Dashboard data not available' });
    }
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get complex database queries showcase
router.get('/complex-queries', async (req, res) => {
  try {
    const complexQueriesData = mockData['/api/analytics/complex-queries'];
    if (complexQueriesData) {
      res.json(complexQueriesData);
    } else {
      res.status(500).json({ success: false, error: 'Complex queries data not available' });
    }
  } catch (error) {
    console.error('Error fetching complex queries:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get database schema information
router.get('/schema-info', async (req, res) => {
  try {
    const schemaData = mockData['/api/analytics/schema-info'];
    if (schemaData) {
      res.json(schemaData);
    } else {
      res.status(500).json({ success: false, error: 'Schema info not available' });
    }
  } catch (error) {
    console.error('Error fetching schema info:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get detailed database information for visualization
router.get('/database-details', async (req, res) => {
  try {
    const detailsData = mockData['/api/analytics/database-details'];
    if (detailsData) {
      res.json(detailsData);
    } else {
      res.status(500).json({ success: false, error: 'Database details not available' });
    }
  } catch (error) {
    console.error('Error fetching database details:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get comprehensive database content for showcase
router.get('/database-content', async (req, res) => {
  try {
    const contentData = mockData['/api/analytics/database-content'];
    if (contentData) {
      res.json(contentData);
    } else {
      res.status(500).json({ success: false, error: 'Database content not available' });
    }
  } catch (error) {
    console.error('Error fetching database content:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get attendance records with employee details
router.get('/attendance-records', async (req, res) => {
  try {
    // Generate mock attendance data
    const mockAttendanceData = {
      success: true,
      data: {
        records: generateMockAttendanceRecords(50),
        summary: {
          total_records: 1250,
          present_count: 1180,
          absent_count: 45,
          late_count: 25,
          half_day_count: 15,
          wfh_count: 85,
          avg_hours: 8.2,
          total_overtime: 125.5
        },
        department_breakdown: [
          { department_name: 'Information Technology', total_records: 350, present_count: 330, absent_count: 12, avg_hours: 8.4 },
          { department_name: 'Sales', total_records: 280, present_count: 265, absent_count: 8, avg_hours: 8.1 },
          { department_name: 'Marketing', total_records: 220, present_count: 210, absent_count: 6, avg_hours: 8.0 },
          { department_name: 'Finance', total_records: 180, present_count: 172, absent_count: 5, avg_hours: 8.3 },
          { department_name: 'Human Resources', total_records: 120, present_count: 115, absent_count: 3, avg_hours: 7.9 }
        ],
        trends: [
          { attendance_date: '2024-09-30', total_records: 142, present_count: 135, absent_count: 4, late_count: 3, avg_hours: 8.1 },
          { attendance_date: '2024-09-29', total_records: 142, present_count: 138, absent_count: 2, late_count: 2, avg_hours: 8.3 },
          { attendance_date: '2024-09-28', total_records: 142, present_count: 140, absent_count: 1, late_count: 1, avg_hours: 8.2 },
          { attendance_date: '2024-09-27', total_records: 142, present_count: 136, absent_count: 3, late_count: 3, avg_hours: 8.0 },
          { attendance_date: '2024-09-26', total_records: 142, present_count: 139, absent_count: 2, late_count: 1, avg_hours: 8.4 }
        ]
      }
    };

    res.json(mockAttendanceData);
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper function to generate mock attendance records
function generateMockAttendanceRecords(count) {
  const records = [];
  const employees = [
    'John Smith', 'Jane Doe', 'Mike Johnson', 'Sarah Wilson', 'Tom Brown',
    'Lisa Davis', 'Robert Miller', 'Emily Garcia', 'David Martinez', 'Jennifer Lopez'
  ];
  const departments = [
    'Information Technology', 'Sales', 'Marketing', 'Finance', 'Human Resources',
    'Operations', 'Research & Development', 'Customer Support'
  ];
  const statuses = ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'WORK_FROM_HOME'];

  for (let i = 1; i <= count; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    const checkInHour = 8 + Math.floor(Math.random() * 2);
    const checkInMinute = Math.floor(Math.random() * 60);
    const checkIn = new Date(date);
    checkIn.setHours(checkInHour, checkInMinute);
    
    const checkOut = new Date(checkIn);
    checkOut.setHours(checkIn.getHours() + 8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60));
    
    const totalHours = (checkOut - checkIn) / (1000 * 60 * 60);
    const overtimeHours = Math.max(0, totalHours - 8);

    records.push({
      attendance_id: i,
      employee_id: Math.floor(Math.random() * 50) + 1,
      employee_name: employees[Math.floor(Math.random() * employees.length)],
      employee_number: `EMP${String(Math.floor(Math.random() * 200) + 1).padStart(4, '0')}`,
      department_name: departments[Math.floor(Math.random() * departments.length)],
      attendance_date: date.toISOString().split('T')[0],
      check_in_time: checkIn.toISOString(),
      check_out_time: checkOut.toISOString(),
      total_hours: totalHours.toFixed(1),
      overtime_hours: overtimeHours.toFixed(1),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      notes: Math.random() > 0.7 ? 'Working from home' : null
    });
  }

  return records.sort((a, b) => new Date(b.attendance_date) - new Date(a.attendance_date));
}

module.exports = router;


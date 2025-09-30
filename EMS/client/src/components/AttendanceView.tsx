import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Search, Filter, CheckCircle, XCircle, AlertCircle, Home } from 'lucide-react';

interface AttendanceRecord {
  attendance_id: number;
  employee_id: number;
  employee_name: string;
  employee_number: string;
  department_name: string;
  attendance_date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  total_hours: number;
  overtime_hours: number;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'WORK_FROM_HOME';
  notes: string | null;
}

interface AttendanceSummary {
  total_records: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  avg_hours: number;
  total_overtime: number;
}

const AttendanceView: React.FC = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:5000/api/analytics/attendance-records');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        // Process attendance records to ensure numeric values
        const processedRecords = (data.data.records || []).map((record: any) => ({
          ...record,
          total_hours: Number(record.total_hours || 0),
          overtime_hours: Number(record.overtime_hours || 0),
          attendance_id: Number(record.attendance_id),
          employee_id: Number(record.employee_id)
        }));
        
        setAttendanceRecords(processedRecords);
        
        // Ensure summary has proper default values
        const summaryData = data.data.summary || {};
        setSummary({
          total_records: Number(summaryData.total_records) || 0,
          present_count: Number(summaryData.present_count) || 0,
          absent_count: Number(summaryData.absent_count) || 0,
          late_count: Number(summaryData.late_count) || 0,
          avg_hours: Number(summaryData.avg_hours) || 0,
          total_overtime: Number(summaryData.total_overtime) || 0
        });
      } else {
        throw new Error(data.error || 'Failed to fetch attendance data');
      }
    } catch (err) {
      console.error('Error fetching attendance data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch attendance data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return <CheckCircle className="text-green-600" size={16} />;
      case 'ABSENT':
        return <XCircle className="text-red-600" size={16} />;
      case 'LATE':
        return <AlertCircle className="text-yellow-600" size={16} />;
      case 'WORK_FROM_HOME':
        return <Home className="text-blue-600" size={16} />;
      default:
        return <AlertCircle className="text-gray-600" size={16} />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return 'status-present';
      case 'ABSENT':
        return 'status-absent';
      case 'LATE':
        return 'status-late';
      case 'WORK_FROM_HOME':
        return 'status-wfh';
      case 'HALF_DAY':
        return 'status-half-day';
      default:
        return 'status-default';
    }
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '-';
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', { 
        hour12: true, 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return '-';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = 
      record.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employee_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.department_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || record.status === statusFilter;
    const matchesDate = !dateFilter || record.attendance_date.includes(dateFilter);
    const matchesDepartment = departmentFilter === 'ALL' || record.department_name === departmentFilter;

    return matchesSearch && matchesStatus && matchesDate && matchesDepartment;
  });

  const uniqueDepartments = Array.from(new Set(attendanceRecords.map(r => r.department_name)));

  if (loading) {
    return (
      <div className="loading">
        <Clock className="animate-spin" size={24} />
        <span>Loading attendance records...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Error Loading Attendance Data</h3>
        <p>{error}</p>
        <button onClick={fetchAttendanceData} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="attendance-view">
        <div className="page-header">
          <div className="header-content">
            <h1>
              <Calendar size={28} />
              Attendance Records
            </h1>
            <p>View and monitor employee attendance data</p>
          </div>
        </div>

      {/* Summary Cards */}
      {summary && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{summary.total_records}</div>
            <div className="stat-label">Total Records</div>
          </div>
          <div className="stat-card">
            <div className="stat-value attendance-present">{summary.present_count}</div>
            <div className="stat-label">Present</div>
          </div>
          <div className="stat-card">
            <div className="stat-value attendance-absent">{summary.absent_count}</div>
            <div className="stat-label">Absent</div>
          </div>
          <div className="stat-card">
            <div className="stat-value attendance-late">{summary.late_count}</div>
            <div className="stat-label">Late</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{Number(summary?.avg_hours || 0).toFixed(1)}h</div>
            <div className="stat-label">Avg Hours</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{Number(summary?.total_overtime || 0).toFixed(1)}h</div>
            <div className="stat-label">Total Overtime</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="search-container">
          <div className="search-input">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by employee name, number, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select filter-select"
            title="Filter by attendance status"
          >
            <option value="ALL">All Status</option>
            <option value="PRESENT">Present</option>
            <option value="ABSENT">Absent</option>
            <option value="LATE">Late</option>
            <option value="HALF_DAY">Half Day</option>
            <option value="WORK_FROM_HOME">Work From Home</option>
          </select>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="form-select filter-select"
            title="Filter by department"
          >
            <option value="ALL">All Departments</option>
            {uniqueDepartments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="form-input filter-select"
            title="Filter by date"
          />
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="table-card">
        <div className="table-header">
          <h3>Attendance Records</h3>
          <p>Recent attendance data with detailed information</p>
        </div>
        <div className="table-content">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Hours</th>
                <th>Overtime</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="no-records">
                    No attendance records found
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.attendance_id}>
                    <td>
                      <div className="employee-info">
                        <div className="employee-name">{record.employee_name}</div>
                        <div className="employee-number">#{record.employee_number}</div>
                      </div>
                    </td>
                    <td>
                      <span className="department-name">{record.department_name}</span>
                    </td>
                    <td>
                      <div className="date">
                        {formatDate(record.attendance_date)}
                      </div>
                    </td>
                    <td>
                      <span className="attendance-time check-in">
                        {formatTime(record.check_in_time)}
                      </span>
                    </td>
                    <td>
                      <span className="attendance-time check-out">
                        {formatTime(record.check_out_time)}
                      </span>
                    </td>
                    <td>
                      <span className="attendance-hours">
                        {Number(record.total_hours || 0).toFixed(1)}h
                      </span>
                    </td>
                    <td>
                      <span className="overtime-hours">
                        {Number(record.overtime_hours || 0).toFixed(1)}h
                      </span>
                    </td>
                    <td>
                      <span className={`attendance-status ${getStatusClass(record.status)}`}>
                        {getStatusIcon(record.status)}
                        {record.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span className="attendance-notes">
                        {record.notes || '-'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        </div>
      </div>
    </>
  );
};

export default AttendanceView;
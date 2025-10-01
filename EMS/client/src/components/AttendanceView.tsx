import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Search, CheckCircle, XCircle, AlertCircle, Home, Download, RefreshCw, TrendingUp, Users, SortAsc, SortDesc } from 'lucide-react';

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
  const [sortField, setSortField] = useState<keyof AttendanceRecord>('attendance_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await fetch('/api/analytics/attendance-records');
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
      setRefreshing(false);
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

  const sortedRecords = [...filteredRecords].sort((a, b) => {
    const aValue = a[sortField] || '';
    const bValue = b[sortField] || '';
    
    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const totalPages = Math.ceil(sortedRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRecords = sortedRecords.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: keyof AttendanceRecord) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Employee', 'Department', 'Date', 'Check In', 'Check Out', 'Hours', 'Overtime', 'Status', 'Notes'],
      ...sortedRecords.map(record => [
        record.employee_name,
        record.department_name,
        record.attendance_date,
        formatTime(record.check_in_time),
        formatTime(record.check_out_time),
        record.total_hours.toFixed(1),
        record.overtime_hours.toFixed(1),
        record.status,
        record.notes || ''
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance-records.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

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
        <button onClick={() => fetchAttendanceData()} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Enhanced Header */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h2 className="card-title">
                <Calendar size={24} style={{ marginRight: '0.5rem' }} />
                Attendance Records
              </h2>
              <p className="card-subtitle">View and monitor employee attendance data</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button 
                onClick={() => fetchAttendanceData(true)}
                disabled={refreshing}
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
              <button onClick={handleExport} className="btn btn-secondary">
                <Download size={16} />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Summary Cards */}
      {summary && (
        <div className="stats-grid">
          <div className="stat-card">
            <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', padding: '1rem', borderRadius: 'var(--radius-lg)', color: 'white' }}>
              <Users size={24} />
            </div>
            <div>
              <div className="stat-value">{summary.total_records}</div>
              <div className="stat-label">Total Records</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Last 30 days
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '1rem', borderRadius: 'var(--radius-lg)', color: 'white' }}>
              <CheckCircle size={24} />
            </div>
            <div>
              <div className="stat-value" style={{ color: 'var(--accent-success)' }}>{summary.present_count}</div>
              <div className="stat-label">Present</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--accent-success)', marginTop: '0.25rem' }}>
                {Math.round((summary.present_count / summary.total_records) * 100)}% attendance rate
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', padding: '1rem', borderRadius: 'var(--radius-lg)', color: 'white' }}>
              <XCircle size={24} />
            </div>
            <div>
              <div className="stat-value" style={{ color: 'var(--accent-error)' }}>{summary.absent_count}</div>
              <div className="stat-label">Absent</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--accent-error)', marginTop: '0.25rem' }}>
                {Math.round((summary.absent_count / summary.total_records) * 100)}% absence rate
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', padding: '1rem', borderRadius: 'var(--radius-lg)', color: 'white' }}>
              <AlertCircle size={24} />
            </div>
            <div>
              <div className="stat-value" style={{ color: 'var(--accent-warning)' }}>{summary.late_count}</div>
              <div className="stat-label">Late</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--accent-warning)', marginTop: '0.25rem' }}>
                {Math.round((summary.late_count / summary.total_records) * 100)}% late rate
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', padding: '1rem', borderRadius: 'var(--radius-lg)', color: 'white' }}>
              <Clock size={24} />
            </div>
            <div>
              <div className="stat-value">{Number(summary?.avg_hours || 0).toFixed(1)}h</div>
              <div className="stat-label">Avg Hours</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Per day
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', padding: '1rem', borderRadius: 'var(--radius-lg)', color: 'white' }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <div className="stat-value">{Number(summary?.total_overtime || 0).toFixed(1)}h</div>
              <div className="stat-label">Total Overtime</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                This period
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Filters */}
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

      {/* Enhanced Attendance Records Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Attendance Records</h3>
          <p className="card-subtitle">
            Showing {paginatedRecords.length} of {sortedRecords.length} records
          </p>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSort('employee_name')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Employee
                    {sortField === 'employee_name' && (
                      sortDirection === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />
                    )}
                  </div>
                </th>
                <th onClick={() => handleSort('department_name')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Department
                    {sortField === 'department_name' && (
                      sortDirection === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />
                    )}
                  </div>
                </th>
                <th onClick={() => handleSort('attendance_date')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Date
                    {sortField === 'attendance_date' && (
                      sortDirection === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />
                    )}
                  </div>
                </th>
                <th>Check In</th>
                <th>Check Out</th>
                <th onClick={() => handleSort('total_hours')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Hours
                    {sortField === 'total_hours' && (
                      sortDirection === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />
                    )}
                  </div>
                </th>
                <th onClick={() => handleSort('overtime_hours')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Overtime
                    {sortField === 'overtime_hours' && (
                      sortDirection === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />
                    )}
                  </div>
                </th>
                <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Status
                    {sortField === 'status' && (
                      sortDirection === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />
                    )}
                  </div>
                </th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No attendance records found
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((record) => (
                  <tr key={record.attendance_id}>
                    <td>
                      <div>
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
                      <span className={`status-badge ${getStatusClass(record.status)}`}>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '1.5rem 2rem',
            borderTop: '1px solid var(--border-light)'
          }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedRecords.length)} of {sortedRecords.length} records
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1rem' }}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`btn ${currentPage === page ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.5rem 1rem' }}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1rem' }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AttendanceView;
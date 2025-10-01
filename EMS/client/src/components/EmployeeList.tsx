import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, CheckCircle, AlertCircle, Filter, Download, MoreVertical, Eye, SortAsc, SortDesc } from 'lucide-react';

interface Department {
  department_id: number;
  department_name: string;
  is_active: boolean;
  budget: number;
}

interface Position {
  position_id: number;
  position_title: string;
  department_id: number;
}

interface Employee {
  employee_id?: number;
  employee_number: string;
  first_name: string;
  last_name: string;
  personal_email: string;
  phone: string;
  department_id: string;
  department_name?: string;
  position_id: string;
  position_title?: string;
  manager_id: string;
  manager_name?: string;
  salary: string;
  hire_date: string;
  employment_status?: string;
}

const EmployeeList: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [addEmployeeError, setAddEmployeeError] = useState<string | null>(null);
  const [deleteEmployeeError, setDeleteEmployeeError] = useState<string | null>(null);
  const [addEmployeeSuccess, setAddEmployeeSuccess] = useState(false);
  const [deleteEmployeeSuccess, setDeleteEmployeeSuccess] = useState(false);
  const [sortField, setSortField] = useState<keyof Employee>('last_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [newEmployee, setNewEmployee] = useState<Employee>({
    employee_number: '',
    first_name: '',
    last_name: '',
    personal_email: '',
    phone: '',
    department_id: '',
    position_id: '',
    manager_id: '',
    salary: '',
    hire_date: ''
  });

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchPositions();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/employees');
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      const result = await response.json();
      setEmployees(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments');
      if (!response.ok) {
        throw new Error('Failed to fetch departments');
      }
      const result = await response.json();
      setDepartments(result.data);
    } catch (err) {
      setError('Failed to load departments');
    }
  };

  const fetchPositions = async () => {
    try {
      // For now, we'll use sample data since there's no positions API
      // In a real application, this would fetch from an API endpoint
      const samplePositions: Position[] = [
        { position_id: 1, position_title: 'HR Manager', department_id: 1 },
        { position_id: 2, position_title: 'HR Specialist', department_id: 1 },
        { position_id: 3, position_title: 'Software Developer', department_id: 2 },
        { position_id: 4, position_title: 'IT Manager', department_id: 2 },
        { position_id: 5, position_title: 'Financial Analyst', department_id: 3 },
        { position_id: 6, position_title: 'Marketing Coordinator', department_id: 4 },
        { position_id: 7, position_title: 'Operations Manager', department_id: 5 }
      ];
      setPositions(samplePositions);
    } catch (err) {
      setError('Failed to load positions');
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employee_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.department_name && employee.department_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDepartment = filterDepartment === 'all' || 
      (employee.department_name && employee.department_name === filterDepartment);
    
    const matchesStatus = filterStatus === 'all' || 
      (employee.employment_status && employee.employment_status === filterStatus);
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    const aValue = a[sortField] || '';
    const bValue = b[sortField] || '';
    
    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const totalPages = Math.ceil(sortedEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmployees = sortedEmployees.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: keyof Employee) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Name', 'Employee #', 'Email', 'Department', 'Position', 'Status', 'Salary'],
      ...sortedEmployees.map(emp => [
        `${emp.first_name} ${emp.last_name}`,
        emp.employee_number,
        emp.personal_email,
        emp.department_name || '',
        emp.position_title || '',
        emp.employment_status || '',
        emp.salary || ''
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employees.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const validateEmployeeForm = () => {
    const errors: string[] = [];

    if (!newEmployee.employee_number.trim()) {
      errors.push('Employee number is required');
    }
    if (!newEmployee.first_name.trim()) {
      errors.push('First name is required');
    }
    if (!newEmployee.last_name.trim()) {
      errors.push('Last name is required');
    }
    if (!newEmployee.personal_email.trim()) {
      errors.push('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(newEmployee.personal_email)) {
      errors.push('Email format is invalid');
    }
    if (!newEmployee.department_id) {
      errors.push('Department is required');
    }
    if (!newEmployee.position_id) {
      errors.push('Position is required');
    }
    if (!newEmployee.salary.trim()) {
      errors.push('Salary is required');
    } else if (isNaN(parseFloat(newEmployee.salary)) || parseFloat(newEmployee.salary) <= 0) {
      errors.push('Salary must be a positive number');
    }
    if (!newEmployee.hire_date) {
      errors.push('Hire date is required');
    }

    return errors;
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddEmployeeError(null);
    setAddEmployeeSuccess(false);

    // Validate form
    const validationErrors = validateEmployeeForm();
    if (validationErrors.length > 0) {
      setAddEmployeeError(validationErrors.join(', '));
      return;
    }

    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newEmployee,
          department_id: parseInt(newEmployee.department_id),
          position_id: parseInt(newEmployee.position_id),
          manager_id: newEmployee.manager_id ? parseInt(newEmployee.manager_id) : null,
          salary: parseFloat(newEmployee.salary),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add employee');
      }

      // Refresh the employee list
      await fetchEmployees();

      // Reset form and close modal
      setNewEmployee({
        employee_number: '',
        first_name: '',
        last_name: '',
        personal_email: '',
        phone: '',
        department_id: '',
        position_id: '',
        manager_id: '',
        salary: '',
        hire_date: ''
      });
      setShowAddModal(false);
      setAddEmployeeSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => setAddEmployeeSuccess(false), 3000);
    } catch (err) {
      setAddEmployeeError(err instanceof Error ? err.message : 'An error occurred while adding employee');
    }
  };  const handleDeleteEmployee = async (employeeId: number) => {
    const confirmed = window.confirm('Are you sure you want to delete this employee? This action cannot be undone.');
    if (!confirmed) return;

    setDeleteEmployeeError(null);
    setDeleteEmployeeSuccess(false);

    try {
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete employee');
      }

      // Refresh the employee list
      await fetchEmployees();
      setDeleteEmployeeSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => setDeleteEmployeeSuccess(false), 3000);
    } catch (err) {
      setDeleteEmployeeError(err instanceof Error ? err.message : 'An error occurred while deleting employee');
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div>Loading employees...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        Error loading employees: {error}
        <br />
        <small>Make sure the backend server is running on port 5000</small>
      </div>
    );
  }

  return (
    <>
      {/* Enhanced Search and Filter Controls */}
      <div className="search-container">
        <div className="search-input">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search employees by name, number, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
          />
        </div>
        
        <select
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value)}
          className="form-select filter-select"
        >
          <option value="all">All Departments</option>
          {departments.map(dept => (
            <option key={dept.department_id} value={dept.department_name}>
              {dept.department_name}
            </option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="form-select filter-select"
        >
          <option value="all">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="TERMINATED">Terminated</option>
          <option value="INACTIVE">Inactive</option>
        </select>

        <button onClick={handleExport} className="btn btn-secondary">
          <Download size={16} />
          Export
        </button>

        <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
          <Plus size={16} />
          Add Employee
        </button>
      </div>

      {/* Employee Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Employee Directory</h3>
          <p className="card-subtitle">
            Showing {paginatedEmployees.length} of {sortedEmployees.length} employees
          </p>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSort('first_name')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Employee
                    {sortField === 'first_name' && (
                      sortDirection === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />
                    )}
                  </div>
                </th>
                <th onClick={() => handleSort('employee_number')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Employee #
                    {sortField === 'employee_number' && (
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
                <th onClick={() => handleSort('position_title')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Position
                    {sortField === 'position_title' && (
                      sortDirection === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />
                    )}
                  </div>
                </th>
                <th>Manager</th>
                <th onClick={() => handleSort('employment_status')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Status
                    {sortField === 'employment_status' && (
                      sortDirection === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />
                    )}
                  </div>
                </th>
                <th onClick={() => handleSort('salary')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Salary
                    {sortField === 'salary' && (
                      sortDirection === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />
                    )}
                  </div>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEmployees.map((employee) => (
                <tr key={employee.employee_id}>
                  <td>
                    <div>
                      <div className="employee-name">
                        {employee.first_name} {employee.last_name}
                      </div>
                      <div className="employee-email">
                        {employee.personal_email}
                      </div>
                    </div>
                  </td>
                  <td>{employee.employee_number}</td>
                  <td>{employee.department_name}</td>
                  <td>{employee.position_title}</td>
                  <td>{employee.manager_name || 'N/A'}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        employee.employment_status === 'ACTIVE'
                          ? 'status-active'
                          : 'status-terminated'
                      }`}
                    >
                      {employee.employment_status}
                    </span>
                  </td>
                  <td>${employee.salary?.toLocaleString() || 'N/A'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => setSelectedEmployee(employee)}
                        className="btn btn-secondary"
                        style={{ padding: '0.5rem' }}
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.5rem' }}
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(employee.employee_id!)}
                        className="btn btn-secondary"
                        style={{ padding: '0.5rem', color: 'var(--accent-error)' }}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedEmployees.length)} of {sortedEmployees.length} employees
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

      {/* Employee Details Modal */}
      {selectedEmployee && (
        <div className="employee-modal-overlay" onClick={() => setSelectedEmployee(null)}>
          <div className="employee-modal" onClick={(e) => e.stopPropagation()}>
            <div className="employee-modal-header">
              <h3 className="card-title">Employee Details</h3>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="employee-modal-close"
              >
                ×
              </button>
            </div>
            <div className="employee-details">
              <p><strong>Name:</strong> {selectedEmployee.first_name} {selectedEmployee.last_name}</p>
              <p><strong>Employee #:</strong> {selectedEmployee.employee_number}</p>
              <p><strong>Email:</strong> {selectedEmployee.personal_email}</p>
              <p><strong>Phone:</strong> {selectedEmployee.phone}</p>
              <p><strong>Department:</strong> {selectedEmployee.department_name}</p>
              <p><strong>Position:</strong> {selectedEmployee.position_title}</p>
              <p><strong>Manager:</strong> {selectedEmployee.manager_name || 'N/A'}</p>
              <p><strong>Hire Date:</strong> {new Date(selectedEmployee.hire_date).toLocaleDateString()}</p>
              <p><strong>Status:</strong> {selectedEmployee.employment_status}</p>
              <p><strong>Salary:</strong> ${selectedEmployee.salary?.toLocaleString() || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="employee-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="employee-modal" onClick={(e) => e.stopPropagation()}>
            <div className="employee-modal-header">
              <h3 className="card-title">Add New Employee</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="employee-modal-close"
              >
                ×
              </button>
            </div>
            {/* Debug info */}
            <div className="employee-debug-info">
              <strong>Debug Info:</strong><br />
              Departments loaded: {departments.length}<br />
              Positions loaded: {positions.length}
            </div>
            <form onSubmit={handleAddEmployee}>
              <div className="employee-form-grid">
                <div className="employee-form-group">
                  <label className="employee-form-label">Employee Number</label>
                  <input
                    type="text"
                    value={newEmployee.employee_number}
                    onChange={(e) => setNewEmployee({...newEmployee, employee_number: e.target.value})}
                    required
                    className="employee-form-input"
                    aria-label="Employee Number"
                    placeholder="Enter employee number"
                  />
                </div>
                <div className="employee-form-group">
                  <label className="employee-form-label">First Name</label>
                  <input
                    type="text"
                    value={newEmployee.first_name}
                    onChange={(e) => setNewEmployee({...newEmployee, first_name: e.target.value})}
                    required
                    className="employee-form-input"
                    aria-label="First Name"
                    placeholder="Enter first name"
                  />
                </div>
                <div className="employee-form-group">
                  <label className="employee-form-label">Last Name</label>
                  <input
                    type="text"
                    value={newEmployee.last_name}
                    onChange={(e) => setNewEmployee({...newEmployee, last_name: e.target.value})}
                    required
                    className="employee-form-input"
                    aria-label="Last Name"
                    placeholder="Enter last name"
                  />
                </div>
                <div className="employee-form-group">
                  <label className="employee-form-label">Email</label>
                  <input
                    type="email"
                    value={newEmployee.personal_email}
                    onChange={(e) => setNewEmployee({...newEmployee, personal_email: e.target.value})}
                    required
                    className="employee-form-input"
                    aria-label="Email Address"
                    placeholder="Enter email address"
                  />
                </div>
                <div className="employee-form-group">
                  <label className="employee-form-label">Phone</label>
                  <input
                    type="tel"
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                    className="employee-form-input"
                    aria-label="Phone Number"
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="employee-form-group">
                  <label className="employee-form-label">Department</label>
                  <select
                    value={newEmployee.department_id}
                    onChange={(e) => setNewEmployee({...newEmployee, department_id: e.target.value})}
                    required
                    className="employee-form-select"
                    aria-label="Select Department"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.department_id} value={dept.department_id}>
                        {dept.department_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="employee-form-group">
                  <label className="employee-form-label">Position</label>
                  <select
                    value={newEmployee.position_id}
                    onChange={(e) => setNewEmployee({...newEmployee, position_id: e.target.value})}
                    required
                    className="employee-form-select"
                    aria-label="Select Position"
                  >
                    <option value="">Select Position</option>
                    {positions.map((pos) => (
                      <option key={pos.position_id} value={pos.position_id}>
                        {pos.position_title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="employee-form-group">
                  <label className="employee-form-label">Manager ID (Optional)</label>
                  <input
                    type="number"
                    value={newEmployee.manager_id}
                    onChange={(e) => setNewEmployee({...newEmployee, manager_id: e.target.value})}
                    className="employee-form-input"
                    aria-label="Manager ID"
                    placeholder="Enter Manager ID"
                  />
                </div>
                <div className="employee-form-group">
                  <label className="employee-form-label">Salary</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newEmployee.salary}
                    onChange={(e) => setNewEmployee({...newEmployee, salary: e.target.value})}
                    required
                    className="employee-form-input"
                    aria-label="Salary Amount"
                    placeholder="Enter salary amount"
                  />
                </div>
                <div className="employee-form-group employee-form-full-width">
                  <label className="employee-form-label">Hire Date</label>
                  <input
                    type="date"
                    value={newEmployee.hire_date}
                    onChange={(e) => setNewEmployee({...newEmployee, hire_date: e.target.value})}
                    required
                    className="employee-form-input"
                    aria-label="Hire Date"
                  />
                </div>
              </div>
              <div className="employee-form-actions">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="employee-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="employee-btn-primary"
                >
                  Add Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success and Error Messages */}
      {addEmployeeSuccess && (
        <div className="employee-message employee-message-success">
          <CheckCircle size={16} />
          <strong>Success:</strong> Employee added successfully!
        </div>
      )}

      {deleteEmployeeSuccess && (
        <div className="employee-message employee-message-success">
          <CheckCircle size={16} />
          <strong>Success:</strong> Employee deleted successfully!
        </div>
      )}

      {addEmployeeError && (
        <div className="employee-message employee-message-error">
          <AlertCircle size={16} />
          <strong>Error:</strong> {addEmployeeError}
        </div>
      )}

      {deleteEmployeeError && (
        <div className="employee-message employee-message-error">
          <AlertCircle size={16} />
          <strong>Error:</strong> {deleteEmployeeError}
        </div>
      )}

    </>
  );
};

export default EmployeeList;

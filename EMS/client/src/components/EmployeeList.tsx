import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

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
      const response = await fetch('http://localhost:5000/api/employees');
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
      const response = await fetch('http://localhost:5000/api/departments');
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

  const filteredEmployees = employees.filter(employee =>
    employee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employee_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (employee.department_name && employee.department_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
      const response = await fetch('http://localhost:5000/api/employees', {
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
      const response = await fetch(`http://localhost:5000/api/employees/${employeeId}`, {
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
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Employee Management</h2>
          <p className="card-subtitle">Comprehensive employee data with complex database relationships</p>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="card">
        <div className="employee-search-container">
          <div className="employee-search-wrapper">
            <Search size={20} className="employee-search-icon" />
            <input
              type="text"
              placeholder="Search employees by name, number, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="employee-search-input"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="employee-add-btn"
          >
            <Plus size={16} />
            Add Employee
          </button>
        </div>
      </div>

      {/* Employee Table */}
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Employee #</th>
                <th>Department</th>
                <th>Position</th>
                <th>Manager</th>
                <th>Status</th>
                <th>Salary</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee) => (
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
                      className={`employee-status-badge ${
                        employee.employment_status === 'ACTIVE'
                          ? 'employee-status-active'
                          : 'employee-status-terminated'
                      }`}
                    >
                      {employee.employment_status}
                    </span>
                  </td>
                  <td>${employee.salary?.toLocaleString() || 'N/A'}</td>
                  <td>
                    <div className="employee-actions">
                      <button
                        className="employee-action-btn employee-action-edit"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(employee.employee_id!)}
                        className="employee-action-btn employee-action-delete"
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

      {/* Database Information */}
      <div className="database-info">
        <h3>Database Features Demonstrated</h3>
        <p>• <strong>Complex JOINs:</strong> Employees with departments, positions, and manager relationships</p>
        <p>• <strong>Data Filtering:</strong> Real-time search across multiple fields</p>
        <p>• <strong>Foreign Key Relationships:</strong> Proper data integrity with referential constraints</p>
        <p>• <strong>Indexed Queries:</strong> Fast search performance with optimized database indexes</p>
        <p>• <strong>Data Validation:</strong> Consistent data types and constraints</p>
      </div>
    </div>
  );
};

export default EmployeeList;


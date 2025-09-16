# Employee Management System - Database Showcase

A comprehensive demonstration of robust PostgreSQL database design with a modern React frontend and Node.js backend.

## 🎯 Project Overview

This project showcases advanced database capabilities through a complete Employee Management System, highlighting:

- **Complex Database Relationships** - 12 interconnected tables with proper foreign keys
- **Advanced SQL Queries** - Recursive CTEs, complex JOINs, and aggregations
- **Performance Optimization** - Strategic indexing and query optimization
- **Data Integrity** - Comprehensive constraints and validation
- **Real-time Analytics** - Live dashboard with database-driven insights

## 🏗️ Architecture

### Backend (Node.js + Express)
- **RESTful API** with comprehensive endpoints
- **PostgreSQL Integration** with connection pooling
- **Complex Query Engine** showcasing advanced SQL features
- **Security Middleware** with rate limiting and CORS
- **Error Handling** with detailed logging

### Frontend (React + TypeScript)
- **Modern UI** with responsive design
- **Real-time Data** from PostgreSQL database
- **Interactive Dashboards** with charts and analytics
- **Database Showcase** demonstrating complex queries
- **Employee Management** with full CRUD operations

### Database (PostgreSQL)
- **12 Core Tables** with 200+ fields
- **20+ Relationships** with proper constraints
- **50+ Indexes** for performance optimization
- **Advanced Features** - CTEs, window functions, triggers
- **Security** - Row-level security and audit logging

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- PostgreSQL 15+
- npm or yarn

### Installation

1. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd employee-management-showcase
   npm install
   ```

2. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb employee_management
   
   # Run the schema
   psql -d employee_management -f Database_SQL_Schema.sql
   ```

3. **Environment Configuration**
   ```bash
   # Copy environment template
   cp env.example .env
   
   # Edit .env with your database credentials
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=employee_management
   DB_USER=postgres
   DB_PASSWORD=your_password
   ```

4. **Start the Application**
   ```bash
   # Start backend server
   npm start
   
   # In another terminal, start frontend
   cd client
   npm start
   ```

5. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/api/health

## 📊 Database Features Showcased

### Core Tables
- **Users** - Authentication and authorization
- **Employees** - Master employee data with relationships
- **Departments** - Organizational hierarchy
- **Positions** - Job roles and responsibilities
- **Attendance Records** - Daily tracking with calculations
- **Time-off Requests** - Workflow management
- **Performance Reviews** - Evaluation system
- **Salary History** - Compensation tracking

### Advanced SQL Features
- **Recursive CTEs** for employee hierarchy
- **Complex JOINs** across multiple tables
- **Window Functions** for analytical queries
- **Aggregate Functions** with GROUP BY
- **Date/Time Operations** and filtering
- **CASE Statements** for conditional logic

### Performance Optimizations
- **Strategic Indexing** on frequently queried columns
- **Composite Indexes** for multi-column queries
- **Query Optimization** with EXPLAIN ANALYZE
- **Connection Pooling** for scalability
- **Efficient Data Types** and constraints

## 🎨 Frontend Features

### Dashboard
- **Real-time Statistics** from database
- **Interactive Charts** with Recharts
- **Department Analytics** with visualizations
- **Recent Activity** tracking
- **Performance Metrics** display

### Employee Management
- **Comprehensive Employee List** with search
- **Detailed Employee Profiles** with relationships
- **Department and Position** information
- **Manager Hierarchy** display
- **Status Management** and filtering

### Database Showcase
- **Complex Query Examples** with explanations
- **Schema Information** and relationships
- **Index Analysis** and performance data
- **Foreign Key Mapping** visualization
- **Query Performance** demonstrations

## 🔧 API Endpoints

### Employees
- `GET /api/employees` - List all employees
- `GET /api/employees/:id` - Get employee details
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Soft delete employee

### Departments
- `GET /api/departments` - List departments
- `GET /api/departments/:id` - Get department details
- `GET /api/departments/hierarchy/tree` - Department hierarchy

### Analytics
- `GET /api/analytics/dashboard` - Dashboard data
- `GET /api/analytics/complex-queries` - Advanced queries
- `GET /api/analytics/schema-info` - Database schema

### Attendance
- `GET /api/attendance` - Attendance records
- `GET /api/attendance/summary/:id` - Employee summary
- `GET /api/attendance/stats/overview` - Statistics

## 📈 Database Performance

### Query Examples
```sql
-- Employee hierarchy with recursive CTE
WITH RECURSIVE employee_hierarchy AS (
  SELECT employee_id, employee_name, manager_id, 0 as level
  FROM employees WHERE manager_id IS NULL
  UNION ALL
  SELECT e.employee_id, e.employee_name, e.manager_id, eh.level + 1
  FROM employees e
  JOIN employee_hierarchy eh ON e.manager_id = eh.employee_id
)
SELECT * FROM employee_hierarchy;

-- Department performance analysis
SELECT 
  d.department_name,
  COUNT(e.employee_id) as total_employees,
  AVG(e.salary) as average_salary,
  d.budget,
  ROUND((COUNT(e.employee_id) * AVG(e.salary)) / d.budget * 100, 2) as ratio
FROM departments d
LEFT JOIN employees e ON d.department_id = e.department_id
GROUP BY d.department_id, d.department_name, d.budget;
```

### Indexing Strategy
- Primary keys on all tables
- Foreign key indexes for joins
- Composite indexes for multi-column queries
- Partial indexes for filtered data
- Expression indexes for calculated fields

## 🛡️ Security Features

- **Row Level Security** for data access control
- **Input Validation** and sanitization
- **SQL Injection Prevention** with parameterized queries
- **Rate Limiting** on API endpoints
- **CORS Configuration** for cross-origin requests
- **Error Handling** without information leakage

## 📚 Documentation

- **Database Design Report** - Comprehensive schema documentation
- **Entity Relationship Diagram** - Visual relationship mapping
- **API Documentation** - Complete endpoint reference
- **Query Examples** - Advanced SQL demonstrations
- **Performance Analysis** - Optimization strategies

## 🎯 Learning Outcomes

This project demonstrates:

1. **Database Design Principles** - Normalization, relationships, constraints
2. **Advanced SQL Techniques** - CTEs, window functions, complex queries
3. **Performance Optimization** - Indexing, query planning, optimization
4. **Full-Stack Integration** - Database to frontend data flow
5. **Real-world Application** - Practical business logic implementation

## 🔄 Future Enhancements

- Authentication and authorization system
- Real-time notifications with WebSockets
- Advanced reporting and analytics
- Mobile-responsive design improvements
- API rate limiting and caching
- Database backup and recovery automation

## 📄 License

This project is created for educational purposes to demonstrate robust database design and full-stack development capabilities.

---

**Built with ❤️ using React, Node.js, Express, and PostgreSQL**


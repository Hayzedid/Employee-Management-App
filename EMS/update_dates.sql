-- Update dates for existing records to ensure realistic data
-- This file contains SQL commands to update hire dates and other date fields
-- to create a more realistic timeline for the employee data

-- Update hire dates to be more spread out over the past 2-3 years
UPDATE employees SET hire_date = '2023-01-15' WHERE employee_id = 2;
UPDATE employees SET hire_date = '2023-03-20' WHERE employee_id = 3;
UPDATE employees SET hire_date = '2023-05-10' WHERE employee_id = 4;
UPDATE employees SET hire_date = '2023-07-15' WHERE employee_id = 5;
UPDATE employees SET hire_date = '2023-09-01' WHERE employee_id = 6;
UPDATE employees SET hire_date = '2023-11-20' WHERE employee_id = 7;
UPDATE employees SET hire_date = '2024-01-15' WHERE employee_id = 8;

-- Update attendance records to have dates within the past 3 months
UPDATE attendance_records SET attendance_date = CURRENT_DATE - INTERVAL '2 months' + (random() * INTERVAL '2 months')
WHERE attendance_date IS NOT NULL;

-- Update salary history effective dates to match hire dates
UPDATE salary_history SET effective_date = e.hire_date
FROM employees e
WHERE salary_history.employee_id = e.employee_id;

-- Add some future hire dates for planning purposes (these would be for future employees)
-- Note: These are commented out as they represent planned hires
-- INSERT INTO employees (employee_number, first_name, last_name, hire_date, employment_status)
-- VALUES ('EMP010', 'Future', 'Hire', '2025-03-01', 'PLANNED');

-- Update any NULL hire dates to a default value
UPDATE employees SET hire_date = '2023-01-01' WHERE hire_date IS NULL;

-- Ensure all hire dates are in the past (for active employees)
UPDATE employees SET hire_date = CURRENT_DATE - INTERVAL '1 day'
WHERE hire_date > CURRENT_DATE AND employment_status = 'ACTIVE';

-- Add some variety to the hire dates by adding random days
UPDATE employees SET hire_date = hire_date + (random() * INTERVAL '30 days')::interval
WHERE employment_status = 'ACTIVE';
-- ================================
-- DATABASE (optional)
-- ================================
CREATE DATABASE IF NOT EXISTS hospital_management;
USE hospital_management;

-- ================================
-- USERS TABLE
-- ================================
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','doctor','staff') NOT NULL,
  is_first_login BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- DOCTOR TABLE
-- ================================
CREATE TABLE doctor (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(150),
  dob DATE,
  gender VARCHAR(20),
  address TEXT,
  phone VARCHAR(20),
  image VARCHAR(255),
  department VARCHAR(100),
  biography TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

-- ================================
-- PATIENT TABLE
-- ================================
CREATE TABLE patient (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150),
  email VARCHAR(150),
  phone VARCHAR(20),
  gender VARCHAR(20),
  dob DATE,
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- APPOINTMENT TABLE
-- ================================
CREATE TABLE appointment (
  id INT PRIMARY KEY AUTO_INCREMENT,
  patient_id INT,
  doctor_id INT NOT NULL,
  department VARCHAR(100),
  date DATE,
  time TIME,
  status ENUM(
    'Pending',
    'In Consultation',
    'Prescription Added',
    'Completed'
  ) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (doctor_id) REFERENCES users(id)
);


-- ================================
-- PRESCRIPTION TABLE
-- ================================
CREATE TABLE prescription (
  id INT AUTO_INCREMENT PRIMARY KEY,
  appointment_id INT NOT NULL,
  doctor_id INT NOT NULL,
  patient_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (appointment_id) REFERENCES appointment(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (patient_id) REFERENCES patient(id) ON DELETE CASCADE
);

 CREATE TABLE medicines (
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(255),
generic_name VARCHAR(255),
brand_name VARCHAR(255),
category VARCHAR(100),
dosage_form VARCHAR(100),
strength VARCHAR(50),
manufacturer VARCHAR(255),
barcode VARCHAR(255),
gst_percent DECIMAL(5,2),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE medicine_batches (
id INT AUTO_INCREMENT PRIMARY KEY,
medicine_id INT,
batch_number VARCHAR(100),
purchase_price DECIMAL(10,2),
selling_price DECIMAL(10,2),
quantity INT,
manufacturing_date DATE,
expiry_date DATE,
supplier VARCHAR(255),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

FOREIGN KEY (medicine_id) REFERENCES medicines(id)
);
CREATE TABLE stock_transactions (
id INT AUTO_INCREMENT PRIMARY KEY,
medicine_id INT,
batch_id INT,
type ENUM('purchase','sale','return','adjustment'),
quantity INT,
reference_id INT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE prescription_medicine (
  id INT AUTO_INCREMENT PRIMARY KEY,
  prescription_id INT,
  medicine_name VARCHAR(255),
  dosage VARCHAR(50),
  duration VARCHAR(50)
);
CREATE TABLE department (
  id INT AUTO_INCREMENT PRIMARY KEY,
  department_name VARCHAR(150) NOT NULL,
  department_desc TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE employee_leave (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  leave_type VARCHAR(50),
  date_from DATE,
  date_to DATE,
  reason TEXT,
  status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (employee_id)
    REFERENCES employee(id)
    ON DELETE CASCADE
);
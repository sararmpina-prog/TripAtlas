-- Creation of tables

-- Create users table
-- 1. Users
CREATE TABLE users (
	id INT PRIMARY KEY AUTO_INCREMENT,
	first_name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    mobile_phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 


-- Create trips table
-- 2. Trips
CREATE TABLE trips (
	id INT PRIMARY KEY AUTO_INCREMENT,
	user_id INT,
    title VARCHAR(100),
    description VARCHAR(255),
    destination VARCHAR(150) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
); 


-- Create accommodations table
-- 3. Accommodations
CREATE TABLE accommodations (
	id INT PRIMARY KEY AUTO_INCREMENT,
	name VARCHAR(150) NOT NULL,
    city VARCHAR(100),
    country VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 


-- Create accommodation_reserve table
-- 4. Accommodation_reserve
CREATE TABLE accommodation_reserve (
	id INT PRIMARY KEY AUTO_INCREMENT,
	accommodation_id INT NOT NULL,
	trip_id INT NOT NULL,
    check_in_date DATE,
    check_out_date DATE,
   
	FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    FOREIGN KEY (accommodation_id) REFERENCES accommodations(id)  ON DELETE CASCADE
); 


-- Create flights table
-- 5. Flights
CREATE TABLE flights (
	id INT PRIMARY KEY AUTO_INCREMENT,
	trip_id INT NOT NULL,
    flight_number VARCHAR(25),
    airline VARCHAR(100),
    departure_airport VARCHAR(15),
	arrival_airport VARCHAR(15),
    departure_datetime  DATETIME,
    arrival_datetime DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
	FOREIGN KEY (id_trip) REFERENCES trips(id)
    ON DELETE CASCADE
); 

-- Create user_flights table
-- 6. User_flights
CREATE TABLE user_flights (
	user_id INT NOT NULL,
	flight_id INT NOT NULL,
    PRIMARY KEY (user_id, flight_id),
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
	FOREIGN KEY (flight_id) REFERENCES flights(id) ON DELETE CASCADE
); 

-- Creation chat_history table
-- 7. chat_history
CREATE TABLE chat_history (
	id INT PRIMARY KEY AUTO_INCREMENT,
    trip_id INT NOT NULL,
	user_message TEXT,
    ai_response MEDIUMTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
); 

-- Creation ai_suggestions table
-- 8. ai_suggestions 
CREATE TABLE ai_suggestions (
	id INT PRIMARY KEY AUTO_INCREMENT,
    trip_id INT,
	title VARCHAR(100),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
); 


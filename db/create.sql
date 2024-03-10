-- Create a new database if it doesn't exist
CREATE DATABASE course-selling;

-- Connect to the newly created database
\c course_selling;

-- Create table for instructors
CREATE TABLE IF NOT EXISTS Instructors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Create table for courses
CREATE TABLE IF NOT EXISTS Courses (
    id SERIAL PRIMARY KEY,
    instructor_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    max_seats INT,
    start_date DATE,
    FOREIGN KEY (instructor_id) REFERENCES Instructors(id)
);

-- Create table for leads
CREATE TABLE IF NOT EXISTS Leads (
    id SERIAL PRIMARY KEY,
    user_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    linkedin_profile VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    course_id INT,
    FOREIGN KEY (course_id) REFERENCES Courses(id)
);

-- Create table for users
CREATE TABLE IF NOT EXISTS Users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    enroll_course INTEGER[]
);

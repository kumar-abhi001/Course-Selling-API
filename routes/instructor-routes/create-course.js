const pool = require('../../db/connect');

const createCourse = async(req, res) => {
    const { name, max_seats, start_date, instructorId } = req.body;
  
    try {
      // Check if the course already exists in the database
      const existingCourse = await pool.query('SELECT * FROM courses WHERE name = $1', [name]);
      if (existingCourse.rows.length > 0) {
        return res.status(409).send({
          "message": "Course already exists"
        });
      }
      const query = (`SELECT MAX(id) AS last_course_id FROM courses;`);
      const courseId = (await pool.query(query)).rows[0].last_course_id + 1;
      
      // Insert the course into the database
      const result = await pool.query('INSERT INTO courses (id, instructor_id, name, max_seats, start_date) VALUES ($1, $2, $3, $4, $5)', [courseId, instructorId, name, max_seats, start_date]);
  
  
      res.status(201).send({
        "message": "Course added successfully",
        "course_id": courseId,
        "name": name
      });
  
  
    } catch (error) {
      console.error('Error adding course:', error);
      res.status(500).send("Error adding course");
    }
  }

  module.exports = createCourse;
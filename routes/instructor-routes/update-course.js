const pool = require('../../db/connect');

const updateCoure = async (req, res) => {
    const courseId = parseInt(req.params.courseId);
    const { name, max_seats, start_date } = req.body;
  
    try {
      const client = await pool.connect();
  
      // Check if the course exists and belongs to the requesting instructor
      const courseQuery = `
        SELECT * FROM Courses
        WHERE id = $1;
      `;
      const courseResult = await client.query(courseQuery, [courseId]);
      const course = courseResult.rows[0];
  
      if (!course) {
        res.status(404).send("Course not found or you don't have permission to update it.");
        return;
      }
  
      // Update the course details
      const updateQuery = `
        UPDATE Courses
        SET name = $1, max_seats = $2, start_date = $3
        WHERE id = $4;
      `;
      await client.query(updateQuery, [name, max_seats, start_date, courseId]);
  
      res.status(200).send({
        message: "Course updated successfully",
        course: { id: courseId, name, max_seats, start_date }
      });
    } 
    
    catch (error) {
      console.error('Error updating course:', error);
      res.status(500).send("Internal Server Error");
    }
  }

module.exports = updateCoure;
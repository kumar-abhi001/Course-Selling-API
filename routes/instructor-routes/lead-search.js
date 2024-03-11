const pool = require('../../db/connect');

const serachLead = async (req, res) => {
    const courseId = parseInt(req.params.courseId);
    const instructor_id = parseInt(req.headers.instructor_id);
  
    try {
      const client = await pool.connect();
  
      // Check if the instructor has access to the course
      const courseQuery = `
        SELECT * FROM Courses
        WHERE id = $1 AND instructor_id = $2;
      `;
      const courseResult = await client.query(courseQuery, [courseId, instructor_id]);
      const course = courseResult.rows[0];
  
      if (!course) {
        res.status(404).send("Course not found or you don't have permission to view leads for this course.");
        return;
      }
  
      // Retrieve leads for the course
      const leadsQuery = `
        SELECT * FROM Leads
        WHERE course_id = $1;
      `;
      const leadsResult = await client.query(leadsQuery, [courseId]);
      const leads = leadsResult.rows;
  
      res.status(200).send(leads);
  
      // Release the client back to the pool
      client.release();
  
    } catch (error) {
      console.error('Error fetching leads:', error);
      res.status(500).send("Internal Server Error");
    }
  }

  module.exports = serachLead;
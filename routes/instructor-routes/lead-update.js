const pool = require('../../db/connect');

const updateLead = async (req, res) => {
    const leadId = parseInt(req.params.leadId);
    const { status } = req.body;
    const instructor_id = parseInt(req.headers.instructor_id);
  
    try {
      const client = await pool.connect();
  
      // Check if the lead exists and belongs to the instructor's course
      const leadQuery = `
        SELECT * FROM leads
        WHERE id = $1;
      `;
      const leadResult = await client.query(leadQuery, [leadId]);
      const lead = leadResult.rows[0];
  
      if (!lead) {
        res.status(404).send("Lead not found.");
        return;
      }
  
      // Check if the lead belongs to the instructor's course
      const courseQuery = `
        SELECT * FROM Courses
        WHERE id = $1 AND instructor_id = $2;
      `;
      const courseResult = await client.query(courseQuery, [lead.course_id, instructor_id]);
      const course = courseResult.rows[0];
  
      if (!course) {
        res.status(403).send("You don't have permission to update this lead.");
        return;
      }
  
      // Update the lead status
      const updateQuery = `
        UPDATE leads
        SET status = $1
        WHERE id = $2;
      `;
      await client.query(updateQuery, [status, leadId]);
  
      if (status === "Accepted") {
        // Add the course to the user's enroll_course column
        const userUpdateQuery = `UPDATE users 
          SET enroll_course = array_append(enroll_course, $1) WHERE email = $2;`;
        await client.query(userUpdateQuery, [lead.course_id, lead.email]);
  
  
        // Delete the lead from the Leads table
        const deleteLeadQuery = `
          DELETE FROM leads
          WHERE id = $1;
        `;
        await client.query(deleteLeadQuery, [leadId]);
      }
  
      res.status(200).send({
        message: "Lead status updated successfully"
      });
  
      // Release the client back to the pool
      client.release();
  
    } catch (error) {
      console.error('Error updating lead status:', error);
      res.status(500).send("Internal Server Error");
    }
  }

  module.exports = updateLead;
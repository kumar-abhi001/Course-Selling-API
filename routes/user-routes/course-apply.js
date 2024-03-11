const pool = require('../../db/connect');

const courseApply = async (req, res) => {
    const { name, email, phone_number, linkedin_profile, course_id } = req.body;
  
    // Check if lead already exists
    try {
      const client = await pool.connect();
  
      const checkLeadQuery = `
        SELECT * FROM leads
        WHERE email = $1 AND course_id = $2;
      `;
      const { rows } = await client.query(checkLeadQuery, [email, course_id]);
      console.log(rows);
  
      if (rows.length > 0) {
        res.status(409).send({
          message: "Lead already exists for this user and course."
        });
        client.release();
        return; // Exit the function
      }
  
      const query = (`SELECT MAX(id) AS last_course_id FROM leads;`);
      const lead_id = (await pool.query(query)).rows[0].last_course_id + 1;
      // Lead does not exist, proceed to add it to the database
      const insertLeadQuery = `
        INSERT INTO leads (id, user_name, email, phone_number, linkedin_profile, course_id)
        VALUES ($1, $2, $3, $4, $5, $6);
      `;
      await client.query(insertLeadQuery, [lead_id, name, email, phone_number, linkedin_profile, course_id]);
  
      res.status(201).send({
        message: "Application submitted successfully",
        course_id: course_id
      });
  
      // Release the client back to the pool
      client.release();
  
    } catch (error) {
      console.error('Error submitting application:', error);
      res.status(500).send("Internal Server Error");
    }
  }

  module.exports = courseApply;
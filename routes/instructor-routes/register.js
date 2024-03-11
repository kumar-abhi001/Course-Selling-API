const {createToken, authenticateJwt} = require('../../middleware/auth');
const pool = require('../../db/connect');

async function register(req, res)  {
    const { name, email, password } = req.body;
  
    try {
      // Check if instructor with the same email already exists
      const existingInstructor = await pool.query('SELECT * FROM instructors WHERE email = $1', [email]);
      if (existingInstructor.rows.length > 0) {
        return res.status(403).send(`${email} already exists`);
      }
  
      // If instructor doesn't exist, insert into the database
      const result = await pool.query('INSERT INTO instructors (name, email, password) VALUES ($1, $2, $3) RETURNING id', [name, email, password]);
      const instructorId = result.rows[0].id;
      const token = createToken({ name, role: 'instructor' });
    
      res.status(202).send({
        "message": "Instructor is added",
        "name": name,
        "token": token,
        instructorId
      });
    } catch (error) {
      console.error('Error registering instructor:', error);
      res.status(500).send("Error registering instructor");
    }
  }

  module.exports = register;
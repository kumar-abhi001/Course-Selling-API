const {createToken, authenticateJwt} = require('../../middleware/auth');
const pool = require('../../db/connect');

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Query the database to find the instructor with the provided email and password
    const result = await pool.query('SELECT * FROM instructors WHERE email = $1 AND password = $2', [email, password]);
    const instructor = result.rows[0];

    if (instructor) {
      // If instructor found, generate and send JWT token
      const token = createToken({ username: instructor.name, role: 'instructor' });
      res.status(200).send({
        "message": "Instructor logged in successfully",
        "token": token
      });
    } else {
      // If no instructor found, return unauthorized status
      res.status(401).send("Invalid email or password");
    }
  } catch (error) {
    // Handle any errors
    console.error('Error logging in instructor:', error);
    res.status(500).send("Error logging in instructor");
  }
}

module.exports = login;
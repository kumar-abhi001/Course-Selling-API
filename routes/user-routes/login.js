const {createToken, authenticateJwt} = require('../../middleware/auth');
const pool = require('../../db/connect');

const login = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const client = await pool.connect();
  
      // Check if the user with the provided email and password exists
      const loginUserQuery = `
        SELECT * FROM Users
        WHERE email = $1 AND password = $2;
      `;
      const userResult = await client.query(loginUserQuery, [email, password]);
      const user = userResult.rows[0];
  
      if (user) {
        // Generate token
        const token = createToken({ email, role: 'user' });
  
        res.status(200).send({
          message: "User logged in successfully",
          token: token
        });
      } else {
        res.status(401).send("Invalid email or password");
      }
  
      // Release the client back to the pool
      client.release();
  
    } catch (error) {
      console.error('Error logging in user:', error);
      res.status(500).send("Internal Server Error");
    }
  }

  module.exports = login;
const {createToken, authenticateJwt} = require('../../middleware/auth');
const pool = require('../../db/connect');

const register = async (req, res) => {
    const { name, email, password } = req.body;
  
    try {
      const client = await pool.connect();
  
      // Check if the user already exists
      const checkUserQuery = `
        SELECT * FROM Users
        WHERE email = $1;
      `;
      const userResult = await client.query(checkUserQuery, [email]);
      const existingUser = userResult.rows[0];
  
      if (existingUser) {
        res.status(409).send({
          message: "User already exists"
        });
        return;
      }
  
      // Insert the new user into the database
      const insertUserQuery = `
        INSERT INTO Users (name, email, password)
        VALUES ($1, $2, $3)
        RETURNING id;
      `;
      const insertedUser = await client.query(insertUserQuery, [name, email, password]);
  
      const userId = insertedUser.rows[0].id;
  
      // Generate token
      const token = createToken({ name, role: 'user' });
  
      res.status(201).send({
        message: "User registered successfully",
        name: name,
        token: token
      });
  
      // Release the client back to the pool
      client.release();
  
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).send("Internal Server Error");
    }
  }

  module.exports = register;
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
const jwt = require('jsonwebtoken');
const SECRET = "Abhiske";
const pool = require('./db/connect');

app.use(bodyParser.json());
app.use(cors());


//Function to create token for new registration
function createToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '1h'});
}

//Middleware for verify the token
const authenticateJwt = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } 
  else {
    res.sendStatus(401);
  }
};


// API to register instructor
app.post('/instructor/register', async (req, res) => {
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
});



// API to signin for instructor
app.post('/instructor/login', async (req, res) => {
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
});


// API to add course
app.post('/instructor/course', authenticateJwt, async(req, res) => {
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
});



// API to update course
app.put('/instructor/courses/:courseId', authenticateJwt, async (req, res) => {
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
});


// API for user registration
app.post('/user/registration', async (req, res) => {
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
});

// API for user login
app.post('/user/login', async (req, res) => {
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
});

// API to show the courses

app.get('/user/courses', authenticateJwt, (req, res) => {
});

// API for applying for a course
app.post('/user/course/apply', authenticateJwt, async (req, res) => {
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
});

// API for instructors to view leads for a course
app.get('/instructor/course/:courseId/leads', authenticateJwt, async (req, res) => {
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
});


// API for instructors to update lead status and enroll user
app.put('/instructor/leads/:leadId/status', authenticateJwt, async (req, res) => {
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
});



//Giving the port the user

app.listen(PORT, (err) => {
  if(err) {
    console.log(err);
  }

  else {
    console.log(`Sever is running on port ${PORT}`);
  }
});
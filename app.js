const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
const pool = require('./db/connect');
const instructorRegister = require('./routes/instructor-routes/register');
const instructorLogin = require('./routes/instructor-routes/login');
const createCourse = require('./routes/instructor-routes/create-course');
const updateCoure = require('./routes/instructor-routes/update-course');
const searchLead = require('./routes/instructor-routes/lead-search');
const updateLead = require('./routes/instructor-routes/lead-update');

const userRegister = require('./routes/user-routes/register');
const userLogin = require('./routes/user-routes/login');
const courseApply = require('./routes/user-routes/course-apply');

app.use(bodyParser.json());
app.use(cors());

const {createToken, authenticateJwt} = require('./middleware/auth');
const serachLead = require('./routes/instructor-routes/lead-search');

// API to register instructor
app.post('/instructor/register', instructorRegister);



// API to signin for instructor
app.post('/instructor/login', instructorLogin);


// API to add course
app.post('/instructor/course', authenticateJwt, createCourse);


// API to update course
app.put('/instructor/courses/:courseId', authenticateJwt, updateCoure);


// API for user registration
app.post('/user/registration', userRegister);

// API for user login
app.post('/user/login', userLogin);

// API to show the courses

app.get('/user/courses', authenticateJwt, (req, res) => {
});

// API for applying for a course
app.post('/user/course/apply', authenticateJwt, courseApply);

// API for instructors to view leads for a course
app.get('/instructor/course/:courseId/leads', authenticateJwt, searchLead);


// API for instructors to update lead status and enroll user
app.put('/instructor/leads/:leadId/status', authenticateJwt, updateLead);



//Giving the port the user
app.listen(PORT, (err) => {
  if(err) {
    console.log(err);
  }

  else {
    console.log(`Sever is running on port ${PORT}`);
  }
});
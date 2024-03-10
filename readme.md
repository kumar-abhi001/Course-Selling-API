# Course Selling App API Documentation


## Getting Started

To get started with the Course Selling App API, follow these steps:

1. Clone the repository:

2. Install dependencies: npm install

3. Set up environment variables:
- Create a `.env` file in the root directory of the project.
- Add the following environment variables to the `.env` file:
  ```
  DATABASE_URL=< DB_HOST = localhost, // PostgreSQL host
              DB_USER = , // PostgreSQL username
              DB_PASSWORD =, // PostgreSQL password
              DB_DATABASE =, // PostgreSQL database name
              DB_PORT: 5432>
  JWT_SECRET=<your-secret-key>
  ```
Replace `<your-database-url>` with the URL of your PostgreSQL database, and `<your-secret-key>` with a secret key for JWT token generation.

4. Start the server: npm start or node app.js




## Endpoints

### For Instructors

1. **Register**: `POST /instructor/register`
- Registers a new instructor.
- Requires `name`, `email`, and `password` in the request body.

2. **Login**: `POST /instructor/login`
- Logs in an instructor.
- Requires `email` and `password` in the request body.

3. **Create Course**: `POST /instructor/course`
- Creates a new course.
- Requires `name`, `max_seats`, and `start_date` in the request body.

4. **Update Course**: `PUT /instructor/courses/:courseId`
- Updates an existing course.
- Requires `name`, `max_seats`, and `start_date` in the request body.

5. **Change Lead Status**: `PUT /instructor/leads/:leadId/status`
- Changes the status of a lead for a course.
- Requires `status` in the request body.
- Requires `instructor_id` in the request header.

6. **Find Leads**: `GET /instructor/course/:courseId/leads`
- Retrieves leads for a specific course.
- Requires `instructor_id` in the request header.

### For Users

1. **Registration**: `POST /user/registration`
- Registers a new user.
- Requires `name`, `email`, `phone_number`, `linkedin_profile`, and `password` in the request body.

2. **Login**: `POST /user/login`
- Logs in a user.
- Requires `email` and `password` in the request body.

3. **Course Application**: `POST /user/course/apply`
- Allows users to apply for a course by providing their details and the course ID.
- Requires `name`, `email`, `phone_number`, `linkedin_profile`, `password`, and `courseId` in the request body.

## Environment Variables

The following environment variables need to be set:

- `DATABASE_URL`: URL of the PostgreSQL database.
- `JWT_SECRET`: Secret key for JWT token generation.


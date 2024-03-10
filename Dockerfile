# Use official PostgreSQL image
FROM postgres:latest

# Set environment variables
ENV POSTGRES_USER your_username
ENV POSTGRES_PASSWORD your_password
ENV POSTGRES_DB course-selling

# Copy the SQL script to the Docker image
COPY connect.sql /docker-entrypoint-initdb.d/

# Expose PostgreSQL default port
EXPOSE 5432

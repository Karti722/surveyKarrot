# Task Management Application Created by Kartikeya Kumaria

## Overview

This is a full-stack "Task Management" application built using React + TypeScript for the frontend, Node.js for the backend, and PostgreSQL for the database. The application allows users to register, log in, and manage tasks effectively.

## Features

- **User Authentication**: Users can register and log in to access their tasks.
- **Task Management**: Users can create, view, update, and delete tasks.
- **Secure Routes**: Task operations are protected and require authentication.

## Technologies Used

- **Frontend**: React, TypeScript, Axios
- **Backend**: Node.js, Express, TypeScript, PostgreSQL
- **Database**: PostgreSQL
- **Authentication**: JWT for token-based authentication, bcrypt for password hashing

## Setup Instructions

### Clone the Repository

1. Clone the repo onto your local machine:
   ```
   git clone https://github.com/Karti722/lumaa-spring-2025-swe-submission-from-kartikeya.git
   ```

### Backend

1. Navigate to the `task_management-app/backend` directory on your terminal or Windows CMD.
2. Install dependencies:
   ```
   npm install
   ```

   
3. Set up the PostgreSQL database and make sure to store the password somewhere safe for reference (like a .txt file on your desktop):
   - Create a new database for the application.
   - Run the necessary migrations to set up the `users` and `tasks` tables using the query tool in PgAdmin4 under your tasks database. Insert the following code and run it.
 ```
 CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    isComplete BOOLEAN DEFAULT FALSE,
    userId INTEGER REFERENCES users(id) ON DELETE CASCADE
);
 ```
 4. Create a super user when adding Login/Group roles in PgAdmin 4. Remember to also store this
.
 5. Make sure to set up a .env file and set up the credentials as per this example. Only change the DB_USER, DB_NAME, and DB_PASSWORD variables to what you have set up on your database (or PgAdmin 4)
```
DB_USER=<YOUR_DB_SUPERUSER_HERE>
DB_HOST=localhost
DB_NAME=<YOUR_DB_NAME_HERE>
DB_PASSWORD=<YOUR_DB_PASSWORD_HERE>
DB_PORT=5432
JWT_SECRET=your_jwt_secret
```
 6. Make sure the tsconfig.json in the backend folder is set up to the root of the backend folder itself
   ```
   {
  "compilerOptions": {
    "target": "ES6",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.spec.ts"]
}
```
7. Start the server from the backend root directory (`task_management-app/backend`):
   ```
   npm run dev
   ```


### Frontend

8. Navigate to the `task-management-app\frontend` directory.
9. Install dependencies:
   ```
   npm install
   ```
10. Start the React application:
   ```
   npm start
   ```
11. Now that the frontend and backend servers are running, you can login, add, update, and delete tasks

## Usage

1. Register a new user through the registration form.
2. Log in using the registered credentials.
3. Manage tasks by creating, updating, and deleting them from the tasks page.

## API Testing -- I Used ThunderClient

Using ThunderClient
You can use ThunderClient, a REST API client extension for Visual Studio Code, to manually test the APIs.

## How to Install ThunderClient?
Install ThunderClient from the Visual Studio Code marketplace.
Open ThunderClient and create new requests to test the various endpoints (e.g., POST /auth/register, POST /auth/login, GET /tasks, POST /tasks, PUT /tasks/:id, DELETE /tasks/:id).
Ensure to include the JWT token (you get this from running  the login POST request) in the headers for protected routes.
Relevant Notes on Testing
Ensure that the PostgreSQL server is running before starting the backend.
Use the .env file to configure environment variables for the database connection and JWT secret.
Test all endpoints to verify that they are working as expected. Screenshots of all the ThunderClient tests are in the setting-up-images directory

## Salary expectations:
I believe with my skills and experience in web development, my desired salary is at minimum $40,000-$50,000 a year. I am open to negotiations if that can't be arranged.

## Demonstration Video Link:
https://www.loom.com/share/3195d894a0e1463588b1bbb13d778c94?sid=72ac8308-d3a2-4054-bdfe-5371d42f627c 
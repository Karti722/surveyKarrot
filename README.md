
# SurveyKarrot

## GitHub link:
https://github.com/Karti722/surveyKarrot

## Overview

SurveyKarrot is a full-stack survey management application that allows users to create, distribute, and analyze surveys. Built with React + TypeScript on the frontend and Node.js + Express + PostgreSQL on the backend, it provides secure authentication and a modern user experience.

## Features

- **User Authentication**: Register and log in securely (JWT, bcrypt)
- **Survey Management**: Create, view, and manage surveys
- **Survey Submission**: Users can submit responses to surveys
- **View Submissions**: See all submissions and details
- **Role Support**: (If enabled) Different user roles for access control
- **Modern UI**: Responsive design with React

## Technologies Used

- **Frontend**: React, TypeScript, Vite, Axios
- **Backend**: Node.js, Express, TypeScript, PostgreSQL
- **Database**: PostgreSQL
- **Authentication**: JWT, bcrypt

## Setup Instructions

### 1. Clone the Repository

```sh
git clone https://github.com/Karti722/surveyKarrot.git
```

### 2. Backend Setup

1. Navigate to the backend directory:
   ```sh
   cd surveyKarrot/backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Set up PostgreSQL:
   - Create a new database (e.g., `surveykarrot`)
   - Run migrations in `backend/migrations/` to set up tables (users, surveys, submissions, etc.)
   - Example migration (run in PgAdmin or psql):
     ```sql
     -- See backend/migrations/*.sql for schema
     ```
4. Create a `.env` file in `backend/`:
   ```env
   DB_USER=<YOUR_DB_USER>
   DB_HOST=localhost
   DB_NAME=<YOUR_DB_NAME>
   DB_PASSWORD=<YOUR_DB_PASSWORD>
   DB_PORT=5432
   JWT_SECRET=your_jwt_secret
   ```
   Example:
   DB_HOST = db.miszspocowhjzvirbewq.supabase.co
   DB_PORT = 5432
   DB_NAME = postgres
   DB_USER = postgres
   DB_SSL = true
   NODE_ENV = production
   DB_PASSWORD = Priororder5698
   JWT_SECRET = AO+6ccmta0TopFhVa+bpqJNg3xHzUfmOAY7uU5uu1qzDeZr3+rjJd7PbOS3189jNYbKp4tCWHR0KR6D8oL7VAQ==




5. Start the backend server:
   ```sh
   npm run dev
   ```

### 3. Frontend Setup

1. Navigate to the frontend directory:
   ```sh
   cd ../frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the frontend app:
   ```sh
   npm run dev
   ```

### 4. Access the App

- Frontend: [http://localhost:5173](http://localhost:5173) (default Vite port)
- Backend: [http://localhost:3000](http://localhost:3000) (default Express port)

## Usage

1. Register a new account
2. Log in
3. Create and manage surveys
4. Share surveys and collect responses
5. View submissions and analyze results

## API Testing

You can use ThunderClient (VS Code extension) or Postman to test API endpoints:

- **Auth**: `POST /auth/register`, `POST /auth/login`
- **Surveys**: `GET /surveys`, `POST /surveys`, etc.
- **Submissions**: `GET /submissions`, `POST /submissions`, etc.

Include the JWT token in headers for protected routes.

## Notes

- Ensure PostgreSQL is running before starting the backend.
- Configure environment variables in `.env` for database and JWT.
- See `backend/migrations/` for schema setup.

## Demo Video

[Download the Video from Google Drive and watch the demonstration](https://drive.google.com/file/d/1u0G2TV2aCtrAHVzMxvxPGENaLFZzh8Hm/view?usp=sharing)

---

## Additional SurveyKarrot API Notes:
https://docs.google.com/document/d/1WxATN3BbHukcHvChIdICU7yRJtcQ5R_w6OeXf8Dsuos/edit?usp=sharing

Created by Kartikeya Kumaria
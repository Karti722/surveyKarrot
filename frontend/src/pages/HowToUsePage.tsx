import React from "react";

const HowToUsePage: React.FC = () => (
  <div style={{ maxWidth: 700, margin: "2rem auto", padding: "2rem", background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
    <h1>How to Use SurveyKarrot</h1>
    <p>Welcome to SurveyKarrot! This guide will help you get started with the application.</p>
    <h2>Getting Started</h2>
    <ul>
      <li>Open the frontend in your browser (usually at <code>http://localhost:5173</code> if running locally).</li>
      <li>Register as a new user or log in with existing credentials.</li>
    </ul>
    <h2>User Roles</h2>
    <ul>
      <li><strong>Regular Users:</strong> Can participate in surveys and view their submissions.</li>
      <li><strong>Admins:</strong> Can create, edit, and manage surveys, as well as view all submissions.</li>
    </ul>
  <h2>Creating Surveys (Admin Only)</h2>
  <p>To create surveys, you must log in with admin credentials. Use the following example admin account:</p>
  <pre style={{ background: "#f6f8fa", padding: "1em", borderRadius: 4 }}>
{`
username: adminuserKarti12
email: admin@example2.com
password: yourStrongPasswordKarti2
role: admin
`}
  </pre>
  <p>You can use these credentials to log in as an admin and access survey creation features.</p>
  <h2>Test User Credentials</h2>
  <p>For testing, you can use the following test user account:</p>
  <pre style={{ background: "#f6f8fa", padding: "1em", borderRadius: 4 }}>
{`
username: karrot12345
email: kartikeyaku3@gmail.com
password: Vikram12
`}
  </pre>
  <p>Use these credentials to log in as a regular user and try out the survey features.</p>
    <h2>Features</h2>
    <ul>
      <li><strong>Create Survey:</strong> Admins can create new surveys from the dashboard.</li>
      <li><strong>Participate in Survey:</strong> Users can fill out and submit surveys.</li>
      <li><strong>View Submissions:</strong> Admins can see all submissions; users can see their own.</li>
    </ul>
    <h2>Tips</h2>
    <ul>
      <li>Make sure to use a strong password for admin accounts.</li>
      <li>Only admins can access survey management features.</li>
    </ul>
    <h2>Need Help?</h2>
    <p>Refer to this guide or contact the project maintainer for support.</p>
    <hr />
    <p>Enjoy using SurveyKarrot!</p>
  </div>
);

export default HowToUsePage;

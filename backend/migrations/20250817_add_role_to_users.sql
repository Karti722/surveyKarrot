-- Add 'role' column to users table, default to 'user'
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(10) NOT NULL DEFAULT 'user';

-- Optionally, update all existing users to 'user' role
UPDATE users SET role = 'user' WHERE role IS NULL;

-- To create an admin, manually set role = 'admin' for a user:
-- UPDATE users SET role = 'admin' WHERE username = 'admin_username';

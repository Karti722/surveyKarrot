import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { findUserByUsername, createUser } from '../models/userModel';
import { pool } from '../utils/db';
import { deleteUserSubmissions } from '../models/surveyModel';

// Minimal register function (username, password)
export const register = async (req: Request, res: Response) => {
    const { username, password, role } = req.body;
    try {
        // Check for unique username
        const existingUser = await findUserByUsername(username);
        if (existingUser) {
            return res.status(409).json({ error: 'Username already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        // Allow admin registration if role is provided and is 'admin', else default to 'user'
        const userRole = role === 'admin' ? 'admin' : 'user';
        const user = await createUser(username, hashedPassword, userRole);
        res.status(201).json({ id: user.id, username: user.username, role: user.role });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, username, password } = req.body;
    const loginId = email || username;
    console.log('LOGIN ATTEMPT:', { loginId, password });
    try {
        // Try username first
        let user = await findUserByUsername(loginId);
        // If not found, try email (assuming users table has an email column)
        if (!user) {
            const result = await pool.query('SELECT * FROM users WHERE email = $1', [loginId]);
            user = result.rows[0];
        }
        console.log('USER FOUND:', user);
        if (!user) {
            console.error('User not found:', loginId);
            return res.status(401).json({ error: 'User not found. Please register.' });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        console.log('PASSWORD MATCH:', passwordMatch);
        if (passwordMatch) {
            const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '7d' });
            res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
            console.log('LOGIN SUCCESS:', user.username);
            return res.json({ message: 'Login successful', user: { id: user.id, username: user.username, role: user.role }, token });
        } else {
            console.error('Invalid credentials for user:', loginId);
            return res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('LOGIN ERROR:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
// (duplicate login function removed)
// Logout: clear the cookie
export const logout = (req: Request, res: Response) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
};

// Get current user info from token
export const getCurrentUser = (req: Request, res: Response) => {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Not authenticated' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        // Optionally fetch user from DB for fresh info
        return res.json({ user: decoded });
    } catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Get user role by username/password
export const getUserRole = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    const user = await findUserByUsername(username);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!(await bcrypt.compare(password, user.password))) return res.status(401).json({ error: 'Invalid credentials' });
    return res.json({ role: user.role });
};

// Delete user account and all their submissions
export const deleteAccount = async (req: Request, res: Response) => {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Not authenticated' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        const userId = decoded.userId;
        // Delete all submissions for this user
        await deleteUserSubmissions(userId);
        // Delete user
        await pool.query('DELETE FROM users WHERE id = $1', [userId]);
        res.clearCookie('token');
        return res.json({ message: 'Account and submissions deleted' });
    } catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
};


export const deleteUser = async (req: Request, res: Response) => {
    const { username } = req.body;
    try {
        // Get user id by username
        const userResult = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
        const user = userResult.rows[0];
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Delete all tasks for this user using userId
        await pool.query('DELETE FROM tasks WHERE userId = $1', [user.id]);

        // Delete the user
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [user.id]);
        res.json({ message: 'User and their tasks deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
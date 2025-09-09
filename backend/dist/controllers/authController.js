"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.deleteAccount = exports.getUserRole = exports.getCurrentUser = exports.logout = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = require("../models/userModel");
const db_1 = require("../utils/db");
const surveyModel_1 = require("../models/surveyModel");
const register = async (req, res) => {
    const { username, password, role } = req.body;
    try {
        const existingUser = await (0, userModel_1.findUserByUsername)(username);
        if (existingUser) {
            return res.status(409).json({ error: 'Username already exists' });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const userRole = role === 'admin' ? 'admin' : 'user';
        const user = await (0, userModel_1.createUser)(username, hashedPassword, userRole);
        res.status(201).json({ id: user.id, username: user.username, role: user.role });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.register = register;
const login = async (req, res) => {
    const { email, username, password } = req.body;
    const loginId = email || username;
    console.log('LOGIN ATTEMPT:', { loginId, password });
    try {
        let user = await (0, userModel_1.findUserByUsername)(loginId);
        if (!user) {
            const result = await db_1.pool.query('SELECT * FROM users WHERE email = $1', [loginId]);
            user = result.rows[0];
        }
        console.log('USER FOUND:', user);
        if (!user) {
            console.error('User not found:', loginId);
            return res.status(401).json({ error: 'User not found. Please register.' });
        }
        const passwordMatch = await bcrypt_1.default.compare(password, user.password);
        console.log('PASSWORD MATCH:', passwordMatch);
        if (passwordMatch) {
            const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
            res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
            console.log('LOGIN SUCCESS:', user.username);
            return res.json({ message: 'Login successful', user: { id: user.id, username: user.username, role: user.role }, token });
        }
        else {
            console.error('Invalid credentials for user:', loginId);
            return res.status(401).json({ error: 'Invalid credentials' });
        }
    }
    catch (error) {
        console.error('LOGIN ERROR:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.login = login;
const logout = (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
};
exports.logout = logout;
const getCurrentUser = (req, res) => {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if (!token)
        return res.status(401).json({ error: 'Not authenticated' });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        return res.json({ user: decoded });
    }
    catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
};
exports.getCurrentUser = getCurrentUser;
const getUserRole = async (req, res) => {
    const { username, password } = req.body;
    const user = await (0, userModel_1.findUserByUsername)(username);
    if (!user)
        return res.status(404).json({ error: 'User not found' });
    if (!(await bcrypt_1.default.compare(password, user.password)))
        return res.status(401).json({ error: 'Invalid credentials' });
    return res.json({ role: user.role });
};
exports.getUserRole = getUserRole;
const deleteAccount = async (req, res) => {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if (!token)
        return res.status(401).json({ error: 'Not authenticated' });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        await (0, surveyModel_1.deleteUserSubmissions)(userId);
        await db_1.pool.query('DELETE FROM users WHERE id = $1', [userId]);
        res.clearCookie('token');
        return res.json({ message: 'Account and submissions deleted' });
    }
    catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
};
exports.deleteAccount = deleteAccount;
const deleteUser = async (req, res) => {
    const { username } = req.body;
    try {
        const userResult = await db_1.pool.query('SELECT id FROM users WHERE username = $1', [username]);
        const user = userResult.rows[0];
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        await db_1.pool.query('DELETE FROM tasks WHERE userId = $1', [user.id]);
        const result = await db_1.pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [user.id]);
        res.json({ message: 'User and their tasks deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.deleteUser = deleteUser;

import { Router } from 'express';
import { register, login, logout, getCurrentUser, getUserRole, deleteAccount } from '../controllers/authController';

const router = Router();

// Route for user registration
router.post('/register', register);

// Route for user login
router.post('/login', login);


// Logout
router.post('/logout', logout);

// Get current user info
router.get('/me', getCurrentUser);

// Get user role
router.post('/role', getUserRole);

// Delete account (and all submissions)
router.delete('/delete', deleteAccount);

export default router;
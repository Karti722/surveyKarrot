import { findUserByUsername, createUser, User } from '../models/userModel';
import { generateToken } from '../utils/jwt';
import { hashPassword, comparePassword } from '../utils/bcrypt';

export const registerUser = async (username: string, password: string): Promise<User> => {
    const hashedPassword = await hashPassword(password);
    return await createUser(username, hashedPassword);
};

export const loginUser = async (username: string, password: string) => {
    const user = await findUserByUsername(username);
    if (!user || !(await comparePassword(password, user.password))) {
        throw new Error('Invalid username or password');
    }
    const token = generateToken(user.id.toString());
    return { user, token };
};
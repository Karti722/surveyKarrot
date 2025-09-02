import { pool } from '../utils/db';


export interface User {
  id: number;
  username: string;
  password: string;
  role: 'user' | 'admin';
}


export const createUser = async (username: string, password: string, role: 'user' | 'admin' = 'user'): Promise<User> => {
  const result = await pool.query(
    'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING *',
    [username, password, role]
  );
  return result.rows[0];
};


export const findUserById = async (id: number): Promise<User | null> => {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows.length ? result.rows[0] : null;
};


export const findUserByUsername = async (username: string): Promise<User | null> => {
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  return result.rows.length ? result.rows[0] : null;
};
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserByUsername = exports.findUserById = exports.createUser = void 0;
const db_1 = require("../utils/db");
const createUser = async (username, password, role = 'user') => {
    const result = await db_1.pool.query('INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING *', [username, password, role]);
    return result.rows[0];
};
exports.createUser = createUser;
const findUserById = async (id) => {
    const result = await db_1.pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows.length ? result.rows[0] : null;
};
exports.findUserById = findUserById;
const findUserByUsername = async (username) => {
    const result = await db_1.pool.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows.length ? result.rows[0] : null;
};
exports.findUserByUsername = findUserByUsername;

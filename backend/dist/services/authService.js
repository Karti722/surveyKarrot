"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = void 0;
const userModel_1 = require("../models/userModel");
const jwt_1 = require("../utils/jwt");
const bcrypt_1 = require("../utils/bcrypt");
const registerUser = async (username, password) => {
    const hashedPassword = await (0, bcrypt_1.hashPassword)(password);
    return await (0, userModel_1.createUser)(username, hashedPassword);
};
exports.registerUser = registerUser;
const loginUser = async (username, password) => {
    const user = await (0, userModel_1.findUserByUsername)(username);
    if (!user || !(await (0, bcrypt_1.comparePassword)(password, user.password))) {
        throw new Error('Invalid username or password');
    }
    const token = (0, jwt_1.generateToken)(user.id.toString());
    return { user, token };
};
exports.loginUser = loginUser;

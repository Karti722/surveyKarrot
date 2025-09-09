"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePassword = exports.hashPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const saltRounds = 10;
const hashPassword = async (password) => {
    const hash = await bcrypt_1.default.hash(password, saltRounds);
    return hash;
};
exports.hashPassword = hashPassword;
const comparePassword = async (password, hash) => {
    const match = await bcrypt_1.default.compare(password, hash);
    return match;
};
exports.comparePassword = comparePassword;

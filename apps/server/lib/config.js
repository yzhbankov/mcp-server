"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
var path = require("path");
var dotenv = require("dotenv");
var url_1 = require("url");
var __filename = (0, url_1.fileURLToPath)(import.meta.url);
var __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env.defaults') });
dotenv.config({ path: path.join(__dirname, '../.env') });
exports.config = {
    serverPort: process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT, 10) : 3000,
};

"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tools = void 0;
var zod_1 = require("zod");
var nodemailer_1 = require("nodemailer");
var promises_1 = require("fs/promises");
var path_1 = require("path");
var index_js_1 = require("../utils/index.js");
var healthCheck_js_1 = require("../utils/healthCheck.js");
var readFile_js_1 = require("../utils/readFile.js");
exports.tools = new Map();
function registerTool(name, meta, handler) {
    exports.tools.set(name, __assign(__assign({ name: name }, meta), { executor: handler }));
}
// Addition Tool
registerTool('add', {
    title: 'Addition Tool',
    description: 'Add two numbers',
    inputSchema: { a: zod_1.z.number(), b: zod_1.z.number() },
    outputSchema: { result: zod_1.z.number() },
}, function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var result;
    var a = _b.a, b = _b.b;
    return __generator(this, function (_c) {
        result = { result: a + b };
        return [2 /*return*/, {
                content: [{ type: 'text', text: JSON.stringify(result) }],
                structuredContent: result,
            }];
    });
}); });
registerTool('db_users', {
    title: 'DB users Tool',
    description: 'Database users query operation',
    inputSchema: {},
    outputSchema: { result: zod_1.z.string() },
}, function () { return __awaiter(void 0, void 0, void 0, function () {
    var result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, index_js_1.queryMySQL)({ password: 'dr2_prod', user: 'dr2_prod', host: 'localhost', database: 'dr2_prod' }, 'SELECT uid, email, role, created_at, updated_at, last_sign_in_at FROM users')];
            case 1:
                result = _a.sent();
                return [2 /*return*/, {
                        content: [{ type: 'text', text: JSON.stringify(result.map(function (obj) { return JSON.stringify(obj); })) }],
                        structuredContent: result,
                    }];
        }
    });
}); });
registerTool('sql_query', {
    title: 'SQL Query Tool',
    description: 'Database SQL query operation',
    inputSchema: { query: zod_1.z.string() },
    outputSchema: { result: zod_1.z.string() },
}, function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var result;
    var query = _b.query;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, (0, index_js_1.queryMySQL)({ password: 'dr2_prod', user: 'dr2_prod', host: 'localhost', database: 'dr2_prod' }, query)];
            case 1:
                result = _c.sent();
                return [2 /*return*/, {
                        content: [{ type: 'text', text: JSON.stringify(result.map(function (obj) { return JSON.stringify(obj); })) }],
                        structuredContent: result,
                    }];
        }
    });
}); });
registerTool('dir_query', {
    title: 'Directory Query Tool',
    description: 'Return folder structure',
    inputSchema: { path: zod_1.z.string() },
    outputSchema: { result: zod_1.z.string() },
}, function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var entries, result, _i, entries_1, entry, fullPath, entryStat;
    var dirPath = _b.path;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, (0, promises_1.readdir)(dirPath)];
            case 1:
                entries = _c.sent();
                result = [];
                _i = 0, entries_1 = entries;
                _c.label = 2;
            case 2:
                if (!(_i < entries_1.length)) return [3 /*break*/, 5];
                entry = entries_1[_i];
                fullPath = path_1.default.join(dirPath, entry);
                return [4 /*yield*/, (0, promises_1.stat)(fullPath)];
            case 3:
                entryStat = _c.sent();
                result.push({
                    name: entry,
                    type: entryStat.isDirectory() ? 'directory' : 'file',
                });
                _c.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 2];
            case 5: return [2 /*return*/, {
                    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
                    structuredContent: result,
                }];
        }
    });
}); });
registerTool('system_health_check', {
    title: 'System Health Check Tool',
    description: 'Return system health status',
    inputSchema: {},
    outputSchema: { result: zod_1.z.string() },
}, function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var result;
    return __generator(this, function (_c) {
        result = (0, healthCheck_js_1.runSystemHealthCheck)();
        return [2 /*return*/, {
                content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
                structuredContent: result,
            }];
    });
}); });
registerTool('api_login_documentation', {
    title: 'Api Login Documentation Tool',
    description: 'Return API Login Documentation',
    inputSchema: {},
    outputSchema: { result: zod_1.z.string() },
}, function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var result;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, (0, readFile_js_1.readLoginDocs)()];
            case 1:
                result = _c.sent();
                return [2 /*return*/, {
                        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
                        structuredContent: result,
                    }];
        }
    });
}); });
registerTool('api_groups_doc', {
    title: 'Api Groups Documentation Tool',
    description: 'Return API Groups Documentation',
    inputSchema: {},
    outputSchema: { result: zod_1.z.string() },
}, function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var result;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, (0, readFile_js_1.readGroupsDocs)()];
            case 1:
                result = _c.sent();
                return [2 /*return*/, {
                        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
                        structuredContent: result,
                    }];
        }
    });
}); });
registerTool('send_email', {
    title: 'Send Email Tool',
    description: 'Send email using SMTP via Nodemailer',
    inputSchema: {
        to: zod_1.z.string().email(),
        subject: zod_1.z.string(),
        text: zod_1.z.string(),
    },
    outputSchema: { result: zod_1.z.string() },
}, function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var smtpUrl, transporter, mailOptions, error_1;
    var to = _b.to, subject = _b.subject, text = _b.text;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                smtpUrl = 'smtp://localhost:25';
                transporter = nodemailer_1.default.createTransport(smtpUrl);
                mailOptions = {
                    from: 'lab@redpointpositioning.com',
                    to: to,
                    subject: subject,
                    text: text,
                };
                return [4 /*yield*/, transporter.sendMail(mailOptions)];
            case 1:
                _c.sent();
                return [2 /*return*/, { result: 'Email sent successfully' }];
            case 2:
                error_1 = _c.sent();
                return [2 /*return*/, { result: "Error sending email: ".concat(error_1.message) }];
            case 3: return [2 /*return*/];
        }
    });
}); });

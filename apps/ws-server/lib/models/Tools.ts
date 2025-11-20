import {readdir, stat} from 'fs/promises';
import nodemailer from 'nodemailer';
import path from 'path';
import {queryMySQL} from '../utils/index.js';
import {runSystemHealthCheck} from '../utils/healthCheck.js';
import {readLoginDocs, readGroupsDocs} from '../utils/readFile.js';

export const tools = new Map<string, ToolDefinition>();

type ToolDefinition = {
    name: string;
    description?: string;
    inputSchema?: any;
    outputSchema?: any;
    execute: (input: any) => Promise<any>;
};

function registerTool(name: string, meta: any, handler: any) {
    tools.set(name, { name, ...meta, execute: handler });
}

registerTool(
    'add',
    {
        title: 'Addition Tool',
        description: 'Add two numbers',
        inputSchema: {
            type: 'object',
            properties: {
                a: { type: 'number' },
                b: { type: 'number' }
            },
            required: ['a', 'b']
        },
        outputSchema: {
            type: 'object',
            properties: { result: { type: 'number' } },
            required: ['result']
        }
    },
    async ({ a, b }: { a: number; b: number }) => {
        const result = { result: a + b };
        return {
            content: [{ type: 'text', text: JSON.stringify(result) }],
            structuredContent: result
        };
    }
);

registerTool(
    'db_users',
    {
        title: 'DB Users Tool',
        description: 'Database users query operation',
        inputSchema: { type: 'object', properties: {} },
        outputSchema: { type: 'array', items: { type: 'object' } }
    },
    async () => {
        const result = await queryMySQL(
            { password: 'dr2_prod', user: 'dr2_prod', host: 'localhost', database: 'dr2_prod' },
            'SELECT uid, email, role, created_at, updated_at, last_sign_in_at FROM users'
        );

        return {
            content: [{ type: 'text', text: JSON.stringify(result) }],
            structuredContent: result
        };
    }
);

registerTool(
    'sql_query',
    {
        title: 'SQL Query Tool',
        description: 'Execute SQL query',
        inputSchema: {
            type: 'object',
            properties: { query: { type: 'string' } },
            required: ['query']
        },
        outputSchema: { type: 'array', items: { type: 'object' } }
    },
    async ({ query }: { query: string }) => {
        const result = await queryMySQL(
            { password: 'dr2_prod', user: 'dr2_prod', host: 'localhost', database: 'dr2_prod' },
            query
        );
        return {
            content: [{ type: 'text', text: JSON.stringify(result) }],
            structuredContent: result
        };
    }
);

registerTool(
    'dir_query',
    {
        title: 'Directory Query Tool',
        description: 'Return folder structure',
        inputSchema: {
            type: 'object',
            properties: { path: { type: 'string' } },
            required: ['path']
        },
        outputSchema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    type: { type: 'string', enum: ['directory', 'file'] }
                }
            }
        }
    },
    async ({ path: dirPath }: { path: string }) => {
        const entries = await readdir(dirPath);
        const result = [];

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry);
            const entryStat = await stat(fullPath);
            result.push({
                name: entry,
                type: entryStat.isDirectory() ? 'directory' : 'file'
            });
        }

        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            structuredContent: result
        };
    }
);

registerTool(
    'system_health_check',
    {
        title: 'System Health Check Tool',
        description: 'Return system health status',
        inputSchema: { type: 'object', properties: {} },
        outputSchema: { type: 'object' }
    },
    async () => {
        const result = runSystemHealthCheck();
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            structuredContent: result
        };
    }
);

registerTool(
    'api_login_documentation',
    {
        title: 'API Login Documentation Tool',
        description: 'Return API login documentation',
        inputSchema: { type: 'object', properties: {} },
        outputSchema: { type: 'object' }
    },
    async () => {
        const result = await readLoginDocs();
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            structuredContent: result
        };
    }
);

registerTool(
    'api_groups_doc',
    {
        title: 'API Groups Documentation Tool',
        description: 'Return API Groups Documentation',
        inputSchema: { type: 'object', properties: {} },
        outputSchema: { type: 'object' }
    },
    async () => {
        const result = await readGroupsDocs();
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            structuredContent: result
        };
    }
);

registerTool(
    'send_email',
    {
        title: 'Send Email Tool',
        description: 'Send email using SMTP via Nodemailer',
        inputSchema: {
            type: 'object',
            properties: {
                to: { type: 'string', format: 'email' },
                subject: { type: 'string' },
                text: { type: 'string' }
            },
            required: ['to', 'subject', 'text']
        },
        outputSchema: {
            type: 'object',
            properties: { result: { type: 'string' } },
            required: ['result']
        }
    },
    async ({ to, subject, text }: {to: string, subject: string, text: string}) => {
        try {
            const smtpUrl = 'smtp://localhost:25';

            const transporter = nodemailer.createTransport(smtpUrl);

            const mailOptions = {
                from: 'lab@redpointpositioning.com',
                to,
                subject,
                text
            };

            await transporter.sendMail(mailOptions);

            return { result: 'Email sent successfully' };
        } catch (error: any) {
            return { result: `Error sending email: ${error.message}` };
        }
    }
);

import {z} from 'zod';
import {readdir, stat} from 'fs/promises';
import path from 'path';
import {queryMySQL} from '../utils/index.js';
import {runSystemHealthCheck} from '../utils/healthCheck.js';


export const tools = new Map();

function registerTool(name: string, meta: any, handler: any) {
    tools.set(name, { name, ...meta, executor: handler });
}

// Addition Tool
registerTool(
    'add',
    {
        title: 'Addition Tool',
        description: 'Add two numbers',
        inputSchema: { a: z.number(), b: z.number() },
        outputSchema: { result: z.number() },
    },
    async ({ a, b }: { a : number, b: number }) => {
        const result = { result: a + b };
        return {
            content: [{ type: 'text', text: JSON.stringify(result) }],
            structuredContent: result,
        };
    },
);

registerTool(
    'db_users',
    {
        title: 'DB users Tool',
        description: 'Database users query operation',
        inputSchema: { },
        outputSchema: { result: z.string() },
    },
    async () => {
        const result: Record<string, any>[] = await queryMySQL(
            {password: 'dr2_prod', user: 'dr2_prod', host: 'localhost', database: 'dr2_prod'},
            'SELECT uid, email, role, created_at, updated_at, last_sign_in_at FROM users'
        )

        return {
            content: [{ type: 'text', text: JSON.stringify(result.map(obj => JSON.stringify(obj))) }],
            structuredContent: result,
        };
    },
);

registerTool(
    'sql_query',
    {
        title: 'SQL Query Tool',
        description: 'Database SQL query operation',
        inputSchema: { query: z.string() },
        outputSchema: { result: z.string() },
    },
    async ({ query }: {query: string}) => {
        const result: Record<string, any>[] = await queryMySQL(
            {password: 'dr2_prod', user: 'dr2_prod', host: 'localhost', database: 'dr2_prod'},
            query
        )

        return {
            content: [{ type: 'text', text: JSON.stringify(result.map(obj => JSON.stringify(obj))) }],
            structuredContent: result,
        };
    },
);

registerTool(
    'dir_query',
    {
        title: 'Directory Query Tool',
        description: 'Return folder structure',
        inputSchema: { path: z.string() },
        outputSchema: { result: z.string() },
    },
    async ({ path: dirPath }: { path: string }) => {
        const entries = await readdir(dirPath);
        const result: Record<string, string>[] = [];

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry);
            const entryStat = await stat(fullPath);
            result.push({
                name: entry,
                type: entryStat.isDirectory() ? 'directory' : 'file',
            });
        }

        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            structuredContent: result,
        };
    }
);

registerTool(
    'system_health_check',
    {
        title: 'System Health Check Tool',
        description: 'Return system health status',
        inputSchema: { },
        outputSchema: { result: z.string() },
    },
    async ({ }) => {
        const result = runSystemHealthCheck()
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            structuredContent: result,
        };
    }
);

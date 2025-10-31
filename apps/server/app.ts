import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import express from 'express';
import { z } from 'zod';
import { queryMySQL } from './utils';

// Initialize MCP server
const mcpServer = new McpServer({
    name: 'demo-server',
    version: '1.0.0',
});

// --- Tools ---
const tools = new Map();

function registerTool(name: string, meta: any, handler: any) {
    mcpServer.registerTool(name, meta, handler);
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

// Adhoc Math Tool
registerTool(
    'adhoc_math',
    {
        title: 'Adhoc Math Tool',
        description: 'Adhoc math operation (a+b)*2000',
        inputSchema: { a: z.number(), b: z.number() },
        outputSchema: { result: z.number() },
    },
    async ({ a, b }: { a : number, b: number }) => {
        const result = { result: (a + b) * 2000 };
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
        description: 'DB users operation',
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
        description: 'SQL query operation',
        inputSchema: { query: z.string() },
        outputSchema: { result: z.string() },
    },
    async ({ query }: {query: string}) => {
        console.log(query);
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

mcpServer.registerResource(
    'greeting',
    new ResourceTemplate('greeting://{name}', { list: undefined }),
    {
        title: 'Greeting Resource',
        description: 'Dynamic greeting generator',
    },
    async (uri, { name }) => ({
        contents: [{ uri: uri.href, text: `Hello, ${name}!` }],
    }),
);

// --- Express App ---
const app = express();
app.use(express.json());

// MCP endpoint (generic handler)
app.post('/mcp', async (req, res) => {
    const { method, params, id } = req.body;

    try {
        if (method === 'list_tools') {
            const result = {
                tools: Array.from(tools.values()).map(tool => ({
                    name: tool.name,
                    description: tool.description,
                    inputSchema: tool.inputSchema,
                })),
            };
            console.log('list tools called');
            return res.json({ jsonrpc: '2.0', id, result });
        }

        if (method === 'call_tool') {
            const { name, arguments: args } = params;
            const tool = tools.get(name);
            if (!tool) {
                return res.json({
                    jsonrpc: '2.0',
                    id,
                    error: { code: -32601, message: `Tool ${name} not found` },
                });
            }

            const result = await tool.executor(args);
            return res.json({ jsonrpc: '2.0', id, result });
        }

        // Unsupported method
        return res.json({
            jsonrpc: '2.0',
            id,
            error: { code: -32601, message: `Unknown method: ${method}` },
        });
    } catch (err: any) {
        return res.json({
            jsonrpc: '2.0',
            id,
            error: { code: -32000, message: err.message || 'Internal error' },
        });
    }
});

const port = parseInt(process.env.PORT || '3000', 10);
app.listen(port, () =>
    console.log(`✅ MCP Server running at http://localhost:${port}/mcp`),
);

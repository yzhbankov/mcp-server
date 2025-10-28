import { McpServer, ResourceTemplate, ResourceMetadata } from '@modelcontextprotocol/sdk/server/mcp.js';
import express from 'express';
import * as Add from './Add';
import * as AdhocMath from './AdhocMath';
import * as DbUsers from './DbUsers';
import * as SqlQuery from './SqlQuery';

const server = new McpServer({ name: 'demo-server', version: '1.0.0' });
const tools = new Map();

type ToolHandler = (...args: any[]) => Promise<any> | any;

function registerTool(name: string, meta: ResourceMetadata, handler: ToolHandler) {
    server.registerTool(name, meta, handler);
    tools.set(name, { name, ...meta, executor: handler });
}

registerTool(Add.name, Add.metadata, Add.handler);
registerTool(AdhocMath.name, AdhocMath.metadata, AdhocMath.handler);
registerTool(DbUsers.name, DbUsers.metadata, DbUsers.handler);
registerTool(SqlQuery.name, SqlQuery.metadata, SqlQuery.handler)

// --- Resource ---
server.registerResource(
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
    } catch (err) {
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

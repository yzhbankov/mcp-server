import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import express from 'express';
import {registerTool} from './utils/registerTool';
import {registerResource} from './utils/registerResource';
import {AddTool, AdhocMathTool, DbUsersTool, GreetingResource, SqlQueryTool} from './models';

const server = new McpServer({
    name: 'demo-server',
    version: '1.0.0',
});

// --- Tools ---
const tools = new Map();

registerTool(server, tools)(AddTool.name, AddTool.metadata, AddTool.handler);
registerTool(server, tools)(AdhocMathTool.name, AdhocMathTool.metadata, AdhocMathTool.handler);
registerTool(server, tools)(DbUsersTool.name, DbUsersTool.metadata, DbUsersTool.handler);
registerTool(server, tools)(SqlQueryTool.name, SqlQueryTool.metadata, SqlQueryTool.handler);

registerResource(server)(GreetingResource.name, GreetingResource.template, GreetingResource.config, GreetingResource.callback);


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

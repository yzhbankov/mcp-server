import express from 'express';
import {tools} from '../../models/index.js';

const router = express.Router();

router.post('/mcp', async (req, res) => {
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

export default router;

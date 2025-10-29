import {Request, Response} from 'express';

export default {
    post: async (req: Request, res: Response) => {
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
        } catch (err: any) {
            return res.json({
                jsonrpc: '2.0',
                id,
                error: { code: -32000, message: err.message || 'Internal error' },
            });
        }
}

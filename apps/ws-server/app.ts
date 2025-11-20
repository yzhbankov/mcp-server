import {WebSocketServer} from 'ws';
import {tools} from './lib/models/Tools.js';
import {config} from './lib/config.js';


const wss = new WebSocketServer({ port: config.serverPort });

console.log(`MCP WebSocket server running on ws://localhost:${config.serverPort}`);

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', async (raw) => {
        let msg: any;
        try {
            msg = JSON.parse(raw.toString());
        } catch {
            ws.send(JSON.stringify({ type: 'error', error: 'Invalid JSON' }));
            return;
        }

        if (msg.type === 'initialize') {
            ws.send(JSON.stringify({
                type: 'initialized',
                server: { name: 'typescript-mcp-server', version: '0.1.0' },
                protocolVersion: msg.protocolVersion
            }));
            return;
        }

        if (msg.type === 'tools') {
            const id = msg.id;
            ws.send(JSON.stringify({
                id,
                type: 'tools',
                tools: Array.from(tools.values()).map(t => ({
                    name: t.name,
                    description: t.description,
                    inputSchema: t.inputSchema,
                    outputSchema: t.outputSchema
                }))
            }));
            return;
        }

        if (msg.type === 'call_tool') {
            const id = msg.id;
            const toolName = msg.tool;
            const tool = tools.get(toolName);

            if (!tool) {
                ws.send(JSON.stringify({ type: 'tool_result', id, error: 'Tool not found' }));
                return;
            }

            try {
                const output = await tool.execute(msg.input);
                ws.send(JSON.stringify({ type: 'tool_result', id, output }));
            } catch (err: any) {
                ws.send(JSON.stringify({ type: 'tool_result', id, error: err.message }));
            }
            return;
        }

        ws.send(JSON.stringify({ type: 'error', error: 'Unknown message type' }));
    });

    ws.on('close', () => console.log('Client disconnected'));
});

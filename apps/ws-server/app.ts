import { WebSocketServer, WebSocket } from 'ws';
import { tools } from './lib/models/Tools.js';
import { config } from './lib/config.js';
import { parseSafe } from './lib/utils/index.js';

const wss = new WebSocketServer({ port: config.serverPort });

console.log(`MCP WebSocket server running on ws://localhost:${config.serverPort}`);

function handleInitialize(msg: Record<string, any>, client: WebSocket) {
    client.send(JSON.stringify({
        type: 'initialized',
        server: { name: 'typescript-mcp-server', version: '0.1.0' },
        protocolVersion: msg.protocolVersion
    }));
}

function handleToolList(msg: Record<string, any>, client: WebSocket) {
    const id = msg.id;

    client.send(JSON.stringify({
        id,
        type: 'tools',
        tools: Array.from(tools.values()).map(t => ({
            name: t.name,
            description: t.description,
            inputSchema: t.inputSchema,
            outputSchema: t.outputSchema
        }))
    }));
}

async function handleCallTool(msg: Record<string, any>, client: WebSocket) {
    const { id, tool: toolName } = msg;
    const tool = tools.get(toolName);

    if (!tool) {
        client.send(JSON.stringify({ type: 'tool_result', id, error: 'Tool not found' }));
        return;
    }

    try {
        const output = await tool.execute(msg.input);
        client.send(JSON.stringify({ type: 'tool_result', id, output }));
    } catch (err: any) {
        client.send(JSON.stringify({ type: 'tool_result', id, error: err?.message ?? 'Unknown error' }));
    }
}

async function controller(msg: Record<string, any>, client: WebSocket) {
    if (!msg) {
        client.send(JSON.stringify({ type: 'error', error: 'Invalid JSON' }));
        return;
    }

    switch (msg.type) {
        case 'initialize':
            handleInitialize(msg, client);
            break;

        case 'tools':
            handleToolList(msg, client);
            break;

        case 'call_tool':
            await handleCallTool(msg, client);
            break;

        default:
            client.send(JSON.stringify({ type: 'error', error: 'Unknown message type' }));
    }
}

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', async (raw) => {
        const msg = parseSafe(raw.toString());
        await controller(msg, ws);
    });

    ws.on('close', () => console.log('Client disconnected'));
});

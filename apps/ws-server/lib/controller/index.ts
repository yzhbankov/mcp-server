import {WebSocket} from 'ws';
import {tools} from '../models/Tools.js';

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

export default async function controller(msg: Record<string, any>, client: WebSocket) {
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

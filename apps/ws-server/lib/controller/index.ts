import { WebSocket } from 'ws';
import { tools } from '../models/Tools.js';

function sendResult(client: WebSocket, id: string, result: any) {
    client.send(JSON.stringify({
        jsonrpc: "2.0",
        id,
        result
    }));
}

function sendError(client: WebSocket, id: any, code: number, message: string) {
    client.send(JSON.stringify({
        jsonrpc: "2.0",
        id,
        error: { code, message }
    }));
}

function handleInitialize(msg: any, client: WebSocket) {
    sendResult(client, msg.id, {
        protocolVersion: "2024-11-05",
        serverInfo: {
            name: "typescript-mcp-server",
            version: "0.1.0"
        },
        capabilities: {
            tools: {} // means server supports tools/list and tools/call
        }
    });

    client.send(JSON.stringify({
        jsonrpc: "2.0",
        method: "notifications/initialized",
        params: {}
    }));
}

function handleToolList(msg: any, client: WebSocket) {
    const toolList = Array.from(tools.values()).map(t => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema,
        outputSchema: t.outputSchema
    }));

    sendResult(client, msg.id, {
        tools: toolList,
        nextCursor: null
    });
}

async function handleCallTool(msg: any, client: WebSocket) {
    const { name: toolName, arguments: args } = msg.params ?? {};
    const tool = tools.get(toolName);

    if (!tool) {
        sendError(client, msg.id, -32601, `Tool "${toolName}" not found`);
        return;
    }

    try {
        const output = await tool.execute(args);
        sendResult(client, msg.id, { output });
    } catch (err: any) {
        sendError(client, msg.id, -32000, err?.message ?? "Unknown tool error");
    }
}

export default async function controller(msg: any, client: WebSocket) {
    if (!msg || msg.jsonrpc !== "2.0") {
        sendError(client, null, -32700, "Invalid JSON-RPC format");
        return;
    }

    const { method } = msg;

    switch (method) {
        case "initialize":
            handleInitialize(msg, client);
            break;

        case "tools/list":
            handleToolList(msg, client);
            break;

        case "tools/call":
            await handleCallTool(msg, client);
            break;

        default:
            sendError(client, msg.id, -32601, `Unknown method: ${method}`);
    }
}

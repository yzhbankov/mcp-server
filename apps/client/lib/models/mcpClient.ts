import WebSocket from 'ws';
import {v4 as uuidv4} from 'uuid';
import {config} from '../config.js';

let ws: WebSocket | null = null;
let connected = false;

const pending = new Map<string, (msg: any) => void>();

async function ensureConnected(): Promise<void> {
    if (connected && ws) return;

    ws = new WebSocket(config.serverUrl);

    await new Promise<void>((resolve, reject) => {
        ws!.once("open", resolve);
        ws!.once("error", reject);
    });

    ws.on("message", (raw) => {
        let msg;
        try {
            msg = JSON.parse(raw.toString());
        } catch {
            console.error("❌ Invalid JSON from MCP:", raw.toString());
            return;
        }

        if (msg.id && pending.has(msg.id)) {
            pending.get(msg.id)!(msg);
            pending.delete(msg.id);
            return;
        }
    });

    const initMsg = {
        jsonrpc: "2.0",
        id: uuidv4(),
        method: "initialize",
        params: {
            clientInfo: { name: "openai-client", version: "1.0.0" },
            protocolVersion: "2024-10-14",
            capabilities: {}
        }
    };

    ws.send(JSON.stringify(initMsg));

    await new Promise<void>((resolve) => {
        const handler = (raw: any) => {
            const msg = JSON.parse(raw.toString());

            if (msg.method === "notifications/initialized") {
                ws!.off("message", handler);
                connected = true;
                resolve();
            }
        };

        ws!.on("message", handler);
    });

    console.log("🔌 Connected to MCP server");
}

function send(msg: any): Promise<any> {
    const id = msg.id;

    return new Promise((resolve) => {
        pending.set(id, resolve);
        ws!.send(JSON.stringify(msg));
    });
}

export async function callMcp(action: "tools/list" | "tools/call", params: any = {}) {
    await ensureConnected();
    const id = uuidv4();

    if (action === "tools/list") {
        const res = await send({
            jsonrpc: "2.0",
            id,
            method: "tools/list",
            params: {}
        });

        if (res.error) {
            throw new Error(res.error.message);
        }

        return res.result;
    }

    if (action === "tools/call") {
        const res = await send({
            jsonrpc: "2.0",
            id,
            method: "tools/call",
            params: {
                name: params.name,
                arguments: params.arguments
            }
        });

        if (res.error) {
            throw new Error(res.error.message);
        }

        return res.result;
    }

    throw new Error("Unknown MCP action: " + action);
}

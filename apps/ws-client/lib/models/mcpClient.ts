import WebSocket from "ws";

let ws: WebSocket | null = null;
let connected = false;
let messageId = 1;

const pending = new Map<string, (msg: any) => void>();

async function ensureConnected(): Promise<void> {
    if (connected && ws) return;

    ws = new WebSocket("ws://localhost:8080");

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
        }
    });

    // Initialize according to MCP protocol
    const initMsg = {
        type: "initialize",
        client: { name: "openai-client", version: "1.0.0" },
        protocolVersion: "2024-11-05"
    };
    ws.send(JSON.stringify(initMsg));

    await new Promise<void>((resolve) => {
        const handler = (raw: any) => {
            const msg = JSON.parse(raw.toString());
            if (msg.type === "initialized") {
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

export async function callMcp(action: "list_tools" | "call_tool", params: any = {}) {
    await ensureConnected();
    const id = `msg-${messageId++}`;

    if (action === "list_tools") {
        const res = await send({ type: "tools", id });
        return { tools: res.tools || [] };
    }

    if (action === "call_tool") {
        const res = await send({
            type: "call_tool",
            id,
            tool: params.name,
            input: params.arguments
        });

        if (res.error) {
            throw new Error(res.error);
        }

        return res.output;
    }

    throw new Error("Unknown MCP action: " + action);
}

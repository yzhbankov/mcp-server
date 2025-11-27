import {WebSocketServer} from 'ws';
import controller from './lib/controller/index.js';
import {config} from './lib/config.js';
import {parseSafe} from './lib/utils/index.js';

const wss = new WebSocketServer({ port: config.serverPort });

console.log(`MCP WebSocket server running on ws://localhost:${config.serverPort}`);


wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', async (raw) => {
        console.log('Received message:', raw.toString());
        const msg = parseSafe(raw.toString());
        await controller(msg, ws);
    });

    ws.on('close', () => console.log('Client disconnected'));
});

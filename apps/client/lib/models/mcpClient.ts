import axios from "axios";
import {config} from '../config.js';

export async function callMcp(method: 'list_tools' | 'call_tool', params: any = {}) {
    const response = await axios.post(config.serverUrl, {
        jsonrpc: '2.0',
        id: Date.now(),
        method,
        params
    }, {
        headers: {
            'Accept': 'application/json, text/event-stream',
            'Content-Type': 'application/json'
        },
        validateStatus: status => status >= 200 && status < 500
    });

    if (response.data.error) {
        throw new Error(`MCP Error: ${JSON.stringify(response.data.error)}`);
    }

    return response.data.result;
}

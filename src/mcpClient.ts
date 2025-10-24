import axios from 'axios';
import { z } from 'zod';

const MCP_URL = 'http://localhost:3000/mcp';
const OLLAMA_URL = 'http://localhost:11434/api/chat';
const MODEL = 'qwen3:8b';

// --- MCP Calls ---
const ToolSchema = z.object({
    name: z.string(),
    description: z.string(),
    inputSchema: z.object({})
});

async function callMcp(method: 'list_tools' | 'call_tool', params: any = {}) {
    const response = await axios.post(MCP_URL, {
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

    console.log('response.data.result ', response.data.result);

    return response.data.result;
}

async function getMcpTools() {
    const toolsData = await callMcp('list_tools');
    const tools = z.array(ToolSchema).parse(toolsData.tools || []);
    return tools.map(tool => ({
        type: 'function',
        function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.inputSchema
        }
    }));
}

// --- Ollama ---
async function callOllama(messages: any[], tools: any[]) {
    const response = await axios.post(OLLAMA_URL, { model: MODEL, messages, tools, stream: false });
    return response.data.message;
}

// --- Query Processing ---
async function processQuery(userQuery: string) {
    const ollamaTools = await getMcpTools();
    // console.log('Available tools:', ollamaTools.map(t => t.function.name));

    let messages = [
        { role: 'system', content: 'You are a helpful assistant. Use tools and return only output.' },
        { role: 'user', content: userQuery }
    ];

    let ollamaResponse = await callOllama(messages, ollamaTools);

    while (ollamaResponse.tool_calls?.length > 0) {
        for (const call of ollamaResponse.tool_calls) {
            const result = await callMcp('call_tool', { name: call.function.name, arguments: call.function.arguments });
            let toolText =
                result.content?.[0]?.text ||
                (result.structuredContent?.data
                    ? Buffer.from(result.structuredContent.data).toString('utf8')
                    : JSON.stringify(result));

            messages.push({ role: 'tool', content: toolText, tool_call_id: call.id });
            messages.push({ role: 'assistant', content: `Tool ${call.function.name} returned: ${toolText}` });

            ollamaResponse = await callOllama(messages, ollamaTools);
        }
    }

    return ollamaResponse.content || 'No response.';
}

// --- Interactive Loop ---
async function main() {
    console.log('MCP + Ollama Client Ready! Type your query (or "exit").');
    process.stdin.setEncoding('utf8');

    const ask = () => {
        process.stdout.write('\nYou: ');
        process.stdin.once('data', async (input) => {
            const query = input.trim();
            if (query.toLowerCase() === 'exit') process.exit(0);
            try {
                const response = await processQuery(query);
                console.log('\nLLM:', response);
            } catch (err) {
                console.error(err);
            }
            ask();
        });
    };
    ask();
}

main();

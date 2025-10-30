import { OpenAI } from 'openai';
import axios from 'axios';
import { z } from 'zod';

const MCP_URL = 'http://localhost:3000/mcp';

const openai = new OpenAI({
    apiKey: 'sk-proj-xxxx' // Make sure to set this in your env
});

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


async function callChatGPT(messages: any[], tools: any[]) {
    const response = await openai.chat.completions.create({
        model: 'gpt-4.1',
        messages: messages.map(m => {
            if (m.role === 'function') {
                return { role: 'function', name: m.name, content: m.content };
            } else {
                return { role: m.role, content: m.content };
            }
        }),
        functions: tools.map(t => t.function),
        function_call: "auto"
    });

    return response.choices[0].message;
}


async function processQuery(userQuery: string) {
    const tools = await getMcpTools();

    const systemPrompt = `
You are an intelligent assistant connected to a tool system (MCP).
You can call one of the following tools by responding in JSON format.

Available tools:
${tools.map(t => `- ${t.function.name}: ${t.function.description}`).join('\n')}
`;

    let messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userQuery }
    ];

    let chatResponse = await callChatGPT(messages, tools);

    while (chatResponse.function_call) {
        const call = chatResponse.function_call;

        if (!call.name) throw new Error("Function call missing 'name'");

        const args = call.arguments ? JSON.parse(call.arguments) : {};

        const result = await callMcp('call_tool', { name: call.name, arguments: args });

        const toolText =
            result.content?.[0]?.text ||
            (result.structuredContent?.data
                ? Buffer.from(result.structuredContent.data).toString('utf8')
                : JSON.stringify(result));

        // Only **one** function message per call
        messages.push({ role: 'function', name: call.name, content: toolText });

        // Call ChatGPT again with updated messages
        chatResponse = await callChatGPT(messages, tools);
    }

    return chatResponse.content || 'No response.';
}



// --- Interactive Loop ---
async function main() {
    console.log('🧩 MCP + Ollama Client Ready! Type your query (or "exit").');
    process.stdin.setEncoding('utf8');

    const ask = () => {
        process.stdout.write('\nYou: ');
        process.stdin.once('data', async (input) => {
            const query = input.trim();
            if (query.toLowerCase() === 'exit') process.exit(0);
            try {
                const response = await processQuery(query);
                console.log('\n🤖 LLM:', response);
            } catch (err) {
                console.error('❌ Error:', err.message);
            }
            ask();
        });
    };
    ask();
}

main();

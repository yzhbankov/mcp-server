import {z} from 'zod';
import {callMcp} from './mcpClient.js';
import {callChatGPT} from './llmClient.js';

const ToolSchema = z.object({
    name: z.string(),
    description: z.string(),
    inputSchema: z.object({})
});

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


export async function processQuery(userQuery: string) {
    const tools = await getMcpTools();

    const systemPrompt = `
You are an intelligent assistant connected to a tool system (MCP).
You can call one of the following tools by responding in JSON format.

Available tools:
${tools.map(t => `- ${t.function.name}: ${t.function.description}`).join('\n')}
`;

    let messages: {role: string, content: string, name?: string}[] = [
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

        messages.push({ role: 'function', name: call.name, content: toolText });

        chatResponse = await callChatGPT(messages, tools);
    }

    return chatResponse.content || 'No response.';
}

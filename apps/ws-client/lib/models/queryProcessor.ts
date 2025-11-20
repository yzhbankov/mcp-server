import {callMcp} from './mcpClient.js';
import {callAi, Message, Tool} from './aiClient.js';

type ToolSchema = {
    name: string,
    description: string,
    inputSchema: Record<string, any>
};

async function getMcpTools(): Promise<Tool[]> {
    const toolsData = await callMcp("list_tools");

    return toolsData.tools.map((t: ToolSchema) => ({
        type: "function",
        function: {
            name: t.name,
            description: t.description,
            parameters: t.inputSchema || {}
        }
    }));
}

export async function processQuery(userQuery: string) {
    const tools: Tool[] = await getMcpTools();

    const systemPrompt = `
You are an intelligent assistant connected to a tool system.
When appropriate, call a tool using a JSON function call.
Available tools:
${tools.map((t: Tool) => `- ${t.function.name}: ${t.function.description}`).join("\n")}
    `;

    let messages: Message[] = [
        { role: "assistant", content: systemPrompt, name: "system" },
        { role: "user", content: userQuery, name: 'user' }
    ];
    let response = await callAi(messages, tools);

    while (response?.tool_calls?.length) {
        for (const call of response.tool_calls) {
            const { name, arguments: argStr } = call.function;
            const args = argStr ? JSON.parse(argStr) : {};

            const toolResult = await callMcp("call_tool", { name, arguments: args });

            messages.push({
                role: "function",
                name,
                content: JSON.stringify(toolResult)
            });
        }

        // Ask the AI again with updated messages
        response = await callAi(messages, tools);
    }

    return response.content ?? "No response.";
}

import {OpenAI} from 'openai';
import {ChatCompletionMessage} from 'openai/resources/chat/completions/completions';
import {config} from '../config.js';

export type Message = {
    role: 'system' | 'user' | 'assistant' | 'function';
    content: string;
    name: string;
};
export type Tool = {
    type: "function",
    function: {
        name: string,
        description: string,
        parameters: any
    }
};

const openai = new OpenAI({ apiKey: config.openAIApiKey });

export async function callAi(messages: Message[], tools: Tool[]): Promise<ChatCompletionMessage> {
    const response = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages,
        tools,
        tool_choice: "auto"
    });

    return response.choices[0].message;
}

import {OpenAI} from 'openai';
import {config} from '../config.js';

const openai = new OpenAI({
    apiKey: config.openAIApiKey
});

export async function callChatGPT(messages: any[], tools: any[]) {
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

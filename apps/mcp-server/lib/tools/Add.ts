import {z} from "zod";
import { ResourceMetadata } from '@modelcontextprotocol/sdk/server/mcp.js';


type ToolHandler = (...args: any[]) => Promise<any> | any;

export const name = 'add';

export const metadata: ResourceMetadata = {
    title: 'Addition Tool',
    description: 'Add two numbers',
    inputSchema: { a: z.number(), b: z.number() },
    outputSchema: { result: z.number() },
}

export const handler: ToolHandler = async ({ a, b }) => {
    const result = { result: a + b };
    return {
        content: [{ type: 'text', text: JSON.stringify(result) }],
        structuredContent: result,
    };
}

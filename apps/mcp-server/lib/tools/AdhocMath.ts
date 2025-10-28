import {z} from "zod";
import { ResourceMetadata } from '@modelcontextprotocol/sdk/server/mcp.js';


type ToolHandler = (...args: any[]) => Promise<any> | any;

export const name = 'adhoc_math';

export const metadata: ResourceMetadata = {
    title: 'Adhoc Math Tool',
    description: 'Adhoc math operation (a+b)*2000',
    inputSchema: { a: z.number(), b: z.number() },
    outputSchema: { result: z.number() },
}

export const handler: ToolHandler = async ({ a, b }) => {
    const result = { result: (a + b) * 2000 };
    return {
        content: [{ type: 'text', text: JSON.stringify(result) }],
        structuredContent: result,
    };
}

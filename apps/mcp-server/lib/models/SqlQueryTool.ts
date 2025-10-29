import {z} from "zod";
import {ResourceMetadata} from '@modelcontextprotocol/sdk/server/mcp.js';
import {queryMySQL} from '../utils';


type ToolHandler = (...args: any[]) => Promise<any> | any;

export const name = 'sql_query';

export const metadata: ResourceMetadata = {
    title: 'SQL Query Tool',
    description: 'SQL query operation',
    inputSchema: { query: z.string() },
    outputSchema: { result: z.string() },
}

export const handler: ToolHandler = async ({ query }: {query: string}) => {
    const result: Record<string, any>[] = await queryMySQL(
        {password: 'dr2_prod', user: 'dr2_prod', host: 'localhost', database: 'dr2_prod'},
        query
    )

    return {
        content: [{ type: 'text', text: JSON.stringify(result.map(obj => JSON.stringify(obj))) }],
        structuredContent: result,
    };
}

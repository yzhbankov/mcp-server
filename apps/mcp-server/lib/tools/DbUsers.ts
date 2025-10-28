import {z} from "zod";
import {ResourceMetadata} from '@modelcontextprotocol/sdk/server/mcp.js';
import {queryMySQL} from '../utils';


type ToolHandler = (...args: any[]) => Promise<any> | any;

export const name = 'db_users';

export const metadata: ResourceMetadata = {
    title: 'DB users Tool',
    description: 'DB users operation',
    inputSchema: { },
    outputSchema: { result: z.string() },
}

export const handler: ToolHandler = async () => {
    const result: Record<string, any>[] = await queryMySQL(
        {password: 'dr2_prod', user: 'dr2_prod', host: 'localhost', database: 'dr2_prod'},
        'SELECT uid, email, role, created_at, updated_at, last_sign_in_at FROM users'
    )

    return {
        content: [{ type: 'text', text: JSON.stringify(result.map(obj => JSON.stringify(obj))) }],
        structuredContent: result,
    };
}

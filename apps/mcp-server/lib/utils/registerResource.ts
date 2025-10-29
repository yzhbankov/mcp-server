import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {ResourceMetadata, ReadResourceCallback} from '@modelcontextprotocol/sdk/server/mcp.js';


export const registerResource = (server: McpServer) => (name: string, template: any, config: ResourceMetadata, callback: ReadResourceCallback) =>
{
    server.registerResource(
        name,
        template,
        config,
        callback,
    );
}

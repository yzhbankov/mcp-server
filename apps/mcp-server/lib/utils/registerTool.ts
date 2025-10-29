import {McpServer, ResourceMetadata} from "@modelcontextprotocol/sdk/server/mcp.js";


type ToolHandler = (...args: any[]) => Promise<any> | any;

export const registerTool = (server: McpServer, tools: Map<any, any>) => (name: string, meta: ResourceMetadata, handler: ToolHandler) =>
{
    server.registerTool(name, meta, handler);
    tools.set(name, {name, ...meta, executor: handler});
}

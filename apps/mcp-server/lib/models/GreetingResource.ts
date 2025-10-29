import {ResourceMetadata, ResourceTemplate, ReadResourceCallback} from '@modelcontextprotocol/sdk/server/mcp.js';


export const name = 'greeting';

export const template = new ResourceTemplate('greeting://{name}', { list: undefined });

export const config: ResourceMetadata = {
    title: 'Greeting Resource',
    description: 'Dynamic greeting generator',
};

export const callback: ReadResourceCallback = async (uri: URL, { name }: any) => ({
    contents: [{ uri: uri.href, text: `Hello, ${name}!` }],
});

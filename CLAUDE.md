# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MCP Server is a modular Node.js backend implementing the Model Context Protocol (MCP). It orchestrates and exposes tools via a JSON-RPC WebSocket API, enabling AI agents (like OpenAI) to invoke business logic, system health checks, database operations, and more.

## Requirements

- Node.js v25+
- npm v11.6.2+
- OpenAI API key (required for client)
- Docker (required for Docker execution tools)
- MySQL database (optional, for database tools)
- SMTP server at localhost:25 (optional, for email tool)

## Development Commands

### Starting the System

```bash
# Install dependencies (from root)
yarn install

# Start MCP server (runs on ws://localhost:8080)
yarn start:server

# Start MCP client (in separate terminal)
yarn start:client
```

### Running Individual Apps

```bash
# Server only
cd apps/server && yarn start

# Client only
cd apps/client && yarn start
```

## Configuration

### Server Configuration

Create `apps/server/.env` (based on `.env.defaults`):
```
SERVER_PORT=8080
```

### Client Configuration

Create `apps/client/.env` (based on `.env.defaults`):
```
MCP_SERVER_URL=ws://localhost:8080
OPEN_AI_API_KEY=sk-proj-xxxxxx
```

## Architecture

### High-Level Flow

```
Client (OpenAI Agent) <--WebSocket/JSON-RPC--> MCP Server <--> Registered Tools
```

1. **Client** (`apps/client/`): Interactive CLI that connects to OpenAI and the MCP server. Queries are processed by OpenAI, which decides which tools to invoke via MCP.

2. **Server** (`apps/server/`): WebSocket server implementing JSON-RPC 2.0 protocol. Exposes tool registry and handles tool invocations.

3. **Tools** (`apps/server/lib/models/Tools.ts`): Pluggable functions registered at startup. Each tool has a name, description, input/output schema, and execution handler.

### Key Components

#### Server Side (`apps/server/`)

- **`app.ts`**: WebSocket server entry point. Listens on configured port and routes messages to controller.

- **`lib/controller/index.ts`**: JSON-RPC controller handling three methods:
  - `initialize`: Protocol handshake, returns server capabilities
  - `tools/list`: Returns all registered tools with schemas
  - `tools/call`: Executes a tool by name with provided arguments

- **`lib/models/Tools.ts`**: Tool registry using `registerTool()` pattern. All tools are stored in a `Map<string, ToolDefinition>`. Each tool returns results in format:
  ```typescript
  { content: [{ type: 'text', text: JSON.stringify(result) }] }
  ```

- **`lib/config.ts`**: Server configuration loaded from `.env` file.

- **`lib/utils/`**: Utility functions for MySQL queries, file operations, health checks, etc.

#### Client Side (`apps/client/`)

- **`app.ts`**: Interactive CLI entry point with readline-style prompt.

- **`lib/models/mcpClient.ts`**: WebSocket client for MCP server. Manages connection, initialization handshake, and JSON-RPC request/response mapping.

- **`lib/models/aiClient.ts`**: OpenAI API wrapper. Sends prompts and tool definitions to GPT-4.1 with function calling.

- **`lib/models/queryProcessor.ts`**: Orchestration layer. Fetches MCP tools, converts them to OpenAI function format, processes user queries, and handles tool call loops.

- **`lib/config.ts`**: Client configuration loaded from `.env` file.

### Protocol Details

This implementation follows **JSON-RPC 2.0** over WebSocket. All messages have:
```json
{
  "jsonrpc": "2.0",
  "id": "unique-id",
  "method": "method/name",
  "params": {}
}
```

Responses:
```json
{
  "jsonrpc": "2.0",
  "id": "matching-request-id",
  "result": {} // or "error": {}
}
```

### Tool Registration Pattern

Tools are registered in `apps/server/lib/models/Tools.ts` using:

```typescript
registerTool(
  'tool_name',
  {
    title: 'Tool Display Name',
    description: 'What the tool does',
    inputSchema: { type: 'object', properties: {...}, required: [...] },
    outputSchema: { type: 'object', properties: {...} }
  },
  async (args) => {
    // Tool implementation
    return {
      content: [{ type: 'text', text: JSON.stringify(result) }]
    };
  }
);
```

## Registered Tools

Current tool inventory (see `apps/server/lib/models/Tools.ts` for full list):

### Basic Tools
- **add**: Basic addition (example tool)
- **dir_query**: List directory structure

### Database Tools
- **db_users**: Query users from MySQL database
- **sql_query**: Execute arbitrary SQL queries

### Documentation Tools
- **api_login_documentation**: Return API login docs
- **api_groups_doc**: Return API groups docs

### Communication Tools
- **send_email**: Send email via SMTP

### Code Execution Tools (Sandboxed)
- **run_js_code**: Execute JavaScript in VM2 sandbox with access to global `numbers` array
- **run_js_test_suite**: Run unit tests in sandbox

### Docker Code Execution Tools
- **run_docker_code**: Execute code in Docker container with specified language (Python, JavaScript, Bash, C, C++, Java, Go, Rust)
- **run_docker_command**: Execute arbitrary shell command in Docker container
- **run_docker_script**: Execute multi-line script with environment variables and custom working directory
- **docker_list_images**: List available Docker images on the system

### File Tools
- **save_html_file**: Write HTML content to `./report.html`

## Adding New Tools

1. Open `apps/server/lib/models/Tools.ts`
2. Add new `registerTool()` call following the pattern above
3. Implement the async handler function
4. Restart the server
5. Tool will automatically appear in `tools/list` and be available to AI clients

## Database Configuration

Database tools (`db_users`, `sql_query`) are currently hardcoded to connect to:
```typescript
{
  host: 'localhost',
  user: 'dr2_prod',
  password: 'dr2_prod',
  database: 'dr2_prod'
}
```

Update these values in `Tools.ts` for your database.

## TypeScript Configuration

- Uses ES modules (`"type": "module"` in package.json)
- Module resolution: `NodeNext`
- Target: ES2022
- Runtime: `tsx` for direct TypeScript execution
- No compilation step required for development

## Project Structure

```
mcp-server/
├── apps/
│   ├── server/           # MCP server implementation
│   │   ├── app.ts        # WebSocket server entry
│   │   └── lib/
│   │       ├── controller/  # JSON-RPC message handling
│   │       ├── models/      # Tool registry
│   │       ├── utils/       # Helper functions
│   │       └── config.ts    # Server config
│   └── client/           # AI client implementation
│       ├── app.ts        # CLI entry point
│       └── lib/
│           ├── models/      # MCP client, AI client, query processor
│           └── config.ts    # Client config
├── package.json          # Workspace root
└── tsconfig.json         # TypeScript config
```

## Common Usage Patterns

When the client is running, example queries:

- `show me a set of available tools` - Lists all registered tools
- `provide me system health check analysis` - Runs health diagnostics
- `provide me system health check and if disk usage is greater than 10% send email to user@example.com` - Conditional tool chaining
- `using api documentation provide me curl requests how I can login and create group entity` - Documentation-based code generation

## WebSocket Connection

Server runs on `ws://localhost:8080` by default. Connection flow:

1. Client connects via WebSocket
2. Client sends `initialize` with protocol version `2024-11-05`
3. Server responds with capabilities
4. Server sends `notifications/initialized` notification
5. Client can now call `tools/list` and `tools/call`

## Error Handling

JSON-RPC errors follow standard codes:
- `-32700`: Parse error / Invalid JSON-RPC
- `-32601`: Method not found / Unknown tool
- `-32000`: Tool execution error

All tool errors are caught and returned as JSON-RPC error responses.

# MCP Server

A production-ready implementation of the **Model Context Protocol (MCP)** - a modular, extensible Node.js backend that orchestrates AI tool interactions via JSON-RPC 2.0 over WebSocket.

## Overview

MCP Server bridges the gap between AI agents (like OpenAI's GPT models) and system-level operations, enabling intelligent automation through a unified protocol. The server exposes a pluggable tool registry that AI agents can discover and invoke dynamically, making it ideal for building autonomous systems, intelligent automation pipelines, and AI-powered operations.

## Key Features

- **Protocol-First Design**: Implements JSON-RPC 2.0 over WebSocket for reliable, bi-directional communication
- **Dynamic Tool Discovery**: AI agents can query available tools at runtime with full schema information
- **Extensible Architecture**: Add new tools by implementing simple async handlers
- **OpenAI Integration**: Ready-to-use client with GPT-4 function calling support
- **Sandboxed Execution**: Safe code execution environments using VM2 and Docker containers
- **System Monitoring**: Built-in health checks for CPU, memory, disk, and network
- **Multi-Language Support**: Execute code in Python, JavaScript, Bash, C, C++, Java, Go, and Rust

## Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   AI Client     │         │   MCP Server    │         │  Tool Registry  │
│  (OpenAI GPT)   │◄───────►│  (WebSocket)    │◄───────►│  (Pluggable)    │
└─────────────────┘         └─────────────────┘         └─────────────────┘
         │                           │                           │
         │    JSON-RPC 2.0           │                           │
         │    over WebSocket         │                           │
         │                           │                           │
         │  1. initialize            │                           │
         │  2. tools/list            │                           │
         │  3. tools/call            │   Execute Tool            │
         │                           │──────────────────────────►│
         │                           │◄──────────────────────────│
         │◄──────────────────────────│         Result            │
```

### Protocol Flow

1. **Initialize**: Client establishes WebSocket connection and performs protocol handshake
2. **Discovery**: Client requests tool list with complete input/output schemas
3. **Execution**: AI agent selects and invokes tools based on user queries
4. **Iteration**: Multi-step tool chains execute until task completion

## Available Tools

### System & Monitoring
- `health_check` - Comprehensive system diagnostics (CPU, memory, disk, network)
- `dir_query` - Directory structure exploration

### Code Execution (Sandboxed)
- `run_js_code` - Execute JavaScript in VM2 sandbox
- `run_js_test_suite` - Run unit tests in isolated environment
- `run_docker_code` - Multi-language execution (Python, JS, C, C++, Java, Go, Rust)
- `run_docker_command` - Arbitrary command execution in containers
- `run_docker_script` - Multi-line scripts with environment variables
- `docker_list_images` - Docker image inventory

### Database Operations
- `db_users` - Query user data from MySQL
- `sql_query` - Execute arbitrary SQL queries

### Communication
- `send_email` - SMTP email delivery

### Documentation
- `api_login_documentation` - API authentication docs
- `api_groups_doc` - API groups management docs

### File Operations
- `save_html_file` - Write HTML content to filesystem

## Quick Start

### Prerequisites

- Node.js v25+
- npm v11.6.2+
- OpenAI API key ([get one here](https://platform.openai.com/account/api-keys))
- Docker (for containerized execution tools)

### Installation

```bash
# Clone the repository
git clone https://github.com/yzhbankov/mcp-server.git
cd mcp-server

# Install dependencies
yarn install
```

### Configuration

#### Server Configuration

Create `apps/server/.env`:
```env
SERVER_PORT=8080
```

#### Client Configuration

Create `apps/client/.env`:
```env
MCP_SERVER_URL=ws://localhost:8080
OPEN_AI_API_KEY=your_openai_api_key_here
```

### Running the Server

```bash
# Start MCP Server (in one terminal)
yarn start:server

# Start AI Client (in another terminal)
yarn start:client
```

## Usage Examples

Once the client is running, try these queries:

```bash
# Discover available tools
show me a set of available tools

# System health analysis
provide me system health check analysis

# Conditional automation
provide me system health check and if disk usage is greater than 10% send email to admin@example.com

# AI-powered code generation
using api documentation provide me curl requests how I can login and create group entity

# Execute Python code
run this python code: print([x**2 for x in range(10)])

# Multi-step automation
analyze system health, save results to HTML, and email the report to ops@example.com
```

## Extending the Server

### Adding a New Tool

Tools are registered in `apps/server/lib/models/Tools.ts`:

```typescript
registerTool(
  'my_custom_tool',
  {
    title: 'My Custom Tool',
    description: 'Performs a specific operation',
    inputSchema: {
      type: 'object',
      properties: {
        input: { type: 'string', description: 'Input parameter' }
      },
      required: ['input']
    },
    outputSchema: {
      type: 'object',
      properties: {
        result: { type: 'string' }
      }
    }
  },
  async (args) => {
    // Your implementation here
    const result = await performOperation(args.input);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ result })
      }]
    };
  }
);
```

The tool automatically becomes available to all connected AI clients.

## Project Structure

```
mcp-server/
├── apps/
│   ├── server/                 # MCP Server implementation
│   │   ├── app.ts              # WebSocket server entry point
│   │   └── lib/
│   │       ├── controller/     # JSON-RPC message routing
│   │       ├── models/         # Tool registry and definitions
│   │       ├── utils/          # Helper functions
│   │       └── config.ts       # Server configuration
│   └── client/                 # AI Client implementation
│       ├── app.ts              # Interactive CLI
│       └── lib/
│           ├── models/         # MCP client, AI integration
│           └── config.ts       # Client configuration
├── CLAUDE.md                   # Development guidelines
├── LICENSE                     # MIT License
└── README.md                   # This file
```

## Technology Stack

- **Runtime**: Node.js v25+ with ES modules
- **Language**: TypeScript (ES2022 target)
- **Protocol**: JSON-RPC 2.0 over WebSocket
- **WebSocket**: `ws` library
- **AI Integration**: OpenAI GPT-4 with function calling
- **Sandboxing**: VM2, Docker containers
- **Database**: MySQL (optional)
- **Build Tool**: tsx (no compilation required)

## Security Considerations

- API keys should be stored in `.env` files (never commit these!)
- Database credentials should be externalized to environment variables
- Code execution tools run in sandboxed environments
- Docker containers provide additional isolation for untrusted code
- All tool invocations are logged for audit purposes

## Development

```bash
# Run server in development
cd apps/server && yarn start

# Run client in development
cd apps/client && yarn start

# Both servers support hot-reload via tsx
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Dr. Zhbankov Yaroslav**

- GitHub: [@yzhbankov](https://github.com/yzhbankov)
- Repository: [mcp-server](https://github.com/yzhbankov/mcp-server)

## Acknowledgments

- Built on the Model Context Protocol specification
- Inspired by the need for standardized AI-to-system communication
- Designed for extensibility and real-world production use

---

**Note**: This is a reference implementation showcasing MCP protocol capabilities. Customize tool implementations according to your security and operational requirements.

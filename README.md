# Mcp-Server

## Overview
MCP Server is a modular, extensible Node.js backend designed to orchestrate and expose a set of tools and resources via a unified API. It supports integration with AI services (like OpenAI), custom business logic, and system health monitoring, making it suitable for automation, analytics, and system management tasks.

## Solution Architecture

### High-Level Diagram

```
+-------------------+         +-------------------+         +-------------------+
|   MCP Client(s)   | <-----> |   MCP Server      | <-----> |   Tools/Resources |
+-------------------+         +-------------------+         +-------------------+
        |                          |                                 |
        |  JSON-RPC/REST/WebSocket |                                 |
        |------------------------->|                                 |
        |                          |  Tool/Resource Registration     |
        |                          |-------------------------------> |
        |                          |                                 |
        |                          |  Tool/Resource Invocation       |
        |                          |<-------------------------------|
        |                          |                                 |
        |  Results/Events          |                                 |
        |<-------------------------|                                 |
```

- **MCP Client(s):** CLI, web, or programmatic clients that interact with the MCP Server using JSON-RPC, REST, or WebSocket protocols.
- **MCP Server:** The core orchestrator. Registers tools/resources, exposes APIs, handles authentication, and manages requests/responses.
- **Tools/Resources:** Pluggable modules providing business logic, system health checks, AI integrations, database access, etc.

### Key Components
- **Tool Registration:** Tools (functions, scripts, or modules) are registered with the server at startup. Each tool exposes a name, description, input/output schema, and handler function.
- **Resource Registration:** Resources (e.g., REST endpoints, static files, or data sources) can be registered and exposed via the server.
- **API Layer:** Supports JSON-RPC (primary), REST, and optionally WebSocket for real-time events.
- **AI Integration:** Connects to OpenAI or other LLM providers using API keys for advanced processing.
- **Health Checks:** Built-in tools for system diagnostics (CPU, memory, disk, etc.).
- **Extensibility:** New tools/resources can be added by implementing and registering them in the server codebase.

## Requirements
- Node.js v25
- OpenAI account and API key from https://platform.openai.com/account/api-keys

## Setup & Running
1. **Configure API Keys:**
   - Create `apps/ws-client/.env` and add your `OPEN_AI_API_KEY` value.

2. **Start MCP Server:**
   - `yarn start:server`

3. **Start MCP Client:**
   - `yarn start:client`

4. **Interact with the System:**
   - Use the client to send prompts or tool requests. Example prompts:
     - `show me a set of available tools`
     - `provide me system health check analysis`
     - `provide me system health check and if disk usage is greater than 10% send email to yzhbankov@gmail.com`
     - `using api documentation provide me curl requests how I can login and create group entity`

## Extending MCP Server
- Add new tools by implementing their logic and registering them in the server startup code.
- Add new resources (REST endpoints, static files, etc.) as needed.
- Integrate with additional AI providers or databases by adding new modules and registering them as tools/resources.

## Troubleshooting
- Ensure all required environment variables are set (especially API keys).
- Check server logs for errors during startup or request handling.
- Use `curl` or the provided client to test tool invocation and API endpoints.

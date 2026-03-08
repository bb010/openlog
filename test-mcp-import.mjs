import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

console.log('McpServer:', typeof McpServer);
console.log('StdioServerTransport:', typeof StdioServerTransport);

const server = new McpServer({ name: 'test', version: '1.0.0' });
console.log('server created:', typeof server);
console.log('registerTool:', typeof server.registerTool);
console.log('OK');

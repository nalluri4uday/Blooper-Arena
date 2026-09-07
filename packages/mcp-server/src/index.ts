#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const BLOOPER_ARENA_URL =
  process.env.BLOOPER_ARENA_URL ?? 'https://blooperarena.com';

const server = new McpServer({
  name: 'blooper-arena',
  version: '0.1.0',
});

// ---------------------------------------------------------------------------
// Helper: call the Blooper Arena REST API
// ---------------------------------------------------------------------------
async function apiCall(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  options?: { body?: unknown; headers?: Record<string, string> },
): Promise<unknown> {
  const url = `${BLOOPER_ARENA_URL}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  const res = await fetch(url, {
    method,
    headers,
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${method} ${path} failed (${res.status}): ${text}`);
  }

  return res.json();
}

// ---------------------------------------------------------------------------
// Tool 1: register
// ---------------------------------------------------------------------------
server.tool(
  'register',
  'Register a new AI agent on Blooper Arena. Returns an API key for trading.',
  {
    name: z.string().describe('Agent name'),
    description: z.string().optional().describe('Agent description'),
    strategy: z
      .string()
      .optional()
      .describe('Trading strategy description'),
  },
  async ({ name, description, strategy }) => {
    try {
      const data = await apiCall('POST', '/api/agents/register', {
        body: { name, description, strategy },
      });
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: 'text' as const, text: `Error: ${message}` }],
        isError: true,
      };
    }
  },
);

// ---------------------------------------------------------------------------
// Tool 2: get_market_prices
// ---------------------------------------------------------------------------
server.tool(
  'get_market_prices',
  'Get current stock prices. Filter by market: IN (India NSE), US (NYSE/NASDAQ), or all.',
  {
    market: z
      .enum(['IN', 'US', 'all'])
      .optional()
      .default('all')
      .describe('Market filter: IN, US, or all'),
  },
  async ({ market }) => {
    try {
      const data = await apiCall('GET', `/api/market/prices?market=${market}`);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: 'text' as const, text: `Error: ${message}` }],
        isError: true,
      };
    }
  },
);

// ---------------------------------------------------------------------------
// Tool 3: get_stock
// ---------------------------------------------------------------------------
server.tool(
  'get_stock',
  'Get detailed info and recent price history for a specific stock.',
  {
    symbol: z.string().describe('Stock ticker symbol'),
  },
  async ({ symbol }) => {
    try {
      const data = await apiCall('GET', `/api/market/prices/${encodeURIComponent(symbol)}`);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: 'text' as const, text: `Error: ${message}` }],
        isError: true,
      };
    }
  },
);

// ---------------------------------------------------------------------------
// Tool 4: trade
// ---------------------------------------------------------------------------
server.tool(
  'trade',
  'Place a buy or sell trade. Requires your API key.',
  {
    apiKey: z.string().describe('Your agent API key'),
    symbol: z.string().describe('Stock ticker symbol'),
    side: z.enum(['buy', 'sell']).describe('Trade side: buy or sell'),
    quantity: z.number().int().positive().describe('Number of shares'),
  },
  async ({ apiKey, symbol, side, quantity }) => {
    try {
      const data = await apiCall('POST', '/api/agents/trade', {
        body: { symbol, side, quantity },
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: 'text' as const, text: `Error: ${message}` }],
        isError: true,
      };
    }
  },
);

// ---------------------------------------------------------------------------
// Tool 5: get_portfolio
// ---------------------------------------------------------------------------
server.tool(
  'get_portfolio',
  'View your agent\'s portfolio, holdings, and P&L. Requires your API key.',
  {
    apiKey: z.string().describe('Your agent API key'),
  },
  async ({ apiKey }) => {
    try {
      const data = await apiCall('GET', '/api/agents/portfolio', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: 'text' as const, text: `Error: ${message}` }],
        isError: true,
      };
    }
  },
);

// ---------------------------------------------------------------------------
// Tool 6: get_leaderboard
// ---------------------------------------------------------------------------
server.tool(
  'get_leaderboard',
  'View the top-ranked agents by portfolio value.',
  {
    limit: z
      .number()
      .int()
      .positive()
      .optional()
      .default(20)
      .describe('Number of agents to return'),
  },
  async ({ limit }) => {
    try {
      const data = await apiCall('GET', `/api/leaderboard?limit=${limit}`);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: 'text' as const, text: `Error: ${message}` }],
        isError: true,
      };
    }
  },
);

// ---------------------------------------------------------------------------
// Tool 7: get_market_status
// ---------------------------------------------------------------------------
server.tool(
  'get_market_status',
  'Check if Indian and US stock markets are currently open.',
  {},
  async () => {
    try {
      const data = await apiCall('GET', '/api/market/status');
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: 'text' as const, text: `Error: ${message}` }],
        isError: true,
      };
    }
  },
);

// ---------------------------------------------------------------------------
// Start the server
// ---------------------------------------------------------------------------
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Blooper Arena MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

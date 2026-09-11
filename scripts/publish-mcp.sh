#!/bin/bash
# Publish @blooper-arena/mcp-server to npm
# Prerequisites: npm login (run `npm login` first if not authenticated)

set -e

cd "$(dirname "$0")/../packages/mcp-server"

echo "Building MCP server..."
pnpm build

echo "Publishing to npm..."
npm publish --access public

echo "Done! Users can now run: npx @blooper-arena/mcp-server"

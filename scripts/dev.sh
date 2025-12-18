#!/bin/bash
# One-command development setup

echo "🚀 Starting HUMMBL development environment..."

# Start all services in parallel
pnpm --filter @hummbl/workers dev &
pnpm --filter @hummbl/web dev &
pnpm --filter @hummbl/mcp-server dev &

echo "✅ All services started:"
echo "   - Workers API: http://localhost:8787"
echo "   - Web App: http://localhost:5173" 
echo "   - MCP Server: stdio mode"

wait
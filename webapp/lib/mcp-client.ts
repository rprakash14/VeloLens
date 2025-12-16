import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

let mcpClient: Client | null = null;
let mcpTransport: StdioClientTransport | null = null;

export async function getMCPClient(): Promise<Client> {
  if (mcpClient && mcpTransport) {
    return mcpClient;
  }

  // Path to the built Strava MCP server
  const serverPath = process.env.STRAVA_MCP_SERVER_PATH ||
    "/home/rishabhprakash/vibecoding/VeloLens/strava-mcp/dist/server.js";

  mcpTransport = new StdioClientTransport({
    command: "node",
    args: [serverPath],
    env: {
      ...process.env,
      STRAVA_CLIENT_ID: process.env.STRAVA_CLIENT_ID!,
      STRAVA_CLIENT_SECRET: process.env.STRAVA_CLIENT_SECRET!,
      STRAVA_ACCESS_TOKEN: process.env.STRAVA_ACCESS_TOKEN!,
      STRAVA_REFRESH_TOKEN: process.env.STRAVA_REFRESH_TOKEN!,
    },
  });

  mcpClient = new Client(
    {
      name: "velolens-client",
      version: "1.0.0",
    },
    {
      capabilities: {},
    }
  );

  await mcpClient.connect(mcpTransport);

  return mcpClient;
}

export async function closeMCPClient() {
  if (mcpClient && mcpTransport) {
    await mcpClient.close();
    mcpClient = null;
    mcpTransport = null;
  }
}

export async function getMCPTools() {
  const client = await getMCPClient();
  const toolsResponse = await client.listTools();
  return toolsResponse.tools;
}

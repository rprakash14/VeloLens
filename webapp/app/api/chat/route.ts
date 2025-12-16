import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getMCPClient, getMCPTools } from "@/lib/mcp-client";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid messages format" },
        { status: 400 }
      );
    }

    // Get MCP tools
    const mcpClient = await getMCPClient();
    const mcpTools = await getMCPTools();

    // Convert MCP tools to Claude format
    const claudeTools = mcpTools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.inputSchema,
    }));

    // Call Claude API with tools
    let response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 4096,
      messages: messages,
      tools: claudeTools,
    });

    // Handle tool calls in a loop
    while (response.stop_reason === "tool_use") {
      const toolUseBlocks = response.content.filter(
        (block) => block.type === "tool_use"
      );

      const toolResults = await Promise.all(
        toolUseBlocks.map(async (toolUse: any) => {
          try {
            // Call the MCP tool
            const result = await mcpClient.callTool({
              name: toolUse.name,
              arguments: toolUse.input,
            });

            return {
              type: "tool_result",
              tool_use_id: toolUse.id,
              content: JSON.stringify(result.content),
            };
          } catch (error: any) {
            return {
              type: "tool_result",
              tool_use_id: toolUse.id,
              content: JSON.stringify({
                error: error.message || "Tool execution failed",
              }),
              is_error: true,
            };
          }
        })
      );

      // Continue the conversation with tool results
      messages.push({
        role: "assistant",
        content: response.content,
      });

      messages.push({
        role: "user",
        content: toolResults,
      });

      response = await anthropic.messages.create({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 4096,
        messages: messages,
        tools: claudeTools,
      });
    }

    return NextResponse.json({
      content: response.content,
      stop_reason: response.stop_reason,
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

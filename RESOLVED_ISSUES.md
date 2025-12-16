# Resolved Issues - VeloLens

## Issue #1: Dashboard API Routes Failing to Parse MCP Tool Responses

**Date Resolved:** 2025-12-16

**Severity:** High - Dashboard displayed empty data

### Problem Description

The dashboard API routes were unable to parse responses from Strava MCP tools, resulting in:
- Empty activity feed (0 activities shown)
- Missing summary statistics
- Failed performance metrics loading
- JSON parsing errors in console

**Root Cause:**

The MCP (Model Context Protocol) tools return human-readable, formatted markdown text designed for chat interfaces, not structured JSON data. For example:

```
🏃 Colden still mogs (ID: 16753426662) — 37175.6m on 12/15/2025
```

The dashboard API routes were attempting to parse this formatted text as JSON, which failed with errors like:
- `SyntaxError: Unexpected token � in JSON at position 0`
- `SyntaxError: Unexpected token * in JSON at position 0`

### Affected Files

**Before Fix (Broken):**
- `webapp/app/api/dashboard/activities/route.ts` - Used `getMCPClient().callTool("get-recent-activities")`
- `webapp/app/api/dashboard/stats/route.ts` - Used `getMCPClient().callTool("get-athlete-stats")`
- `webapp/app/api/dashboard/performance/route.ts` - Used `getMCPClient().callTool("get-athlete-zones")`
- `webapp/app/api/dashboard/trends/route.ts` - Used `getMCPClient().callTool("get-all-activities")`

### Solution

Bypassed MCP tools entirely for dashboard data fetching. Instead, directly called the Strava REST API using axios with the access token from environment variables.

**Changes Made:**

1. **Installed axios dependency:**
   ```bash
   npm install axios
   ```

2. **Rewrote all dashboard API routes** to use direct Strava API calls:

   ```typescript
   // Before (broken):
   const result = await mcpClient.callTool({
     name: "get-recent-activities",
     arguments: { perPage: 30 },
   });
   const text = result.content[0]?.text || "[]";
   const activities = JSON.parse(text); // ❌ Fails - text is markdown, not JSON

   // After (fixed):
   const response = await axios.get(
     "https://www.strava.com/api/v3/athlete/activities",
     {
       headers: { Authorization: `Bearer ${process.env.STRAVA_ACCESS_TOKEN}` },
       params: { per_page: 30, page: 1 },
     }
   );
   const activities = response.data; // ✅ Works - direct JSON response
   ```

3. **Updated imports** in all dashboard API routes:
   - Removed: `import { getMCPClient } from "@/lib/mcp-client";`
   - Added: `import axios from "axios";`

### Verification

After the fix:
```bash
$ curl http://localhost:3000/api/dashboard/activities?days=7
{"activities":[...]} # ✅ Returns 6 activities including cycling and running
```

### Key Learnings

1. **MCP Tools vs. Direct API:**
   - **MCP Tools:** Best for chat interfaces where human-readable text is needed
   - **Direct API Calls:** Required for structured data in dashboard/UI components

2. **When to use MCP:**
   - Chat interface: ✅ Use MCP tools (formatted responses work well with Claude)
   - Dashboard APIs: ❌ Don't use MCP (need structured JSON data)

3. **Environment Variables Required:**
   - `STRAVA_ACCESS_TOKEN` - Must be set in `.env.local` for direct API calls
   - MCP server handles its own token management for chat

### Related Files Modified

- `webapp/app/api/dashboard/activities/route.ts` - Complete rewrite (56 lines → 52 lines)
- `webapp/app/api/dashboard/stats/route.ts` - Complete rewrite (49 lines → 50 lines)
- `webapp/app/api/dashboard/performance/route.ts` - Complete rewrite (94 lines → 90 lines)
- `webapp/app/api/dashboard/trends/route.ts` - Partial rewrite (API call section)
- `webapp/package.json` - Added `axios` dependency

### Testing Checklist

- [x] Activities endpoint returns all activity types (running, cycling, virtual rides)
- [x] Activity from 12/15 (cycling) now appears in dashboard
- [x] Summary stats load correctly
- [x] Performance metrics display HR/Power zones
- [x] Trend charts render with accurate data
- [x] No JSON parsing errors in console
- [x] Chat interface still works correctly (uses MCP tools)

### Future Considerations

- Consider creating a shared Strava API client utility (`lib/strava-api.ts`) to centralize:
  - Token management
  - Request error handling
  - Rate limit handling
  - Type definitions for Strava API responses

---

**Issue Reporter:** System
**Resolved By:** Claude Code
**Git Commit:** (To be added when pushed)

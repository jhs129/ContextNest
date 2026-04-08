# @promptowl/contextnest-mcp-server

MCP server for [Context Nest](https://github.com/PromptOwl/ContextNest) — gives AI agents direct access to your context vault via the [Model Context Protocol](https://modelcontextprotocol.io). Supports all node types including documents, source nodes, and skill nodes.

## Install

```bash
npm install -g @promptowl/contextnest-mcp-server
```

## Usage

### With Claude Desktop

Add to your Claude Desktop config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "contextnest": {
      "command": "contextnest-mcp",
      "args": ["/path/to/your/vault"]
    }
  }
}
```

### With Claude Code

```bash
claude mcp add contextnest -- contextnest-mcp /path/to/your/vault
```

### With Gemini CLI

```bash
gemini mcp add contextnest -- contextnest-mcp /path/to/your/vault
```

### Standalone

```bash
contextnest-mcp /path/to/your/vault
```

Or via environment variable:

```bash
CONTEXTNEST_VAULT_PATH=/path/to/vault contextnest-mcp
```

## Tools

| Tool | Description |
|------|-------------|
| `vault_info` | Get vault identity and configuration summary |
| `resolve` | Execute a selector query with graph traversal |
| `read_document` | Read a single document by URI or path |
| `list_documents` | List documents with optional type/status/tag filters |
| `search` | Full-text search with graph traversal |
| `read_pack` | Resolve and return a context pack |
| `document_format` | Get the document format spec (call before creating docs) |
| `create_document` | Create a new document (supports all types including skill nodes) |
| `update_document` | Update an existing document |
| `delete_document` | Delete a document and its version history |
| `publish_document` | Publish a document (bump version, checkpoint) |
| `read_index` | Return the context.yaml graph index |
| `read_version` | Reconstruct a specific version of a document |
| `verify_integrity` | Verify all hash chains in the vault |
| `list_checkpoints` | List recent checkpoints |

### Graph Traversal

The `resolve`, `search`, and `read_pack` tools support graph-aware queries:

- **`hops`** (number, default: 2) — Controls traversal depth from matched documents. More hops = more context loaded, slower. Fewer hops = faster, less context.
- **`full`** (boolean, default: false) — Bypass graph traversal and load all documents (legacy mode).

### Skill Nodes

Agents can discover and use skill nodes — governed procedures with triggers, inputs, and guard rails:

```
resolve({ selector: "type:skill + #engineering" })  → all engineering skills
list_documents({ type: "skill" })                    → all skill nodes
create_document({ type: "skill", trigger: "..." })   → create a new skill
```

## Exposing PromptOwl nests to Claude / Cursor

This MCP server is designed to serve a local vault to any MCP
client (Claude Desktop, Cursor, or anything else speaking the
Model Context Protocol).

If you want an AI agent to query a **remote** nest published on
the [PromptOwl](https://promptowl.ai) marketplace, the connection
looks like this:

```
MCP client (Claude/Cursor) ──► this MCP server
                                      │
                                      ▼
                              PromptOwl /query endpoint
                              Authorization: Bearer cnst_*
                              ▼
                              Metered, approved-only content
```

**Setup**:

1. Buy access to the nest in PromptOwl → receive a consumer API
   key (`cnst_*`, shown once)
2. Export `PROMPTOWL_CONSUMER_KEY` and `PROMPTOWL_NEST_ID` in the
   MCP client's environment
3. The server uses those to call
   `POST https://promptowl.ai/api/marketplace/nests/{nestId}/query`
   under the hood

**Billing**: every query the LLM runs through the MCP tool is
metered per output token. When the prepaid credit balance runs
out, the endpoint returns 402 and subsequent calls fail until
credits are topped up.

**Security**: the consumer key is read-only and bound to exactly
one nest. A compromised key can't touch other nests, write
anything, or escape to raw files.

> **Coming soon**: a first-class `promptowl_marketplace` MCP tool
> that handles the auth + metering + response shaping
> automatically. Until then, the current server only exposes a
> local vault; to wire up a remote PromptOwl nest today, script
> against the endpoint directly.

Full HTTP reference:
[`NEST_API.md`](https://github.com/PromptOwl/TheOwl/blob/development/docs/NEST_API.md).

## Links

- [Context Nest repo](https://github.com/PromptOwl/ContextNest)
- [Specification](https://github.com/PromptOwl/context-nest-spec)
- [PromptOwl](https://promptowl.ai)
- [Discord](https://discord.gg/fxcSQ5gq)

## License

AGPL-3.0

# Context Nest

**by [PromptOwl](https://promptowl.ai)** | [Website](https://promptowl.ai) | [Whitepaper](https://promptowl.ai/resources/contextnest-whitepaper/) | [Specification](https://github.com/PromptOwl/ContextNest-spec)

Structured, versioned, and verifiable context for AI agents. Context Nest is an open standard for organizing knowledge as governed markdown documents — with hash-chained versioning, a deterministic query language, integrity verification, and full audit trails.

Context governance — not model capability — is the binding constraint on enterprise AI quality. Context Nest solves this by giving AI agents trustworthy, accountable, and auditable knowledge.

## Quick Start

```bash
# Install the CLI
npm install -g @promptowl/contextnest-cli

# Initialize with a starter recipe
ctx init --starter developer
```

### Starter Recipes

Get up and running with a role-specific vault in seconds:

```bash
ctx init --starter developer    # Engineering: architecture, API docs, dev setup
ctx init --starter executive    # Leadership: strategy, market analysis, decisions
ctx init --starter analyst      # Research/OSINT: case files, sources, methodology
ctx init --starter team         # Teams: handbook, onboarding, runbooks
```

See all options: `ctx init --list-starters`

## Why Context Nest?

RAG solved retrieval. Context Nest solves **governance**.

| | RAG | Context Nest |
|---|---|---|
| Versioning | None | Hash-chained, tamper-evident |
| Querying | Probabilistic (embeddings) | Deterministic (selector grammar) |
| Integrity | None | SHA-256 hash chains + checkpoints |
| Audit trails | None | Full injection tracing |
| Structure | Flat chunks | Typed documents with relationships |
| Live data | Static snapshots | Source nodes with MCP/REST/CLI hydration |

Read the full case in the [whitepaper](https://promptowl.ai/resources/contextnest-whitepaper/).

## Packages

| Package | Description | License |
|---|---|---|
| [`@promptowl/contextnest-cli`](https://www.npmjs.com/package/@promptowl/contextnest-cli) | Command-line tool (`ctx`) | AGPL-3.0 |
| [`@promptowl/contextnest-engine`](https://www.npmjs.com/package/@promptowl/contextnest-engine) | Core library — parsing, storage, versioning, integrity | AGPL-3.0 |
| [`@promptowl/contextnest-mcp-server`](https://www.npmjs.com/package/@promptowl/contextnest-mcp-server) | MCP server for AI agent access | AGPL-3.0 |

## Prerequisites

- **Node.js** >= 20.0.0
- **pnpm** >= 9.0.0 (for development from source)

## Installation from Source

```bash
git clone https://github.com/PromptOwl/ContextNest.git
cd context-nest
pnpm install
pnpm build
```

Optionally link the CLI globally:

```bash
cd packages/cli && pnpm link --global
```

## Project Structure

```
context-nest/
├── packages/
│   ├── engine/        # Core library — parsing, storage, versioning, integrity
│   ├── cli/           # Command-line tool (ctx)
│   └── mcp-server/    # MCP server for AI agent access
├── fixtures/
│   └── minimal-vault/ # Example vault for reference and testing
└── CONTEXT_NEST_SPEC.md   # Full specification
```

---

## Setting Up a Vault

### 1. Initialize

```bash
ctx init --starter developer --name "My Project"
```

This creates a **structured** vault with starter documents:

```
my-vault/
├── CONTEXT.md              # Vault identity & AI operating instructions
├── .context/
│   └── config.yaml         # Vault configuration
├── nodes/                  # Documents, snippets, glossaries, etc.
│   ├── architecture-overview.md
│   ├── api-reference.md
│   └── development-setup.md
├── sources/                # Source nodes (live data connectors)
├── packs/                  # Context packs (saved queries)
│   └── engineering-essentials.yml
└── context.yaml            # Auto-generated document graph
```

Use `--layout obsidian` for a flat Obsidian-compatible layout.

### 2. Configure

Edit `.context/config.yaml` to register MCP servers and set defaults:

```yaml
version: 1
name: "My Project"
description: "Project knowledge base for AI agents"
defaults:
  status: draft
folders:
  nodes:
    description: "Project documents"
  sources:
    description: "Live data sources"
servers:
  jira:
    url: "https://mcp.atlassian.com/sse"
    transport: mcp
    description: "Jira project tracking"
  github:
    url: "https://mcp.github.com/sse"
    transport: mcp
    description: "GitHub repository data"
```

### 3. Edit CONTEXT.md

`CONTEXT.md` is the vault's identity file — it tells AI agents what this vault is and how to use it:

```markdown
---
title: "My Project"
---

# My Project

Knowledge base for the Acme platform.

## Operating Instructions

- Always cite sources by document path
- Prefer published documents over drafts
- Check source nodes for live data before using cached info
```

### 4. Add documents

```bash
ctx add nodes/api-design --title "API Design Guidelines" --tags "engineering,api"
```

This creates `nodes/api-design.md` with a frontmatter template:

```markdown
---
title: "API Design Guidelines"
type: document
tags:
  - "#engineering"
  - "#api"
status: draft
version: 1
---

# API Design Guidelines

All endpoints use REST conventions. See
[Architecture Overview](contextnest://nodes/architecture-overview) for context.
```

### 5. Add source nodes

Source nodes connect to live data via MCP servers or other transports:

```markdown
---
title: "Current Sprint Tickets"
type: source
tags:
  - "#engineering"
  - "#sprint"
status: published
version: 1
source:
  transport: mcp
  server: jira
  tools:
    - jira_get_active_sprint
    - jira_get_sprint_issues
  cache_ttl: 300
---

# Current Sprint Tickets

Call `jira_get_active_sprint` to get the current sprint,
then `jira_get_sprint_issues` to list all tickets.
```

### 6. Add context packs

Packs are saved queries in `packs/` as YAML files:

```yaml
# packs/onboarding-basics.yml
id: onboarding.basics
label: "Onboarding Basics"
description: "Essential materials for new team members"
query: "#onboarding + type:document"
includes:
  - "contextnest://nodes/architecture-overview"
audiences:
  - internal
  - agent
agent_instructions: |
  Present these documents in order.
  Start with the architecture overview.
```

---

## CLI Reference

Set the vault path (defaults to current directory):

```bash
export CONTEXTNEST_VAULT_PATH=/path/to/your/vault
```

### Document Management

| Command | Description |
|---|---|
| `ctx init` | Initialize a new vault (supports `--starter` recipes) |
| `ctx add <path>` | Create a new document (auto-publishes and regenerates index) |
| `ctx update <path>` | Update a document's title, tags, or body (auto-publishes) |
| `ctx delete <path>` | Delete a document and its version history |
| `ctx validate [path]` | Validate documents against the spec |
| `ctx publish <path>` | Publish a document (creates version + checkpoint) |

### Querying & Injection

| Command | Description |
|---|---|
| `ctx list` | List all documents (filter with `--type`, `--status`, `--tag`) |
| `ctx search <query>` | Full-text search across vault documents |
| `ctx resolve <selector>` | Execute a selector query |
| `ctx inject <selector>` | Resolve context for AI agent consumption |
| `ctx inject @org/pack` | Inject from a cloud-hosted pack via [PromptOwl](https://promptowl.ai) |

### Selectors

```bash
ctx inject "tag:#engineering"              # All docs with a tag
ctx inject "type:document"                 # All docs of a type
ctx inject "path:nodes/api-*"             # Glob match
ctx inject "pack:engineering-essentials"   # All docs in a pack
ctx inject "status:published"             # By status
ctx inject "tag:#api + tag:#v2"           # Union
ctx inject "tag:#api & status:published"  # Intersection
```

### Versioning & Integrity

| Command | Description |
|---|---|
| `ctx history <path>` | Show version history |
| `ctx reconstruct <path> <version>` | Reconstruct a specific version |
| `ctx verify` | Verify integrity of all hash chains |

### Packs, Checkpoints & Index

| Command | Description |
|---|---|
| `ctx index` | Regenerate context.yaml and INDEX.md files |
| `ctx pack list` | List all context packs |
| `ctx pack show <id>` | Show pack details |
| `ctx checkpoint list` | List checkpoints |
| `ctx checkpoint rebuild` | Rebuild checkpoint history |

---

## MCP Server

The MCP server exposes vault operations as tools for AI agents over stdio transport.

### Running the server

```bash
node packages/mcp-server/dist/index.js /path/to/your/vault
```

### Configuring with Claude Code

Add to your project's `.mcp.json`:

```json
{
  "mcpServers": {
    "contextnest": {
      "command": "node",
      "args": ["/absolute/path/to/packages/mcp-server/dist/index.js"],
      "env": {
        "CONTEXTNEST_VAULT_PATH": "/path/to/your/vault"
      }
    }
  }
}
```

### Configuring with Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "contextnest": {
      "command": "node",
      "args": ["/absolute/path/to/packages/mcp-server/dist/index.js"],
      "env": {
        "CONTEXTNEST_VAULT_PATH": "/path/to/your/vault"
      }
    }
  }
}
```

### Available MCP Tools

**Read tools:**

| Tool | Description |
|---|---|
| `vault_info` | Get vault identity and configuration summary |
| `resolve` | Execute a selector query |
| `read_document` | Read a document by URI or path |
| `list_documents` | List documents with optional type/status/tag filters |
| `read_index` | Return the context.yaml index |
| `read_pack` | Resolve and return a context pack with documents |
| `search` | Full-text search across vault documents |
| `verify_integrity` | Verify all hash chains |
| `list_checkpoints` | List recent checkpoints |
| `read_version` | Read a specific version of a document |

**Mutation tools** (all auto-publish and regenerate the index):

| Tool | Description |
|---|---|
| `create_document` | Create a new document with frontmatter and optional body |
| `update_document` | Update a document's title, tags, status, or body |
| `delete_document` | Delete a document and its version history |
| `publish_document` | Explicitly publish a document (bump version, create checkpoint) |

---

## Development

```bash
pnpm build          # Build all packages
pnpm test           # Run tests
pnpm test:watch     # Run tests in watch mode
pnpm lint           # Type-check without emitting
pnpm clean          # Clean all build artifacts
```

## Typical Workflow

```
ctx init --starter developer       # 1. Create a vault with starter recipe
                                   # 2. Edit CONTEXT.md and config.yaml
ctx add nodes/my-doc               # 3. Add documents (auto-publishes & indexes)
ctx update nodes/my-doc --title X  # 4. Update as needed (auto-publishes & indexes)
ctx validate                       # 5. Validate
ctx verify                         # 6. Verify integrity
                                   # 7. Start MCP server for AI access
```

## License

All packages are licensed under **AGPL-3.0**:

- **CLI** ([`@promptowl/contextnest-cli`](https://www.npmjs.com/package/@promptowl/contextnest-cli)): **AGPL-3.0**
- **Engine** ([`@promptowl/contextnest-engine`](https://www.npmjs.com/package/@promptowl/contextnest-engine)): **AGPL-3.0**
- **MCP Server** ([`@promptowl/contextnest-mcp-server`](https://www.npmjs.com/package/@promptowl/contextnest-mcp-server)): **AGPL-3.0**
- **Specification** ([CONTEXT_NEST_SPEC.md](CONTEXT_NEST_SPEC.md)): **Apache-2.0** — open standard

AGPL-3.0 ensures all improvements stay open source. You are free to use, modify, and distribute Context Nest, but modifications to the source must be shared under the same license. Commercial licensing is available from [PromptOwl](https://promptowl.com) for organizations that need to embed or redistribute without AGPL obligations.

---

**[PromptOwl](https://promptowl.ai)** — Context governance for AI agents

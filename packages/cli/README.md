# @promptowl/contextnest-cli

**by [PromptOwl](https://promptowl.ai)** | [Website](https://promptowl.ai) | [Whitepaper](https://promptowl.ai/resources/contextnest-whitepaper/) | [Specification](https://github.com/PromptOwl/context-nest-spec)

Command-line tool for [Context Nest](https://github.com/PromptOwl/context-nest) — structured, versioned context vaults for AI agents.

## Install

```bash
npm install -g @promptowl/contextnest-cli
```

## Quick Start

```bash
# Initialize a vault with a starter recipe
ctx init --starter developer

# See all available starters
ctx init --list-starters

# Or initialize an empty vault and build it yourself
ctx init --name "My Vault"
```

### Available Starters

| Recipe | For | What You Get |
|--------|-----|-------------|
| `developer` | Engineering teams | Architecture, API reference, dev setup |
| `executive` | Leadership | Strategic vision, market landscape, decision log |
| `analyst` | Research / OSINT | Case files, source registry, methodology |
| `team` | General teams | Handbook, onboarding guide, runbook |

## Commands

### Document Management
- `ctx add <path>` — Create a new document
- `ctx update <path>` — Update a document
- `ctx delete <path>` — Delete a document
- `ctx publish <path>` — Publish (bump version, create checkpoint)
- `ctx validate [path]` — Validate against the spec
- `ctx list` — List documents (filter by `--type`, `--status`, `--tag`)
- `ctx search <query>` — Full-text search

### Context Queries
- `ctx query <selector>` — Query context with graph traversal (default: 2 hops)
- `ctx query <selector> --hops 4` — Deeper traversal for more context
- `ctx query <selector> --full` — Load all documents (legacy full mode)
- `ctx query @org/pack` — Query from a cloud-hosted pack
- `ctx resolve <selector>` — Execute a selector query

### Versioning & Integrity
- `ctx history <path>` — Show version history
- `ctx reconstruct <path> <version>` — Reconstruct a specific version
- `ctx verify` — Verify all hash chains

### Packs & Checkpoints
- `ctx pack list` — List context packs
- `ctx pack show <id>` — Show pack details
- `ctx checkpoint list` — List checkpoints
- `ctx checkpoint rebuild` — Rebuild checkpoint history

### Index & Agent Configs
- `ctx index` — Regenerate context.yaml, INDEX.md, and agent config files (CLAUDE.md, GEMINI.md, .cursorrules, .windsurfrules, .github/copilot-instructions.md)

## Graph Traversal

Queries use `context.yaml` as a lightweight graph index. Instead of loading all documents into memory, the engine evaluates selectors against metadata, traverses relationship edges for N hops via BFS, and only loads bodies for reached nodes.

```bash
ctx query "#engineering"           # Default: 2 hops from matched docs
ctx query "#engineering" --hops 4  # Deeper traversal, more context
ctx query "#engineering" --hops 1  # Shallow, fastest
ctx query "#engineering" --full    # Legacy: load everything
```

Edge priorities:
- `depends_on` edges are always traversed (free)
- Edges to hub nodes (most-referenced docs) are free
- `reference` edges cost 1 hop
- Set `metadata.edge_priority: 0` in frontmatter to make edges from that doc free

## Selectors

```bash
ctx query "#engineering"                   # All docs with a tag
ctx query "type:document"                  # All docs of a type
ctx query "pack:engineering-essentials"    # All docs in a pack
ctx query "status:published"              # By status
ctx query "#api + #v2"                    # Union
ctx query "#api + status:published"       # Intersection
```

## Cloud Packs

Query context from cloud-hosted packs without downloading source files:

```bash
ctx query @promptowl/executive-ai-strategy
```

## AI Agent Integration

Running `ctx index` auto-generates config files so AI tools discover your vault:

| File | Tool |
|------|------|
| `CLAUDE.md` | Claude Code |
| `GEMINI.md` | Gemini CLI |
| `.cursorrules` | Cursor |
| `.windsurfrules` | Windsurf |
| `.github/copilot-instructions.md` | GitHub Copilot |

Your hand-written content in these files is preserved — only the Context Nest section (between markers) is updated.

## MCP Server

For direct AI agent access via the Model Context Protocol:

```bash
npm install -g @promptowl/contextnest-mcp-server
```

See [@promptowl/contextnest-mcp-server](https://www.npmjs.com/package/@promptowl/contextnest-mcp-server) for setup instructions.

## Related Packages

| Package | Description |
|---------|-------------|
| [`@promptowl/contextnest-engine`](https://www.npmjs.com/package/@promptowl/contextnest-engine) | Core library — parsing, storage, versioning, graph traversal |
| [`@promptowl/contextnest-mcp-server`](https://www.npmjs.com/package/@promptowl/contextnest-mcp-server) | MCP server for AI agent access |

## Links

- [Context Nest repo](https://github.com/PromptOwl/context-nest)
- [Context Nest Specification](https://github.com/PromptOwl/context-nest-spec)
- [Whitepaper](https://promptowl.ai/resources/contextnest-whitepaper/)
- [PromptOwl](https://promptowl.ai)

## License

AGPL-3.0 — See [LICENSE](./LICENSE) for details.

For commercial licensing (embedding in proprietary products without AGPL obligations), contact [PromptOwl](https://promptowl.com).

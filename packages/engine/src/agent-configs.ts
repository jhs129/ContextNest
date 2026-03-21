/**
 * Auto-generate agent config files (CLAUDE.md, GEMINI.md, .cursorrules, etc.)
 * so AI tools auto-discover the vault without plugins.
 *
 * Uses delimited sections so user-authored content is preserved.
 * On each `ctx index`, only the section between BEGIN/END markers is updated.
 * If the file has no markers yet, the section is appended.
 */

import type { ContextYaml, NestConfig, Pack } from "./types.js";

const SECTION_BEGIN = "<!-- BEGIN CONTEXT NEST (auto-generated, do not edit this section) -->";
const SECTION_END = "<!-- END CONTEXT NEST -->";

export interface AgentConfigInput {
  config: NestConfig | null;
  contextYaml: ContextYaml;
  packs: Pack[];
  hasMcpServer: boolean;
}

/**
 * All supported agent config targets.
 */
export interface AgentConfigFile {
  /** Relative path from vault root */
  path: string;
  /** Content to merge into the file (between markers) */
  content: string;
}

/**
 * Generate all agent config files for the vault.
 */
export function generateAgentConfigs(input: AgentConfigInput): AgentConfigFile[] {
  const core = buildCoreInstructions(input);
  const section = `${SECTION_BEGIN}\n${core}\n${SECTION_END}`;

  return [
    { path: "CLAUDE.md", content: section },
    { path: "GEMINI.md", content: section },
    { path: ".cursorrules", content: section },
    { path: ".windsurfrules", content: section },
    { path: ".github/copilot-instructions.md", content: section },
  ];
}

/**
 * Merge auto-generated section into an existing file's content.
 * If the file already has BEGIN/END markers, replaces that section.
 * If not, appends the section at the end.
 * Returns the merged content.
 */
export function mergeAgentConfig(existingContent: string | null, newSection: string): string {
  if (!existingContent) {
    return newSection + "\n";
  }

  const beginIdx = existingContent.indexOf(SECTION_BEGIN);
  const endIdx = existingContent.indexOf(SECTION_END);

  if (beginIdx !== -1 && endIdx !== -1) {
    // Replace existing section
    const before = existingContent.slice(0, beginIdx).trimEnd();
    const after = existingContent.slice(endIdx + SECTION_END.length).trimStart();
    const parts = [before, newSection, after].filter((p) => p.length > 0);
    return parts.join("\n\n") + "\n";
  }

  // No existing section — append
  return existingContent.trimEnd() + "\n\n" + newSection + "\n";
}

// ─── Core instructions (shared across all agents) ────────────────────────────

function buildCoreInstructions(input: AgentConfigInput): string {
  const { config, contextYaml, packs, hasMcpServer } = input;
  const vaultName = config?.name || "Context Nest Vault";

  const lines: string[] = [];

  lines.push(`# ${vaultName}`);
  lines.push("");
  lines.push("This project contains a **Context Nest vault** — a structured knowledge base");
  lines.push("you should query before answering questions about this codebase or domain.");
  lines.push("");

  // How to use
  lines.push("## How to Use This Vault");
  lines.push("");
  if (hasMcpServer) {
    lines.push("**Preferred: MCP Server** — Use the `contextnest` MCP tools (`resolve`, `read_document`, `search`).");
    lines.push("");
  }
  lines.push("**CLI fallback** — Run `ctx query <selector>` to load context:");
  lines.push("```");
  lines.push('ctx query "#topic"              # By tag');
  lines.push('ctx query "type:document"        # By type');
  lines.push('ctx query "pack:pack-name"       # Load a pack');
  lines.push('ctx query "#tag" --hops 3        # Deeper graph traversal');
  lines.push('ctx query "#tag" --full           # Load everything (large vaults)');
  lines.push("```");
  lines.push("");

  // Key documents (hubs)
  if (contextYaml.hubs.length > 0) {
    lines.push("## Start Here (Hub Documents)");
    lines.push("");
    lines.push("These are the most-referenced documents — start with these for broad context:");
    lines.push("");
    for (const hub of contextYaml.hubs.slice(0, 5)) {
      const doc = contextYaml.documents.find((d) => d.id === hub.id);
      const title = doc?.title || hub.id;
      lines.push(`- **${title}** — \`ctx query "contextnest://${hub.id}"\``);
    }
    lines.push("");
  }

  // Available packs
  if (packs.length > 0) {
    lines.push("## Context Packs");
    lines.push("");
    lines.push("Pre-curated bundles of context for common tasks:");
    lines.push("");
    for (const pack of packs) {
      lines.push(`- **${pack.label}** (\`pack:${pack.id}\`) — ${pack.description || "No description"}`);
    }
    lines.push("");
  }

  // Vault stats
  lines.push("## Vault Overview");
  lines.push("");
  const published = contextYaml.documents.filter((d) => d.status === "published").length;
  const drafts = contextYaml.documents.length - published;
  lines.push(`- **${published}** published documents, **${drafts}** drafts`);
  lines.push(`- **${contextYaml.relationships.length}** relationship edges`);

  const tags = new Set<string>();
  for (const doc of contextYaml.documents) {
    for (const tag of doc.tags) tags.add(tag);
  }
  if (tags.size > 0) {
    lines.push(`- Tags: ${[...tags].sort().map((t) => `\`#${t}\``).join(", ")}`);
  }
  lines.push("");

  // Rules
  lines.push("## Rules");
  lines.push("");
  lines.push("1. **Query before answering** — Always check the vault for relevant context before responding to domain questions");
  lines.push("2. **Cite sources** — Reference document paths when using vault content");
  lines.push("3. **Prefer published** — Use published documents over drafts");
  lines.push("4. **Use graph traversal** — Default `ctx query` follows the document graph; increase `--hops` if you need more context");
  lines.push("");

  return lines.join("\n");
}


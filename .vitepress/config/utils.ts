import { acronyms, excludedSections, customTitles } from "./constants.js";
import fs from "node:fs";

export type ToTitleOptions = {
  acronyms?: Record<string, string>; // token -> desired form
  keepLowercase?: Set<string>; // optional: "and", "of", etc.
};

// Helper to get a readable title from filename or directory name
export function toTitle(input: string, options: ToTitleOptions = {}): string {
  // Check for custom title override first
  const normalizedInput = input.trim().replace(/\.md$/i, "");
  if (customTitles[normalizedInput]) {
    return customTitles[normalizedInput];
  }

  const allAcronyms: Record<string, string> = {
    ...acronyms,
    ...options.acronyms,
  };

  const keepLowercase = options.keepLowercase ?? new Set(["and", "or", "of", "the", "to", "in"]);

  // 1) Remove .md extension first, then normalize separators -> spaces
  const normalized = normalizedInput.replace(/[_\-.]+/g, " ").replace(/\s+/g, " ");

  if (!normalized) return "";

  const words = normalized.split(" ");

  // 2) Basic title-case pass
  const titled = words.map((w, idx) => {
    const lower = w.toLowerCase();

    // keep lowercase words unless it's the first word
    if (idx !== 0 && keepLowercase.has(lower)) return lower;

    // default Title Case
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  });

  // 3) Fix acronyms / special casing
  const fixed = titled.map((w) => {
    const lower = w.toLowerCase();
    return allAcronyms[lower] ?? w;
  });

  return fixed.join(" ");
}

// Sort: overview.md first, then non-dated alphabetically, then dated by date descending
export function sortByDate(items: string[]): string[] {
  return items.sort((a, b) => {
    // Always put overview.md first
    if (a.toLowerCase() === "overview.md") return -1;
    if (b.toLowerCase() === "overview.md") return 1;

    const dateA = a.match(/^(\d{4}-\d{2}-\d{2})/);
    const dateB = b.match(/^(\d{4}-\d{2}-\d{2})/);

    if (dateA && dateB) {
      return dateB[1].localeCompare(dateA[1]); // Most recent first
    }
    if (dateA && !dateB) return 1;
    if (!dateA && dateB) return -1;
    return a.localeCompare(b);
  });
}

// Auto-discover top-level documentation directories
export function discoverSections(docsDir: string): string[] {
  return fs
    .readdirSync(docsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith(".") && !excludedSections.includes(e.name))
    .map((e) => e.name)
    .sort();
}

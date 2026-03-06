#!/usr/bin/env node
import { execSync } from "node:child_process";
import fs from "node:fs";
import { globby } from "globby";

/**
 * Validate markdown files against schema using mdschema
 *
 * Usage:
 *   node scripts/validate-schema.mts                    # Validate all docs markdown files
 *   node scripts/validate-schema.mts <file1> <file2>    # Validate specific files
 *
 * Note: Only index.md files are validated due to mdschema limitations
 */

const SCHEMA_STRUCTURE = "schema.yml";

// Check if schema file exists
if (!fs.existsSync(SCHEMA_STRUCTURE)) {
  console.error(`❌ ${SCHEMA_STRUCTURE} not found.\n`);
  console.error("Make sure schema.yml exists in the project root.\n");
  process.exit(1);
}

// Get files to validate
let files = process.argv.slice(2);

// If no files provided, validate all markdown files in docs/
if (files.length === 0) {
  console.log("No files specified. Validating all markdown files in docs/...\n");
  files = await globby(["docs/**/*.md"], {
    gitignore: true,
  });

  if (files.length === 0) {
    console.log("No markdown files found in docs/");
    process.exit(0);
  }

  console.log(`Found ${files.length} file(s) to validate\n`);
}

// Separate files by schema type
const indexFiles = [];
const regularFiles = [];

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.log(`⚠️  Skipping ${file} (file not found)`);
    continue;
  }

  if (file.endsWith("/index.md") || file.endsWith("\\index.md")) {
    indexFiles.push(file);
  } else {
    regularFiles.push(file);
  }
}

console.log(`Index files: ${indexFiles.length}`);
console.log(`Regular files: ${regularFiles.length} (skipped - mdschema limitation)\n`);

let hasErrors = false;

// Validate index files with structure schema
if (indexFiles.length > 0) {
  console.log(`Validating ${indexFiles.length} index file(s) with structure schema...\n`);
  try {
    const fileList = indexFiles.join(" ");
    execSync(`mdschema check --schema ${SCHEMA_STRUCTURE} ${fileList}`, {
      stdio: "inherit",
    });
    console.log(`\n✅ All index files passed structure validation\n`);
  } catch {
    console.log(`\n❌ Some index files failed structure validation\n`);
    hasErrors = true;
  }
}

// Skip regular files - mdschema cannot validate links-only without structure
if (regularFiles.length > 0) {
  console.log(
    `ℹ️  Skipped ${regularFiles.length} regular files (mdschema requires structure validation)\n`,
  );
}

if (hasErrors) {
  console.log("❌ Validation failed");
  process.exit(1);
}

console.log("✅ All markdown files passed schema validation");

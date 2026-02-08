#!/usr/bin/env node

/**
 * Bump package versions and resolve workspace dependencies for publishing.
 * Replaces `workspace:*` dependencies with timestamp-based versions.
 */

const fs = require("fs");
const path = require("path");

const TS = process.env.TS;

if (!TS) {
  console.error("Error: TS environment variable must be set");
  process.exit(1);
}

function getPackages() {
  const rootPkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
  const workspacePatterns = rootPkg.workspaces || [];

  // Convert patterns to directories
  const dirs = workspacePatterns.flatMap((p) => p.replace(/\/\*$/, ""));

  // Walk directories to find packages
  function walk(dir) {
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => path.join(dir, d.name))
      .filter((p) => fs.existsSync(path.join(p, "package.json")));
  }

  return dirs.flatMap(walk);
}

function setVersion(file) {
  const json = JSON.parse(fs.readFileSync(file, "utf8"));
  json.version = `0.0.0-${TS}`;

  const depKeys = [
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "optionalDependencies",
  ];

  for (const key of depKeys) {
    const deps = json[key];
    if (!deps) continue;

    for (const [k, v] of Object.entries(deps)) {
      if (typeof v === "string" && v.startsWith("workspace:")) {
        deps[k] = `0.0.0-${TS}`;
      }
    }
  }

  fs.writeFileSync(file, JSON.stringify(json, null, 2) + "\n");
}

function main() {
  const packages = getPackages();

  for (const pkg of packages) {
    const pkgJson = path.join(pkg, "package.json");
    console.log(`Bumping ${pkgJson}`);
    setVersion(pkgJson);
  }

  // Also bump root package.json
  console.log("Bumping package.json");
  setVersion("package.json");
}

main();

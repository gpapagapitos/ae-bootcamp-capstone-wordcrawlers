import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const BOARD_JSON = path.join(ROOT, "docs", "board.json");
const HANDOFF_MD = path.join(ROOT, "docs", "handoff.md");

function loadBoard() {
  const raw = fs.readFileSync(BOARD_JSON, "utf8");
  return JSON.parse(raw);
}

function summary(board) {
  const counts = Object.fromEntries(board.columns.map((c) => [c.id, 0]));
  for (const item of board.items) {
    if (counts[item.status] !== undefined) {
      counts[item.status] += 1;
    }
  }
  return counts;
}

function topInFlight(board) {
  return board.items
    .filter((x) => x.status === "in-progress" || x.status === "blocked")
    .sort((a, b) => a.id.localeCompare(b.id));
}

function appendSnapshot() {
  const board = loadBoard();
  const counts = summary(board);
  const inFlight = topInFlight(board);
  const stamp = new Date().toISOString();

  const lines = [];
  lines.push(`\n### Snapshot ${stamp}`);
  lines.push("");
  lines.push(`- Backlog: ${counts.backlog ?? 0}`);
  lines.push(`- In Progress: ${counts["in-progress"] ?? 0}`);
  lines.push(`- Blocked: ${counts.blocked ?? 0}`);
  lines.push(`- Done: ${counts.done ?? 0}`);
  lines.push("");
  lines.push("- In-flight focus:");

  if (inFlight.length === 0) {
    lines.push("  - none");
  } else {
    for (const item of inFlight) {
      lines.push(`  - ${item.id}: ${item.title} (${item.status})`);
    }
  }

  lines.push("");
  fs.appendFileSync(HANDOFF_MD, `${lines.join("\n")}\n`, "utf8");
  console.log("Appended snapshot to docs/handoff.md");
}

appendSnapshot();

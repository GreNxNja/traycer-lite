import fs from "node:fs";
import path from "node:path";
import { BaseAgent } from "./BaseAgent.js";
import { Task } from "../types.js";

export class FormatCodeAgent extends BaseAgent {
  constructor() {
    super("formatCode", "Format Code");
  }
  async run(task: Task) {
    // pretend formatting
    return { output: { formatted: true, note: `Formatted after task: ${task.title}` } } as any;
  }
}

export class SearchRepoAgent extends BaseAgent {
  constructor(private root = process.cwd()) {
    super("searchRepo", "Search Repo");
  }
  async run(task: Task) {
    const query = String(task.input?.query ?? task.description);
    const files = walk(this.root).filter(f => f.endsWith(".ts") || f.endsWith(".tsx") || f.endsWith(".js"));
    const hits: Array<{ file: string; count: number }> = [];
    for (const f of files) {
      const text = fs.readFileSync(f, "utf8");
      const count = (text.match(new RegExp(escapeRegExp(query), "gi")) || []).length;
      if (count > 0) hits.push({ file: path.relative(this.root, f), count });
    }
    return { output: { hits } } as any;
  }
}

export class WriteFileAgent extends BaseAgent {
  constructor(private root = process.cwd()) {
    super("writeFile", "Write File");
  }
  async run(task: Task) {
    const rel = String(task.input?.path ?? "out/generated.txt");
    const content = String(task.input?.content ?? `// TODO from: ${task.title}\n`);
    const full = path.join(this.root, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content, "utf8");
    return { output: { path: rel, bytes: Buffer.byteLength(content) } } as any;
  }
}

function walk(dir: string): string[] {
  return fs.readdirSync(dir).flatMap(name => {
    const p = path.join(dir, name);
    const stat = fs.statSync(p);
    if (stat.isDirectory() && name !== "node_modules" && name !== ".git" && name !== "dist") return walk(p);
    return stat.isFile() ? [p] : [];
  });
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { Plan, RunLogEntry } from "../types.js";

export class Store {
  plansDir = path.resolve("plans");
  runsDir = path.resolve("runs");

  constructor() {
    fs.mkdirSync(this.plansDir, { recursive: true });
    fs.mkdirSync(this.runsDir, { recursive: true });
  }

  savePlan(plan: Plan, fileName?: string): string {
    const slug = (fileName ?? slugify(plan.goal) + ".yaml").replace(/[/\\]/g, "-");
    const fp = path.join(this.plansDir, slug);
    fs.writeFileSync(fp, yaml.dump(plan), "utf8");
    return fp;
  }

  loadPlan(filePath: string): Plan {
    const raw = fs.readFileSync(filePath, "utf8");
    return yaml.load(raw) as Plan;
  }

  appendRunLog(entries: RunLogEntry[]): string {
    const name = new Date().toISOString().replaceAll(":", "-") + ".json";
    const fp = path.join(this.runsDir, name);
    fs.writeFileSync(fp, JSON.stringify(entries, null, 2), "utf8");
    return fp;
  }
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { Plan, RunLogEntry, Phase, Task } from "../types.js";

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
    const loaded = yaml.load(raw) as any;
    
    // Validate and fix the loaded plan structure
    if (!loaded || typeof loaded !== 'object') {
      throw new Error(`Invalid YAML structure in ${filePath}`);
    }

    // Ensure phases is an array
    if (!Array.isArray(loaded.phases)) {
      throw new Error(`Plan phases must be an array in ${filePath}`);
    }

    // Validate and fix each phase
    for (let i = 0; i < loaded.phases.length; i++) {
      const phase = loaded.phases[i];
      if (!phase || typeof phase !== 'object') {
        throw new Error(`Invalid phase structure in ${filePath}`);
      }
      
      // Set default title if missing
      if (!phase.title) {
        phase.title = `Phase ${i + 1}`;
      }
      
      // Ensure tasks is an array
      if (!Array.isArray(phase.tasks)) {
        // If tasks is undefined/null, initialize as empty array
        if (phase.tasks === undefined || phase.tasks === null) {
          phase.tasks = [];
        } else {
          throw new Error(`Phase tasks must be an array in ${filePath}. Found: ${typeof phase.tasks}`);
        }
      }

      // Validate each task
      for (let j = 0; j < phase.tasks.length; j++) {
        const task = phase.tasks[j];
        if (!task || typeof task !== 'object') {
          throw new Error(`Invalid task structure in ${filePath}`);
        }
        
        // Set default title if missing
        if (!task.title) {
          task.title = `Task ${j + 1}`;
        }
        
        // Ensure dependsOn is an array
        if (!Array.isArray(task.dependsOn)) {
          if (task.dependsOn === undefined || task.dependsOn === null) {
            task.dependsOn = [];
          } else {
            throw new Error(`Task dependsOn must be an array in ${filePath}`);
          }
        }

        // Set default values for missing properties
        if (!task.status) task.status = "PENDING";
        if (typeof task.attempts !== 'number') task.attempts = 0;
      }
    }

    return loaded as Plan;
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
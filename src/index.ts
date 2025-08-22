#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import chalk from "chalk";

import { Planner } from "./core/Planner.js";
import { Orchestrator } from "./core/Orchestrator.js";
import { Store } from "./core/Store.js";
import { ToolRegistry } from "./core/ToolRegistry.js";
import { Config, Plan } from "./types.js";
import { FormatCodeAgent, SearchRepoAgent, WriteFileAgent } from "./agents/MockAgents.js";

const argv = await yargs(hideBin(process.argv))
  .scriptName("traycer-lite")
  .usage("$0 <goal> [options]")
  .positional("goal", { describe: "High-level goal (string)", type: "string" })
  .option("plan", { type: "string", describe: "Run from existing plan file" })
  .help()
  .parseAsync();

const store = new Store();
const planner = new Planner();
const registry = new ToolRegistry();

// Register demo agents
registry.register(new FormatCodeAgent());
registry.register(new SearchRepoAgent());
registry.register(new WriteFileAgent());

const cfg: Config = loadConfig();

let plan: Plan;
if (argv.plan) {
  plan = store.loadPlan(path.resolve(String(argv.plan)));
  console.log(chalk.gray(`Loaded plan: ${argv.plan}`));
} else {
  const goal = String(argv._[0] ?? argv.goal ?? "").trim();
  if (!goal) {
    console.error(chalk.red("Please provide a goal or --plan <file.yaml>"));
    process.exit(1);
  }
  plan = planner.build(goal);
  const fp = store.savePlan(plan);
  console.log(chalk.green(`Saved plan → ${fp}`));
}

// Show plan summary
printPlan(plan);

// Execute
const orchestrator = new Orchestrator(registry, cfg);
const log = await orchestrator.run(plan);
const runFile = store.appendRunLog(log);
const updatedPlanFile = store.savePlan(plan); // persist refinements

console.log(chalk.green(`\nRun log → ${runFile}`));
console.log(chalk.green(`Updated plan → ${updatedPlanFile}`));

function printPlan(plan: Plan) {
  console.log(chalk.cyan(`\nGoal: ${plan.goal}`));
  for (const phase of plan.phases) {
    console.log(chalk.bold(`\n▶ ${phase.title}`));
    for (const t of phase.tasks) {
      const agent = t.suggestedAgent ? chalk.gray(` [${t.suggestedAgent}]`) : "";
      console.log(` - ${t.title}${agent}`);
    }
  }
}

function loadConfig(): Config {
  const fp = path.resolve("tracer.config.json");
  if (fs.existsSync(fp)) {
    const raw = fs.readFileSync(fp, "utf8");
    return JSON.parse(raw) as Config;
    }
  return { maxRetries: 1, defaultAgents: { format: "formatCode", search: "searchRepo", write: "writeFile" } };
}

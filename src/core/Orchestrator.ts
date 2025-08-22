import { Config, Plan, RunLogEntry, Task } from "../types.js";
import { ToolRegistry } from "./ToolRegistry.js";
import { Review } from "./Review.js";

export class Orchestrator {
  constructor(private registry: ToolRegistry, private cfg: Config) {}

  async run(plan: Plan): Promise<RunLogEntry[]> {
    const review = new Review();
    const log: RunLogEntry[] = [];
    const tasks = plan.phases.flatMap(p => p.tasks);

    while (tasks.some(t => t.status === "PENDING")) {
      const ready = tasks.filter(
        t => t.status === "PENDING" && t.dependsOn.every(id => tasks.find(x => x.id === id)?.status === "DONE")
      );

      if (ready.length === 0) throw new Error("No runnable tasks found; check dependencies.");

      for (const task of ready) {
        await this.executeTask(task, log, plan, review);
      }
    }
    return log;
  }

  private async executeTask(task: Task, log: RunLogEntry[], plan: Plan, review: Review) {
    const agentKey = task.suggestedAgent ?? "writeFile";
    const agent = this.registry.get(agentKey);

    for (let attempt = 0; attempt <= this.cfg.maxRetries; attempt++) {
      task.status = "RUNNING";
      task.attempts++;
      try {
        const out = await agent.run(task);
        task.output = { ...(task.output ?? {}), ...(out || {}) };
        task.status = "DONE";
        log.push({ ts: new Date().toISOString(), taskId: task.id, agent: agent.key, status: task.status, notes: "ok" });
        break;
      } catch (err: unknown) {
        task.status = "FAILED";
        task.error = err instanceof Error ? err.message : String(err);
        log.push({
          ts: new Date().toISOString(),
          taskId: task.id,
          agent: agent.key,
          status: task.status,
          notes: task.error
        });
        const note = review.refine(plan, task);
        if (note) log.push({ ts: new Date().toISOString(), taskId: task.id, agent: "review", status: "PENDING", notes: note });
        if (attempt === this.cfg.maxRetries) break;
      }
    }
  }
}

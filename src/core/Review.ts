import { Plan, Task } from "../types.js";

/**
 * Micro review policy:
 * - If a task fails twice, insert a "Gather more context" task before it.
 * - If output is empty, note for retry.
 */
export class Review {
  refine(plan: Plan, task: Task): string | undefined {
    if (task.attempts >= 2 && task.status === "FAILED") {
      const phase = plan.phases.find(p => p.tasks.some(t => t.id === task.id));
      if (!phase) return;
      const idx = phase.tasks.findIndex(t => t.id === task.id);
      const newId = Math.random().toString(36).slice(2, 10);
      phase.tasks.splice(idx, 0, {
        id: newId,
        title: "Gather more context",
        description: `Collect missing info for '${task.title}'.`,
        dependsOn: [...task.dependsOn],
        status: "PENDING",
        attempts: 0,
        suggestedAgent: "searchRepo"
      });
      task.dependsOn = [newId];
      return `Inserted helper task before '${task.title}'.`;
    }

    if (!task.output || Object.keys(task.output).length === 0) {
      return `Output empty for '${task.title}', will retry.`;
    }
  }
}

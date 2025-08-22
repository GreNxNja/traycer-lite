import { Phase, Plan, Task } from "../types.js";

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * Simple heuristic planner:
 * Goal -> Discover -> Design -> Implement -> Verify
 */
export class Planner {
  build(goal: string, context?: string): Plan {
    const planId = uid();

    const discover: Phase = {
      id: uid(),
      title: "Discover",
      tasks: [
        this.task("Clarify requirements", `Extract constraints, inputs/outputs for: ${goal}`, []),
        this.task("Search codebase", "Locate relevant modules & endpoints.", [])
      ]
    };

    const design: Phase = {
      id: uid(),
      title: "Design",
      tasks: [
        this.task(
          "Propose approach",
          "Outline minimal changes and interfaces.",
          [discover.tasks[0].id, discover.tasks[1].id]
        )
      ]
    };

    const implement: Phase = {
      id: uid(),
      title: "Implement",
      tasks: [
        this.task("Make changes", "Apply code edits per design.", [design.tasks[0].id]),
        this.task("Format", "Format/organize modified files.", []) // fix deps below
      ]
    };
    implement.tasks[1].dependsOn = [implement.tasks[0].id];

    const verify: Phase = {
      id: uid(),
      title: "Verify",
      tasks: [this.task("Smoke test", "Run basic checks or validations.", [implement.tasks[1].id])]
    };

    const phases = [discover, design, implement, verify];

    // naive agent suggestions
    for (const p of phases) {
      for (const t of p.tasks) {
        if (/search/i.test(t.title)) t.suggestedAgent = "searchRepo";
        else if (/format/i.test(t.title)) t.suggestedAgent = "formatCode";
        else if (/make changes/i.test(t.title)) t.suggestedAgent = "writeFile";
      }
    }

    return {
      id: planId,
      goal,
      context,
      createdAt: new Date().toISOString(),
      phases
    };
  }

  private task(title: string, description: string, dependsOn: string[]): Task {
    return {
      id: uid(),
      title,
      description,
      dependsOn,
      status: "PENDING",
      attempts: 0
    };
  }
}

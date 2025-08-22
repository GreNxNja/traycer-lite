import { Task, RegistryAgent } from "../types.js";

export abstract class BaseAgent implements RegistryAgent {
  constructor(public key: string, public displayName: string) {}
  abstract run(task: Task): Promise<Partial<Task>>;
}

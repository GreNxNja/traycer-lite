import { RegistryAgent } from "../types.js";

export class ToolRegistry {
  private agents: Map<string, RegistryAgent> = new Map();

  register(agent: RegistryAgent) {
    if (this.agents.has(agent.key)) {
      throw new Error(`Agent '${agent.key}' already registered`);
    }
    this.agents.set(agent.key, agent);
  }

  get(key: string): RegistryAgent {
    const found = this.agents.get(key);
    if (!found) throw new Error(`Agent '${key}' not found`);
    return found;
  }

  list(): RegistryAgent[] {
    return [...this.agents.values()];
  }
}

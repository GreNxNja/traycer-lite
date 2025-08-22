export type UUID = string;

export type TaskStatus = "PENDING" | "RUNNING" | "DONE" | "FAILED";

export interface Task {
  id: UUID;
  title: string;
  description: string;
  dependsOn: UUID[];
  suggestedAgent?: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  status: TaskStatus;
  attempts: number;
  error?: string;
}

export interface Phase {
  id: UUID;
  title: string;
  tasks: Task[];
}

export interface Plan {
  id: UUID;
  goal: string;
  context?: string;
  createdAt: string;
  phases: Phase[];
}

export interface RunLogEntry {
  ts: string;
  taskId: UUID;
  agent: string;
  status: TaskStatus;
  notes?: string;
}

export interface RegistryAgent {
  key: string;
  displayName: string;
  run: (task: Task) => Promise<Partial<Task>>; // returns output or throws
}

export interface Config {
  maxRetries: number;
  defaultAgents: Record<string, string>;
}

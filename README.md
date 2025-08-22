# traycer-lite

A lightweight task orchestration system that breaks down high-level goals into structured phases and executes them using pluggable agents.

## 🎯 Overview

traycer-lite is a TypeScript-based orchestration framework that:
- Converts natural language goals into executable task plans
- Organizes tasks into logical phases with dependency management
- Executes tasks using specialized agents (search, write, format, etc.)
- Provides automatic retry logic and adaptive planning
- Persists execution logs and plan refinements

## 🚀 Features

- **Intelligent Planning**: Automatically breaks down goals into Discover → Design → Implement → Verify phases
- **Dependency Management**: Tasks execute in the correct order based on dependencies
- **Agent System**: Pluggable agents for different task types (file operations, code search, formatting)
- **Error Recovery**: Automatic retries with adaptive refinement when tasks fail
- **Plan Persistence**: Save and load plans as YAML files
- **Execution Logging**: Detailed logs of task execution and outcomes

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd traycer-lite

# Install dependencies
npm install

# Build the project
npm run build
```

## 🎮 Quick Start

### Run with a Goal

```bash
# Create a plan from a natural language goal
npm run dev -- "Create a REST API for user management"

# Or use the built version
npm run build
npm start -- "Setup a React component library"
```

### Run from Existing Plan

```bash
# Execute a pre-defined plan
npm run dev -- --plan examples/sample-plan.yaml
```

## 🏗️ Architecture

### Core Components

- **Planner**: Converts goals into structured task plans
- **Orchestrator**: Manages task execution and dependencies  
- **ToolRegistry**: Manages available agents
- **Store**: Handles plan and log persistence
- **Review**: Provides adaptive refinement when tasks fail

### Built-in Agents

- **SearchRepoAgent**: Searches codebase for relevant files and patterns
- **WriteFileAgent**: Creates and modifies files
- **FormatCodeAgent**: Formats and organizes code files

## 📝 Plan Structure

Plans are organized into phases, each containing tasks:

```yaml
goal: "Plan a simple web app flow"
phases:
  - title: "Discover"
    tasks:
      - title: "Clarify requirements"
        description: "Extract constraints and requirements"
        dependsOn: []
        suggestedAgent: "searchRepo"
        
  - title: "Design"  
    tasks:
      - title: "Propose approach"
        description: "Outline technical approach"
        dependsOn: ["clarify-requirements-id"]
        
  - title: "Implement"
    tasks:
      - title: "Make changes"
        description: "Apply code modifications"
        suggestedAgent: "writeFile"
        dependsOn: ["propose-approach-id"]
```

## 🔧 Configuration

Create a `tracer.config.json` file to customize behavior:

```json
{
    "maxRetries": 2,
    "defaultAgents": {
        "format": "formatCode",
        "search": "searchRepo", 
        "write": "writeFile"
    }
}
```

## 🛠️ Creating Custom Agents

Extend the `BaseAgent` class to create custom agents:

```typescript
import { BaseAgent } from "./agents/BaseAgent.js";
import { Task } from "./types.js";

export class CustomAgent extends BaseAgent {
  constructor() {
    super("customKey", "Custom Agent Display Name");
  }

  async run(task: Task): Promise<Partial<Task>> {
    // Your agent logic here
    const result = await this.performWork(task);
    
    return {
      output: {
        success: true,
        data: result
      }
    };
  }
}

// Register the agent
registry.register(new CustomAgent());
```

## 📁 Project Structure

```
traycer-lite/
├── src/
│   ├── agents/           # Agent implementations
│   │   ├── BaseAgent.ts  # Base agent class
│   │   └── MockAgents.ts # Built-in agents
│   ├── core/            # Core system components
│   │   ├── Orchestrator.ts # Task execution engine
│   │   ├── Planner.ts     # Goal-to-plan converter
│   │   ├── Review.ts      # Adaptive refinement
│   │   ├── Store.ts       # Plan/log persistence
│   │   └── ToolRegistry.ts # Agent management
│   ├── types.ts         # TypeScript definitions
│   └── index.ts         # CLI entry point
├── examples/            # Sample plans
├── plans/              # Generated plans (auto-created)
├── runs/               # Execution logs (auto-created)
└── tracer.config.json  # Configuration file
```

## 🎯 Use Cases

- **Code Generation**: Break down development tasks into manageable steps
- **Documentation**: Automatically generate docs by analyzing codebases
- **Refactoring**: Plan and execute large-scale code changes
- **Setup Automation**: Automate project setup and configuration
- **Testing Workflows**: Create comprehensive testing strategies

## 📊 Example Output

```
Goal: Plan a simple web app flow

▶ Discover
 - Clarify requirements [searchRepo]
 - Search codebase [searchRepo]

▶ Design  
 - Propose approach

▶ Implement
 - Make changes [writeFile]
 - Format [formatCode]

▶ Verify
 - Smoke test

Run log → runs/2025-08-22T16-12-14.324Z.json
Updated plan → plans/plan-a-simple-web-app-flow.yaml
```

## 🔄 Task Status Flow

```
PENDING → RUNNING → DONE
    ↓         ↓
    ↓    FAILED → (retry or refine)
    ↓         ↓
    └─────────┘
```

## 🧪 Development

```bash
# Run in development mode
npm run dev -- "Your goal here"

# Build for production
npm run build

# Clean build artifacts  
npm run clean

# Run built version
npm start -- "Your goal here"
```

## 📋 Task Dependencies

Tasks can depend on other tasks using the `dependsOn` array. The orchestrator ensures:
- Dependencies complete before dependent tasks start
- Circular dependencies are avoided
- Failed dependencies block dependent tasks

## 🔍 Logging and Debugging

Execution logs include:
- Timestamp and task ID
- Agent used for execution
- Task status and any error messages
- Review system notes and refinements

Logs are saved as JSON files in the `runs/` directory.

## 🚨 Error Handling

The system includes robust error handling:
- **Automatic Retries**: Failed tasks retry up to `maxRetries` times
- **Adaptive Planning**: Review system can inject helper tasks for failed tasks
- **Graceful Degradation**: Individual task failures don't stop the entire plan
- **Detailed Logging**: All errors are captured with context

## 🎉 Assignment Submission

This project represents a complete task orchestration system with:
- ✅ Modular architecture with clear separation of concerns
- ✅ TypeScript implementation with proper type safety
- ✅ Pluggable agent system for extensibility
- ✅ YAML-based plan persistence
- ✅ Comprehensive error handling and retry logic
- ✅ CLI interface with argument parsing
- ✅ Automated dependency resolution
- ✅ Adaptive planning with review system

The system successfully demonstrates software engineering principles including abstraction, modularity, error handling, and user experience design.
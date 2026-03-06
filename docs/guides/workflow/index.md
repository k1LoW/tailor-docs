---
doc_type: guide
---

# Workflow Service

## Overview

Workflow service enables you to build and execute complex, multi-step background jobs with automatic state management and resume capabilities on Tailor Platform.

If a workflow fails at any step, you can resume it from where it stopped without re-executing successful steps, making it ideal for long-running operations that need reliability.

With Workflow service, you can:

- Chain multiple JavaScript functions into durable workflows
- Automatically preserve execution state at each step
- Resume failed workflows from the point of failure
- Access TailorDB and other platform services with proper authentication
- Monitor execution progress through Tailor Console and tailor-sdk CLI

### Workflow vs Function

Both Workflow and Function services execute JavaScript code, but serve different purposes:

| Feature               | Function                       | Workflow                                      |
| --------------------- | ------------------------------ | --------------------------------------------- |
| **Execution model**   | Synchronous, single execution  | Multi-step, stateful execution                |
| **Duration**          | Short-lived (seconds)          | Long-running (minutes to hours)               |
| **State management**  | None                           | Automatic state preservation                  |
| **Resume capability** | No                             | Yes, from point of failure                    |
| **Use case**          | Data transformation, API calls | Complex background jobs, multi-step processes |
| **Called from**       | Pipeline resolvers, Executors  | Executors, Functions                          |

**When to use Workflow:**

- You need to chain multiple operations with state preservation
- The job may fail and needs to be resumed without repeating successful steps
- You're orchestrating complex business processes across multiple services

**When to use Function:**

- You need quick, synchronous data processing
- The operation is a single, atomic task
- You're transforming data within Pipeline resolvers

## How Workflow Execution Works

### Durable Execution Model

Workflow service uses a **durable execution model** where the execution state is automatically saved after each successful step.

**Example execution flow:**

```
Step 1: Fetch data from API    → Success ✓ (result cached)
Step 2: Transform data          → Success ✓ (result cached)
Step 3: Save to database        → Failed ✗
```

When you resume the workflow:

```
Step 1: Fetch data from API    → Skipped (use cached result)
Step 2: Transform data          → Skipped (use cached result)
Step 3: Save to database        → Retry from here
```

**Benefits:**

- **No duplicate work**: Successful steps are never re-executed
- **Safe retries**: You can retry as many times as needed
- **Cost efficient**: Only failed steps consume resources on retry
- **Data consistency**: Results from successful steps remain available

### Stack-Based Execution

Workflows support nested function calls, similar to regular programming:

```javascript
export function main(args) {
  // Call functions sequentially
  const data = tailor.workflow.triggerJobFunction("fetchData", {});
  const processed = tailor.workflow.triggerJobFunction("processData", data);
  return processed;
}
```

The execution stack:

```
[] → [main] → [main, fetchData] → [main] → [main, processData] → [main] → []
```

Each function's result is cached and passed to the next function in the chain.

Job functions within a single workflow execute **sequentially**, not in parallel. Each function completes before the next one starts. For concurrent execution, you can start multiple workflows asynchronously using `tailor.workflow.triggerWorkflow()`.

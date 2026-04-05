import { tool } from "ai";
import { z } from "zod";
import { N8nClient } from "@/lib/n8n-client";

export function createN8nTools(n8nClient: N8nClient) {
  return {
    listWorkflows: tool({
      description:
        "List all workflows in the user's n8n instance with their name, ID, and active status.",
      parameters: z.object({}),
      execute: async () => {
        const { data } = await n8nClient.getWorkflows();
        return data.map((w) => ({
          id: w.id,
          name: w.name,
          active: w.active,
          tags: w.tags?.map((t) => t.name) ?? [],
          updatedAt: w.updatedAt,
        }));
      },
    }),

    getWorkflowDetails: tool({
      description: "Get detailed information about a specific workflow by ID.",
      parameters: z.object({
        workflowId: z.string().describe("The workflow ID"),
      }),
      execute: async ({ workflowId }) => {
        const workflow = await n8nClient.getWorkflow(workflowId);
        return {
          id: workflow.id,
          name: workflow.name,
          active: workflow.active,
          tags: workflow.tags?.map((t) => t.name) ?? [],
          createdAt: workflow.createdAt,
          updatedAt: workflow.updatedAt,
        };
      },
    }),

    activateWorkflow: tool({
      description: "Activate a workflow so it starts listening for triggers.",
      parameters: z.object({
        workflowId: z.string().describe("The workflow ID to activate"),
      }),
      execute: async ({ workflowId }) => {
        const workflow = await n8nClient.activateWorkflow(workflowId);
        return {
          success: true,
          message: `Workflow "${workflow.name}" (${workflow.id}) is now active.`,
        };
      },
    }),

    deactivateWorkflow: tool({
      description:
        "Deactivate a workflow so it stops listening for triggers.",
      parameters: z.object({
        workflowId: z.string().describe("The workflow ID to deactivate"),
      }),
      execute: async ({ workflowId }) => {
        const workflow = await n8nClient.deactivateWorkflow(workflowId);
        return {
          success: true,
          message: `Workflow "${workflow.name}" (${workflow.id}) has been deactivated.`,
        };
      },
    }),

    executeWorkflow: tool({
      description: "Manually execute/run a workflow immediately.",
      parameters: z.object({
        workflowId: z.string().describe("The workflow ID to execute"),
        inputData: z
          .record(z.unknown())
          .optional()
          .describe("Optional input data to pass to the workflow"),
      }),
      execute: async ({ workflowId, inputData }) => {
        const result = await n8nClient.executeWorkflow(
          workflowId,
          inputData
        );
        return {
          success: true,
          executionId: result.executionId,
          message: `Workflow execution started. Execution ID: ${result.executionId}`,
        };
      },
    }),

    getRecentExecutions: tool({
      description:
        "Get recent workflow executions. Can filter by workflow ID or status (success, error, running, waiting).",
      parameters: z.object({
        workflowId: z
          .string()
          .optional()
          .describe("Filter by workflow ID"),
        status: z
          .enum(["success", "error", "running", "waiting"])
          .optional()
          .describe("Filter by execution status"),
        limit: z
          .number()
          .min(1)
          .max(50)
          .default(10)
          .describe("Number of executions to return"),
      }),
      execute: async ({ workflowId, status, limit }) => {
        const { data } = await n8nClient.getExecutions({
          workflowId,
          status,
          limit,
        });
        return data.map((e) => ({
          id: e.id,
          workflowId: e.workflowId,
          status: e.status,
          mode: e.mode,
          startedAt: e.startedAt,
          stoppedAt: e.stoppedAt,
          finished: e.finished,
        }));
      },
    }),

    getExecutionDetails: tool({
      description: "Get details of a specific execution by its ID.",
      parameters: z.object({
        executionId: z.string().describe("The execution ID"),
      }),
      execute: async ({ executionId }) => {
        const execution = await n8nClient.getExecution(executionId);
        return {
          id: execution.id,
          workflowId: execution.workflowId,
          status: execution.status,
          mode: execution.mode,
          startedAt: execution.startedAt,
          stoppedAt: execution.stoppedAt,
          finished: execution.finished,
        };
      },
    }),

    checkHealth: tool({
      description:
        "Check if the n8n instance is reachable and the API key is valid.",
      parameters: z.object({}),
      execute: async () => {
        const healthy = await n8nClient.healthCheck();
        return {
          healthy,
          message: healthy
            ? "n8n instance is online and API key is valid."
            : "Cannot reach n8n instance. Please check the URL and API key.",
        };
      },
    }),

    createWorkflow: tool({
      description:
        "Create a new workflow in n8n. Requires a name and optionally nodes, connections, and settings. Nodes should follow n8n workflow JSON format.",
      parameters: z.object({
        name: z.string().describe("Name of the new workflow"),
        nodes: z
          .array(z.record(z.unknown()))
          .optional()
          .describe("Array of workflow nodes in n8n JSON format"),
        connections: z
          .record(z.unknown())
          .optional()
          .describe("Connections between nodes in n8n format"),
        settings: z
          .record(z.unknown())
          .optional()
          .describe("Workflow settings (execution order, error handling, etc.)"),
      }),
      execute: async ({ name, nodes, connections, settings }) => {
        const workflow = await n8nClient.createWorkflow({
          name,
          nodes,
          connections,
          settings,
        });
        return {
          success: true,
          id: workflow.id,
          name: workflow.name,
          message: `Workflow "${workflow.name}" created successfully with ID: ${workflow.id}`,
        };
      },
    }),

    updateWorkflow: tool({
      description:
        "Update an existing workflow's name, nodes, connections, or settings.",
      parameters: z.object({
        workflowId: z.string().describe("The workflow ID to update"),
        name: z.string().optional().describe("New name for the workflow"),
        nodes: z
          .array(z.record(z.unknown()))
          .optional()
          .describe("Updated array of workflow nodes"),
        connections: z
          .record(z.unknown())
          .optional()
          .describe("Updated connections between nodes"),
        settings: z
          .record(z.unknown())
          .optional()
          .describe("Updated workflow settings"),
      }),
      execute: async ({ workflowId, name, nodes, connections, settings }) => {
        const workflow = await n8nClient.updateWorkflow(workflowId, {
          name,
          nodes,
          connections,
          settings,
        });
        return {
          success: true,
          id: workflow.id,
          name: workflow.name,
          message: `Workflow "${workflow.name}" updated successfully.`,
        };
      },
    }),

    deleteWorkflow: tool({
      description: "Delete a workflow permanently from n8n.",
      parameters: z.object({
        workflowId: z.string().describe("The workflow ID to delete"),
      }),
      execute: async ({ workflowId }) => {
        await n8nClient.deleteWorkflow(workflowId);
        return {
          success: true,
          message: `Workflow ${workflowId} deleted successfully.`,
        };
      },
    }),
  };
}

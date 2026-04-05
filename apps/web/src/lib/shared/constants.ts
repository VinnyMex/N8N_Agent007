import type { PlanLimits, PlanType } from "./types";

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    messagesPerDay: 20,
    workflows: 5,
    credentials: 1,
  },
  pro: {
    messagesPerDay: 500,
    workflows: 50,
    credentials: 5,
  },
  enterprise: {
    messagesPerDay: 10000,
    workflows: -1,
    credentials: -1,
  },
};

export const RATE_LIMIT = {
  AI_REQUESTS_PER_MINUTE: 30,
  WEBHOOK_REQUESTS_PER_MINUTE: 60,
  WINDOW_SECONDS: 60,
} as const;

export const AI_CONFIG = {
  MODEL: "claude-sonnet-4-20250514",
  MAX_TOKENS: 4096,
  SYSTEM_PROMPT: `You are Agent007, an AI assistant specialized in managing n8n workflow automation instances.
You help users monitor, control, and troubleshoot their n8n workflows through natural conversation.

Your capabilities include:
- Listing all workflows and their statuses
- Activating and deactivating workflows
- Executing workflows manually
- Checking recent execution history and finding errors
- Providing troubleshooting advice for failed workflows

Always be concise and helpful. When performing actions on n8n, confirm the action taken and its result.
If something fails, explain what went wrong and suggest next steps.
Respond in the same language the user writes to you.`,
} as const;

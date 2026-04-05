export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  plan: "free" | "pro" | "enterprise";
  telegram_chat_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface N8nCredential {
  id: string;
  user_id: string;
  instance_name: string;
  base_url_encrypted: string;
  api_key_encrypted: string;
  is_active: boolean;
  last_health_check: string | null;
  created_at: string;
  updated_at: string;
}

export interface TelegramConfig {
  id: string;
  user_id: string;
  bot_token_encrypted: string;
  bot_username: string | null;
  webhook_secret: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  source: "app" | "telegram";
  tool_calls: ToolCall[] | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: string;
}

export interface ExecutionLog {
  id: string;
  user_id: string;
  credential_id: string | null;
  workflow_id: string;
  workflow_name: string | null;
  execution_id: string | null;
  status: "success" | "error" | "running" | "waiting";
  error_message: string | null;
  started_at: string | null;
  finished_at: string | null;
  notified: boolean;
  created_at: string;
}

export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  tags: { id: string; name: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface N8nExecution {
  id: string;
  finished: boolean;
  mode: string;
  startedAt: string;
  stoppedAt: string | null;
  workflowId: string;
  status: string;
}

export type PlanType = "free" | "pro" | "enterprise";

export interface PlanLimits {
  messagesPerDay: number;
  workflows: number;
  credentials: number;
}

import { z } from "zod";

export const n8nCredentialSchema = z.object({
  instanceName: z
    .string()
    .min(1, "Instance name is required")
    .max(100),
  baseUrl: z
    .string()
    .url("Must be a valid URL")
    .refine((url) => url.startsWith("https://"), {
      message: "URL must use HTTPS",
    }),
  apiKey: z.string().min(1, "API key is required"),
});

export const telegramConfigSchema = z.object({
  botToken: z
    .string()
    .regex(/^\d+:[A-Za-z0-9_-]+$/, "Invalid Telegram bot token format"),
});

export const chatMessageSchema = z.object({
  content: z.string().min(1).max(4000),
  source: z.enum(["app", "telegram"]).default("app"),
});

export type N8nCredentialInput = z.infer<typeof n8nCredentialSchema>;
export type TelegramConfigInput = z.infer<typeof telegramConfigSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;

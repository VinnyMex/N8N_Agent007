import type { N8nWorkflow, N8nExecution } from "shared";

export class N8nClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.apiKey = apiKey;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/api/v1${path}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "X-N8N-API-KEY": this.apiKey,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "Unknown error");
      throw new Error(
        `n8n API error ${response.status}: ${errorBody}`
      );
    }

    return response.json();
  }

  async getWorkflows(): Promise<{ data: N8nWorkflow[] }> {
    return this.request("/workflows");
  }

  async getWorkflow(id: string): Promise<N8nWorkflow> {
    return this.request(`/workflows/${id}`);
  }

  async activateWorkflow(id: string): Promise<N8nWorkflow> {
    return this.request(`/workflows/${id}/activate`, { method: "POST" });
  }

  async deactivateWorkflow(id: string): Promise<N8nWorkflow> {
    return this.request(`/workflows/${id}/deactivate`, { method: "POST" });
  }

  async executeWorkflow(
    id: string,
    data?: Record<string, unknown>
  ): Promise<{ executionId: string }> {
    return this.request(`/workflows/${id}/run`, {
      method: "POST",
      body: JSON.stringify(data ?? {}),
    });
  }

  async getExecutions(params?: {
    workflowId?: string;
    status?: string;
    limit?: number;
  }): Promise<{ data: N8nExecution[] }> {
    const searchParams = new URLSearchParams();
    if (params?.workflowId)
      searchParams.set("workflowId", params.workflowId);
    if (params?.status) searchParams.set("status", params.status);
    if (params?.limit)
      searchParams.set("limit", params.limit.toString());

    const query = searchParams.toString();
    return this.request(`/executions${query ? `?${query}` : ""}`);
  }

  async getExecution(id: string): Promise<N8nExecution> {
    return this.request(`/executions/${id}`);
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.request("/workflows?limit=1");
      return true;
    } catch {
      return false;
    }
  }
}

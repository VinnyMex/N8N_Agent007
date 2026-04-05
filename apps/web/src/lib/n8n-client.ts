import type { N8nWorkflow, N8nExecution } from "@/lib/shared";

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
      console.log("N8nClient healthCheck - baseUrl:", this.baseUrl, "apiKey:", this.apiKey?.substring(0, 10) + "...");
      
      // Try /api/v1/workflows first (n8n v1.0+)
      try {
        const result = await this.request("/workflows?limit=1");
        console.log("N8nClient healthCheck success:", result);
        return true;
      } catch {
        // Try /rest/workflows (older n8n versions)
        const response = await fetch(`${this.baseUrl}/rest/workflows?limit=1`, {
          headers: { "X-N8N-API-KEY": this.apiKey }
        });
        if (response.ok) {
          console.log("N8nClient healthCheck success (legacy endpoint)");
          return true;
        }
      }
      
      console.log("N8nClient healthCheck failed");
      return false;
    } catch (err) {
      console.error("N8nClient healthCheck error:", err);
      return false;
    }
  }
}

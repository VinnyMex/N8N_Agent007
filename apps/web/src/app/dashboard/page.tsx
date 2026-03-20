import { createSupabaseServer } from "@/lib/supabase/server";
import { Activity, CheckCircle, XCircle, Clock, MessageSquare } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch stats
  const [executions, messages, credentials] = await Promise.all([
    supabase
      .from("execution_logs")
      .select("status", { count: "exact" })
      .eq("user_id", user!.id)
      .gte("created_at", new Date(Date.now() - 86400000).toISOString()),
    supabase
      .from("chat_history")
      .select("id", { count: "exact" })
      .eq("user_id", user!.id)
      .gte("created_at", new Date(Date.now() - 86400000).toISOString()),
    supabase
      .from("n8n_credentials")
      .select("id")
      .eq("user_id", user!.id)
      .eq("is_active", true),
  ]);

  const totalExecutions = executions.count ?? 0;
  const totalMessages = messages.count ?? 0;
  const hasCredentials = (credentials.data?.length ?? 0) > 0;

  // Recent errors
  const { data: recentErrors } = await supabase
    .from("execution_logs")
    .select("*")
    .eq("user_id", user!.id)
    .eq("status", "error")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Welcome back, {user?.user_metadata?.full_name ?? "Agent"}
        </p>
      </div>

      {!hasCredentials && (
        <div className="mb-8 rounded-xl border border-primary/50 bg-primary/5 p-6">
          <h3 className="font-semibold">Get Started</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect your n8n instance to start using the AI agent.{" "}
            <a href="/dashboard/settings" className="text-primary underline">
              Go to Settings
            </a>
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Executions (24h)",
            value: totalExecutions,
            icon: Activity,
            color: "text-blue-500",
          },
          {
            label: "Messages (24h)",
            value: totalMessages,
            icon: MessageSquare,
            color: "text-green-500",
          },
          {
            label: "Success Rate",
            value: totalExecutions > 0 ? "—" : "N/A",
            icon: CheckCircle,
            color: "text-emerald-500",
          },
          {
            label: "Active Errors",
            value: recentErrors?.length ?? 0,
            icon: XCircle,
            color: "text-red-500",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <p className="mt-2 text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Errors */}
      {recentErrors && recentErrors.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold">Recent Errors</h2>
          <div className="space-y-3">
            {recentErrors.map((error) => (
              <div
                key={error.id}
                className="rounded-xl border border-destructive/30 bg-destructive/5 p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">
                      {error.workflow_name ?? `Workflow ${error.workflow_id}`}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {error.error_message ?? "Unknown error"}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(error.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

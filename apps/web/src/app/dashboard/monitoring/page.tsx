"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import type { ExecutionLog } from "shared";
import { CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";

const statusConfig = {
  success: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
  error: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
  running: { icon: RefreshCw, color: "text-blue-500", bg: "bg-blue-500/10" },
  waiting: { icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10" },
};

export default function MonitoringPage() {
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const supabase = createSupabaseBrowser();

    // Initial fetch
    async function fetchLogs() {
      const { data } = await supabase
        .from("execution_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (data) setLogs(data as ExecutionLog[]);
    }

    fetchLogs();

    // Real-time subscription
    const channel = supabase
      .channel("execution-logs")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "execution_logs",
        },
        (payload) => {
          setLogs((prev) => [payload.new as ExecutionLog, ...prev].slice(0, 100));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredLogs =
    filter === "all" ? logs : logs.filter((l) => l.status === filter);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Monitoring</h1>
          <p className="mt-1 text-muted-foreground">
            Real-time workflow execution logs
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        {["all", "success", "error", "running", "waiting"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
              filter === status
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Logs Table */}
      <div className="rounded-xl border border-border bg-card">
        <div className="grid grid-cols-[1fr_1fr_120px_180px] gap-4 border-b border-border px-6 py-3 text-sm font-medium text-muted-foreground">
          <span>Workflow</span>
          <span>Execution ID</span>
          <span>Status</span>
          <span>Time</span>
        </div>
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No execution logs yet. Logs will appear here in real-time.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const config =
              statusConfig[log.status as keyof typeof statusConfig] ??
              statusConfig.waiting;
            const StatusIcon = config.icon;
            return (
              <div
                key={log.id}
                className="grid grid-cols-[1fr_1fr_120px_180px] gap-4 border-b border-border px-6 py-4 text-sm last:border-0 hover:bg-secondary/50 transition-colors"
              >
                <span className="font-medium truncate">
                  {log.workflow_name ?? log.workflow_id}
                </span>
                <span className="text-muted-foreground truncate font-mono text-xs">
                  {log.execution_id ?? "—"}
                </span>
                <span className="flex items-center gap-2">
                  <div className={`rounded-md p-1 ${config.bg}`}>
                    <StatusIcon className={`h-3.5 w-3.5 ${config.color}`} />
                  </div>
                  <span className="capitalize">{log.status}</span>
                </span>
                <span className="text-muted-foreground">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

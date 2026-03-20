import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { supabase } from "../lib/supabase";

interface ExecutionLog {
  id: string;
  workflow_name: string | null;
  workflow_id: string;
  status: string;
  error_message: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  success: "#22c55e",
  error: "#ef4444",
  running: "#3b82f6",
  waiting: "#eab308",
};

export default function MonitoringScreen() {
  const [logs, setLogs] = useState<ExecutionLog[]>([]);

  useEffect(() => {
    async function fetchLogs() {
      const { data } = await supabase
        .from("execution_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (data) setLogs(data);
    }
    fetchLogs();

    const channel = supabase
      .channel("mobile-execution-logs")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "execution_logs" },
        (payload) => {
          setLogs((prev) => [payload.new as ExecutionLog, ...prev].slice(0, 100));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No execution logs yet</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.workflowName}>
                {item.workflow_name ?? item.workflow_id}
              </Text>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: statusColors[item.status] ?? "#94a3b8" },
                ]}
              />
            </View>
            {item.error_message && (
              <Text style={styles.error} numberOfLines={2}>
                {item.error_message}
              </Text>
            )}
            <Text style={styles.time}>
              {new Date(item.created_at).toLocaleString()}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  list: { padding: 16 },
  empty: { alignItems: "center", marginTop: 100 },
  emptyText: { color: "#94a3b8", fontSize: 16 },
  card: {
    backgroundColor: "#111827",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  workflowName: { color: "#fff", fontWeight: "600", fontSize: 15, flex: 1 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  error: { color: "#f87171", fontSize: 13, marginTop: 8 },
  time: { color: "#64748b", fontSize: 12, marginTop: 8 },
});

import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "../lib/supabase";

export default function HomeScreen() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace("/login");
      } else {
        setUser(user);
      }
    });
  }, []);

  if (!user) return null;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.greeting}>
        Hello, {user.user_metadata?.full_name ?? "Agent"}
      </Text>

      <View style={styles.grid}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/chat")}
        >
          <Text style={styles.cardTitle}>AI Chat</Text>
          <Text style={styles.cardDesc}>
            Talk to your n8n agent
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/monitoring")}
        >
          <Text style={styles.cardTitle}>Monitoring</Text>
          <Text style={styles.cardDesc}>
            View execution logs
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/settings")}
        >
          <Text style={styles.cardTitle}>Settings</Text>
          <Text style={styles.cardDesc}>
            Manage your n8n connection
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a", padding: 20 },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 24,
    marginTop: 10,
  },
  grid: { gap: 16 },
  card: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  cardTitle: { fontSize: 18, fontWeight: "600", color: "#fff", marginBottom: 4 },
  cardDesc: { fontSize: 14, color: "#94a3b8" },
});

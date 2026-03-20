import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export default function SettingsScreen() {
  const [instanceName, setInstanceName] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);

  async function saveCredentials() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/credentials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instanceName, baseUrl, apiKey }),
      });

      if (res.ok) {
        Alert.alert("Success", "n8n instance connected!");
        setInstanceName("");
        setBaseUrl("");
        setApiKey("");
      } else {
        const data = await res.json();
        Alert.alert("Error", data.error ?? "Failed to save");
      }
    } catch {
      Alert.alert("Error", "Could not reach the server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>n8n Instance</Text>
      <Text style={styles.sectionDesc}>
        Credentials are encrypted with AES-256
      </Text>

      <View style={styles.form}>
        <Text style={styles.label}>Instance Name</Text>
        <TextInput
          style={styles.input}
          value={instanceName}
          onChangeText={setInstanceName}
          placeholder="My n8n"
          placeholderTextColor="#64748b"
        />

        <Text style={styles.label}>n8n URL</Text>
        <TextInput
          style={styles.input}
          value={baseUrl}
          onChangeText={setBaseUrl}
          placeholder="https://your-n8n.example.com"
          placeholderTextColor="#64748b"
          autoCapitalize="none"
          keyboardType="url"
        />

        <Text style={styles.label}>API Key</Text>
        <TextInput
          style={styles.input}
          value={apiKey}
          onChangeText={setApiKey}
          placeholder="Your n8n API key"
          placeholderTextColor="#64748b"
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
          onPress={saveCredentials}
          disabled={loading}
        >
          <Text style={styles.saveBtnText}>
            {loading ? "Connecting..." : "Connect & Save"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a", padding: 20 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 10,
  },
  sectionDesc: { fontSize: 14, color: "#94a3b8", marginTop: 4, marginBottom: 20 },
  form: { gap: 12 },
  label: { fontSize: 14, fontWeight: "500", color: "#e2e8f0" },
  input: {
    backgroundColor: "#111827",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#fff",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  saveBtn: {
    backgroundColor: "#6366f1",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});

import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const text = await res.text();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: text,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Error: Could not reach the server.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        contentContainerStyle={styles.messageList}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Agent007 Ready</Text>
            <Text style={styles.emptyDesc}>
              Ask about your n8n workflows
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageBubble,
              item.role === "user" ? styles.userBubble : styles.assistantBubble,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                item.role === "user" && styles.userText,
              ]}
            >
              {item.content}
            </Text>
          </View>
        )}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about your workflows..."
          placeholderTextColor="#64748b"
          multiline
          editable={!loading}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
          onPress={sendMessage}
          disabled={!input.trim() || loading}
        >
          <Text style={styles.sendBtnText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  messageList: { padding: 16, flexGrow: 1 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 100 },
  emptyTitle: { fontSize: 20, fontWeight: "bold", color: "#fff", marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: "#94a3b8" },
  messageBubble: { maxWidth: "80%", borderRadius: 16, padding: 12, marginBottom: 12 },
  userBubble: { alignSelf: "flex-end", backgroundColor: "#6366f1" },
  assistantBubble: { alignSelf: "flex-start", backgroundColor: "#1e293b" },
  messageText: { fontSize: 15, color: "#e2e8f0", lineHeight: 22 },
  userText: { color: "#fff" },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    backgroundColor: "#0a0a0a",
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#111827",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: "#fff",
    fontSize: 15,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  sendBtn: {
    backgroundColor: "#6366f1",
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
});

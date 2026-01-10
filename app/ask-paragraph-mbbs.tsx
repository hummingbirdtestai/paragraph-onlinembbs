//ask-paragraph-mbbs.tsx
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { theme } from '@/constants/theme';
import { StudentBubble } from '@/components/chat/StudentBubble';
import MentorBubbleReply from '@/components/types/MentorBubbleReply';
import { MessageInput } from '@/components/chat/MessageInput';
import LLMMCQCard from '@/components/chat/llm/LLMMCQCard';
import MainLayout from "@/components/MainLayout";

// 🔒 Hide internal control + diagnostic labels (UI only)
function stripControlBlocks(text: string) {
  return text
    // ❌ Remove diagnostic headings but KEEP content
    .replace(
  /\[(CORE_CONCEPT|GAP|EXPLANATION|COMMON_CONFUSION|MEMORY_HOOK|SUB_CONCEPT)\]:\s*/gi,
  ""
)


    // ❌ Hide control tokens
    .replace(/\[STUDENT_REPLY_REQUIRED\]/g, "")
    .replace(/\[FEEDBACK_CORRECT\]/g, "")
    .replace(/\[FEEDBACK_WRONG\]/g, "")
    .replace(/\[SYSTEM_RETRY\]/g, "")

    // ❌ Hide MCQ internals
    .replace(/^Correct:\s*[A-D]\s*$/gim, "")

    .trim();
}



interface Dialog {
  role: 'student' | 'mentor';
  content: string;
  streaming?: boolean;
}

interface MCQData {
  stem?: string;
  question?: string;
  options: any;
  correct_answer?: string;
  correctAnswerId?: string;
  feedback: any;
}


export default function AskParagraphScreen() {
  const params = useLocalSearchParams();
  const scrollViewRef = useRef<ScrollView>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [mcqData, setMcqData] = useState<MCQData | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [conversation, setConversation] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [nextSuggestions, setNextSuggestions] = useState<any[]>([]);
  const [tutorMode, setTutorMode] = useState<
    "idle" | "active"
  >("idle");
  
  const [selectedYear, setSelectedYear] = useState<
    "first" | "second" | "third" | "final" | null
  >(null);


// 2️⃣ Debug MCQ shape (SAFE)
useEffect(() => {
  if (!mcqData) return;

  console.log("🧠 [AskParagraph] FULL MCQ JSON", {
    mcqData,
    stem: mcqData.stem,
    options: mcqData.options,
    correct_answer: mcqData.correct_answer,
    feedback: mcqData.feedback,
    learning_gap: mcqData.learning_gap,
  });
}, [mcqData]);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [conversation, isTyping]);

  const handleSendMessage = async (message: string) => {
  if (!message.trim() || !sessionId || isTyping) return;

  // 1️⃣ Immediately append student message
 // ✅ ONLY append student message
setConversation(prev => [
  ...prev,
  { role: "student", content: message }
]);


  setIsTyping(true);

  try {
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL!;

    const res = await fetch(`${API_BASE_URL}/ask-paragraph-mbbs/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
  session_id: sessionId,
  message,
}),
    });

    if (!res.body) throw new Error("No stream body");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;

      if (value) {
        const chunk = decoder.decode(value, { stream: true });

        // 2️⃣ Append streamed text to last mentor bubble
       // ✅ CREATE mentor bubble only when stream starts
setConversation(prev => {
  const updated = [...prev];
  const last = updated[updated.length - 1];

  if (!last || last.role !== "mentor") {
    updated.push({ role: "mentor", content: chunk });
  } else {
    updated[updated.length - 1] = {
      ...last,
      content: last.content + chunk,
    };
  }

  return updated;
});
      }
    }
  } catch (e) {
    console.error("Chat error", e);
  } finally {
    setIsTyping(false);
  }
};

const startTutor = async (
  year: "first" | "second" | "third" | "final"
) => {
  // ✅ ADD THIS LINE — VERY FIRST LINE
  if (loading) return;
  
  setSelectedYear(year);
  setTutorMode("active");
  setLoading(true);

  try {
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL!;

    const res = await fetch(
      `${API_BASE_URL}/ask-paragraph-mbbs/start`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: params.student_id,
          year,
        }),
      }
    );

    const data = await res.json();

    // backend decides where student left off
    setSessionId(data.session_id || null);
    setMcqData(data.phase_json || null);
    setConversation(data.dialogs || []);
    setNextSuggestions(data.next_suggestions || []);

  } catch (e) {
    console.error("❌ Failed to start tutor", e);
  } finally {
    setLoading(false);
  }
};


// Allow MCQ to render even while chat loads


  return (
      <MainLayout>
    <View style={styles.container}>

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {tutorMode === "idle" && (
  <View style={styles.yearSelectorContainer}>
    <Text style={styles.yearSelectorLabel}>
      Choose your current MBBS year
    </Text>

    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.yearPillsRow}
    >
      {[
        { key: "first", label: "1st Year" },
        { key: "second", label: "2nd Year" },
        { key: "third", label: "3rd Year" },
        { key: "final", label: "Final Year" },
      ].map((item) => (
        <TouchableOpacity
          key={item.key}
          onPress={() => startTutor(item.key as any)}
          style={styles.yearPill}
        >
          <Text style={styles.yearPillText}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
)}

          {tutorMode === "active" && mcqData && (
  <View style={styles.mcqContainer}>
    <LLMMCQCard mcq={mcqData} />
  </View>
)}

          <View style={styles.conversationContainer}>
{conversation
  .filter(msg => msg.role !== "system")   // 🔥 KEY LINE
  .map((msg, index) =>
    msg.role === 'student' ? (
      <StudentBubble key={index} text={msg.content} />
    ) : (
     <MentorBubbleReply
  key={index}
  markdownText={
    typeof msg.content === "string"
      ? stripControlBlocks(msg.content)
      : ""
  }
/>

    )
)}


            {/* ✅ ADD THIS BLOCK — EXACT LOCATION */}
  {loading && (
    <View style={{ paddingVertical: 20, alignItems: "center" }}>
      <ActivityIndicator size="small" color={theme.colors.accent} />
      <Text style={styles.loadingText}>Loading discussion...</Text>
    </View>
  )}


            {isTyping && (
              <MentorBubbleReply markdownText="💬 *Paragraph Mentor is typing…*" />
            )}

            {nextSuggestions?.length > 0 && (
              <View style={styles.suggestionRow}>
                {nextSuggestions.map((s, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.suggestionChip}
                  >
                    <Text style={styles.suggestionText}>{s.label || s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>

        <View style={styles.inputContainer}>
          <MessageInput
            onSend={(message) => {
              if (isTyping || tutorMode !== "active") return;
              handleSendMessage(message);
            }}
            placeholder={
              tutorMode === "idle"
                ? "Select a year to begin…"
                : "Answer or ask anything…"
            }
            disabled={isTyping || tutorMode !== "active"}
          />

        </View>
      </KeyboardAvoidingView>
    </View>
          </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    marginTop: theme.spacing.md,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  mcqContainer: {
    marginBottom: theme.spacing.xl,
  },
  conversationContainer: {
    gap: theme.spacing.md,
  },
  inputContainer: {
    backgroundColor: theme.colors.mentorBubble,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingBottom: Platform.OS === 'ios' ? theme.spacing.xl : theme.spacing.md,
  },
  suggestionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 16,
  },
  suggestionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  suggestionText: {
    fontSize: 13,
    color: theme.colors.text,
  },
    yearSelectorContainer: {
    marginTop: 40,
    marginBottom: 20,
    alignItems: 'center',
  },
  yearSelectorLabel: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
    textAlign: 'center',
  },
  yearPillsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 4,
  },
  yearPill: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  yearPillText: {
    color: theme.colors.accent,
    fontSize: 15,
    fontWeight: '600',
  },
});

// app/cbme-revision.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import ConfettiCannon from "react-native-confetti-cannon";
import CBMEMCQChatScreen from "@/components/cbmeMCQChatScreen";
import { supabase } from "@/lib/supabaseClient";

const { width, height } = Dimensions.get("window");

interface MCQ {
  id: string;
  stem: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  feedback: {
    correct: string;
    wrong: string;
  };
  learning_gap: string;
  correct_answer: "A" | "B" | "C" | "D";
}

export default function CBMERevisionScreen() {
  const { topic_id, topic_name } = useLocalSearchParams<{
    topic_id?: string;
    topic_name?: string;
  }>();

  const router = useRouter();

  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [renderedCount, setRenderedCount] = useState(1);

  /* ───── Confetti ───── */

  const [showConfetti, setShowConfetti] = useState(false);
  const confettiRef = useRef<any>(null);

  const fireConfetti = () => {
    setShowConfetti(true);
    requestAnimationFrame(() => confettiRef.current?.start());
    setTimeout(() => setShowConfetti(false), 1800);
  };

  const scrollRef = useRef<ScrollView>(null);

  /* ───── Fetch MCQs ───── */

  useEffect(() => {
    if (!topic_id) return;

    (async () => {
      const { data, error } = await supabase.rpc(
        "get_5mcqs_cbme",
        { p_topic_id: topic_id }
      );

      if (error || !data) {
        console.error("❌ CBME MCQ fetch failed", error);
        return;
      }

      setMcqs(data.map((row: any) => row.phase_json));
    })();
  }, [topic_id]);

  /* ───── Answer Handler ───── */

  const handleAnswer = (
    index: number,
    selected: "A" | "B" | "C" | "D"
  ) => {
    const mcq = mcqs[index];
    if (!mcq) return;

    if (selected === mcq.correct_answer) {
      fireConfetti();
    }

    // Append next MCQ (conversation style)
    if (renderedCount < mcqs.length) {
      setRenderedCount((c) => c + 1);
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 300);
    }
  };

  /* ───── Render ───── */

  return (
    <View style={styles.container}>
      {showConfetti && (
        <View style={styles.confettiOverlay}>
          <ConfettiCannon
            ref={confettiRef}
            count={70}
            origin={{ x: width / 2, y: height / 3 }}
            autoStart={false}
            fadeOut
          />
        </View>
      )}

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.topicCard}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.topicTitle}>
            {topic_name ?? "Check how much I understood"}
          </Text>

          <Text style={styles.progressText}>
            {renderedCount} / {mcqs.length} questions
          </Text>
        </View>

        {/* MCQs — conversational append */}
        {mcqs.slice(0, renderedCount).map((mcq, idx) => (
     <CBMEMCQChatScreen
  key={mcq.id}
  item={mcq}
  mcqId={mcq.id}
  correctAnswer={mcq.correct_answer}
  mode="practice"
  onAnswerSelected={(opt) =>
    handleAnswer(idx, opt)
  }
/>

        ))}
      </ScrollView>
    </View>
  );
}

/* ───── Styles ───── */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0B" },

  content: {
    padding: 16,
    maxWidth: 560,
    alignSelf: "center",
  },

  topicCard: {
    backgroundColor: "#111b21",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },

  backText: {
    color: "#9FB3C8",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },

  topicTitle: {
    color: "#25D366",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },

  progressText: {
    color: "#B7E4C7",
    fontSize: 14,
    fontWeight: "600",
  },

  confettiOverlay: {
    position: "absolute",
    inset: 0,
    zIndex: 9999,
    pointerEvents: "none",
  },
});

//app/cbme-revision.tsx
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
import MCQChatScreen from "@/components/MCQChatScreen";
import { supabase } from "@/lib/supabaseClient";

/* ─────────────────────────────────────────────
   CONFIG
───────────────────────────────────────────── */

const { width, height } = Dimensions.get("window");

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */

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

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */

export default function CBMERevisionScreen() {
  /* ───────── ROUTER PARAMS ───────── */

  const { topic_id, topic_name } = useLocalSearchParams<{
    topic_id?: string;
    topic_name?: string;
  }>();

  const router = useRouter();

  /* ───────── DATA ───────── */

  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answered, setAnswered] = useState(false);

  /* ───────── CONFETTI ───────── */

  const [showConfetti, setShowConfetti] = useState(false);
  const confettiRef = useRef<any>(null);

  const fireConfetti = () => {
    setShowConfetti(true);
    requestAnimationFrame(() => confettiRef.current?.start());
    setTimeout(() => setShowConfetti(false), 1800);
  };

  /* ───────── SCROLL ───────── */

  const scrollRef = useRef<ScrollView>(null);

  /* ─────────────────────────────────────────────
     FETCH MCQs (RPC)
  ───────────────────────────────────────────── */

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

      // unwrap phase_json
      const parsed: MCQ[] = data.map((row: any) => row.phase_json);
      setMcqs(parsed);
    })();
  }, [topic_id]);

  /* ─────────────────────────────────────────────
     ANSWER HANDLER
  ───────────────────────────────────────────── */

  const handleAnswer = (selected: "A" | "B" | "C" | "D") => {
    if (answered) return;

    const mcq = mcqs[currentIndex];
    const isCorrect = selected === mcq.correct_answer;

    if (isCorrect) fireConfetti();

    setAnswered(true);

    // move to next after short delay
    setTimeout(() => {
      if (currentIndex < mcqs.length - 1) {
        setCurrentIndex((i) => i + 1);
        setAnswered(false);
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      }
    }, 1200);
  };

  /* ─────────────────────────────────────────────
     COMPLETE
  ───────────────────────────────────────────── */

  if (mcqs.length > 0 && currentIndex >= mcqs.length) {
    return (
      <View style={styles.completeContainer}>
        <Text style={styles.completeTitle}>🎉 Self-check complete</Text>
        <Text style={styles.completeText}>
          You’ve checked your understanding. Keep going 🚀
        </Text>
      </View>
    );
  }

  const mcq = mcqs[currentIndex];

  /* ─────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────── */

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
            Question {currentIndex + 1} / {mcqs.length}
          </Text>
        </View>

        {/* MCQ */}
        {mcq && (
          <MCQChatScreen
            item={mcq}
            mcqId={mcq.id}
            correctAnswer={mcq.correct_answer}
            mode="practice"
            disableAfterAnswer
            onAnswerSelected={handleAnswer}
          />
        )}
      </ScrollView>
    </View>
  );
}

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0B",
  },

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
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    pointerEvents: "none",
  },

  completeContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    backgroundColor: "#0A0A0B",
  },

  completeTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 12,
  },

  completeText: {
    fontSize: 16,
    color: "#C4C4C4",
    textAlign: "center",
  },
});

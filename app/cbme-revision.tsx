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
import MCQChatScreen from "@/components/MCQChatScreen";
import { supabase } from "@/lib/supabaseClient";

/* ───────────────────────────────────────────── */

const { width, height } = Dimensions.get("window");

/* ───────────────────────────────────────────── */

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

/* ───────────────────────────────────────────── */

export default function CBMERevisionScreen() {
  const { topic_id, topic_name } = useLocalSearchParams<{
    topic_id?: string;
    topic_name?: string;
  }>();

  const router = useRouter();

  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answered, setAnswered] = useState(false);

  /* ───────── Confetti ───────── */

  const [showConfetti, setShowConfetti] = useState(false);
  const confettiRef = useRef<any>(null);

  const fireConfetti = () => {
    setShowConfetti(true);
    requestAnimationFrame(() => confettiRef.current?.start());
    setTimeout(() => setShowConfetti(false), 1800);
  };

  /* ───────── Scroll ───────── */

  const scrollRef = useRef<ScrollView>(null);

  /* ───────── Fetch MCQs ───────── */

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

      const parsed: MCQ[] = data.map((row: any) => row.phase_json);
      setMcqs(parsed);
    })();
  }, [topic_id]);

  /* ───────── Answer Handler ───────── */

  const handleAnswer = (selected: "A" | "B" | "C" | "D") => {
    if (answered) return;

    const mcq = mcqs[currentIndex];
    const isCorrect = selected === mcq.correct_answer;

    if (isCorrect) fireConfetti();

    // ✅ IMPORTANT: stay on same MCQ
    setAnswered(true);
  };

  /* ───────── Next MCQ ───────── */

  const goNext = () => {
    if (currentIndex < mcqs.length - 1) {
      setCurrentIndex((i) => i + 1);
      setAnswered(false);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  /* ───────── Complete ───────── */

  if (mcqs.length > 0 && currentIndex >= mcqs.length) {
    return (
      <View style={styles.completeContainer}>
        <Text style={styles.completeTitle}>🎉 Self-check complete</Text>
        <Text style={styles.completeText}>
          You’ve identified your learning gaps. Keep going 🚀
        </Text>
      </View>
    );
  }

  const mcq = mcqs[currentIndex];

  /* ───────── Render ───────── */

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
          <>
            <MCQChatScreen
              item={mcq}
              mcqId={mcq.id}
              correctAnswer={mcq.correct_answer}
              mode="practice"
              disableAfterAnswer
              onAnswerSelected={handleAnswer}
            />

            {/* ✅ NEXT BUTTON ONLY AFTER FEEDBACK */}
            {answered && (
              <TouchableOpacity
                style={styles.nextButton}
                onPress={goNext}
              >
                <Text style={styles.nextText}>
                  {currentIndex === mcqs.length - 1
                    ? "Finish"
                    : "Next Question →"}
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

/* ───────────────────────────────────────────── */

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

  nextButton: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#0d2017",
    borderWidth: 1,
    borderColor: "#25D366",
    alignItems: "center",
  },

  nextText: {
    color: "#25D366",
    fontSize: 15,
    fontWeight: "700",
  },

  confettiOverlay: {
    position: "absolute",
    inset: 0,
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

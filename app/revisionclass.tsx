//revisionclass.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ConceptJSONRenderer from "@/components/types/ConceptJSONRenderer";
import NeetpgMCQChatScreen from "@/components/neetpgMCQChatScreen";
import ConfettiCannon from 'react-native-confetti-cannon';

/* ─────────────────────────────────────────────
   CONFIG
───────────────────────────────────────────── */

const API_BASE = 'https://revisionmainonlinembbspy-production.up.railway.app';
const TOTAL_CONCEPTS_FALLBACK = 10;
const { width, height } = Dimensions.get('window');

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */

interface Concept {
  title: string;
  concept: number;
  core_idea: string;
  key_explanation: string;
}

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
    wrong: string;
    correct: string;
  };
  learning_gap: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  concept_value: number;
}

type State = 'concept' | 'complete';

interface RenderedItem {
  type: 'concept' | 'mcq';
  concept: Concept;
  mcq?: MCQ;
  index: number;
}

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */

export default function RevisionScreen() {
  /* ───────────── ROUTER PARAMS ───────────── */

  const params = useLocalSearchParams<{
  topic_id?: string;
  topic_name?: string;
  subject?: string;   // ✅ now available
}>();

  const TOPIC_ID = params.topic_id;
  const router = useRouter();

  /* ───────────── SESSION / API ───────────── */

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [totalConcepts, setTotalConcepts] = useState(TOTAL_CONCEPTS_FALLBACK);

  /* ───────────── UI / FLOW ───────────── */

  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentConcept, setCurrentConcept] = useState<Concept | null>(null);
  const [renderedItems, setRenderedItems] = useState<RenderedItem[]>([]);
const [state, setState] = useState<State>('concept');

  /* ───────────── TIMERS ───────────── */

 const [countdown, setCountdown] = useState(10);
  const [feedbackCountdownActive, setFeedbackCountdownActive] = useState(false);


  /* ───────────── CONFETTI (BATTLE STYLE) ───────────── */

  const [showConfetti, setShowConfetti] = useState(false);
  const confettiRef = useRef<any>(null);

  const fireCorrectConfetti = () => {
    setShowConfetti(true);

    requestAnimationFrame(() => {
      confettiRef.current?.start();
    });

    setTimeout(() => {
      setShowConfetti(false);
    }, 2000);
  };

  /* ───────────── REFS ───────────── */

  const scrollRef = useRef<ScrollView>(null);
  const feedbackCountdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  /* ─────────────────────────────────────────────
     START REVISION SESSION
  ───────────────────────────────────────────── */

  useEffect(() => {
    if (!TOPIC_ID) {
      console.error("❌ topic_id missing in route params, aborting revision start");
      return;
    }

    (async () => {
      console.log("🚀 Starting revision");
      console.log("📌 topic_id:", TOPIC_ID);
      console.log("🌍 API_BASE:", API_BASE);

      try {
        const res = await fetch(`${API_BASE}/revision/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic_id: TOPIC_ID }),
        });

        console.log("📡 /revision/start status:", res.status);

        const raw = await res.text();
        console.log("📦 raw response:", raw);

        if (!res.ok) {
          console.error("❌ API returned error status:", res.status);
          return;
        }

        let data;
        try {
          data = JSON.parse(raw);
        } catch (parseErr) {
          console.error("❌ Failed to parse JSON:", raw);
          return;
        }

        console.log("🧠 session_id:", data.session_id);
        console.log("📘 first concept:", data.payload);

        setSessionId(data.session_id);
        setCurrentConcept(data.payload);
        setTotalConcepts(data.total_concepts || TOTAL_CONCEPTS_FALLBACK);

// 👇 ALSO append MCQ immediately if present
const { concept, mcq } = data.payload;

setRenderedItems([
  { type: "concept", concept, index: 0 },
  { type: "mcq", concept, mcq, index: 0 },
]);


      } catch (err) {
        console.error("❌ Revision start failed:", err);
      }
    })();
  }, [TOPIC_ID]);

  /* ─────────────────────────────────────────────
     FEEDBACK TIMER
  ───────────────────────────────────────────── */

  useEffect(() => {
  if (!feedbackCountdownActive) return;

  setCountdown(4);

  feedbackCountdownTimerRef.current = setInterval(() => {
    setCountdown((prev) => {
      if (prev <= 1) {
        clearInterval(feedbackCountdownTimerRef.current!);
        setFeedbackCountdownActive(false);
        loadNextStep();
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(feedbackCountdownTimerRef.current!);
}, [feedbackCountdownActive]);


  /* ─────────────────────────────────────────────
     LOAD MCQ
  ───────────────────────────────────────────── */
const loadNextStep = async () => {
  if (!sessionId) return;

  const res = await fetch(`${API_BASE}/revision/next`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId }),
  });

  if (!res.ok) return;

  const data = await res.json();

  if (data.type === "complete") {
    setState("complete");
    return;
  }

  const { concept, mcq } = data.payload;

  setCurrentIndex(data.index);

  setRenderedItems(items => [
    ...items,
    { type: "concept", concept, index: data.index },
    { type: "mcq", concept, mcq, index: data.index },
  ]);

  requestAnimationFrame(() =>
    scrollRef.current?.scrollToEnd({ animated: true })
  );
};

  /* ─────────────────────────────────────────────
     ANSWER SELECTED (CONFETTI ON CORRECT)
  ───────────────────────────────────────────── */

  const handleAnswerSelected = async (
  selectedOption: 'A' | 'B' | 'C' | 'D'
) => {
  if (!sessionId) return;

  const lastMCQ = renderedItems.findLast(i => i.type === 'mcq')?.mcq;
  if (!lastMCQ) return;

  const isCorrect = selectedOption === lastMCQ.correct_answer;
  if (isCorrect) fireCorrectConfetti();

  await fetch(`${API_BASE}/revision/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      mcq_index: currentIndex,
      selected_option: selectedOption,
    }),
  });

  console.log("⏳ Starting 10s countdown before next concept");
  setFeedbackCountdownActive(true);
};

  /* ─────────────────────────────────────────────
     COMPLETE
  ───────────────────────────────────────────── */

  if (state === 'complete') {
    return (
      <View style={styles.container}>
        <View style={styles.completeContainer}>
          <Text style={styles.completeTitle}>🎉 Revision Complete!</Text>
          <Text style={styles.completeText}>
            You've completed all concepts. Excellent work!
          </Text>
        </View>
      </View>
    );
  }

  /* ─────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────── */

  return (
    <View style={styles.container}>
{showConfetti && (
  <View style={styles.confettiOverlay}>
    <ConfettiCannon
      ref={confettiRef}
      count={80}
      origin={{ x: width / 2, y: height / 3 }}
      autoStart={false}
      fadeOut
    />
  </View>
)}


{feedbackCountdownActive && (
        <View style={styles.floatingCountdown}>
          <Text style={styles.floatingCountdownText}>{countdown}s</Text>
        </View>
      )}

      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
<View style={styles.topicCard}>
  {/* Back */}
  <TouchableOpacity
    activeOpacity={0.7}
    onPress={() => router.back()}
    style={styles.backButton}
  >
    <Text style={styles.backButtonText}>← Back</Text>
  </TouchableOpacity>

  {/* Topic */}
  <Text style={styles.topicTitle}>
    {params.topic_name ?? 'AI Tutor Revision'}
  </Text>

  {/* Progress */}
  <View style={styles.progressRow}>
    <Text style={styles.progressText}>
      🧠 Concept {currentIndex + 1} / {totalConcepts}
    </Text>
  </View>
</View>


{renderedItems.map((item, idx) => (
  <React.Fragment key={`${item.type}-${item.index}-${idx}`}>

    {item.type === 'concept' && (
  <ConceptJSONRenderer
    data={JSON.stringify(item.concept)}
    cbmeMeta={{
      subject: params.subject ?? null,   // ✅ shows General Medicine
      topic: params.topic_name ?? null,
    }}
  />
)}


    {item.type === 'mcq' && item.mcq && (
      <NeetpgMCQChatScreen
        item={item.mcq}
        studentId="practice-student"
        conceptId={item.concept.concept.toString()}
        mcqId={item.mcq.id}
        correctAnswer={item.mcq.correct_answer}
        phaseUniqueId={sessionId || 'session'}
        mode="practice"
        onAnswerSelected={handleAnswerSelected}
      />
    )}

  </React.Fragment>
))}
                            </ScrollView>
    </View>
  );
}

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0B' },
  scrollView: { flex: 1 },
contentContainer: {
  paddingVertical: 20,
  paddingBottom: 40,
  paddingHorizontal: 12,   // 👈 tiny breathing room
  maxWidth: 720,           // 👈 sweet spot: wider mobile, not desktop
  alignSelf: 'center',
},


header: {
  flexDirection: 'column',   // 👈 stack vertically
  alignItems: 'flex-start',
  gap: 8,
  paddingHorizontal: 16,
  marginBottom: 20,
  marginTop: 48,
},

  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    color: '#9FB3C8',
    fontSize: 14,
    fontWeight: '600',
  },
  headerText: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  progressBadge: {
    backgroundColor: '#1F1F23',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  progressText: { color: '#8B5CF6', fontSize: 14, fontWeight: '600' },
  floatingCountdown: {
    position: 'absolute',
    top: 100,
    right: 16,
    backgroundColor: '#8B5CF6',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  floatingCountdownText: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  completeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  completeTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  completeText: {
    fontSize: 18,
    color: '#C4C4C4',
    textAlign: 'center',
  },
  topicCard: {
  backgroundColor: '#111b21',
  borderRadius: 14,
  padding: 16,
  marginBottom: 20,
},

topicTitle: {
  color: '#25D366',
  fontSize: 18,
  fontWeight: '700',
  marginBottom: 10,
},

progressRow: {
  paddingVertical: 4,
  paddingHorizontal: 10,
  backgroundColor: '#0d2017',
  borderRadius: 12,
  alignSelf: 'flex-start',
  borderWidth: 1,
  borderColor: '#25D36655',
},
confettiOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 9999,
  pointerEvents: 'none',
},

});

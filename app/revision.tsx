//revision.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Dimensions,
} from 'react-native';
import { ConceptBubble } from '@/components/ConceptBubble';
import MCQChatScreen from '@/components/MCQChatScreen';
import ConfettiCannon from 'react-native-confetti-cannon';

/* ─────────────────────────────────────────────
   CONFIG
───────────────────────────────────────────── */

const API_BASE = 'https://revisionmainpy-production.up.railway.app';
const TOPIC_ID = 'REPLACE_WITH_REAL_TOPIC_ID'; // wire from router later
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
  /* ───────────── SESSION / API ───────────── */

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentConcept, setCurrentConcept] = useState<Concept | null>(null);
  const [currentMCQ, setCurrentMCQ] = useState<MCQ | null>(null);
  const [totalConcepts, setTotalConcepts] = useState(TOTAL_CONCEPTS_FALLBACK);

  /* ───────────── UI / FLOW ───────────── */

  const [currentIndex, setCurrentIndex] = useState(0);
  const [state, setState] = useState<State>('concept');
  const [renderedItems, setRenderedItems] = useState<RenderedItem[]>([]);

  /* ───────────── TIMERS ───────────── */

  const [countdown, setCountdown] = useState(20);
  const [conceptWaitCountdownActive, setConceptWaitCountdownActive] = useState(false);
  const [mcqCountdownActive, setMcqCountdownActive] = useState(false);
  const [feedbackCountdownActive, setFeedbackCountdownActive] = useState(false);
  const [autoSubmitTriggered, setAutoSubmitTriggered] = useState(false);

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
  const conceptWaitTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mcqCountdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackCountdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  /* ─────────────────────────────────────────────
     START REVISION SESSION
  ───────────────────────────────────────────── */

  useEffect(() => {
    (async () => {
      const res = await fetch(`${API_BASE}/revision/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic_id: TOPIC_ID }),
      });

      const data = await res.json();

      setSessionId(data.session_id);
      setCurrentConcept(data.payload);
      setTotalConcepts(data.total_concepts || TOTAL_CONCEPTS_FALLBACK);

      setRenderedItems([
        {
          type: 'concept',
          concept: data.payload,
          index: 0,
        },
      ]);
    })();
  }, []);

  /* ─────────────────────────────────────────────
     CONCEPT → WAIT TIMER
  ───────────────────────────────────────────── */

  useEffect(() => {
    if (!conceptWaitCountdownActive || !currentConcept) return;

    setCountdown(20);

    conceptWaitTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(conceptWaitTimerRef.current!);
          loadMCQ();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(conceptWaitTimerRef.current!);
  }, [conceptWaitCountdownActive]);

  /* ─────────────────────────────────────────────
     MCQ TIMER
  ───────────────────────────────────────────── */

  useEffect(() => {
    if (!mcqCountdownActive) return;

    setCountdown(20);

    mcqCountdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(mcqCountdownTimerRef.current!);
          setAutoSubmitTriggered(true);
          setMcqCountdownActive(false);
          setTimeout(() => setFeedbackCountdownActive(true), 2200);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(mcqCountdownTimerRef.current!);
  }, [mcqCountdownActive]);

  /* ─────────────────────────────────────────────
     FEEDBACK TIMER
  ───────────────────────────────────────────── */

  useEffect(() => {
    if (!feedbackCountdownActive) return;

    setCountdown(20);

    feedbackCountdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(feedbackCountdownTimerRef.current!);
          loadNextConcept();
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

  const loadMCQ = async () => {
    if (!sessionId || !currentConcept) return;

    const res = await fetch(`${API_BASE}/revision/next`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId }),
    });

    const data = await res.json();
    setCurrentMCQ(data.payload);

    setRenderedItems((items) => [
      ...items,
      {
        type: 'mcq',
        concept: currentConcept,
        mcq: data.payload,
        index: currentIndex,
      },
    ]);

    setConceptWaitCountdownActive(false);
    setMcqCountdownActive(true);

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  /* ─────────────────────────────────────────────
     ANSWER SELECTED (CONFETTI ON CORRECT)
  ───────────────────────────────────────────── */

  const handleAnswerSelected = async (
    selectedOption: 'A' | 'B' | 'C' | 'D'
  ) => {
    if (!sessionId || !currentMCQ) return;

    const isCorrect = selectedOption === currentMCQ.correct_answer;

    if (isCorrect) {
      fireCorrectConfetti();
    }

    await fetch(`${API_BASE}/revision/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        mcq_index: currentIndex,
        selected_option: selectedOption,
      }),
    });

    setMcqCountdownActive(false);
    clearInterval(mcqCountdownTimerRef.current!);

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 400);
    setTimeout(() => setFeedbackCountdownActive(true), 2200);
  };

  /* ─────────────────────────────────────────────
     LOAD NEXT CONCEPT
  ───────────────────────────────────────────── */

  const loadNextConcept = async () => {
    if (!sessionId) return;

    const res = await fetch(`${API_BASE}/revision/next`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId }),
    });

    const data = await res.json();

    if (data.type === 'complete') {
      setState('complete');
      return;
    }

    const nextIndex = currentIndex + 1;

    setCurrentIndex(nextIndex);
    setCurrentConcept(data.payload);
    setCurrentMCQ(null);

    setRenderedItems((items) => [
      ...items,
      {
        type: 'concept',
        concept: data.payload,
        index: nextIndex,
      },
    ]);

    setConceptWaitCountdownActive(false);
    setFeedbackCountdownActive(false);
    setAutoSubmitTriggered(false);

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
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
            You’ve completed all concepts. Excellent work!
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
        <ConfettiCannon
          ref={confettiRef}
          count={80}
          origin={{ x: width / 2, y: height / 3 }}
          autoStart={false}
          fadeOut
        />
      )}

      {(conceptWaitCountdownActive || mcqCountdownActive || feedbackCountdownActive) && (
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
        <View style={styles.header}>
          <Text style={styles.headerText}>AI Tutor Revision</Text>
          <View style={styles.progressBadge}>
            <Text style={styles.progressText}>
              Concept {currentIndex + 1}/{totalConcepts}
            </Text>
          </View>
        </View>

        {renderedItems.map((item, idx) => (
          <React.Fragment key={`${item.type}-${item.index}-${idx}`}>
            {item.type === 'concept' && (
              <ConceptBubble
                title={item.concept.title}
                coreIdea={item.concept.core_idea}
                keyExplanation={item.concept.key_explanation}
                conceptNumber={item.index + 1}
                totalConcepts={totalConcepts}
                onComplete={
                  item.index === currentIndex
                    ? () => setConceptWaitCountdownActive(true)
                    : undefined
                }
              />
            )}

            {item.type === 'mcq' && item.mcq && (
              <MCQChatScreen
                item={item.mcq}
                studentId="practice-student"
                conceptId={item.concept.concept.toString()}
                mcqId={item.mcq.id}
                correctAnswer={item.mcq.correct_answer}
                phaseUniqueId={sessionId || 'session'}
                mode="practice"
                onAnswerSelected={handleAnswerSelected}
                autoSubmit={autoSubmitTriggered}
              />
            )}
          </React.Fragment>
        ))}
      </ScrollView>
    </View>
  );
}

/* ─────────────────────────────────────────────
   STYLES (UNCHANGED)
───────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0B' },
  scrollView: { flex: 1 },
  contentContainer: { paddingVertical: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 24,
    marginTop: 48,
  },
  headerText: { fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
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
});

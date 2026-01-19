//revision.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { ConceptBubble } from '@/components/ConceptBubble';
import MCQChatScreen from '@/components/MCQChatScreen';
import ConfettiCannon from 'react-native-confetti-cannon';


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

const MOCK_CONCEPTS: Concept[] = [
  {
    title: 'Definition and Purpose of HRT 💡⚕',
    concept: 1,
    core_idea:
      '**_HRT_** = systemic or local **_estrogen_** ± **_progestogen_** to treat **_hypoestrogenic_** states and relieve menopausal symptoms.',
    key_explanation:
      "In one sentence, **_Hormone Replacement Therapy (HRT)_** is the use of **_estrogen_** alone or with **_progestogen_** to replace deficient hormones and improve symptoms; in practice we choose systemic vs local formulations depending on whether the goal is vasomotor control, **_vulvovaginal atrophy (VVA)_**, bone protection, or **_gender-affirming_** care. Think of **_HRT_** as a targeted therapy: systemic **_estrogen_** addresses **_hot flashes_**, sleep, mood and **_bone mineral density (BMD)_**, while **_local vaginal estrogen_** treats **_vaginal atrophy_** with minimal systemic exposure. Always frame decisions around indication, risk profile, and patient preferences. 🧠📘",
  },
  {
    title: 'Cardiovascular Effects of HRT 🫀',
    concept: 2,
    core_idea:
      '**_HRT_** has **_complex cardiovascular effects_** that depend heavily on **_timing of initiation_** relative to menopause onset.',
    key_explanation:
      'The **_timing hypothesis_** suggests that starting **_HRT_** within 10 years of menopause or before age 60 may provide **_cardiovascular benefits_**, while initiation later carries increased risk. Early HRT may improve **_endothelial function_** and reduce **_atherosclerosis_** progression, but in women with established disease, it can destabilize plaques. Key point: **_cardiovascular risk is not absolute_** but depends on age, time since menopause, and baseline cardiovascular health. 🫀📊',
  },
];

const MOCK_MCQS: MCQ[] = [
  {
    id: 'mcq-1',
    stem: '**A 51-year-old woman** presents with bothersome *hot flashes*, sleep disturbance and vaginal dryness 2 years after her last menstrual period. Which statement best describes the primary purpose of **_HRT_**?',
    options: {
      A: "To provide long-term prevention of Alzheimer's disease in all postmenopausal women",
      B: '**_To replace deficient estrogen ± progestogen to relieve vasomotor symptoms, improve vaginal trophicity and protect bone_**',
      C: 'To treat osteoporosis exclusively by increasing calcium absorption in the gut',
      D: 'To be used only for gender-affirming therapy and not for menopausal symptoms',
    },
    feedback: {
      correct: '✅ Correct! HRT replaces estrogen ± progestogen to manage menopausal symptoms (hot flashes, vaginal atrophy) and provides bone protection. This is the core therapeutic goal.',
      wrong: '❌ The primary indication for HRT is symptom relief and bone protection through estrogen replacement with or without progestogen. It addresses vasomotor symptoms, vaginal atrophy, and helps maintain bone density.',
    },
    learning_gap: 'HRT is fundamentally about replacing deficient hormones to manage menopausal symptoms and protect bone health. While it may have other effects, the core purpose is managing hypoestrogenic states through systemic or local hormone replacement.',
    correct_answer: 'B',
    concept_value: 1,
  },
  {
    id: 'mcq-2',
    stem: '**A 63-year-old woman** with no prior HRT use wants to start estrogen therapy for persistent hot flashes that began 11 years ago at menopause. She has **_no history of cardiovascular disease_**. What is the most important consideration?',
    options: {
      A: 'HRT should be avoided entirely in women over 60 regardless of symptoms',
      B: '**_The timing hypothesis suggests increased cardiovascular risk when initiating HRT more than 10 years post-menopause_**',
      C: 'Cardiovascular benefits of HRT increase with age, so she is an ideal candidate',
      D: 'Only local vaginal estrogen should be used in all postmenopausal women over 60',
    },
    feedback: {
      correct: '✅ Correct! The timing hypothesis indicates that starting HRT beyond 10 years post-menopause or after age 60 may increase cardiovascular risk, even without prior CVD. Careful counseling is essential.',
      wrong: '❌ The timing hypothesis is critical here: initiating HRT more than 10 years after menopause or after age 60 carries increased cardiovascular risk, even in women without prior cardiovascular disease.',
    },
    learning_gap: 'The timing hypothesis is a key principle in HRT: starting therapy within 10 years of menopause or before age 60 may provide cardiovascular benefits, while later initiation increases risk. This relationship exists even in women without established cardiovascular disease.',
    correct_answer: 'B',
    concept_value: 2,
  },
];

type State = 'concept' | 'countdown' | 'complete';

interface RenderedItem {
  type: 'concept' | 'mcq';
  concept: Concept;
  mcq?: MCQ;
  index: number;
}

export default function RevisionScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [state, setState] = useState<State>('concept');
  const [countdown, setCountdown] = useState(20);
  const [showConfetti, setShowConfetti] = useState(false);
  const [renderedItems, setRenderedItems] = useState<RenderedItem[]>([]);
  const [conceptWaitCountdownActive, setConceptWaitCountdownActive] = useState(false);
  const [mcqCountdownActive, setMcqCountdownActive] = useState(false);
  const [feedbackCountdownActive, setFeedbackCountdownActive] = useState(false);
  const [autoSubmitTriggered, setAutoSubmitTriggered] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const conceptWaitTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mcqCountdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackCountdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentConcept = MOCK_CONCEPTS[currentIndex];
  const currentMCQ = MOCK_MCQS.find((mcq) => mcq.concept_value === currentConcept?.concept);

  // Initialize with first concept
  useEffect(() => {
    if (renderedItems.length === 0) {
      setRenderedItems([{
        type: 'concept',
        concept: currentConcept,
        index: 0,
      }]);
    }
  }, []);

  // Concept wait countdown - starts after concept completes, before MCQ appears
  useEffect(() => {
    if (conceptWaitCountdownActive) {
      setCountdown(20);
      conceptWaitTimerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (conceptWaitTimerRef.current) {
              clearInterval(conceptWaitTimerRef.current);
            }
            // Show MCQ after countdown
            setRenderedItems((items) => [
              ...items,
              {
                type: 'mcq',
                concept: currentConcept,
                mcq: currentMCQ,
                index: currentIndex,
              },
            ]);
            setConceptWaitCountdownActive(false);
            // Start MCQ countdown
            setMcqCountdownActive(true);
            // Auto-scroll when MCQ appears
            setTimeout(() => {
              scrollRef.current?.scrollToEnd({ animated: true });
            }, 100);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => {
        if (conceptWaitTimerRef.current) {
          clearInterval(conceptWaitTimerRef.current);
        }
      };
    }
  }, [conceptWaitCountdownActive, currentConcept, currentMCQ, currentIndex]);

  // MCQ countdown - starts when MCQ appears
  useEffect(() => {
    if (mcqCountdownActive) {
      setCountdown(20);
      mcqCountdownTimerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (mcqCountdownTimerRef.current) {
              clearInterval(mcqCountdownTimerRef.current);
            }
            // Auto-submit when countdown hits 0
            setAutoSubmitTriggered(true);
            setMcqCountdownActive(false);

            // Start feedback countdown after auto-submit feedback completes
            setTimeout(() => {
              setFeedbackCountdownActive(true);
            }, 2200);

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => {
        if (mcqCountdownTimerRef.current) {
          clearInterval(mcqCountdownTimerRef.current);
        }
      };
    }
  }, [mcqCountdownActive]);

  // Feedback countdown - starts after feedback appears
  useEffect(() => {
    if (feedbackCountdownActive) {
      setCountdown(20);
      feedbackCountdownTimerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (feedbackCountdownTimerRef.current) {
              clearInterval(feedbackCountdownTimerRef.current);
            }
            handleNextConcept();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => {
        if (feedbackCountdownTimerRef.current) {
          clearInterval(feedbackCountdownTimerRef.current);
        }
      };
    }
  }, [feedbackCountdownActive]);

  const handleAnswerSelected = () => {
  setShowConfetti(true); // 🎉 FIRE CONFETTI

  setTimeout(() => {
    setShowConfetti(false); // cleanup
  }, 3000);

  setMcqCountdownActive(false);
  if (mcqCountdownTimerRef.current) {
    clearInterval(mcqCountdownTimerRef.current);
  }

  setTimeout(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, 400);

  setTimeout(() => {
    setFeedbackCountdownActive(true);
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, 2200);
};

  const handleNextConcept = () => {
    if (currentIndex < MOCK_CONCEPTS.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setFeedbackCountdownActive(false);
      setConceptWaitCountdownActive(false);
      setMcqCountdownActive(false);
      setAutoSubmitTriggered(false);

      // Add next concept to rendered items
      setRenderedItems((items) => [
        ...items,
        {
          type: 'concept',
          concept: MOCK_CONCEPTS[nextIndex],
          index: nextIndex,
        },
      ]);

      setState('concept');

      // Scroll to show new concept
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } else {
      setState('complete');
    }
  };

  if (state === 'complete') {
    return (
      <View style={styles.container}>
        <View style={styles.completeContainer}>
          <Text style={styles.completeTitle}>🎉 Revision Complete!</Text>
          <Text style={styles.completeText}>
            You've reviewed all concepts. Great work!
          </Text>
        </View>
      </View>
    );
  }

  if (!currentConcept || !currentMCQ) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Loading concepts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showConfetti && (
  <ConfettiCannon
    count={120}
    origin={{ x: -10, y: 0 }}
    fadeOut
    explosionSpeed={350}
    fallSpeed={3000}
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
              Concept {currentIndex + 1}/10
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
                totalConcepts={10}
                onComplete={item.index === currentIndex ? handleConceptComplete : undefined}
              />
            )}

            {item.type === 'mcq' && item.mcq && (
              <MCQChatScreen
                item={item.mcq}
                studentId="practice-student"
                conceptId={item.concept.concept.toString()}
                mcqId={item.mcq.id}
                correctAnswer={item.mcq.correct_answer}
                phaseUniqueId="practice-session"
                mode="practice"
                onAnswerSelected={item.index === currentIndex ? handleAnswerSelected : undefined}
                autoSubmit={item.index === currentIndex ? autoSubmitTriggered : false}
              />
            )}
          </React.Fragment>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0B',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 24,
    marginTop: 48,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progressBadge: {
    backgroundColor: '#1F1F23',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  progressText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '600',
  },
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
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  floatingCountdownText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
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
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 100,
  },
});

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '@/lib/supabaseClient';
import { ChevronLeft } from 'lucide-react-native';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface MCQ {
  stem: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  explanation: string;
  exam_trap: string;
}

interface StudentDoubt {
  doubt: string;
  answer: string;
}

interface ConceptBlock {
  title: string;
  concept: string[];
  mcq: MCQ;
  student_doubts: StudentDoubt[];
}

interface BattleClassItem {
  question: string;
  topic_order: number;
  class_json: Record<string, ConceptBlock>;
}

type Mode = 'push' | 'over';

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;
const OPTION_KEYS: (keyof MCQ)[] = [
  'option_a',
  'option_b',
  'option_c',
  'option_d',
];

// -----------------------------------------------------------------------------
// Screen
// -----------------------------------------------------------------------------

export default function TeacherLiveClassContent() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [data, setData] = useState<BattleClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [mode, setMode] = useState<Mode>('push');

  // ---------------------------------------------------------------------------
  // Fetch
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const fetchContent = async () => {
      if (!id) return;

      setLoading(true);
      setError('');

      const { data: rpcData, error: rpcError } = await supabase.rpc(
        'get_battle_class_contentv1',
        { p_battle_id: Number(id) }
      );

      if (rpcError) {
        setError(rpcError.message || 'Failed to load class content');
        setLoading(false);
        return;
      }

      const sorted = (rpcData || []).sort(
        (a: BattleClassItem, b: BattleClassItem) =>
          a.topic_order - b.topic_order
      );

      setData(sorted);
      setLoading(false);
    };

    fetchContent();
  }, [id]);

  // ---------------------------------------------------------------------------
  // Loading / Error / Empty
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator size="large" color="#00D9FF" />
        <Text style={styles.loadingText}>Loading class content...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerScreen}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => router.back()}>
          <Text style={styles.retryBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={styles.centerScreen}>
        <Text style={styles.emptyText}>No content found for this class</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => router.back()}>
          <Text style={styles.retryBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ---------------------------------------------------------------------------
  // Active item
  // ---------------------------------------------------------------------------

  const activeItem = data[activeTab];
  const conceptKeys = Object.keys(activeItem.class_json).sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
    const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
    return numA - numB;
  });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <ChevronLeft size={22} color="#00D9FF" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Live Class</Text>
          <Text style={styles.headerSub}>
            Question {activeTab + 1} of {data.length}
          </Text>
        </View>
        <View style={{ width: 64 }} />
      </View>

      {/* QUESTION TABS */}
      <View style={styles.tabBarContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBar}
        >
          {data.map((q, i) => {
            const isActive = i === activeTab;
            return (
              <TouchableOpacity
                key={q.topic_order}
                onPress={() => setActiveTab(i)}
                style={[styles.tab, isActive && styles.tabActive]}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  Q{i + 1}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* QUESTION TITLE */}
      <View style={styles.questionBanner}>
        <Text style={styles.questionTitle}>{activeItem.question}</Text>
      </View>

      {/* CONTENT */}
      <ScrollView
        style={styles.contentScroll}
        contentContainerStyle={styles.contentContainer}
      >
        {conceptKeys.map((key, ci) => {
          const concept = activeItem.class_json[key];
          if (!concept || !concept.title) return null;

          return (
            <View key={key} style={styles.conceptSection}>
              {/* CONCEPT HEADER */}
              <View style={styles.conceptHeader}>
                <View style={styles.conceptBadge}>
                  <Text style={styles.conceptBadgeText}>{ci + 1}</Text>
                </View>
                <Text style={styles.conceptTitle}>{concept.title}</Text>
              </View>

              {/* BULLET POINTS */}
              {concept.concept && concept.concept.length > 0 && (
                <View style={styles.bulletSection}>
                  {concept.concept.map((point, pi) => (
                    <View key={pi} style={styles.bulletRow}>
                      <View style={styles.bulletDot} />
                      <Text style={styles.bulletText}>{point}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* MCQ */}
              {concept.mcq && concept.mcq.stem && (
                <View style={styles.mcqCard}>
                  <Text style={styles.mcqLabel}>MCQ</Text>
                  <Text style={styles.mcqStem}>{concept.mcq.stem}</Text>

                  {OPTION_KEYS.map((optKey, oi) => {
                    const optText = concept.mcq[optKey];
                    if (!optText) return null;
                    const isCorrect =
                      concept.mcq.correct_option?.toUpperCase() ===
                      OPTION_LABELS[oi];

                    return (
                      <View
                        key={optKey}
                        style={[
                          styles.optionRow,
                          isCorrect && styles.optionCorrect,
                        ]}
                      >
                        <View
                          style={[
                            styles.optionLabelCircle,
                            isCorrect && styles.optionLabelCorrect,
                          ]}
                        >
                          <Text
                            style={[
                              styles.optionLabel,
                              isCorrect && styles.optionLabelTextCorrect,
                            ]}
                          >
                            {OPTION_LABELS[oi]}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.optionText,
                            isCorrect && styles.optionTextCorrect,
                          ]}
                        >
                          {optText}
                        </Text>
                      </View>
                    );
                  })}

                  {/* EXAM TRAP */}
                  {concept.mcq.exam_trap && (
                    <View style={styles.feedbackBlock}>
                      <Text style={styles.feedbackLabel}>Exam Trap</Text>
                      <Text style={styles.feedbackText}>
                        {concept.mcq.exam_trap}
                      </Text>
                    </View>
                  )}

                  {/* EXPLANATION */}
                  {concept.mcq.explanation && (
                    <View style={styles.feedbackBlock}>
                      <Text style={styles.feedbackLabel}>Explanation</Text>
                      <Text style={styles.feedbackText}>
                        {concept.mcq.explanation}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* STUDENT DOUBTS */}
              {concept.student_doubts && concept.student_doubts.length > 0 && (
                <View style={styles.doubtsCard}>
                  <Text style={styles.doubtsLabel}>Student Doubts</Text>
                  {concept.student_doubts.map((d, di) => (
                    <View key={di} style={styles.doubtItem}>
                      <Text style={styles.doubtQ}>Q: {d.doubt}</Text>
                      <Text style={styles.doubtA}>A: {d.answer}</Text>
                    </View>
                  ))}
                </View>
              )}

              {ci < conceptKeys.length - 1 && <View style={styles.divider} />}
            </View>
          );
        })}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* BOTTOM BAR — PUSH / OVER */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'push' && styles.modeBtnActive]}
          onPress={() => setMode('push')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.modeBtnText,
              mode === 'push' && styles.modeBtnTextActive,
            ]}
          >
            PUSH
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeBtn, mode === 'over' && styles.modeBtnActive]}
          onPress={() => setMode('over')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.modeBtnText,
              mode === 'over' && styles.modeBtnTextActive,
            ]}
          >
            OVER
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// -----------------------------------------------------------------------------
// Styles
// -----------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },

  centerScreen: {
    flex: 1,
    backgroundColor: '#0F0F0F',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 20,
  },

  loadingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },

  errorText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
    textAlign: 'center',
  },

  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#777',
    textAlign: 'center',
  },

  retryBtn: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },

  retryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00D9FF',
  },

  // =========================================================================
  // Header
  // =========================================================================

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },

  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: 64,
  },

  backText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#00D9FF',
  },

  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF1D6',
  },

  headerSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 2,
  },

  // =========================================================================
  // Question Tabs
  // =========================================================================

  tabBarContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },

  tabBar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },

  tabActive: {
    backgroundColor: '#00D9FF',
    borderColor: '#00D9FF',
  },

  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#777',
  },

  tabTextActive: {
    color: '#0F0F0F',
  },

  // =========================================================================
  // Question Banner
  // =========================================================================

  questionBanner: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
    backgroundColor: '#141414',
  },

  questionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F3EAD7',
    lineHeight: 24,
  },

  // =========================================================================
  // Content
  // =========================================================================

  contentScroll: {
    flex: 1,
  },

  contentContainer: {
    padding: 16,
    gap: 0,
  },

  // =========================================================================
  // Concept Section
  // =========================================================================

  conceptSection: {
    gap: 12,
  },

  conceptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },

  conceptBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#252525',
    alignItems: 'center',
    justifyContent: 'center',
  },

  conceptBadgeText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#00D9FF',
  },

  conceptTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF1D6',
  },

  // =========================================================================
  // Bullet Points
  // =========================================================================

  bulletSection: {
    gap: 8,
    paddingLeft: 4,
  },

  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },

  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00D9FF',
    marginTop: 7,
  },

  bulletText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#DDD',
    lineHeight: 22,
  },

  // =========================================================================
  // MCQ Card
  // =========================================================================

  mcqCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },

  mcqLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00D9FF',
    letterSpacing: 1,
  },

  mcqStem: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F3EAD7',
    lineHeight: 23,
  },

  optionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#222',
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },

  optionCorrect: {
    borderColor: '#4CAF5060',
    backgroundColor: '#0D2D15',
  },

  optionLabelCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },

  optionLabelCorrect: {
    backgroundColor: '#4CAF50',
  },

  optionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#999',
  },

  optionLabelTextCorrect: {
    color: '#0F0F0F',
  },

  optionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#CCC',
    lineHeight: 21,
    marginTop: 3,
  },

  optionTextCorrect: {
    color: '#4CAF50',
    fontWeight: '700',
  },

  // =========================================================================
  // Feedback (Exam Trap + Explanation)
  // =========================================================================

  feedbackBlock: {
    backgroundColor: '#252525',
    borderRadius: 10,
    padding: 14,
    gap: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#00D9FF',
  },

  feedbackLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },

  feedbackText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#DDD',
    lineHeight: 22,
  },

  // =========================================================================
  // Doubts
  // =========================================================================

  doubtsCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },

  doubtsLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: 1,
  },

  doubtItem: {
    gap: 6,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2D',
  },

  doubtQ: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F3EAD7',
    lineHeight: 21,
  },

  doubtA: {
    fontSize: 14,
    fontWeight: '500',
    color: '#BBB',
    lineHeight: 21,
  },

  // =========================================================================
  // Divider
  // =========================================================================

  divider: {
    height: 1,
    backgroundColor: '#2D2D2D',
    marginVertical: 16,
  },

  // =========================================================================
  // Bottom Bar — Push / Over
  // =========================================================================

  bottomBar: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
    backgroundColor: '#0F0F0F',
  },

  modeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },

  modeBtnActive: {
    backgroundColor: '#00D9FF',
    borderColor: '#00D9FF',
  },

  modeBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#777',
    letterSpacing: 1,
  },

  modeBtnTextActive: {
    color: '#0F0F0F',
  },
});

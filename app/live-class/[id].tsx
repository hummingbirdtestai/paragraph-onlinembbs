// app/live-class/[id].tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabaseClient';

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function parseInlineMarkup(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let key = 0;

  const regex =
    /(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*_[^_]+_\*|\*[^*]+\*|_[^_]+_)/g;

  const segments = text.split(regex);

  segments.forEach(segment => {
    if (segment.startsWith('***')) {
      parts.push(
        <Text key={key++} style={styles.bold}>
          {segment.slice(3, -3)}
        </Text>
      );
    } else if (segment.startsWith('**')) {
      parts.push(
        <Text key={key++} style={styles.bold}>
          {segment.slice(2, -2)}
        </Text>
      );
    } else if (segment.startsWith('*_')) {
      parts.push(
        <Text key={key++} style={styles.bold}>
          {segment.slice(2, -2)}
        </Text>
      );
    } else if (segment.startsWith('*')) {
      parts.push(
        <Text key={key++} style={styles.bold}>
          {segment.slice(1, -1)}
        </Text>
      );
    } else if (segment.startsWith('_')) {
      parts.push(<Text key={key++}>{segment.slice(1, -1)}</Text>);
    } else {
      parts.push(<Text key={key++}>{segment}</Text>);
    }
  });

  return <>{parts}</>;
}

// -----------------------------------------------------------------------------
// Screen
// -----------------------------------------------------------------------------

export default function StudentLiveClassRoom() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openBlocks, setOpenBlocks] = useState<Record<string, boolean>>({});
  const [mcqAttempts, setMcqAttempts] = useState<
    Record<number, { selected: 'A' | 'B' | 'C' | 'D' }>
  >({});

  const toggleBlock = (key: string) => {
    setOpenBlocks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // 1️⃣ Load persisted feed (replay)
  useEffect(() => {
    if (!id) return;

    const loadFeed = async () => {
      const { data, error } = await supabase.rpc(
        'get_battle_class_feed',
        { p_battle_id: id }
      );

      if (!error && data) {
        setFeed(data);
      }
      setLoading(false);
    };

    loadFeed();
  }, [id]);

  // 2️⃣ Subscribe to realtime updates
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`battle:${id}`)
      .on(
        'broadcast',
        { event: 'class-feed-push' },
        payload => {
          setFeed(prev =>
            prev.some(p => p.seq === payload.payload.seq)
              ? prev
              : [...prev, payload.payload]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator size="large" color="#00D9FF" />
        <Text style={styles.loadingText}>Loading class...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.contentScroll}
        contentContainerStyle={styles.contentContainer}
      >
        {feed.map((item, idx) => {
          const blockKey = `block-${item.seq}`;

          switch (item.type) {
            case 'concept':
              return (
                <View key={item.seq} style={styles.conceptSection}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => toggleBlock(blockKey)}
                    style={styles.conceptHeader}
                  >
                    <View style={styles.conceptBadge}>
                      <Text style={styles.conceptBadgeText}>
                        {item.meta?.ci != null ? item.meta.ci + 1 : ''}
                      </Text>
                    </View>
                    <Text style={styles.conceptTitle}>
                      {item.meta?.title || 'Concept'}
                    </Text>
                  </TouchableOpacity>

                  {openBlocks[blockKey] && (
                    <>
                      {Array.isArray(item.payload) && item.payload.length > 0 && (
                        <View style={styles.bulletSection}>
                          {item.payload.map((point: string, pi: number) => (
                            <View key={pi} style={styles.bulletRow}>
                              <View style={styles.bulletDot} />
                              <Text style={styles.bulletText}>
                                {parseInlineMarkup(point)}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </>
                  )}
                </View>
              );

            case 'mcq':
              const attempt = mcqAttempts[item.seq];
              const hasAnswered = !!attempt;

              return (
                <View key={item.seq} style={styles.mcqCard}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => toggleBlock(blockKey)}
                    style={styles.cardHeader}
                  >
                    <Text style={styles.mcqLabel}>MCQ</Text>
                  </TouchableOpacity>

                  {openBlocks[blockKey] && (
                    <>
                      <Text style={styles.mcqStem}>
                        {parseInlineMarkup(item.payload.stem)}
                      </Text>

                      {(['A', 'B', 'C', 'D'] as const).map(label => {
                        const optText = item.payload.options?.[label];
                        if (!optText) return null;
                        const isCorrect = item.payload.correct_answer === label;

                        return (
                          <TouchableOpacity
                            key={label}
                            disabled={hasAnswered}
                            onPress={() =>
                              setMcqAttempts(prev => ({
                                ...prev,
                                [item.seq]: { selected: label },
                              }))
                            }
                            style={[
                              styles.optionRow,
                              hasAnswered && isCorrect && styles.optionCorrect,
                              hasAnswered &&
                                attempt?.selected === label &&
                                !isCorrect &&
                                styles.optionWrong,
                            ]}
                          >
                            <View
                              style={[
                                styles.optionLabelCircle,
                                hasAnswered && isCorrect && styles.optionLabelCorrect,
                                hasAnswered &&
                                  attempt?.selected === label &&
                                  !isCorrect &&
                                  styles.optionLabelWrong,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.optionLabel,
                                  hasAnswered &&
                                    isCorrect &&
                                    styles.optionLabelTextCorrect,
                                  hasAnswered &&
                                    attempt?.selected === label &&
                                    !isCorrect &&
                                    styles.optionLabelTextWrong,
                                ]}
                              >
                                {label}
                              </Text>
                            </View>
                            <Text
                              style={[
                                styles.optionText,
                                hasAnswered && isCorrect && styles.optionTextCorrect,
                                hasAnswered &&
                                  attempt?.selected === label &&
                                  !isCorrect &&
                                  styles.optionTextWrong,
                              ]}
                            >
                              {parseInlineMarkup(optText)}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </>
                  )}
                </View>
              );

            case 'exam_trap':
              return (
                <View key={item.seq} style={styles.feedbackBlock}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => toggleBlock(blockKey)}
                    style={styles.cardHeader}
                  >
                    <Text style={styles.feedbackLabel}>Exam Trap</Text>
                  </TouchableOpacity>
                  {openBlocks[blockKey] && (
                    <Text style={styles.feedbackText}>
                      {parseInlineMarkup(item.payload)}
                    </Text>
                  )}
                </View>
              );

            case 'explanation':
              return (
                <View key={item.seq} style={styles.feedbackBlock}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => toggleBlock(blockKey)}
                    style={styles.cardHeader}
                  >
                    <Text style={styles.feedbackLabel}>Explanation</Text>
                  </TouchableOpacity>
                  {openBlocks[blockKey] && (
                    <Text style={styles.feedbackText}>
                      {parseInlineMarkup(item.payload)}
                    </Text>
                  )}
                </View>
              );

            case 'wrong_answers':
              return (
                <View key={item.seq} style={styles.feedbackBlock}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => toggleBlock(blockKey)}
                    style={styles.cardHeader}
                  >
                    <Text style={styles.feedbackLabel}>
                      Why Other Options Are Wrong
                    </Text>
                  </TouchableOpacity>
                  {openBlocks[blockKey] &&
                    Object.entries(item.payload).map(
                      ([label, text]: [string, any]) => (
                        <View key={label} style={{ marginTop: 10, paddingLeft: 8 }}>
                          <Text style={styles.wrongOptionLabel}>{label}.</Text>
                          <Text style={styles.feedbackText}>
                            {parseInlineMarkup(text)}
                          </Text>
                        </View>
                      )
                    )}
                </View>
              );

            case 'student_doubts':
              return (
                <View key={item.seq} style={styles.doubtsCard}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => toggleBlock(blockKey)}
                    style={styles.cardHeader}
                  >
                    <Text style={styles.doubtsLabel}>Student Doubts</Text>
                  </TouchableOpacity>

                  {openBlocks[blockKey] && (
                    <>
                      {Array.isArray(item.payload) &&
                        item.payload.map((d: any, di: number) => (
                          <View key={di} style={styles.doubtItem}>
                            <Text style={styles.doubtQ}>
                              Q: {parseInlineMarkup(d.doubt)}
                            </Text>
                            <Text style={styles.doubtA}>
                              A: {parseInlineMarkup(d.answer)}
                            </Text>
                          </View>
                        ))}
                    </>
                  )}
                </View>
              );

            default:
              return null;
          }
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
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

  contentScroll: {
    flex: 1,
  },

  contentContainer: {
    padding: 16,
  },

  conceptSection: {
    gap: 12,
    marginBottom: 14,
  },

  conceptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },

  conceptBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#252525',
    alignItems: 'center',
    justifyContent: 'center',
  },

  conceptBadgeText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#00D9FF',
  },

  conceptTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF1D6',
  },

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

  mcqCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: '#2D2D2D',
    marginBottom: 14,
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

  optionWrong: {
    borderColor: '#EF444460',
    backgroundColor: '#2D0D0D',
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

  optionLabelWrong: {
    backgroundColor: '#EF4444',
  },

  optionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#999',
  },

  optionLabelTextCorrect: {
    color: '#0F0F0F',
  },

  optionLabelTextWrong: {
    color: '#FFF',
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

  optionTextWrong: {
    color: '#EF4444',
    fontWeight: '700',
  },

  feedbackBlock: {
    backgroundColor: '#252525',
    borderRadius: 10,
    padding: 14,
    gap: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#00D9FF',
    marginBottom: 14,
  },

  feedbackLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },

  wrongOptionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F59E0B',
  },

  feedbackText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#DDD',
    lineHeight: 22,
  },

  bold: {
    fontWeight: '700',
    color: '#25D366',
  },

  doubtsCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: '#2D2D2D',
    marginBottom: 14,
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

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

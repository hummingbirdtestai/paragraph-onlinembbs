// app/cbme-learning-path.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, Award, Star, Trophy, Sparkles, ChevronRight, ArrowLeft, CheckCircle2, Circle } from 'lucide-react-native';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const YEARS = [
  {
    year: "First Year",
    yearFull: "MBBS First Year",
    subjects: ["Anatomy", "Physiology", "Biochemistry"],
    color: "#3b82f6",
    lightColor: "#60a5fa",
    bgColor: "rgba(59, 130, 246, 0.1)",
    borderColor: "rgba(59, 130, 246, 0.3)",
    icon: "book",
  },
  {
    year: "Second Year",
    yearFull: "MBBS Second Year",
    subjects: ["Pathology", "Pharmacology", "Microbiology"],
    color: "#8b5cf6",
    lightColor: "#a78bfa",
    bgColor: "rgba(139, 92, 246, 0.1)",
    borderColor: "rgba(139, 92, 246, 0.3)",
    icon: "lab",
  },
  {
    year: "Third Year",
    yearFull: "MBBS Third Year",
    subjects: ["Forensic Medicine", "Community Medicine"],
    color: "#ec4899",
    lightColor: "#f472b6",
    bgColor: "rgba(236, 72, 153, 0.1)",
    borderColor: "rgba(236, 72, 153, 0.3)",
    icon: "research",
  },
  {
    year: "Final Year",
    yearFull: "MBBS Final Year",
    subjects: [
      "General Medicine",
      "Pediatrics",
      "Psychiatry",
      "Radiodiagnosis",
      "Radiotherapy",
      "Dermatology",
      "Gynecology",
      "Obstetrics",
      "General Surgery",
      "Anaesthesiology",
      "Orthopaedics",
      "ENT",
      "Ophthalmology",
    ],
    color: "#10b981",
    lightColor: "#34d399",
    bgColor: "rgba(16, 185, 129, 0.1)",
    borderColor: "rgba(16, 185, 129, 0.3)",
    icon: "trophy",
  },
];

const SUBJECT_COLORS: Record<string, any> = {
  "Anatomy": { color: "#3b82f6", lightColor: "#60a5fa", bgColor: "rgba(59, 130, 246, 0.1)", borderColor: "rgba(59, 130, 246, 0.3)" },
  "Physiology": { color: "#06b6d4", lightColor: "#22d3ee", bgColor: "rgba(6, 182, 212, 0.1)", borderColor: "rgba(6, 182, 212, 0.3)" },
  "Biochemistry": { color: "#8b5cf6", lightColor: "#a78bfa", bgColor: "rgba(139, 92, 246, 0.1)", borderColor: "rgba(139, 92, 246, 0.3)" },
  "Pathology": { color: "#ec4899", lightColor: "#f472b6", bgColor: "rgba(236, 72, 153, 0.1)", borderColor: "rgba(236, 72, 153, 0.3)" },
  "Pharmacology": { color: "#f59e0b", lightColor: "#fbbf24", bgColor: "rgba(245, 158, 11, 0.1)", borderColor: "rgba(245, 158, 11, 0.3)" },
  "Microbiology": { color: "#10b981", lightColor: "#34d399", bgColor: "rgba(16, 185, 129, 0.1)", borderColor: "rgba(16, 185, 129, 0.3)" },
  "Forensic Medicine": { color: "#6366f1", lightColor: "#818cf8", bgColor: "rgba(99, 102, 241, 0.1)", borderColor: "rgba(99, 102, 241, 0.3)" },
  "Community Medicine": { color: "#14b8a6", lightColor: "#2dd4bf", bgColor: "rgba(20, 184, 166, 0.1)", borderColor: "rgba(20, 184, 166, 0.3)" },
  "General Medicine": { color: "#ef4444", lightColor: "#f87171", bgColor: "rgba(239, 68, 68, 0.1)", borderColor: "rgba(239, 68, 68, 0.3)" },
  "Pediatrics": { color: "#8b5cf6", lightColor: "#a78bfa", bgColor: "rgba(139, 92, 246, 0.1)", borderColor: "rgba(139, 92, 246, 0.3)" },
  "Psychiatry": { color: "#06b6d4", lightColor: "#22d3ee", bgColor: "rgba(6, 182, 212, 0.1)", borderColor: "rgba(6, 182, 212, 0.3)" },
  "Radiodiagnosis": { color: "#ec4899", lightColor: "#f472b6", bgColor: "rgba(236, 72, 153, 0.1)", borderColor: "rgba(236, 72, 153, 0.3)" },
  "Radiotherapy": { color: "#f59e0b", lightColor: "#fbbf24", bgColor: "rgba(245, 158, 11, 0.1)", borderColor: "rgba(245, 158, 11, 0.3)" },
  "Dermatology": { color: "#10b981", lightColor: "#34d399", bgColor: "rgba(16, 185, 129, 0.1)", borderColor: "rgba(16, 185, 129, 0.3)" },
  "Gynecology": { color: "#ec4899", lightColor: "#f472b6", bgColor: "rgba(236, 72, 153, 0.1)", borderColor: "rgba(236, 72, 153, 0.3)" },
  "Obstetrics": { color: "#f472b6", lightColor: "#fbcfe8", bgColor: "rgba(244, 114, 182, 0.1)", borderColor: "rgba(244, 114, 182, 0.3)" },
  "General Surgery": { color: "#ef4444", lightColor: "#f87171", bgColor: "rgba(239, 68, 68, 0.1)", borderColor: "rgba(239, 68, 68, 0.3)" },
  "Anaesthesiology": { color: "#6366f1", lightColor: "#818cf8", bgColor: "rgba(99, 102, 241, 0.1)", borderColor: "rgba(99, 102, 241, 0.3)" },
  "Orthopaedics": { color: "#f59e0b", lightColor: "#fbbf24", bgColor: "rgba(245, 158, 11, 0.1)", borderColor: "rgba(245, 158, 11, 0.3)" },
  "ENT": { color: "#14b8a6", lightColor: "#2dd4bf", bgColor: "rgba(20, 184, 166, 0.1)", borderColor: "rgba(20, 184, 166, 0.3)" },
  "Ophthalmology": { color: "#3b82f6", lightColor: "#60a5fa", bgColor: "rgba(59, 130, 246, 0.1)", borderColor: "rgba(59, 130, 246, 0.3)" },
};

interface LearningPathProps {
  onSubjectSelect?: (subject: string) => void;
}

const getChapterAccentColor = (baseColor: string, index: number) => {
  const accents = [
    baseColor,
    '#22c55e', // green
    '#38bdf8', // sky
    '#a78bfa', // violet
    '#fbbf24', // amber
    '#f472b6', // pink
  ];

  return accents[index % accents.length];
};

export default function CBMELearningPath({ onSubjectSelect }: LearningPathProps) {
  const { user } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [subjectProgress, setSubjectProgress] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubjectPress = async (subject: string) => {
    if (!user?.id) {
      setError("Please log in to view your progress");
      return;
    }

    setSelectedSubject(subject);
    setLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc(
        'get_curriculum_tree_with_student_path',
        {
          p_student_id: user.id,
          p_subject: subject,
        }
      );

      if (rpcError) throw rpcError;

      const normalized = Array.isArray(data) ? data : [];

console.log('📦 curriculum tree RPC:', normalized);
      console.log('📦 curriculum tree RPC (raw):', normalized);

// 🔍 ADD THIS EXACTLY HERE
console.log(
  '🧠 curriculum tree STRUCTURE CHECK',
  JSON.stringify(normalized, null, 2)
);

setSubjectProgress(normalized);


      if (onSubjectSelect) {
        onSubjectSelect(subject);
      }
    } catch (err) {
      console.error('Error fetching subject progress:', err);
      setError('Failed to load learning path');
      setSubjectProgress([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
    setSubjectProgress(null);
    setError(null);
  };

  const getSubjectColor = (subject: string) => {
    return SUBJECT_COLORS[subject] || SUBJECT_COLORS["Anatomy"];
  };

  const renderSubjectProgress = () => {
    if (!selectedSubject) return null;

    const subjectColor = getSubjectColor(selectedSubject);

    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#0f172a', '#1e293b', '#0f172a']}
          style={StyleSheet.absoluteFillObject}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with Back Button */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleBackToSubjects}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <ArrowLeft size={20} color={subjectColor.color} />
              <Text style={[styles.backButtonText, { color: subjectColor.color }]}>
                Back to Subjects
              </Text>
            </TouchableOpacity>

          <View style={styles.journeyBadge}>
  <Sparkles size={16} color="#fbbf24" />
  <Text style={styles.journeyBadgeText}>YOUR JOURNEY</Text>
</View>
            <Text style={styles.headerTitle}>{selectedSubject}</Text>
            <Text style={styles.headerSubtitle}>
              Follow your personalized learning path
            </Text>
          </View>

          {/* Loading State */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={subjectColor.color} />
              <Text style={styles.loadingText}>Loading your learning path...</Text>
            </View>
          )}

          {/* Error State */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Subject Progress Flowchart */}
          {!loading && !error && subjectProgress && (
            <View style={styles.flowchartContainer}>
              {/* Vertical Timeline Line (Right Side) */}
              <View style={styles.timelineLineContainer}>
                <LinearGradient
                  colors={[subjectColor.color, subjectColor.lightColor, subjectColor.color]}
                  style={styles.timelineLine}
                />
              </View>

              {/* Start Node */}
              <View style={styles.startNode}>
                <View style={styles.startNodeCircle}>
                  <LinearGradient
                    colors={[subjectColor.color, subjectColor.lightColor]}
                    style={styles.startNodeGradient}
                  >
                    <Sparkles size={20} color="#ffffff" />
                  </LinearGradient>
                </View>
                <View style={styles.startNodeContent}>
                  <Text style={[styles.startNodeText, { color: subjectColor.color }]}>
                    Start Learning {selectedSubject}
                  </Text>
                </View>
                <View style={[styles.connectionLine, { backgroundColor: subjectColor.color }]} />
              </View>

              {/* Textbook Chapters and Topics Flow */}
{subjectProgress
  .filter(tb => Array.isArray(tb.chapters))
  .map((tbChapter, tbIndex) => (

                <View key={tbIndex} style={styles.yearSection}>
                  {/* Textbook Chapter Block (like Year Block) */}
                  <View style={styles.yearBlockWrapper}>
                    <View
                      style={[
                        styles.yearBlock,
                        { backgroundColor: subjectColor.bgColor, borderColor: subjectColor.borderColor },
                      ]}
                    >
                      <LinearGradient
                        colors={[subjectColor.color, subjectColor.lightColor]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.yearBlockAccent}
                      />
                      <View style={styles.yearBlockContent}>
                        <View style={styles.yearBlockHeader}>
                          <View
                            style={[styles.yearIconCircle, { backgroundColor: subjectColor.bgColor }]}
                          >
                            <BookOpen size={20} color={subjectColor.color} />
                          </View>
                          <View style={styles.yearBlockTextContainer}>
                            <Text style={[styles.yearBlockTitle, { color: subjectColor.color }]}>
                              {tbChapter.textbook_chapter}
                            </Text>
                            <Text style={styles.yearBlockSubjects}>
                              {tbChapter.chapters.length} Chapters
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View
                        style={[styles.yearConnectionPoint, { backgroundColor: subjectColor.color }]}
                      />
                    </View>
                    <View style={[styles.horizontalConnector, { backgroundColor: subjectColor.color }]} />
                  </View>

       {/* Chapters and Topics */}
<View style={styles.subjectsContainer}>
  {Array.isArray(tbChapter.chapters) &&
    tbChapter.chapters.map((chapter, chapterIndex) => {
      const topics = Array.isArray(chapter.topics) ? chapter.topics : [];
      const isLastChapter = chapterIndex === tbChapter.chapters.length - 1;
      const allTopicsComplete =
        topics.length > 0 && topics.every(t => t.is_complete);
const chapterAccent = getChapterAccentColor(subjectColor.color, chapterIndex);
      return (
        <View key={chapterIndex} style={styles.chapterSection}>
          {/* Chapter Block */}
          <View style={styles.subjectWrapper}>


  {/* LEFT COLORED STRIP */}
  <View
    style={[
      styles.chapterAccentStrip,
      { backgroundColor: chapterAccent },
    ]}
  />

  {/* MAIN CARD */}
  <View
    style={[
      styles.subjectBlock,
      {
        backgroundColor: allTopicsComplete
          ? subjectColor.bgColor
          : 'rgba(30, 41, 59, 0.4)',
      },
    ]}
  >
  
              <View style={styles.subjectBlockContent}>
                <View
                  style={[
                    styles.subjectDot,
                    {
                      backgroundColor: allTopicsComplete
                        ? subjectColor.color
                        : 'rgba(100, 116, 139, 0.6)',
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.chapterText,
                    {
color: allTopicsComplete
  ? chapterAccent
  : '#CBD5E1',

                    },
                  ]}
                >
                  {chapter.chapter}
                </Text>
                {allTopicsComplete && (
                  <CheckCircle2 size={18} color={subjectColor.color} />
                )}
              </View>
            </View>
          </View>

          {/* Topics */}
          <View style={styles.topicsContainer}>
            {topics.map((topic, topicIndex) => {
              const isComplete = topic.is_complete;
              const isCurrent = topic.is_current;

              return (
                <View key={topicIndex} style={styles.topicWrapper}>
                  <View style={styles.topicBlock}>
                    <View style={styles.topicBlockContent}>
                      {isComplete ? (
                        <CheckCircle2 size={14} color="#10b981" />
                      ) : isCurrent ? (
                        <Circle
                          size={14}
                          fill={subjectColor.color}
                          color={subjectColor.color}
                        />
                      ) : (
                        <Circle size={14} color="#64748b" />
                      )}
                      <Text style={styles.topicText}>
                        {topic.topic}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          {!isLastChapter && (
            <View
              style={[
                styles.chapterConnector,
                { backgroundColor: subjectColor.color, opacity: 0.3 },
              ]}
            />
          )}
        </View>
      );
    })}
</View>


                  {/* Textbook Chapter to Chapter Connector */}
                  {tbIndex < subjectProgress.length - 1 && (
                    <View
                      style={[
                        styles.yearToYearConnector,
                        { backgroundColor: subjectColor.color, opacity: 0.4 },
                      ]}
                    />
                  )}
                </View>
              ))}

              {/* End Node */}
              <View style={styles.endNode}>
                <View style={styles.endNodeCircle}>
                  <LinearGradient
                    colors={['#10b981', '#059669']}
                    style={styles.endNodeGradient}
                  >
                    <Trophy size={24} color="#ffffff" />
                  </LinearGradient>
                </View>
                <View style={styles.endNodeContent}>
                  <Text style={styles.endNodeTitle}>Journey Complete!</Text>
                  <Text style={styles.endNodeSubtitle}>{selectedSubject} Mastered</Text>
                </View>
              </View>
            </View>
          )}

          {/* Empty State */}
          {!loading && !error && subjectProgress && subjectProgress.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No learning path data available yet</Text>
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    );
  };

  // Main render - show either subject overview or subject progress
  if (selectedSubject) {
    return renderSubjectProgress();
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f172a', '#1e293b', '#0f172a']}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.journeyBadge}>
            <Sparkles size={16} color="#fbbf24" />
            <Text style={styles.journeyBadgeText}>YOUR JOURNEY</Text>
          </View>
          <Text style={styles.headerTitle}>MBBS Learning Path</Text>
          <Text style={styles.headerSubtitle}>
            Follow the path through 4 years of medical excellence
          </Text>
        </View>

        {/* Flowchart Container */}
        <View style={styles.flowchartContainer}>
          {/* Vertical Timeline Line (Right Side) */}
          <View style={styles.timelineLineContainer}>
            <LinearGradient
              colors={['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#fbbf24']}
              style={styles.timelineLine}
            />
          </View>

          {/* Start Node */}
          <View style={styles.startNode}>
            <View style={styles.startNodeCircle}>
              <LinearGradient
                colors={['#10b981', '#059669']}
                style={styles.startNodeGradient}
              >
                <Sparkles size={20} color="#ffffff" />
              </LinearGradient>
            </View>
            <View style={styles.startNodeContent}>
              <Text style={styles.startNodeText}>Start Your Journey</Text>
            </View>
            <View style={styles.connectionLine} />
          </View>

          {/* Years and Subjects Flow */}
          {YEARS.map((yearData, yearIndex) => (
            <View key={yearIndex} style={styles.yearSection}>
              {/* Year Block */}
              <View style={styles.yearBlockWrapper}>
                <View
                  style={[
                    styles.yearBlock,
                    { backgroundColor: yearData.bgColor, borderColor: yearData.borderColor },
                  ]}
                >
                  <LinearGradient
                    colors={[yearData.color, yearData.lightColor]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.yearBlockAccent}
                  />
                  <View style={styles.yearBlockContent}>
                    <View style={styles.yearBlockHeader}>
                      <View
                        style={[styles.yearIconCircle, { backgroundColor: yearData.bgColor }]}
                      >
                        {yearIndex === 0 && <BookOpen size={20} color={yearData.color} />}
                        {yearIndex === 1 && <Star size={20} color={yearData.color} />}
                        {yearIndex === 2 && <Award size={20} color={yearData.color} />}
                        {yearIndex === 3 && <Trophy size={20} color={yearData.color} />}
                      </View>
                      <View style={styles.yearBlockTextContainer}>
                        <Text style={[styles.yearBlockTitle, { color: yearData.color }]}>
                          {yearData.year}
                        </Text>
                        <Text style={styles.yearBlockSubjects}>
                          {yearData.subjects.length} Subjects
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View
                    style={[styles.yearConnectionPoint, { backgroundColor: yearData.color }]}
                  />
                </View>
                <View style={[styles.horizontalConnector, { backgroundColor: yearData.color }]} />
              </View>

              {/* Subject Blocks */}
              <View style={styles.subjectsContainer}>
                {yearData.subjects.map((subject, subjectIndex) => {
                  const isLast = subjectIndex === yearData.subjects.length - 1;

                  return (
                    <View key={subjectIndex} style={styles.subjectWrapper}>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => handleSubjectPress(subject)}
                        style={[
                          styles.subjectBlock,
                          {
                            backgroundColor: 'rgba(30, 41, 59, 0.4)',
                            borderColor: 'rgba(51, 65, 85, 0.6)',
                            borderWidth: 1,
                          },
                        ]}
                      >
                        <View style={styles.subjectBlockContent}>
                          <View
                            style={[
                              styles.subjectDot,
                              {
                                backgroundColor: 'rgba(100, 116, 139, 0.6)',
                              },
                            ]}
                          />
                          <Text style={[styles.subjectText, { color: '#94a3b8' }]}>
                            {subject}
                          </Text>
                          <View style={styles.selectedBadge}>
                            <ChevronRight size={16} color="#64748b" />
                          </View>
                        </View>
                        <View
                          style={[
                            styles.subjectConnectionPoint,
                            {
                              backgroundColor: 'rgba(51, 65, 85, 0.8)',
                            },
                          ]}
                        />
                      </TouchableOpacity>
                      {!isLast && (
                        <View
                          style={[
                            styles.subjectConnector,
                            { backgroundColor: yearData.color, opacity: 0.3 },
                          ]}
                        />
                      )}
                      <View
                        style={[
                          styles.horizontalConnectorSmall,
                          { backgroundColor: yearData.color, opacity: 0.5 },
                        ]}
                      />
                    </View>
                  );
                })}
              </View>

              {/* Year to Year Connector */}
              {yearIndex < YEARS.length - 1 && (
                <View
                  style={[
                    styles.yearToYearConnector,
                    { backgroundColor: YEARS[yearIndex + 1].color, opacity: 0.4 },
                  ]}
                />
              )}
            </View>
          ))}

          {/* End Node */}
          <View style={styles.endNode}>
            <View style={styles.endNodeCircle}>
              <LinearGradient
                colors={['#f59e0b', '#d97706']}
                style={styles.endNodeGradient}
              >
                <Trophy size={24} color="#ffffff" />
              </LinearGradient>
            </View>
            <View style={styles.endNodeContent}>
              <Text style={styles.endNodeTitle}>Journey Complete!</Text>
              <Text style={styles.endNodeSubtitle}>MBBS Mastery Achieved</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingTop: 24,
    paddingBottom: 40,
  },

  // HEADER
  header: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },

  journeyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(251, 191, 36, 0.4)',
    marginBottom: 16,
  },

  journeyBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#fbbf24',
    marginLeft: 6,
    letterSpacing: 1.5,
  },

 headerTitle: {
  fontSize: 32,
  fontWeight: '900',
  color: '#F5E6C8', // 🔥 Image-2 font color
  marginBottom: 8,
  letterSpacing: -0.5,

  // subtle premium glow
  textShadowColor: 'rgba(245, 230, 200, 0.35)',
  textShadowOffset: { width: 0, height: 2 },
  textShadowRadius: 6,
},


headerSubtitle: {
  fontSize: 15,
  color: '#C7B89A', // muted gold-gray
  lineHeight: 22,
},


  // BACK BUTTON
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },

  backButtonText: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
    letterSpacing: 0.2,
  },

  // LOADING & ERROR
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },

  loadingText: {
    fontSize: 15,
    color: '#94a3b8',
    marginTop: 16,
  },

  errorContainer: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },

  errorText: {
    fontSize: 15,
    color: '#ef4444',
    textAlign: 'center',
  },

  emptyContainer: {
    paddingHorizontal: 24,
    paddingVertical: 60,
  },

  emptyText: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
  },

  // FLOWCHART
  flowchartContainer: {
    paddingLeft: 24,
    paddingRight: 80,
    position: 'relative',
  },

  // TIMELINE LINE (RIGHT SIDE)
  timelineLineContainer: {
    position: 'absolute',
    right: 32,
    top: 0,
    bottom: 0,
    width: 4,
    zIndex: 0,
  },

  timelineLine: {
    flex: 1,
    borderRadius: 2,
  },

  // START NODE
  startNode: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },

  startNodeCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },

  startNodeGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  startNodeContent: {
    marginLeft: 16,
    flex: 1,
  },

  startNodeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10b981',
    letterSpacing: 0.5,
  },

  connectionLine: {
    position: 'absolute',
    right: -48,
    width: 32,
    height: 2,
    backgroundColor: '#10b981',
    opacity: 0.5,
  },

  // YEAR SECTION
  yearSection: {
    marginBottom: 24,
  },

  yearBlockWrapper: {
    position: 'relative',
    marginBottom: 16,
  },

  yearBlock: {
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
    position: 'relative',
  },

  yearBlockAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },

  yearBlockContent: {
    padding: 16,
    paddingLeft: 20,
  },

  yearBlockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  yearIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },

  yearBlockTextContainer: {
    marginLeft: 14,
    flex: 1,
  },

 yearBlockTitle: {
  fontSize: 20,
  fontWeight: '800',
  color: '#F5E6C8', // same hero tone
  marginBottom: 2,
  letterSpacing: -0.3,

  textShadowColor: 'rgba(245, 230, 200, 0.25)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 4,
},


  yearBlockSubjects: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },

  yearConnectionPoint: {
    position: 'absolute',
    right: -12,
    top: '50%',
    marginTop: -6,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 3,
    borderColor: '#0f172a',
    zIndex: 2,
  },

  horizontalConnector: {
    position: 'absolute',
    right: -48,
    top: '50%',
    marginTop: -1,
    width: 36,
    height: 2,
    zIndex: 1,
  },

  // SUBJECTS
  subjectsContainer: {
    paddingLeft: 32,
  },

  subjectWrapper: {
    position: 'relative',
  },

  subjectBlock: {
    borderRadius: 12,
    marginBottom: 2,
    position: 'relative',
    overflow: 'hidden',
  },

  subjectBlockAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },

  subjectBlockContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    paddingLeft: 16,
  },

  subjectDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },

  subjectText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  chapterText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  selectedBadge: {
    marginLeft: 8,
  },

  subjectConnectionPoint: {
    position: 'absolute',
    right: -8,
    top: '50%',
    marginTop: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#0f172a',
    zIndex: 2,
  },

  subjectConnector: {
    position: 'absolute',
    right: -8,
    top: '50%',
    width: 2,
    height: '100%',
    zIndex: 0,
  },

  horizontalConnectorSmall: {
    position: 'absolute',
    right: -48,
    top: '50%',
    marginTop: -0.5,
    width: 40,
    height: 1,
    zIndex: 1,
  },

  yearToYearConnector: {
    width: 2,
    height: 24,
    marginLeft: 21,
    marginVertical: 8,
  },

  // CHAPTER SECTION (for subject progress view)
  chapterSection: {
    marginBottom: 8,
  },

  chapterConnector: {
    width: 2,
    height: 16,
    marginLeft: 4,
    marginVertical: 4,
  },

  // TOPICS (nested under chapters in subject progress view)
  topicsContainer: {
    paddingLeft: 32,
    marginTop: 4,
    marginBottom: 8,
  },

  topicWrapper: {
    position: 'relative',
  },

  topicBlock: {
    borderRadius: 10,
    marginBottom: 2,
    position: 'relative',
    overflow: 'hidden',
  },

  topicBlockAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 2,
  },

  topicBlockContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingLeft: 12,
  },

  topicText: {
  flex: 1,
  fontSize: 13,
  fontWeight: '600',
  marginLeft: 10,
  letterSpacing: 0.2,

  // 🔥 FIX: high-contrast readable color
  color: '#E5E7EB', // light gray (Tailwind gray-200)

  // subtle lift on dark background
  textShadowColor: 'rgba(0,0,0,0.4)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 2,
},


  topicConnectionPoint: {
    position: 'absolute',
    right: -6,
    top: '50%',
    marginTop: -3,
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: '#0f172a',
    zIndex: 2,
  },

  topicConnector: {
    position: 'absolute',
    right: -6,
    top: '50%',
    width: 1.5,
    height: '100%',
    zIndex: 0,
  },

  horizontalConnectorTiny: {
    position: 'absolute',
    right: -48,
    top: '50%',
    marginTop: -0.5,
    width: 42,
    height: 0.5,
    zIndex: 1,
  },

  // END NODE
  endNode: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    paddingRight: 48,
  },

  endNodeCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },

  endNodeGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  endNodeContent: {
    marginLeft: 16,
    flex: 1,
  },

  endNodeTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 4,
    letterSpacing: -0.3,
  },

  endNodeSubtitle: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },

bottomSpacer: {
  height: 40,
},

chapterCardWrapper: {
  position: 'relative',
  flexDirection: 'row',
  alignItems: 'stretch',
},

chapterAccentStrip: {
  width: 5,
  borderTopLeftRadius: 12,
  borderBottomLeftRadius: 12,
},

});
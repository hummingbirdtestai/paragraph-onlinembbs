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
import { BookOpen, Award, Star, Trophy, Sparkles, ChevronRight, ArrowLeft, CheckCircle2, Circle, Zap } from 'lucide-react-native';
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
  "Anatomy": { color: "#3b82f6", lightColor: "#60a5fa", bgColor: "rgba(59, 130, 246, 0.12)", borderColor: "rgba(59, 130, 246, 0.4)" },
  "Physiology": { color: "#06b6d4", lightColor: "#22d3ee", bgColor: "rgba(6, 182, 212, 0.12)", borderColor: "rgba(6, 182, 212, 0.4)" },
  "Biochemistry": { color: "#8b5cf6", lightColor: "#a78bfa", bgColor: "rgba(139, 92, 246, 0.12)", borderColor: "rgba(139, 92, 246, 0.4)" },
  "Pathology": { color: "#ec4899", lightColor: "#f472b6", bgColor: "rgba(236, 72, 153, 0.12)", borderColor: "rgba(236, 72, 153, 0.4)" },
  "Pharmacology": { color: "#f59e0b", lightColor: "#fbbf24", bgColor: "rgba(245, 158, 11, 0.12)", borderColor: "rgba(245, 158, 11, 0.4)" },
  "Microbiology": { color: "#10b981", lightColor: "#34d399", bgColor: "rgba(16, 185, 129, 0.12)", borderColor: "rgba(16, 185, 129, 0.4)" },
  "Forensic Medicine": { color: "#6366f1", lightColor: "#818cf8", bgColor: "rgba(99, 102, 241, 0.12)", borderColor: "rgba(99, 102, 241, 0.4)" },
  "Community Medicine": { color: "#14b8a6", lightColor: "#2dd4bf", bgColor: "rgba(20, 184, 166, 0.12)", borderColor: "rgba(20, 184, 166, 0.4)" },
  "General Medicine": { color: "#ef4444", lightColor: "#f87171", bgColor: "rgba(239, 68, 68, 0.12)", borderColor: "rgba(239, 68, 68, 0.4)" },
  "Pediatrics": { color: "#8b5cf6", lightColor: "#a78bfa", bgColor: "rgba(139, 92, 246, 0.12)", borderColor: "rgba(139, 92, 246, 0.4)" },
  "Psychiatry": { color: "#06b6d4", lightColor: "#22d3ee", bgColor: "rgba(6, 182, 212, 0.12)", borderColor: "rgba(6, 182, 212, 0.4)" },
  "Radiodiagnosis": { color: "#ec4899", lightColor: "#f472b6", bgColor: "rgba(236, 72, 153, 0.12)", borderColor: "rgba(236, 72, 153, 0.4)" },
  "Radiotherapy": { color: "#f59e0b", lightColor: "#fbbf24", bgColor: "rgba(245, 158, 11, 0.12)", borderColor: "rgba(245, 158, 11, 0.4)" },
  "Dermatology": { color: "#10b981", lightColor: "#34d399", bgColor: "rgba(16, 185, 129, 0.12)", borderColor: "rgba(16, 185, 129, 0.4)" },
  "Gynecology": { color: "#ec4899", lightColor: "#f472b6", bgColor: "rgba(236, 72, 153, 0.12)", borderColor: "rgba(236, 72, 153, 0.4)" },
  "Obstetrics": { color: "#f472b6", lightColor: "#fbcfe8", bgColor: "rgba(244, 114, 182, 0.12)", borderColor: "rgba(244, 114, 182, 0.4)" },
  "General Surgery": { color: "#ef4444", lightColor: "#f87171", bgColor: "rgba(239, 68, 68, 0.12)", borderColor: "rgba(239, 68, 68, 0.4)" },
  "Anaesthesiology": { color: "#6366f1", lightColor: "#818cf8", bgColor: "rgba(99, 102, 241, 0.12)", borderColor: "rgba(99, 102, 241, 0.4)" },
  "Orthopaedics": { color: "#f59e0b", lightColor: "#fbbf24", bgColor: "rgba(245, 158, 11, 0.12)", borderColor: "rgba(245, 158, 11, 0.4)" },
  "ENT": { color: "#14b8a6", lightColor: "#2dd4bf", bgColor: "rgba(20, 184, 166, 0.12)", borderColor: "rgba(20, 184, 166, 0.4)" },
  "Ophthalmology": { color: "#3b82f6", lightColor: "#60a5fa", bgColor: "rgba(59, 130, 246, 0.12)", borderColor: "rgba(59, 130, 246, 0.4)" },
};

const CHAPTER_COLORS = [
  { color: "#3b82f6", lightColor: "#60a5fa", glowColor: "rgba(59, 130, 246, 0.6)" },
  { color: "#8b5cf6", lightColor: "#a78bfa", glowColor: "rgba(139, 92, 246, 0.6)" },
  { color: "#ec4899", lightColor: "#f472b6", glowColor: "rgba(236, 72, 153, 0.6)" },
  { color: "#f59e0b", lightColor: "#fbbf24", glowColor: "rgba(245, 158, 11, 0.6)" },
  { color: "#10b981", lightColor: "#34d399", glowColor: "rgba(16, 185, 129, 0.6)" },
  { color: "#06b6d4", lightColor: "#22d3ee", glowColor: "rgba(6, 182, 212, 0.6)" },
  { color: "#6366f1", lightColor: "#818cf8", glowColor: "rgba(99, 102, 241, 0.6)" },
  { color: "#ef4444", lightColor: "#f87171", glowColor: "rgba(239, 68, 68, 0.6)" },
  { color: "#14b8a6", lightColor: "#2dd4bf", glowColor: "rgba(20, 184, 166, 0.6)" },
  { color: "#f97316", lightColor: "#fb923c", glowColor: "rgba(249, 115, 22, 0.6)" },
];

const TOPIC_COLORS = [
  { color: "#60a5fa", lightColor: "#93c5fd", glowColor: "rgba(96, 165, 250, 0.8)", bgColor: "rgba(96, 165, 250, 0.15)" },
  { color: "#a78bfa", lightColor: "#c4b5fd", glowColor: "rgba(167, 139, 250, 0.8)", bgColor: "rgba(167, 139, 250, 0.15)" },
  { color: "#f472b6", lightColor: "#f9a8d4", glowColor: "rgba(244, 114, 182, 0.8)", bgColor: "rgba(244, 114, 182, 0.15)" },
  { color: "#fbbf24", lightColor: "#fcd34d", glowColor: "rgba(251, 191, 36, 0.8)", bgColor: "rgba(251, 191, 36, 0.15)" },
  { color: "#34d399", lightColor: "#6ee7b7", glowColor: "rgba(52, 211, 153, 0.8)", bgColor: "rgba(52, 211, 153, 0.15)" },
  { color: "#22d3ee", lightColor: "#67e8f9", glowColor: "rgba(34, 211, 238, 0.8)", bgColor: "rgba(34, 211, 238, 0.15)" },
  { color: "#818cf8", lightColor: "#a5b4fc", glowColor: "rgba(129, 140, 248, 0.8)", bgColor: "rgba(129, 140, 248, 0.15)" },
  { color: "#fb923c", lightColor: "#fdba74", glowColor: "rgba(251, 146, 60, 0.8)", bgColor: "rgba(251, 146, 60, 0.15)" },
  { color: "#2dd4bf", lightColor: "#5eead4", glowColor: "rgba(45, 212, 191, 0.8)", bgColor: "rgba(45, 212, 191, 0.15)" },
  { color: "#f87171", lightColor: "#fca5a5", glowColor: "rgba(248, 113, 113, 0.8)", bgColor: "rgba(248, 113, 113, 0.15)" },
];

interface LearningPathProps {
  onSubjectSelect?: (subject: string) => void;
}

interface TopicItem {
  topic: string;
  is_complete: boolean;
  is_current: boolean;
}

interface ChapterItem {
  chapter: string;
  topics: TopicItem[];
}

interface GroupedProgress {
  textbook_chapter: string;
  chapters: ChapterItem[];
}

export default function CBMELearningPath({ onSubjectSelect }: LearningPathProps) {
  const { user } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [subjectProgress, setSubjectProgress] = useState<GroupedProgress[] | null>(null);
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
      const { data, error: rpcError } = await supabase.rpc('get_curriculum_tree_with_student_path', {
        p_student_id: user.id,
        p_subject: subject
      });

      if (rpcError) throw rpcError;

      const normalized = Array.isArray(data) ? data : [];
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

  const getChapterColor = (index: number) => {
    return CHAPTER_COLORS[index % CHAPTER_COLORS.length];
  };

  const getTopicColor = (index: number) => {
    return TOPIC_COLORS[index % TOPIC_COLORS.length];
  };

  const renderSubjectProgress = () => {
    if (!selectedSubject) return null;

    const subjectColor = getSubjectColor(selectedSubject);

    let chapterGlobalIndex = 0;

    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#0a0f1e', '#0f172a', '#1e1b4b', '#0f172a']}
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

            <View style={[styles.journeyBadge, { backgroundColor: subjectColor.bgColor, borderColor: subjectColor.borderColor }]}>
              <Sparkles size={16} color={subjectColor.color} />
              <Text style={[styles.journeyBadgeText, { color: subjectColor.color }]}>YOUR JOURNEY</Text>
            </View>
            <Text style={styles.headerTitle}>{selectedSubject}</Text>
            <Text style={styles.headerSubtitle}>
              Follow your personalized learning path through vibrant chapters
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
              {/* Vertical Timeline Line (Right Side) - Multicolor */}
              <View style={styles.timelineLineContainer}>
                <LinearGradient
                  colors={CHAPTER_COLORS.map(c => c.color)}
                  style={styles.timelineLine}
                />
              </View>

              {/* Start Node */}
              <View style={styles.startNode}>
                <View style={[styles.startNodeCircle, { shadowColor: subjectColor.color }]}>
                  <LinearGradient
                    colors={[subjectColor.color, subjectColor.lightColor]}
                    style={styles.startNodeGradient}
                  >
                    <Sparkles size={20} color="#ffffff" />
                  </LinearGradient>
                </View>
                <View style={styles.startNodeContent}>
                  <Text style={[styles.startNodeText, { color: subjectColor.lightColor }]}>
                    Start Learning {selectedSubject}
                  </Text>
                </View>
                <View style={[styles.connectionLine, { backgroundColor: subjectColor.color }]} />
              </View>

              {/* Textbook Chapters and Topics Flow */}
              {subjectProgress.map((tbChapter, tbIndex) => (
                <View key={tbIndex} style={styles.yearSection}>
                  {/* Textbook Chapter Block (like Year Block) */}
                  <View style={styles.yearBlockWrapper}>
                    <View
                      style={[
                        styles.yearBlock,
                        { 
                          backgroundColor: subjectColor.bgColor, 
                          borderColor: subjectColor.borderColor,
                          shadowColor: subjectColor.color,
                          shadowOffset: { width: 0, height: 8 },
                          shadowOpacity: 0.3,
                          shadowRadius: 16,
                          elevation: 8,
                        },
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
                            style={[
                              styles.yearIconCircle, 
                              { 
                                backgroundColor: subjectColor.bgColor,
                                borderWidth: 2,
                                borderColor: subjectColor.borderColor,
                              }
                            ]}
                          >
                            <BookOpen size={22} color={subjectColor.lightColor} strokeWidth={2.5} />
                          </View>
                          <View style={styles.yearBlockTextContainer}>
                            <Text style={[styles.yearBlockTitle, { color: subjectColor.lightColor }]}>
                              {tbChapter.textbook_chapter}
                            </Text>
                            <Text style={styles.yearBlockSubjects}>
                              {tbChapter.chapters.length} Chapters
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View
                        style={[
                          styles.yearConnectionPoint, 
                          { 
                            backgroundColor: subjectColor.lightColor,
                            shadowColor: subjectColor.color,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.6,
                            shadowRadius: 8,
                            elevation: 6,
                          }
                        ]}
                      />
                    </View>
                    <View style={[styles.horizontalConnector, { backgroundColor: subjectColor.lightColor }]} />
                  </View>

                  {/* Chapters and Topics */}
                  <View style={styles.subjectsContainer}>
                    {tbChapter.chapters.map((chapter, chapterIndex) => {
                      const chapterColor = getChapterColor(chapterGlobalIndex);
                      const isLastChapter = chapterIndex === tbChapter.chapters.length - 1;
                      const allTopicsComplete = chapter.topics.every(t => t.is_complete);
                      const firstIncomplete = chapter.topics.findIndex(t => !t.is_complete);
                      const isCurrent = firstIncomplete >= 0;
                      
                      const currentChapterIndex = chapterGlobalIndex;
                      chapterGlobalIndex++;

                      return (
                        <View key={chapterIndex} style={styles.chapterSection}>
                          {/* Chapter Block */}
                          <View style={styles.subjectWrapper}>
                            <View
                              style={[
                                styles.chapterBlock,
                                {
                                  backgroundColor: allTopicsComplete
                                    ? `${chapterColor.color}20`
                                    : 'rgba(30, 41, 59, 0.5)',
                                  borderColor: allTopicsComplete || isCurrent
                                    ? chapterColor.color
                                    : 'rgba(71, 85, 105, 0.6)',
                                  borderWidth: 2,
                                  shadowColor: chapterColor.color,
                                  shadowOffset: { width: 0, height: 4 },
                                  shadowOpacity: allTopicsComplete || isCurrent ? 0.4 : 0.1,
                                  shadowRadius: 12,
                                  elevation: allTopicsComplete || isCurrent ? 6 : 2,
                                },
                              ]}
                            >
                              {(allTopicsComplete || isCurrent) && (
                                <LinearGradient
                                  colors={[chapterColor.color, chapterColor.lightColor]}
                                  start={{ x: 0, y: 0 }}
                                  end={{ x: 1, y: 1 }}
                                  style={styles.chapterBlockAccent}
                                />
                              )}
                              <View style={styles.chapterBlockContent}>
                                <View
                                  style={[
                                    styles.chapterIconDot,
                                    {
                                      backgroundColor: allTopicsComplete || isCurrent
                                        ? chapterColor.lightColor
                                        : 'rgba(100, 116, 139, 0.6)',
                                      shadowColor: chapterColor.color,
                                      shadowOffset: { width: 0, height: 2 },
                                      shadowOpacity: allTopicsComplete || isCurrent ? 0.6 : 0,
                                      shadowRadius: 6,
                                      elevation: 3,
                                    },
                                  ]}
                                />
                                <Text
                                  style={[
                                    styles.chapterText,
                                    { 
                                      color: allTopicsComplete || isCurrent 
                                        ? chapterColor.lightColor 
                                        : '#94a3b8' 
                                    },
                                  ]}
                                >
                                  {chapter.chapter}
                                </Text>
                                {allTopicsComplete && (
                                  <CheckCircle2 size={20} color={chapterColor.lightColor} strokeWidth={2.5} />
                                )}
                              </View>
                              <View
                                style={[
                                  styles.chapterConnectionPoint,
                                  {
                                    backgroundColor: allTopicsComplete || isCurrent
                                      ? chapterColor.lightColor
                                      : 'rgba(71, 85, 105, 0.8)',
                                    shadowColor: chapterColor.color,
                                    shadowOffset: { width: 0, height: 3 },
                                    shadowOpacity: 0.5,
                                    shadowRadius: 6,
                                    elevation: 4,
                                  },
                                ]}
                              />
                            </View>
                            <View
                              style={[
                                styles.horizontalConnectorChapter,
                                { 
                                  backgroundColor: chapterColor.lightColor,
                                  opacity: allTopicsComplete || isCurrent ? 0.7 : 0.3,
                                },
                              ]}
                            />
                          </View>

                          {/* Topics (nested) - TAB STYLE WITH GLOWING SHADOWS */}
                          <View style={styles.topicsContainer}>
                            {chapter.topics.map((topic, topicIndex) => {
                              const topicColor = getTopicColor(topicIndex);
                              const isComplete = topic.is_complete;
                              const isCurrentTopic = topic.is_current;
                              const isLastTopic = topicIndex === chapter.topics.length - 1;
                              const isFuture = !isComplete && !isCurrentTopic;

                              return (
                                <View key={topicIndex} style={styles.topicWrapper}>
                                  <TouchableOpacity
                                    activeOpacity={0.8}
                                    style={[
                                      styles.topicTab,
                                      {
                                        backgroundColor: isComplete
                                          ? 'rgba(16, 185, 129, 0.2)'
                                          : isCurrentTopic
                                          ? topicColor.bgColor
                                          : 'rgba(30, 41, 59, 0.4)',
                                        borderColor: isComplete
                                          ? '#10b981'
                                          : isCurrentTopic
                                          ? topicColor.color
                                          : 'rgba(71, 85, 105, 0.5)',
                                        borderWidth: isCurrentTopic || isComplete ? 2.5 : 1.5,
                                        shadowColor: isComplete
                                          ? '#10b981'
                                          : isCurrentTopic
                                          ? topicColor.glowColor
                                          : 'transparent',
                                        shadowOffset: { width: 0, height: 6 },
                                        shadowOpacity: isComplete || isCurrentTopic ? 0.8 : 0,
                                        shadowRadius: 15,
                                        elevation: isComplete || isCurrentTopic ? 8 : 1,
                                        opacity: isFuture ? 0.5 : 1,
                                      },
                                    ]}
                                  >
                                    {isCurrentTopic && (
                                      <LinearGradient
                                        colors={[topicColor.color, topicColor.lightColor]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.topicTabGlow}
                                      />
                                    )}
                                    <View style={styles.topicTabContent}>
                                      <View style={styles.topicIconContainer}>
                                        {isComplete ? (
                                          <CheckCircle2 size={18} color="#10b981" strokeWidth={3} />
                                        ) : isCurrentTopic ? (
                                          <Zap size={18} color={topicColor.color} fill={topicColor.color} strokeWidth={2.5} />
                                        ) : (
                                          <Circle size={16} color="rgba(100, 116, 139, 0.6)" strokeWidth={2} />
                                        )}
                                      </View>
                                      <Text
                                        style={[
                                          styles.topicTabText,
                                          {
                                            color: isComplete
                                              ? '#34d399'
                                              : isCurrentTopic
                                              ? topicColor.color
                                              : '#64748b',
                                            fontWeight: isComplete || isCurrentTopic ? '800' : '600',
                                          },
                                        ]}
                                      >
                                        {topic.topic}
                                      </Text>
                                      {isCurrentTopic && (
                                        <View style={[styles.currentBadge, { backgroundColor: topicColor.color }]}>
                                          <Text style={styles.currentBadgeText}>ACTIVE</Text>
                                        </View>
                                      )}
                                    </View>
                                    <View
                                      style={[
                                        styles.topicConnectionPoint,
                                        {
                                          backgroundColor: isComplete
                                            ? '#10b981'
                                            : isCurrentTopic
                                            ? topicColor.color
                                            : 'rgba(71, 85, 105, 0.6)',
                                          shadowColor: isComplete
                                            ? '#10b981'
                                            : topicColor.color,
                                          shadowOffset: { width: 0, height: 2 },
                                          shadowOpacity: isComplete || isCurrentTopic ? 0.7 : 0,
                                          shadowRadius: 8,
                                          elevation: 5,
                                        },
                                      ]}
                                    />
                                  </TouchableOpacity>
                                  {!isLastTopic && (
                                    <View
                                      style={[
                                        styles.topicConnector,
                                        {
                                          backgroundColor: isComplete
                                            ? '#10b981'
                                            : chapterColor.color,
                                          opacity: 0.4,
                                        },
                                      ]}
                                    />
                                  )}
                                  <View
                                    style={[
                                      styles.horizontalConnectorTopic,
                                      {
                                        backgroundColor: isComplete
                                          ? '#34d399'
                                          : isCurrentTopic
                                          ? topicColor.color
                                          : chapterColor.color,
                                        opacity: isComplete || isCurrentTopic ? 0.6 : 0.3,
                                      },
                                    ]}
                                  />
                                </View>
                              );
                            })}
                          </View>

                          {!isLastChapter && (
                            <View
                              style={[
                                styles.chapterConnector,
                                { 
                                  backgroundColor: chapterColor.lightColor, 
                                  opacity: 0.4,
                                },
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
                        { backgroundColor: subjectColor.lightColor, opacity: 0.5 },
                      ]}
                    />
                  )}
                </View>
              ))}

              {/* End Node */}
              <View style={styles.endNode}>
                <View style={[styles.endNodeCircle, { shadowColor: '#10b981' }]}>
                  <LinearGradient
                    colors={['#10b981', '#34d399', '#059669']}
                    style={styles.endNodeGradient}
                  >
                    <Trophy size={28} color="#ffffff" strokeWidth={2.5} />
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
        colors={['#0a0f1e', '#0f172a', '#1e1b4b', '#0f172a']}
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
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: -0.5,
  },

  headerSubtitle: {
    fontSize: 15,
    color: '#94a3b8',
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
    width: 5,
    zIndex: 0,
  },

  timelineLine: {
    flex: 1,
    borderRadius: 3,
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
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
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
    opacity: 0.6,
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
    width: 5,
  },

  yearBlockContent: {
    padding: 16,
    paddingLeft: 22,
  },

  yearBlockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  yearIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    marginBottom: 2,
    letterSpacing: -0.3,
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

  // CHAPTER SECTION (Enhanced with different colors per chapter)
  chapterSection: {
    marginBottom: 12,
  },

  chapterBlock: {
    borderRadius: 14,
    marginBottom: 4,
    position: 'relative',
    overflow: 'hidden',
  },

  chapterBlockAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },

  chapterBlockContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingLeft: 18,
  },

  chapterIconDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 14,
  },

  chapterText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  chapterConnectionPoint: {
    position: 'absolute',
    right: -10,
    top: '50%',
    marginTop: -5,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2.5,
    borderColor: '#0f172a',
    zIndex: 2,
  },

  horizontalConnectorChapter: {
    position: 'absolute',
    right: -48,
    top: '50%',
    marginTop: -1,
    width: 38,
    height: 2,
    zIndex: 1,
  },

  chapterConnector: {
    width: 2.5,
    height: 20,
    marginLeft: 6,
    marginVertical: 6,
  },

  // TOPICS (TAB STYLE WITH GLOWING SHADOWS)
  topicsContainer: {
    paddingLeft: 40,
    marginTop: 8,
    marginBottom: 8,
  },

  topicWrapper: {
    position: 'relative',
    marginBottom: 6,
  },

  topicTab: {
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
  },

  topicTabGlow: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },

  topicTabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    paddingLeft: 18,
  },

  topicIconContainer: {
    marginRight: 12,
  },

  topicTabText: {
    flex: 1,
    fontSize: 14,
    letterSpacing: 0.3,
  },

  currentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 8,
  },

  currentBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1,
  },

  topicConnectionPoint: {
    position: 'absolute',
    right: -7,
    top: '50%',
    marginTop: -3.5,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    borderWidth: 2,
    borderColor: '#0f172a',
    zIndex: 2,
  },

  topicConnector: {
    position: 'absolute',
    right: -7,
    top: '50%',
    width: 2,
    height: '100%',
    zIndex: 0,
  },

  horizontalConnectorTopic: {
    position: 'absolute',
    right: -48,
    top: '50%',
    marginTop: -0.5,
    width: 41,
    height: 1.5,
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
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 10,
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
});

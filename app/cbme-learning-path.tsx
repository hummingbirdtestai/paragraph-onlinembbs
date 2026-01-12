

// app/cbme-learning-path.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, Award, Star, Trophy, Sparkles, ChevronRight } from 'lucide-react-native';
import MainLayout from "@/components/MainLayout";

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

interface LearningPathProps {
  onSubjectSelect?: (subject: string) => void;
}

export default function CBMELearningPath({ onSubjectSelect }: LearningPathProps) {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const handleSubjectPress = (subject: string) => {
    setSelectedSubject(subject);
    if (onSubjectSelect) {
      onSubjectSelect(subject);
    }
  };

  return (
    <MainLayout>
    <View style={styles.container}>
      {/* Background Gradient */}
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
                  {/* Connection Point */}
                  <View
                    style={[styles.yearConnectionPoint, { backgroundColor: yearData.color }]}
                  />
                </View>
                <View style={[styles.horizontalConnector, { backgroundColor: yearData.color }]} />
              </View>

              {/* Subject Blocks */}
              <View style={styles.subjectsContainer}>
                {yearData.subjects.map((subject, subjectIndex) => {
                  const isSelected = selectedSubject === subject;
                  const isLast = subjectIndex === yearData.subjects.length - 1;

                  return (
                    <View key={subjectIndex} style={styles.subjectWrapper}>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => handleSubjectPress(subject)}
                        style={[
                          styles.subjectBlock,
                          {
                            backgroundColor: isSelected
                              ? yearData.bgColor
                              : 'rgba(30, 41, 59, 0.4)',
                            borderColor: isSelected
                              ? yearData.borderColor
                              : 'rgba(51, 65, 85, 0.6)',
                            borderWidth: isSelected ? 2 : 1,
                          },
                        ]}
                      >
                        {isSelected && (
                          <LinearGradient
                            colors={[yearData.color, yearData.lightColor]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.subjectBlockAccent}
                          />
                        )}
                        <View style={styles.subjectBlockContent}>
                          <View
                            style={[
                              styles.subjectDot,
                              {
                                backgroundColor: isSelected
                                  ? yearData.color
                                  : 'rgba(100, 116, 139, 0.6)',
                              },
                            ]}
                          />
                          <Text
                            style={[
                              styles.subjectText,
                              { color: isSelected ? yearData.color : '#94a3b8' },
                            ]}
                          >
                            {subject}
                          </Text>
                          {isSelected && (
                            <View style={styles.selectedBadge}>
                              <ChevronRight size={16} color={yearData.color} />
                            </View>
                          )}
                        </View>
                        {/* Connection Point */}
                        <View
                          style={[
                            styles.subjectConnectionPoint,
                            {
                              backgroundColor: isSelected
                                ? yearData.color
                                : 'rgba(51, 65, 85, 0.8)',
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

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
      </MainLayout>
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
});
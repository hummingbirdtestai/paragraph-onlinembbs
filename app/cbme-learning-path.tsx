// app/cbme-learning-path.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import MainLayout from "@/components/MainLayout";
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { BookOpen, Award, Star, MapPin, Trophy, Sparkles } from 'lucide-react-native';



const { width: SCREEN_WIDTH } = Dimensions.get('window');

const YEARS = [
  {
    year: "First Year",
    yearFull: "MBBS First Year",
    subjects: ["Anatomy", "Physiology", "Biochemistry"],
    color: "#3b82f6",
    darkColor: "#1e40af",
    icon: "book",
    milestone: "Foundation",
  },
  {
    year: "Second Year",
    yearFull: "MBBS Second Year",
    subjects: ["Pathology", "Pharmacology", "Microbiology"],
    color: "#8b5cf6",
    darkColor: "#5b21b6",
    icon: "lab",
    milestone: "Core Sciences",
  },
  {
    year: "Third Year",
    yearFull: "MBBS Third Year",
    subjects: ["Forensic Medicine", "Community Medicine"],
    color: "#ec4899",
    darkColor: "#9f1239",
    icon: "research",
    milestone: "Clinical Foundation",
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
    darkColor: "#047857",
    icon: "trophy",
    milestone: "Clinical Mastery",
  },
];

interface LearningPathProps {
  onSubjectSelect?: (subject: string) => void;
}

export default function CBMELearningPath({ onSubjectSelect }: LearningPathProps) {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [expandedYear, setExpandedYear] = useState<number | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSubjectPress = (subject: string) => {
    setSelectedSubject(subject);
    if (onSubjectSelect) {
      onSubjectSelect(subject);
    }
  };

  const toggleYear = (index: number) => {
    setExpandedYear(expandedYear === index ? null : index);
  };

  return (
      <MainLayout>
    <View style={styles.container}>
      {/* Animated Background */}
      <LinearGradient
        colors={['#0f172a', '#1e293b', '#0f172a']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Floating Stars Background */}
      <View style={styles.starsContainer}>
        {[...Array(20)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.star,
              {
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.2,
              },
            ]}
          />
        ))}
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerBadge}>
            <Sparkles size={16} color="#fbbf24" />
            <Text style={styles.headerBadgeText}>Your Journey</Text>
          </View>
          <Text style={styles.headerTitle}>MBBS Learning Path</Text>
          <Text style={styles.headerSubtitle}>
            Navigate through 4 years of medical excellence
          </Text>

          {/* Progress Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <BookOpen size={20} color="#3b82f6" />
              <Text style={styles.statNumber}>4.5</Text>
              <Text style={styles.statLabel}>Years</Text>
            </View>
            <View style={styles.statCard}>
              <Star size={20} color="#fbbf24" />
              <Text style={styles.statNumber}>21</Text>
              <Text style={styles.statLabel}>Subjects</Text>
            </View>
            <View style={styles.statCard}>
              <Trophy size={20} color="#10b981" />
              <Text style={styles.statNumber}>0%</Text>
              <Text style={styles.statLabel}>Complete</Text>
            </View>
          </View>
        </View>

        {/* Journey Start Marker */}
        <View style={styles.startMarker}>
          <LinearGradient
            colors={['#10b981', '#059669']}
            style={styles.startMarkerGradient}
          >
            <MapPin size={24} color="#ffffff" />
          </LinearGradient>
          <View style={styles.startMarkerLine} />
          <Text style={styles.startMarkerText}>Journey Begins</Text>
        </View>

        {/* Years Timeline */}
        <View style={styles.timeline}>
          {YEARS.map((yearData, yearIndex) => {
            const isExpanded = expandedYear === yearIndex;
            const isLeft = yearIndex % 2 === 0;

            return (
              <View key={yearIndex} style={styles.yearContainer}>
                {/* Connecting Path */}
                <View style={[styles.pathConnector, isLeft ? styles.pathLeft : styles.pathRight]}>
                  <View style={styles.pathDots}>
                    {[...Array(8)].map((_, i) => (
                      <View key={i} style={styles.pathDot} />
                    ))}
                  </View>
                </View>

                {/* Year Milestone Card */}
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => toggleYear(yearIndex)}
                  style={[
                    styles.milestoneCard,
                    isLeft ? styles.milestoneLeft : styles.milestoneRight,
                  ]}
                >
                  <LinearGradient
                    colors={[yearData.color, yearData.darkColor]}
                    style={styles.milestoneGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {/* Year Badge */}
                    <View style={styles.yearBadgeContainer}>
                      <View style={styles.yearBadge}>
                        <Text style={styles.yearBadgeText}>Year {yearIndex + 1}</Text>
                      </View>
                      <View style={styles.milestoneIconContainer}>
                        {yearIndex === 0 && <BookOpen size={28} color="#ffffff" />}
                        {yearIndex === 1 && <Star size={28} color="#ffffff" />}
                        {yearIndex === 2 && <Award size={28} color="#ffffff" />}
                        {yearIndex === 3 && <Trophy size={28} color="#ffffff" />}
                      </View>
                    </View>

                    {/* Year Title */}
                    <Text style={styles.milestoneTitle}>{yearData.year}</Text>
                    <Text style={styles.milestoneMilestone}>{yearData.milestone}</Text>

                    {/* Subject Count */}
                    <View style={styles.subjectCount}>
                      <View style={styles.subjectCountDot} />
                      <Text style={styles.subjectCountText}>
                        {yearData.subjects.length} Subjects
                      </Text>
                    </View>

                    {/* Expand Indicator */}
                    <View style={styles.expandIndicator}>
                      <Text style={styles.expandText}>
                        {isExpanded ? 'Tap to collapse' : 'Tap to explore'}
                      </Text>
                    </View>
                  </LinearGradient>

                  {/* Decorative Corner */}
                  <View style={[styles.cardCorner, { backgroundColor: yearData.color }]} />
                </TouchableOpacity>

                {/* Subjects Grid - Expanded */}
                {isExpanded && (
                  <View style={[styles.subjectsGrid, isLeft ? styles.subjectsLeft : styles.subjectsRight]}>
                    <View style={styles.subjectsHeader}>
                      <Text style={styles.subjectsHeaderText}>Choose Your Path</Text>
                    </View>
                    {yearData.subjects.map((subject, subjectIndex) => (
                      <TouchableOpacity
                        key={subjectIndex}
                        style={[
                          styles.subjectPill,
                          selectedSubject === subject && styles.subjectPillSelected,
                        ]}
                        onPress={() => handleSubjectPress(subject)}
                        activeOpacity={0.8}
                      >
                        <LinearGradient
                          colors={
                            selectedSubject === subject
                              ? [yearData.color, yearData.darkColor]
                              : ['#1e293b', '#0f172a']
                          }
                          style={styles.subjectPillGradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                        >
                          <View style={styles.subjectPillIcon}>
                            <BookOpen 
                              size={16} 
                              color={selectedSubject === subject ? '#ffffff' : yearData.color} 
                            />
                          </View>
                          <Text
                            style={[
                              styles.subjectPillText,
                              selectedSubject === subject && styles.subjectPillTextSelected,
                              { color: selectedSubject === subject ? '#ffffff' : yearData.color },
                            ]}
                          >
                            {subject}
                          </Text>
                          {selectedSubject === subject && (
                            <View style={styles.selectedIndicator}>
                              <Star size={14} color="#fbbf24" fill="#fbbf24" />
                            </View>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Journey End Marker */}
        <View style={styles.endMarker}>
          <View style={styles.endMarkerLine} />
          <LinearGradient
            colors={['#f59e0b', '#d97706']}
            style={styles.endMarkerGradient}
          >
            <Trophy size={32} color="#ffffff" />
          </LinearGradient>
          <Text style={styles.endMarkerTitle}>MBBS Complete!</Text>
          <Text style={styles.endMarkerSubtitle}>Your medical journey continues...</Text>
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

  starsContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },

  star: {
    position: 'absolute',
    width: 2,
    height: 2,
    backgroundColor: '#ffffff',
    borderRadius: 1,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingTop: 24,
    paddingBottom: 60,
  },

  // HEADER
  header: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },

  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    marginBottom: 16,
  },

  headerBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fbbf24',
    marginLeft: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  headerTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: -1,
  },

  headerSubtitle: {
    fontSize: 16,
    color: '#94a3b8',
    lineHeight: 24,
    marginBottom: 24,
  },

  // STATS ROW
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },

  statCard: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.6)',
  },

  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 8,
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },

  // START MARKER
  startMarker: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 24,
  },

  startMarkerGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },

  startMarkerLine: {
    width: 3,
    height: 40,
    backgroundColor: '#334155',
    marginVertical: 12,
  },

  startMarkerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10b981',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },

  // TIMELINE
  timeline: {
    paddingHorizontal: 24,
  },

  yearContainer: {
    marginBottom: 40,
    position: 'relative',
  },

  // PATH CONNECTOR
  pathConnector: {
    position: 'absolute',
    top: 0,
    width: SCREEN_WIDTH * 0.3,
    height: 120,
    zIndex: 0,
  },

  pathLeft: {
    left: '10%',
  },

  pathRight: {
    right: '10%',
  },

  pathDots: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  pathDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#334155',
  },

  // MILESTONE CARD
  milestoneCard: {
    width: SCREEN_WIDTH - 48,
    marginBottom: 16,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },

  milestoneLeft: {
    alignSelf: 'flex-start',
  },

  milestoneRight: {
    alignSelf: 'flex-end',
  },

  milestoneGradient: {
    padding: 24,
  },

  yearBadgeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  yearBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },

  yearBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  milestoneIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  milestoneTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 4,
    letterSpacing: -0.5,
  },

  milestoneMilestone: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    marginBottom: 16,
  },

  subjectCount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  subjectCountDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    marginRight: 8,
  },

  subjectCountText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },

  expandIndicator: {
    marginTop: 8,
  },

  expandText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
    fontStyle: 'italic',
  },

  cardCorner: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 60,
    height: 60,
    opacity: 0.15,
    borderBottomLeftRadius: 60,
  },

  // SUBJECTS GRID
  subjectsGrid: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
  },

  subjectsLeft: {
    marginLeft: 8,
  },

  subjectsRight: {
    marginRight: 8,
  },

  subjectsHeader: {
    marginBottom: 12,
  },

  subjectsHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // SUBJECT PILLS
  subjectPill: {
    marginBottom: 10,
    borderRadius: 16,
    overflow: 'hidden',
  },

  subjectPillGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(51, 65, 85, 0.8)',
    borderRadius: 16,
  },

  subjectPillSelected: {
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },

  subjectPillIcon: {
    marginRight: 12,
  },

  subjectPillText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  subjectPillTextSelected: {
    color: '#ffffff',
  },

  selectedIndicator: {
    marginLeft: 8,
  },

  // END MARKER
  endMarker: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 24,
  },

  endMarkerLine: {
    width: 3,
    height: 60,
    backgroundColor: '#334155',
    marginBottom: 16,
  },

  endMarkerGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },

  endMarkerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: -0.5,
  },

  endMarkerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
  },

  bottomSpacer: {
    height: 60,
  },
});
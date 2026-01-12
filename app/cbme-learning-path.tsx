//app/cbme-learning-path.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

// HARD-CODED DATA
const YEARS = [
  {
    year: "MBBS First Year",
    subjects: ["Anatomy", "Physiology", "Biochemistry"],
  },
  {
    year: "MBBS Second Year",
    subjects: ["Pathology", "Pharmacology", "Microbiology"],
  },
  {
    year: "MBBS Third Year",
    subjects: ["Forensic", "PSM"],
  },
  {
    year: "MBBS Final Year",
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
  },
];

interface LearningPathProps {
  onSubjectSelect?: (subject: string) => void;
}

export default function LearningPath({ onSubjectSelect }: LearningPathProps) {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const handleSubjectPress = (subject: string) => {
    setSelectedSubject(subject);
    if (onSubjectSelect) {
      onSubjectSelect(subject);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Learning Path</Text>
          <Text style={styles.headerSubtitle}>
            Navigate through your MBBS journey
          </Text>
        </View>

        {/* PATHWAY START INDICATOR */}
        <View style={styles.startIndicator}>
          <View style={styles.startDot} />
          <Text style={styles.startText}>Start</Text>
        </View>

        {/* YEARS AND SUBJECTS */}
        {YEARS.map((yearData, yearIndex) => (
          <View key={yearIndex} style={styles.yearBlock}>
            {/* VERTICAL PATH LINE */}
            <View style={styles.pathLineContainer}>
              <View style={styles.pathLine} />
            </View>

            {/* YEAR MILESTONE */}
            <View style={styles.yearMilestone}>
              <View style={styles.yearIconContainer}>
                <View style={styles.yearIcon}>
                  <Text style={styles.yearNumber}>{yearIndex + 1}</Text>
                </View>
              </View>
              <View style={styles.yearInfo}>
                <Text style={styles.yearTitle}>{yearData.year}</Text>
                <Text style={styles.yearMeta}>
                  {yearData.subjects.length} subject
                  {yearData.subjects.length !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>

            {/* SUBJECTS AS PILLS */}
            <View style={styles.subjectsContainer}>
              {yearData.subjects.map((subject, subjectIndex) => (
                <TouchableOpacity
                  key={subjectIndex}
                  style={[
                    styles.pill,
                    selectedSubject === subject && styles.pillSelected,
                  ]}
                  onPress={() => handleSubjectPress(subject)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.pillText,
                      selectedSubject === subject && styles.pillTextSelected,
                    ]}
                  >
                    {subject}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* END INDICATOR */}
        <View style={styles.endIndicator}>
          <View style={styles.endDot} />
          <Text style={styles.endText}>Your journey continues...</Text>
        </View>

        {/* BOTTOM SPACER */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // MAIN CONTAINER
  container: {
    flex: 1,
    backgroundColor: '#0a0e14',
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingTop: 20,
    paddingBottom: 40,
  },

  // HEADER
  header: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },

  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 8,
    letterSpacing: -0.5,
  },

  headerSubtitle: {
    fontSize: 16,
    color: '#94a3b8',
    lineHeight: 22,
  },

  // START INDICATOR
  startIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },

  startDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
    borderWidth: 3,
    borderColor: '#064e3b',
  },

  startText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // YEAR BLOCK
  yearBlock: {
    position: 'relative',
    marginBottom: 16,
  },

  // PATH LINE
  pathLineContainer: {
    position: 'absolute',
    left: 28,
    top: 0,
    bottom: 0,
    width: 3,
    zIndex: 0,
  },

  pathLine: {
    flex: 1,
    backgroundColor: '#1e293b',
  },

  // YEAR MILESTONE
  yearMilestone: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    zIndex: 2,
  },

  yearIconContainer: {
    marginRight: 16,
  },

  yearIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1e293b',
    borderWidth: 3,
    borderColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },

  yearNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10b981',
  },

  yearInfo: {
    flex: 1,
    backgroundColor: '#14181f',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },

  yearTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 4,
  },

  yearMeta: {
    fontSize: 13,
    color: '#64748b',
  },

  // SUBJECTS CONTAINER
  subjectsContainer: {
    paddingHorizontal: 20,
    paddingLeft: 88,
    marginBottom: 24,
  },

  // PILL STYLES (EXACT MATCH FROM ask-paragraph-mbbs.tsx)
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#0b141a',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#10b981',
  },

  pillSelected: {
    backgroundColor: '#0d2017',
    borderColor: '#10b981',
    borderWidth: 2,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 8,
    elevation: 6,
  },

  pillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },

  pillTextSelected: {
    color: '#ffffff',
  },

  // END INDICATOR
  endIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
  },

  endDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0a0e14',
    borderWidth: 3,
    borderColor: '#1e293b',
  },

  endText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
  },

  // BOTTOM SPACER
  bottomSpacer: {
    height: 60,
  },
});
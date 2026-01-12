//app/cbme-learning-path.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
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
  const handleSubjectPress = (subject: string) => {
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

            {/* SUBJECTS PATHWAY */}
            <View style={styles.subjectsPathway}>
              {yearData.subjects.map((subject, subjectIndex) => {
                const isLeft = subjectIndex % 2 === 0;

                return (
                  <View key={subjectIndex} style={styles.subjectMilestone}>
                    {/* CENTER LINE WITH DOT */}
                    <View style={styles.centerLineContainer}>
                      <View style={styles.centerLine} />
                      <View style={styles.centerDot} />
                      <View
                        style={[
                          styles.branchLine,
                          isLeft ? styles.branchLeft : styles.branchRight,
                        ]}
                      />
                    </View>

                    {/* SUBJECT CARD */}
                    <View
                      style={[
                        styles.subjectCardWrapper,
                        isLeft
                          ? styles.subjectCardLeft
                          : styles.subjectCardRight,
                      ]}
                    >
                      <TouchableOpacity
                        style={styles.subjectCard}
                        onPress={() => handleSubjectPress(subject)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.subjectName}>{subject}</Text>
                        <View style={styles.subjectArrow}>
                          <Text style={styles.subjectArrowText}>→</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
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

const { width } = Dimensions.get('window');
const CENTER_OFFSET = 24;
const CARD_WIDTH = (width - 80) * 0.85;

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
    left: CENTER_OFFSET + 4,
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

  // SUBJECTS PATHWAY
  subjectsPathway: {
    paddingLeft: 20,
    marginBottom: 24,
  },

  subjectMilestone: {
    position: 'relative',
    minHeight: 80,
    marginBottom: 12,
  },

  // CENTER LINE WITH DOT
  centerLineContainer: {
    position: 'absolute',
    left: 4,
    top: 0,
    bottom: 0,
    width: 3,
    alignItems: 'center',
    zIndex: 1,
  },

  centerLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: '#1e293b',
  },

  centerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10b981',
    marginTop: 24,
    zIndex: 3,
  },

  branchLine: {
    position: 'absolute',
    top: 24,
    height: 2,
    backgroundColor: '#1e293b',
    width: 40,
  },

  branchLeft: {
    left: 8,
  },

  branchRight: {
    right: 8,
  },

  // SUBJECT CARD
  subjectCardWrapper: {
    position: 'absolute',
    top: 0,
  },

  subjectCardLeft: {
    left: 54,
    right: width * 0.15,
  },

  subjectCardRight: {
    left: width * 0.15,
    right: 20,
  },

  subjectCard: {
    backgroundColor: '#14181f',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  subjectName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f8fafc',
    flex: 1,
    lineHeight: 20,
  },

  subjectArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },

  subjectArrowText: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: '600',
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
//TeacherLiveClassDashboard.tsx

import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  useWindowDimensions,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';

import { MotiView } from 'moti';
import { supabase } from '@/lib/supabaseClient';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

// -----------------------------------------------------------------------------
// 📘 Types (RPC driven — do NOT loosen)
// -----------------------------------------------------------------------------

interface LiveClass {
  battle_id: string;
  title: string;
  scheduled_at: string;
  status: 'active' | 'upcoming' | 'completed';
}

interface QuestionItem {
  question: string;
  topic_order: number;
}

type CreateStep = 'subject' | 'questions' | 'details';

// -----------------------------------------------------------------------------
// 🔁 Status Normalizer (DB → UI)
// -----------------------------------------------------------------------------

const normalizeStatus = (status: string): LiveClass['status'] => {
  switch (status) {
    case 'Active':
      return 'active';
    case 'Upcoming':
      return 'upcoming';
    case 'Completed':
      return 'completed';
    default:
      return 'upcoming';
  }
};
const [isTeacher, setIsTeacher] = useState<boolean | null>(null);


// -----------------------------------------------------------------------------
// 🤖 AI BOT ICON SET (FIXED, STABLE, NO FLICKER)
// -----------------------------------------------------------------------------

const AI_BOT_ICONS = [
  '🤖',      // classic robot
  '🧠',      // intelligence
  '🦾',      // AI strength
  '🤖‍💻',    // coding bot
  '🧑‍💻',    // human-AI hybrid
  '🛰️',      // satellite AI
  '🧬',      // bio-AI
  '⚙️',      // engine AI
  '📡',      // signal AI
  '🔮',      // future AI
];

// -----------------------------------------------------------------------------
// 🧮 Deterministic Hash → Icon Resolver
// Same battle_id ALWAYS maps to same icon
// -----------------------------------------------------------------------------

const getBotIconFromBattleId = (battleId: string): string => {
  let hash = 0;

  for (let i = 0; i < battleId.length; i++) {
    hash = battleId.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % AI_BOT_ICONS.length;
  return AI_BOT_ICONS[index];
};

// -----------------------------------------------------------------------------
// 📚 Hard-coded Subject List (authoritative — no API)
// -----------------------------------------------------------------------------

const SUBJECTS = [
  { subject: 'Anatomy' },
  { subject: 'Biochemistry' },
  { subject: 'Community Medicine' },
  { subject: 'ENT' },
  { subject: 'Forensic Medicine' },
  { subject: 'General Medicine' },
  { subject: 'General Surgery' },
  { subject: 'Gynaecology' },
  { subject: 'Microbiology' },
  { subject: 'Obstetrics' },
  { subject: 'Ophthalmology' },
  { subject: 'Pathology' },
  { subject: 'Pediatrics' },
  { subject: 'Pharmacology' },
  { subject: 'Physiology' },
];

// -----------------------------------------------------------------------------
// 🧩 Main Component
// -----------------------------------------------------------------------------

export default function TeacherLiveClassDashboard() {
  // ---------------------------------------------------------------------------
  // 🔐 Role Detection
  // ---------------------------------------------------------------------------

  const { user } = useAuth();

  /**
   * Adjust this depending on your schema:
   * - user.role === 'teacher'
   * - user.is_teacher === true
   * - user.user_type === 'TEACHER'
   */
  const isTeacher = user?.role === 'teacher';

  // ---------------------------------------------------------------------------
  // 📐 Responsive
  // ---------------------------------------------------------------------------

  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  // ---------------------------------------------------------------------------
  // 🧠 State
  // ---------------------------------------------------------------------------

  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // ---------------------------------------------------------------------------
  // ✏️ Create Flow State
  // ---------------------------------------------------------------------------

  const [showCreate, setShowCreate] = useState(false);
  const [createStep, setCreateStep] = useState<CreateStep>('subject');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(
    new Set()
  );
  const [classTitle, setClassTitle] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // ---------------------------------------------------------------------------
  // 📡 Fetch Classes via RPC
  // ---------------------------------------------------------------------------

  const fetchClasses = useCallback(async () => {
    const { data, error } = await supabase.rpc('get_battle_schedule_for_now');

    if (error) {
      console.error('❌ get_battle_schedule_for_now failed:', error);
      return;
    }

    if (!data) return;

    const formatted: LiveClass[] = data.map((item: any) => ({
      battle_id: item.battle_id,
      title: item.title,
      scheduled_at: `${item.scheduled_date}T${item.scheduled_time}+05:30`,
      status: normalizeStatus(item.status),
    }));

    formatted.sort(
      (a, b) =>
        new Date(a.scheduled_at).getTime() -
        new Date(b.scheduled_at).getTime()
    );

    setClasses(formatted);
  }, []);

  // ---------------------------------------------------------------------------
  // 🧲 Initial Load
  // ---------------------------------------------------------------------------

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // ---------------------------------------------------------------------------
  // 🔄 Pull-to-Refresh
  // ---------------------------------------------------------------------------

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchClasses();
    setRefreshing(false);
  };

  // ---------------------------------------------------------------------------
  // 🕒 Date / Time Helpers
  // ---------------------------------------------------------------------------

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString([], {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });

  // ---------------------------------------------------------------------------
  // 🏷 Status Badge Resolver
  // ---------------------------------------------------------------------------

  const getStatusBadge = (status: LiveClass['status']) => {
    switch (status) {
      case 'active':
        return { text: '🔴 LIVE', color: '#EF4444' };
      case 'upcoming':
        return { text: '⏳ UPCOMING', color: '#00D9FF' };
      default:
        return { text: '✅ ENDED', color: '#4CAF50' };
    }
  };

  // ---------------------------------------------------------------------------
  // 🚀 Navigation
  // ---------------------------------------------------------------------------

  const handleClassPress = (cls: LiveClass) => {
    router.push({
      pathname: isTeacher
        ? '/teacher/live-class/[id]'
        : '/live-class/[id]',
      params: { id: cls.battle_id },
    });
  };

  // ---------------------------------------------------------------------------
  // ✏️ Create Live Class Flow Logic
  // ---------------------------------------------------------------------------

  const openCreateFlow = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');

    setShowCreate(true);
    setCreateStep('subject');
    setSelectedSubject('');
    setQuestions([]);
    setSelectedQuestions(new Set());
    setClassTitle('');
    setScheduledDate(`${yyyy}-${mm}-${dd}`);
    setScheduledTime('');
    setCreateError('');
  };

  const closeCreateFlow = () => {
    setShowCreate(false);
  };

  const handleSubjectSelect = async (subject: string) => {
    setSelectedSubject(subject);
    setCreateStep('questions');
    setLoadingQuestions(true);
    setCreateError('');

    const { data, error } = await supabase.rpc('get_questions_by_subject', {
      p_subject: subject,
    });

    if (error) {
      setCreateError('Failed to load questions');
      setLoadingQuestions(false);
      return;
    }

    setQuestions(data || []);
    setLoadingQuestions(false);
  };

  const toggleQuestion = (index: number) => {
    setSelectedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const canSubmit =
    classTitle.trim().length > 0 &&
    scheduledDate.length === 10 &&
    scheduledTime.length >= 4;

  const handleCreateSubmit = async () => {
    if (!canSubmit || creating) return;

    setCreating(true);
    setCreateError('');

    const timeWithSeconds =
      scheduledTime.split(':').length === 2
        ? `${scheduledTime}:00`
        : scheduledTime;

    const { error } = await supabase.rpc('create_battle_schedule', {
      p_title: classTitle.trim(),
      p_scheduled_date: scheduledDate,
      p_scheduled_time: timeWithSeconds,
      p_subject_1: selectedSubject,
    });

    if (error) {
      setCreateError(error.message || 'Failed to create class');
      setCreating(false);
      return;
    }

    setCreating(false);
    closeCreateFlow();
    await fetchClasses();
  };

  const handleCreateBack = () => {
    if (createStep === 'subject') {
      closeCreateFlow();
    } else if (createStep === 'questions') {
      setCreateStep('subject');
      setSelectedSubject('');
      setQuestions([]);
      setSelectedQuestions(new Set());
    } else if (createStep === 'details') {
      setCreateStep('questions');
    }
  };

  const subjectCardSize = useMemo(() => {
    const padding = 32;
    const gap = 12;
    const cols = isMobile ? 2 : 3;
    return (width - padding - gap * (cols - 1)) / cols;
  }, [width, isMobile]);

  // ---------------------------------------------------------------------------
  // 🖼️ Render
  // ---------------------------------------------------------------------------

  return (
    <View style={styles.container}>
      {/* ------------------------------------------------------------------- */}
      {/* Header                                                              */}
      {/* ------------------------------------------------------------------- */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          🤖 Paragraph AI-Tutored Sessions
        </Text>
        <Text style={styles.headerSubtitle}>
          {isTeacher
            ? 'Manage & conduct AI-tutored live classes'
            : 'Live, instructor-guided interactive classes'}
        </Text>
      </View>

      {/* ------------------------------------------------------------------- */}
      {/* Class List                                                          */}
      {/* ------------------------------------------------------------------- */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00D9FF"
          />
        }
      >
        {classes.map((cls, index) => {
          const badge = getStatusBadge(cls.status);
const botIcon = getBotIconFromBattleId(cls.battle_id);
          const disablePress = !isTeacher && cls.status === 'completed';

          return (
            <MotiView
              key={cls.battle_id}
              from={{ opacity: 0, translateY: 20, scale: 0.96 }}
              animate={{ opacity: 1, translateY: 0, scale: 1 }}
              transition={{ delay: index * 80 }}
            >
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={disablePress ? undefined : () => handleClassPress(cls)}
                style={styles.cardWrapper}
              >
                <View
                  style={[
                    styles.card,
                    {
                      flexDirection: isMobile ? 'column' : 'row',
                      alignItems: isMobile ? 'center' : 'flex-start',
                    },
                  ]}
                >
                  {/* ------------------------------------------------------- */}
                  {/* AI BOT ICON                                             */}
                  {/* ------------------------------------------------------- */}
                  <View style={styles.iconCircle}>
                    <Text style={styles.icon}>{botIcon}</Text>
                  </View>

                  {/* ------------------------------------------------------- */}
                  {/* Info                                                    */}
                  {/* ------------------------------------------------------- */}
                  <View
                    style={[
                      styles.info,
                      { alignItems: isMobile ? 'center' : 'flex-start' },
                    ]}
                  >
                    <Text style={styles.title} numberOfLines={1}>
                      {cls.title}
                    </Text>

                    <View style={styles.timeRow}>
                      <Text style={styles.time}>
                        {formatTime(cls.scheduled_at)}
                      </Text>
                      <Text style={styles.date}>
                        {formatDate(cls.scheduled_at)}
                      </Text>
                    </View>
                  </View>

                  {/* ------------------------------------------------------- */}
                  {/* Status Badge                                            */}
                  {/* ------------------------------------------------------- */}
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: `${badge.color}20` },
                    ]}
                  >
                    <Text style={[styles.badgeText, { color: badge.color }]}>
                      {badge.text}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </MotiView>
          );
        })}
      </ScrollView>

      {/* ------------------------------------------------------------------- */}
      {/* FAB — Teacher Only                                                  */}
      {/* ------------------------------------------------------------------- */}
      {isTeacher && (
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.8}
          onPress={openCreateFlow}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* Create Live Class Modal                                             */}
      {/* ------------------------------------------------------------------- */}
      <Modal
        visible={showCreate}
        animationType="slide"
        onRequestClose={closeCreateFlow}
      >
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={handleCreateBack}
              style={styles.modalBackBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.modalBackText}>
                {createStep === 'subject' ? 'Close' : 'Back'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle} numberOfLines={1}>
              {createStep === 'subject' && 'Select Subject'}
              {createStep === 'questions' && selectedSubject}
              {createStep === 'details' && 'Class Details'}
            </Text>

            <View style={{ width: 56 }} />
          </View>

          {/* Step Indicator */}
          <View style={styles.stepRow}>
            {(['subject', 'questions', 'details'] as CreateStep[]).map(
              (step, i) => {
                const stepIndex = (
                  ['subject', 'questions', 'details'] as CreateStep[]
                ).indexOf(createStep);
                const isActive = createStep === step;
                const isDone = stepIndex > i;
                return (
                  <View key={step} style={styles.stepItem}>
                    <View
                      style={[
                        styles.stepDot,
                        isDone && styles.stepDotDone,
                        isActive && styles.stepDotActive,
                      ]}
                    />
                    <Text
                      style={[
                        styles.stepLabel,
                        (isActive || isDone) && styles.stepLabelActive,
                      ]}
                    >
                      {step === 'subject'
                        ? 'Subject'
                        : step === 'questions'
                          ? 'Topics'
                          : 'Details'}
                    </Text>
                  </View>
                );
              }
            )}
          </View>

          {/* STEP: Subject Selection */}
          {createStep === 'subject' && (
            <ScrollView contentContainerStyle={styles.subjectGrid}>
              {SUBJECTS.map((s) => (
                <TouchableOpacity
                  key={s.subject}
                  style={[styles.subjectCard, { width: subjectCardSize }]}
                  activeOpacity={0.7}
                  onPress={() => handleSubjectSelect(s.subject)}
                >
                  <View style={styles.subjectInitialCircle}>
                    <Text style={styles.subjectInitial}>
                      {s.subject.charAt(0)}
                    </Text>
                  </View>
                  <Text style={styles.subjectText}>{s.subject}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* STEP: Question / Topic Selection */}
          {createStep === 'questions' && (
            <View style={styles.flex1}>
              {loadingQuestions ? (
                <View style={styles.centerLoader}>
                  <ActivityIndicator size="large" color="#00D9FF" />
                  <Text style={styles.loaderText}>Loading topics...</Text>
                </View>
              ) : questions.length === 0 ? (
                <View style={styles.centerLoader}>
                  <Text style={styles.emptyText}>
                    No questions found for {selectedSubject}
                  </Text>
                </View>
              ) : (
                <>
                  <ScrollView contentContainerStyle={styles.questionList}>
                    {questions.map((q, i) => {
                      const selected = selectedQuestions.has(i);
                      return (
                        <TouchableOpacity
                          key={`${q.topic_order}-${i}`}
                          style={[
                            styles.questionRow,
                            selected && styles.questionRowSelected,
                          ]}
                          activeOpacity={0.7}
                          onPress={() => toggleQuestion(i)}
                        >
                          <View
                            style={[
                              styles.checkbox,
                              selected && styles.checkboxSelected,
                            ]}
                          >
                            {selected && (
                              <Text style={styles.checkmark}>✓</Text>
                            )}
                          </View>
                          <Text style={styles.questionText} numberOfLines={3}>
                            {q.question}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  <View style={styles.bottomBar}>
                    <Text style={styles.selectedCount}>
                      {selectedQuestions.size} selected
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.actionBtn,
                        selectedQuestions.size === 0 && styles.actionBtnDisabled,
                      ]}
                      activeOpacity={0.8}
                      onPress={() =>
                        selectedQuestions.size > 0 && setCreateStep('details')
                      }
                    >
                      <Text
                        style={[
                          styles.actionBtnText,
                          selectedQuestions.size === 0 &&
                            styles.actionBtnTextDisabled,
                        ]}
                      >
                        Next
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          )}

          {/* STEP: Class Details & Submit */}
          {createStep === 'details' && (
            <View style={styles.flex1}>
              <ScrollView contentContainerStyle={styles.detailsScroll}>
                {createError !== '' && (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{createError}</Text>
                  </View>
                )}

                <Text style={styles.inputLabel}>Class Title</Text>
                <TextInput
                  style={styles.textInput}
                  value={classTitle}
                  onChangeText={setClassTitle}
                  placeholder="e.g. Anatomy Revision - Batch A"
                  placeholderTextColor="#555"
                  maxLength={100}
                  autoFocus
                />

                <Text style={styles.inputLabel}>Scheduled Date</Text>
                <TextInput
                  style={styles.textInput}
                  value={scheduledDate}
                  onChangeText={setScheduledDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#555"
                  maxLength={10}
                  keyboardType="numeric"
                />

                <Text style={styles.inputLabel}>Scheduled Time (24h)</Text>
                <TextInput
                  style={styles.textInput}
                  value={scheduledTime}
                  onChangeText={setScheduledTime}
                  placeholder="HH:MM"
                  placeholderTextColor="#555"
                  maxLength={5}
                  keyboardType="numeric"
                />

                <View style={styles.summaryCard}>
                  <Text style={styles.summaryHeading}>Summary</Text>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subject</Text>
                    <Text style={styles.summaryValue}>{selectedSubject}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Topics</Text>
                    <Text style={styles.summaryValue}>
                      {selectedQuestions.size} selected
                    </Text>
                  </View>
                  {scheduledDate !== '' && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Date</Text>
                      <Text style={styles.summaryValue}>{scheduledDate}</Text>
                    </View>
                  )}
                  {scheduledTime !== '' && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Time</Text>
                      <Text style={styles.summaryValue}>{scheduledTime}</Text>
                    </View>
                  )}
                </View>
              </ScrollView>

              <View style={styles.bottomBar}>
                <TouchableOpacity
                  style={[
                    styles.createBtn,
                    (!canSubmit || creating) && styles.actionBtnDisabled,
                  ]}
                  activeOpacity={0.8}
                  onPress={handleCreateSubmit}
                  disabled={!canSubmit || creating}
                >
                  {creating ? (
                    <ActivityIndicator size="small" color="#0F0F0F" />
                  ) : (
                    <Text
                      style={[
                        styles.createBtnText,
                        !canSubmit && styles.actionBtnTextDisabled,
                      ]}
                    >
                      Create Live Class
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

// -----------------------------------------------------------------------------
// 🎨 Styles
// -----------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },

  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF1D6',
  },

  headerSubtitle: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },

  cardWrapper: {
    marginBottom: 16,
  },

  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },

  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
  },

  icon: {
    fontSize: 30,
    lineHeight: 32,
  },

  info: {
    flex: 1,
    gap: 4,
  },

  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F3EAD7',
  },

  timeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },

  time: {
    fontSize: 20,
    fontWeight: '800',
    color: '#00D9FF',
  },

  date: {
    fontSize: 15,
    fontWeight: '600',
    color: '#BBBBBB',
  },

  badge: {
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },

  // =========================================================================
  // FAB
  // =========================================================================

  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#00D9FF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#00D9FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },

  fabIcon: {
    fontSize: 30,
    fontWeight: '300',
    color: '#0F0F0F',
    marginTop: -2,
  },

  // =========================================================================
  // Modal Shell
  // =========================================================================

  modalContainer: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },

  modalBackBtn: {
    width: 56,
  },

  modalBackText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#00D9FF',
  },

  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF1D6',
    textAlign: 'center',
  },

  // =========================================================================
  // Step Indicator
  // =========================================================================

  stepRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },

  stepItem: {
    alignItems: 'center',
    gap: 6,
  },

  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2D2D2D',
  },

  stepDotActive: {
    backgroundColor: '#00D9FF',
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  stepDotDone: {
    backgroundColor: '#4CAF50',
  },

  stepLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#555',
  },

  stepLabelActive: {
    color: '#CCC',
  },

  // =========================================================================
  // Subject Grid
  // =========================================================================

  subjectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },

  subjectCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    paddingVertical: 22,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },

  subjectInitialCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#252525',
    alignItems: 'center',
    justifyContent: 'center',
  },

  subjectInitial: {
    fontSize: 20,
    fontWeight: '900',
    color: '#00D9FF',
  },

  subjectText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F3EAD7',
    textAlign: 'center',
  },

  // =========================================================================
  // Loading / Empty
  // =========================================================================

  flex1: {
    flex: 1,
  },

  centerLoader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },

  loaderText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
  },

  emptyText: {
    fontSize: 15,
    color: '#777',
    fontWeight: '600',
  },

  // =========================================================================
  // Question List
  // =========================================================================

  questionList: {
    padding: 16,
    gap: 10,
    paddingBottom: 100,
  },

  questionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },

  questionRowSelected: {
    borderColor: '#00D9FF40',
    backgroundColor: '#0D1F2D',
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },

  checkboxSelected: {
    backgroundColor: '#00D9FF',
    borderColor: '#00D9FF',
  },

  checkmark: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F0F0F',
  },

  questionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#DDD',
    lineHeight: 21,
  },

  // =========================================================================
  // Bottom Bar (shared by questions + details steps)
  // =========================================================================

  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
    backgroundColor: '#0F0F0F',
  },

  selectedCount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9CA3AF',
  },

  actionBtn: {
    backgroundColor: '#00D9FF',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
  },

  actionBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F0F0F',
  },

  actionBtnDisabled: {
    backgroundColor: '#1A1A1A',
  },

  actionBtnTextDisabled: {
    color: '#555',
  },

  // =========================================================================
  // Details Form
  // =========================================================================

  detailsScroll: {
    padding: 20,
    gap: 4,
    paddingBottom: 100,
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9CA3AF',
    marginTop: 18,
    marginBottom: 6,
  },

  textInput: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#F3EAD7',
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },

  // =========================================================================
  // Summary Card
  // =========================================================================

  summaryCard: {
    marginTop: 28,
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },

  summaryHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF1D6',
    marginBottom: 2,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  summaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#777',
  },

  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00D9FF',
  },

  // =========================================================================
  // Error
  // =========================================================================

  errorBox: {
    backgroundColor: '#2D1515',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EF444440',
  },

  errorText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
  },

  // =========================================================================
  // Create Button
  // =========================================================================

  createBtn: {
    flex: 1,
    backgroundColor: '#00D9FF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  createBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F0F0F',
  },
});

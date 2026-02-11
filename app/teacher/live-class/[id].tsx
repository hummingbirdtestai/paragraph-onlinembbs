//app/teacher/live-class/[id].tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '@/lib/supabaseClient';
import { ChevronLeft, MessageCircle, Send, X } from 'lucide-react-native';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface MCQ {
  stem: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  exam_trap: string;
  wrong_answers_explained?: Record<string, string>;
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

interface ChatMessage {
  id: string;
  battle_id: string;
  user_id: string;
  user_name: string;
  message: string;
  created_at: string;
}

type FlatItem =
  | { type: 'concept'; qi: number; ci: number }
  | { type: 'mcq'; qi: number; ci: number }
  | { type: 'exam_trap'; qi: number; ci: number }
  | { type: 'explanation'; qi: number; ci: number }
  | { type: 'wrong_answers'; qi: number; ci: number }
  | { type: 'student_doubts'; qi: number; ci: number };

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const getSortedConceptKeys = (classJson: Record<string, ConceptBlock>) =>
  Object.keys(classJson).sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
    const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
    return numA - numB;
  });

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

export default function TeacherLiveClassContent() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [data, setData] = useState<BattleClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openBlocks, setOpenBlocks] = useState<Record<string, boolean>>({});
  const [cursorIndex, setCursorIndex] = useState(0);

  // Chat state (teacher)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('Teacher');
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  // Platform detection
  const [isMobile, setIsMobile] = useState(
    Platform.OS !== 'web' ? true : typeof window !== 'undefined' && window.innerWidth < 768
  );
  const isWeb = Platform.OS === 'web';

  const scrollRef = React.useRef<ScrollView>(null);
  const contentRef = React.useRef<View>(null);
  const blockRefs = React.useRef<Record<string, View>>({});
  const chatScrollRef = React.useRef<ScrollView>(null);
  const chatChannelRef = React.useRef<any>(null);
  const chatDrawerOpenRef = React.useRef(false);

  const flatTimeline = React.useMemo<FlatItem[]>(() => {
    const timeline: FlatItem[] = [];

    data.forEach((item, qi) => {
      const conceptKeys = getSortedConceptKeys(item.class_json);

      conceptKeys.forEach((key, ci) => {
        const c = item.class_json[key];
        if (!c) return;

        timeline.push({ type: 'concept', qi, ci });
        if (c.mcq?.stem) timeline.push({ type: 'mcq', qi, ci });
        if (c.mcq?.exam_trap) timeline.push({ type: 'exam_trap', qi, ci });
        if (c.mcq?.explanation) timeline.push({ type: 'explanation', qi, ci });
        if (c.mcq?.wrong_answers_explained)
          timeline.push({ type: 'wrong_answers', qi, ci });
        if (c.student_doubts?.length)
          timeline.push({ type: 'student_doubts', qi, ci });
      });
    });

    return timeline;
  }, [data]);

  const toggleBlock = (key: string) => {
    setOpenBlocks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const scrollToBlock = (key: string) => {
    requestAnimationFrame(() => {
      const node = blockRefs.current[key];
      const content = contentRef.current;
      if (!node || !content || !scrollRef.current) return;

      node.measureLayout(
        content as any,
        (_x, y) => {
          scrollRef.current?.scrollTo({
            y: Math.max(0, y - 20),
            animated: true,
          });
        },
        (err) => console.warn('measure failed', err)
      );
    });
  };

  const pushToClassroom = async ({
    type,
    content,
    meta,
  }: {
    type: string;
    content: unknown;
    meta?: Record<string, unknown>;
  }) => {
    if (!id) return null;

    const { data: row, error: rpcErr } = await supabase.rpc(
      'push_battle_class_feed',
      {
        p_battle_id: id,
        p_type: type,
        p_payload: content,
        p_meta: meta ?? {},
      }
    );

    if (rpcErr) {
      console.error('Persist failed', rpcErr);
      return null;
    }

    const channel = supabase.channel(`battle:${id}`);
    await channel.send({
      type: 'broadcast',
      event: 'class-feed-push',
      payload: row,
    });
    supabase.removeChannel(channel);

    return row;
  };

  const handleNext = async () => {
    const item = flatTimeline[cursorIndex];
    if (!item) return;

    const { qi, ci, type } = item;
    const conceptKeys = getSortedConceptKeys(data[qi].class_json);
    const concept = data[qi].class_json[conceptKeys[ci]];
    if (!concept) return;

    let blockKeyPrefix = type;
    if (type === 'exam_trap') blockKeyPrefix = 'trap';
    if (type === 'wrong_answers') blockKeyPrefix = 'wrong';
    if (type === 'student_doubts') blockKeyPrefix = 'doubts';

    const blockKey = `${blockKeyPrefix}-${qi}-${ci}`;

    let payload: any = null;
    let meta: Record<string, any> = { qi, ci };

    if (type === 'concept') {
      payload = concept.concept;
      meta.title = concept.title;
    } else if (type === 'mcq') {
      payload = concept.mcq;
    } else if (type === 'exam_trap') {
      payload = concept.mcq.exam_trap;
    } else if (type === 'explanation') {
      payload = concept.mcq.explanation;
    } else if (type === 'wrong_answers') {
      payload = concept.mcq.wrong_answers_explained;
    } else if (type === 'student_doubts') {
      payload = concept.student_doubts;
    }

    await pushToClassroom({
      type,
      content: payload,
      meta,
    });

    setOpenBlocks(prev => ({ ...prev, [blockKey]: true }));
    setTimeout(() => scrollToBlock(blockKey), 50);

    setCursorIndex(prev => prev + 1);
  };

  // ---------------------------------------------------------------------------
  // Send chat message
  // ---------------------------------------------------------------------------

  const sendChatMessage = async () => {
    if (
      !chatInput.trim() ||
      !id ||
      !userId ||
      !userName ||
      userName === 'Teacher' ||
      sendingMessage
    ) {
      if (!userName || userName === 'Teacher') {
        console.warn('Teacher name not loaded yet');
      }
      return;
    }

    const text = chatInput.trim();
    setChatInput('');
    setSendingMessage(true);
    Keyboard.dismiss();

    const optimistic: ChatMessage = {
      id: `local-${Date.now()}-${Math.random()}`,
      battle_id: id,
      user_id: userId,
      user_name: userName,
      message: text,
      created_at: new Date().toISOString(),
    };

    setChatMessages(prev =>
      [...prev, optimistic].sort(
        (a, b) =>
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime()
      )
    );

    setTimeout(() => {
      chatScrollRef.current?.scrollToEnd({ animated: true });
    }, 50);

    try {
      const { data } = await supabase.rpc('insert_battle_chat_message', {
        p_battle_id: id,
        p_user_name: userName,
        p_message: text,
      });

      if (data?.[0]) {
        setChatMessages(prev =>
          prev.map(m => (m.id === optimistic.id ? data[0] : m))
        );

        try {
          await chatChannelRef.current?.send({
            type: 'broadcast',
            event: 'chat-message',
            payload: data[0],
          });
        } catch {
          // no-op: DB persistence guarantees eventual consistency
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setChatMessages(prev =>
        prev.filter(m => m.id !== optimistic.id)
      );
      setChatInput(text);
    } finally {
      setSendingMessage(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Toggle chat drawer
  // ---------------------------------------------------------------------------

  const toggleChatDrawer = () => {
    const newState = !chatDrawerOpen;
    setChatDrawerOpen(newState);
    chatDrawerOpenRef.current = newState;

    if (newState) {
      setHasUnreadMessages(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Window resize handler (web)
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    let rafId: number | null = null;

    const handler = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setIsMobile(window.innerWidth < 768);
      });
    };

    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('resize', handler);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Load teacher profile
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const loadTeacherProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      const { data: profile } = await supabase
        .from('users')
        .select('name')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.name) {
        setUserName(profile.name);
      }
    };

    loadTeacherProfile();
  }, []);

  // ---------------------------------------------------------------------------
  // Load chat history
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!id) return;

    supabase
      .rpc('get_battle_chat_messages', { p_battle_id: id })
      .then(({ data }) => {
        if (data) setChatMessages(data);
      });
  }, [id]);

  // ---------------------------------------------------------------------------
  // Subscribe to chat
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!id || chatChannelRef.current) return;

    const channel = supabase
      .channel(`battle-chat:${id}`)
      .on(
        'broadcast',
        { event: 'chat-message' },
        payload => {
          setChatMessages(prev => {
            if (prev.some(m => m.id === payload.payload.id)) return prev;

            const updated = [...prev, payload.payload].sort(
              (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
            );

            if (!chatDrawerOpenRef.current) {
              setHasUnreadMessages(true);
            }

            setTimeout(() => {
              chatScrollRef.current?.scrollToEnd({ animated: true });
            }, 50);

            return updated;
          });
        }
      )
      .subscribe();

    chatChannelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      chatChannelRef.current = null;
    };
  }, [id]);

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
        { p_battle_id: id }
      );
      console.log('RPC raw data:', rpcData);
      console.log('RPC error:', rpcError);
      console.log('RPC data type:', typeof rpcData);
      console.log('Is Array?', Array.isArray(rpcData));

      if (rpcError) {
        setError(rpcError.message || 'Failed to load class content');
        setLoading(false);
        return;
      }

      let parsedData: BattleClassItem[] = [];

      if (Array.isArray(rpcData)) {
        parsedData = rpcData;
      } else if (rpcData && typeof rpcData === 'object') {
        parsedData = rpcData as unknown as BattleClassItem[];
      } else {
        parsedData = [];
      }

      console.log('Parsed data:', parsedData);
      console.log('Parsed length:', parsedData.length);

      const sorted = parsedData.sort(
        (a, b) => a.topic_order - b.topic_order
      );

      const adapted = sorted.map(item => {
        const newClassJson: Record<string, ConceptBlock> = {};

        Object.entries(item.class_json).forEach(([key, bucket]: any) => {
          const hyfArray = bucket.hyfs
            ? Object.entries(bucket.hyfs)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([, value]) => value)
            : bucket.concept || [];

          const mcqObject = Array.isArray(bucket.mcq)
            ? bucket.mcq[0]
            : bucket.mcq;

          newClassJson[key] = {
            title: bucket.title,
            concept: hyfArray,
            mcq: mcqObject,
            student_doubts: bucket.student_doubts || [],
          };
        });

        return {
          ...item,
          class_json: newClassJson,
        };
      });

      setData(adapted);
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
  // Render chat UI
  // ---------------------------------------------------------------------------

  const renderChatUI = () => {
    // Mobile: WhatsApp-style layout
    if (isMobile) {
      return (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.overlayDismiss}
            activeOpacity={1}
            onPress={toggleChatDrawer}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.chatRoot}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
          >
            <View style={styles.chatContainer}>
              {/* HEADER */}
              <View style={styles.chatHeader}>
                <MessageCircle size={20} color="#00D9FF" />
                <Text style={styles.chatHeaderText}>Class Chat</Text>
                <TouchableOpacity onPress={toggleChatDrawer} style={styles.closeButton}>
                  <X size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              {/* MESSAGES — FLEX 1 */}
              <ScrollView
                ref={chatScrollRef}
                style={{ flex: 1 }}
                contentContainerStyle={styles.chatMessagesContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {chatMessages.length === 0 && (
                  <View style={styles.emptyChat}>
                    <Text style={styles.emptyChatText}>No messages yet</Text>
                    <Text style={styles.emptyChatSubtext}>
                      Chat with your students
                    </Text>
                  </View>
                )}

                {chatMessages.map(msg => {
                  const isOwnMessage = msg.user_id === userId;

                  return (
                    <View
                      key={msg.id}
                      style={[
                        styles.chatMessageBubble,
                        isOwnMessage && styles.chatMessageBubbleOwn,
                      ]}
                    >
                      {!isOwnMessage && (
                        <Text style={styles.chatMessageSender}>{msg.user_name}</Text>
                      )}
                      <Text
                        style={[
                          styles.chatMessageText,
                          isOwnMessage && styles.chatMessageTextOwn,
                        ]}
                      >
                        {msg.message}
                      </Text>
                      <Text
                        style={[
                          styles.chatMessageTime,
                          isOwnMessage && styles.chatMessageTimeOwn,
                        ]}
                      >
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>

              {/* INPUT — FIXED */}
              <View style={styles.chatInputContainer}>
                <TextInput
                  style={styles.chatInput}
                  value={chatInput}
                  onChangeText={setChatInput}
                  placeholder={!userId ? 'Loading profile…' : 'Message students...'}
                  placeholderTextColor="#6B7280"
                  multiline
                  maxLength={500}
                  blurOnSubmit={false}
                  keyboardShouldPersistTaps="handled"
                  editable={!sendingMessage && !!userId}
                />
                <TouchableOpacity
                  onPress={sendChatMessage}
                  disabled={!chatInput.trim() || sendingMessage}
                  style={[
                    styles.sendButton,
                    (!chatInput.trim() || sendingMessage) && styles.sendButtonDisabled,
                  ]}
                >
                  <Send
                    size={20}
                    color={chatInput.trim() && !sendingMessage ? '#00D9FF' : '#4B5563'}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      );
    }

    // Web: Sidebar
    return (
      <View style={[styles.chatContainer, styles.chatSidebar]}>
        <View style={styles.chatHeader}>
          <MessageCircle size={20} color="#00D9FF" />
          <Text style={styles.chatHeaderText}>Class Chat</Text>
        </View>

        <ScrollView
          ref={chatScrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={styles.chatMessagesContent}
          showsVerticalScrollIndicator={false}
        >
          {chatMessages.length === 0 && (
            <View style={styles.emptyChat}>
              <Text style={styles.emptyChatText}>No messages yet</Text>
              <Text style={styles.emptyChatSubtext}>
                Chat with your students
              </Text>
            </View>
          )}

          {chatMessages.map(msg => {
            const isOwnMessage = msg.user_id === userId;

            return (
              <View
                key={msg.id}
                style={[
                  styles.chatMessageBubble,
                  isOwnMessage && styles.chatMessageBubbleOwn,
                ]}
              >
                {!isOwnMessage && (
                  <Text style={styles.chatMessageSender}>{msg.user_name}</Text>
                )}
                <Text
                  style={[
                    styles.chatMessageText,
                    isOwnMessage && styles.chatMessageTextOwn,
                  ]}
                >
                  {msg.message}
                </Text>
                <Text
                  style={[
                    styles.chatMessageTime,
                    isOwnMessage && styles.chatMessageTimeOwn,
                  ]}
                >
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.chatInputContainer}>
          <TextInput
            style={styles.chatInput}
            value={chatInput}
            onChangeText={setChatInput}
            placeholder={!userId ? 'Loading profile…' : 'Message students...'}
            placeholderTextColor="#6B7280"
            multiline
            maxLength={500}
            onKeyPress={e => {
              if (Platform.OS === 'web' && e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
                e.preventDefault();
                sendChatMessage();
              }
            }}
            blurOnSubmit={false}
            editable={!sendingMessage && !!userId}
          />
          <TouchableOpacity
            onPress={sendChatMessage}
            disabled={!chatInput.trim() || sendingMessage}
            style={[
              styles.sendButton,
              (!chatInput.trim() || sendingMessage) && styles.sendButtonDisabled,
            ]}
          >
            <Send
              size={20}
              color={chatInput.trim() && !sendingMessage ? '#00D9FF' : '#4B5563'}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <View style={styles.container}>
      <View style={[styles.mainContent, isWeb && !isMobile && styles.mainContentWithSidebar]}>
        {/* FEED COLUMN */}
        <View style={{ flex: 1, minWidth: 0 }}>
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
                {data.length} Question{data.length !== 1 ? 's' : ''}
              </Text>
            </View>
            <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
              <Text style={styles.nextBtnText}>▶ Next</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={scrollRef}
            style={styles.contentScroll}
            contentContainerStyle={styles.contentContainer}
          >
        <View ref={contentRef}>
        {data.map((item, qi) => {
          const conceptKeys = getSortedConceptKeys(item.class_json);

          return (
            <View key={item.topic_order} style={styles.questionBlock}>
              <View style={styles.questionHeader}>
                <View style={styles.questionNumberBadge}>
                  <Text style={styles.questionNumberText}>Q{qi + 1}</Text>
                </View>
                <Text style={styles.questionTitle}>{item.question}</Text>
              </View>

              {conceptKeys.map((key, ci) => {
                const concept = item.class_json[key];
                if (!concept || !concept.title) return null;

                const conceptKey = `concept-${qi}-${ci}`;
                const mcqKey = `mcq-${qi}-${ci}`;
                const doubtsKey = `doubts-${qi}-${ci}`;
                const trapKey = `trap-${qi}-${ci}`;
                const explanationKey = `explanation-${qi}-${ci}`;
                const wrongKey = `wrong-${qi}-${ci}`;

                return (
                  <View key={key} style={styles.conceptSection}>
                    <View
                      ref={(ref) => {
                        if (ref) blockRefs.current[conceptKey] = ref;
                      }}
                    >
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => toggleBlock(conceptKey)}
                        style={styles.conceptHeader}
                      >
                        <View style={styles.conceptBadge}>
                          <Text style={styles.conceptBadgeText}>{ci + 1}</Text>
                        </View>
                        <Text style={styles.conceptTitle}>{concept.title}</Text>
                      </TouchableOpacity>

                      {openBlocks[conceptKey] && (
                        <>
                          {concept.concept && concept.concept.length > 0 && (
                            <View style={styles.bulletSection}>
                              {concept.concept.map((point, pi) => (
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

                    {concept.mcq && concept.mcq.stem && (
                      <View
                        ref={(ref) => {
                          if (ref) blockRefs.current[mcqKey] = ref;
                        }}
                        style={styles.mcqCard}
                      >
                        <TouchableOpacity
                          activeOpacity={0.85}
                          onPress={() => toggleBlock(mcqKey)}
                          style={styles.cardHeader}
                        >
                          <Text style={styles.mcqLabel}>MCQ</Text>
                        </TouchableOpacity>

                        {openBlocks[mcqKey] && (
                          <>
                            <Text style={styles.mcqStem}>
                              {parseInlineMarkup(concept.mcq.stem)}
                            </Text>

                            {(['A', 'B', 'C', 'D'] as const).map(label => {
                              const optText = concept.mcq.options?.[label];
                              if (!optText) return null;
                              const isCorrect = concept.mcq.correct_answer === label;

                              return (
                                <View
                                  key={label}
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
                                      {label}
                                    </Text>
                                  </View>
                                  <Text
                                    style={[
                                      styles.optionText,
                                      isCorrect && styles.optionTextCorrect,
                                    ]}
                                  >
                                    {parseInlineMarkup(optText)}
                                  </Text>
                                </View>
                              );
                            })}

                          </>
                        )}
                      </View>
                    )}

                    {concept.mcq && concept.mcq.exam_trap && (
                      <View
                        ref={(ref) => {
                          if (ref) blockRefs.current[trapKey] = ref;
                        }}
                        style={styles.feedbackBlock}
                      >
                        <TouchableOpacity
                          activeOpacity={0.85}
                          onPress={() => toggleBlock(trapKey)}
                          style={styles.cardHeader}
                        >
                          <Text style={styles.feedbackLabel}>Exam Trap</Text>
                        </TouchableOpacity>
                        {openBlocks[trapKey] && (
                          <Text style={styles.feedbackText}>
                            {parseInlineMarkup(concept.mcq.exam_trap)}
                          </Text>
                        )}
                      </View>
                    )}

                    {concept.mcq && concept.mcq.explanation && (
                      <View
                        ref={(ref) => {
                          if (ref) blockRefs.current[explanationKey] = ref;
                        }}
                        style={styles.feedbackBlock}
                      >
                        <TouchableOpacity
                          activeOpacity={0.85}
                          onPress={() => toggleBlock(explanationKey)}
                          style={styles.cardHeader}
                        >
                          <Text style={styles.feedbackLabel}>Explanation</Text>
                        </TouchableOpacity>
                        {openBlocks[explanationKey] && (
                          <Text style={styles.feedbackText}>
                            {parseInlineMarkup(concept.mcq.explanation)}
                          </Text>
                        )}
                      </View>
                    )}

                    {concept.mcq && concept.mcq.wrong_answers_explained &&
                      Object.keys(concept.mcq.wrong_answers_explained).length > 0 && (
                        <View
                          ref={(ref) => {
                            if (ref) blockRefs.current[wrongKey] = ref;
                          }}
                          style={styles.feedbackBlock}
                        >
                          <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() => toggleBlock(wrongKey)}
                            style={styles.cardHeader}
                          >
                            <Text style={styles.feedbackLabel}>
                              Why Other Options Are Wrong
                            </Text>
                          </TouchableOpacity>
                          {openBlocks[wrongKey] &&
                            Object.entries(concept.mcq.wrong_answers_explained).map(
                              ([label, text]) => (
                                <View key={label} style={{ marginTop: 10, paddingLeft: 8 }}>
                                  <Text style={styles.wrongOptionLabel}>{label}.</Text>
                                  <Text style={styles.feedbackText}>
                                    {parseInlineMarkup(text)}
                                  </Text>
                                </View>
                              )
                            )}
                        </View>
                      )}

                    {concept.student_doubts && concept.student_doubts.length > 0 && (
                      <View
                        ref={(ref) => {
                          if (ref) blockRefs.current[doubtsKey] = ref;
                        }}
                        style={styles.doubtsCard}
                      >
                        <TouchableOpacity
                          activeOpacity={0.85}
                          onPress={() => toggleBlock(doubtsKey)}
                          style={styles.cardHeader}
                        >
                          <Text style={styles.doubtsLabel}>Student Doubts</Text>
                        </TouchableOpacity>

                        {openBlocks[doubtsKey] && (
                          <>
                            {concept.student_doubts.map((d, di) => (
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
                    )}

                    {ci < conceptKeys.length - 1 && (
                      <View style={styles.conceptDivider} />
                    )}
                  </View>
                );
              })}

              {qi < data.length - 1 && <View style={styles.questionDivider} />}
            </View>
          );
        })}

        <View style={{ height: 40 }} />
        </View>
      </ScrollView>

          {/* Mobile: Floating chat button */}
          {isMobile && !chatDrawerOpen && (
            <TouchableOpacity
              style={styles.floatingChatButton}
              onPress={toggleChatDrawer}
            >
              <MessageCircle size={24} color="#FFF" />
              {hasUnreadMessages && <View style={styles.chatBadgeDot} />}
            </TouchableOpacity>
          )}
        </View>

        {/* CHAT COLUMN */}
        {(isWeb && !isMobile) || chatDrawerOpen ? renderChatUI() : null}
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

  contentScroll: {
    flex: 1,
  },

  contentContainer: {
    padding: 16,
  },

  questionBlock: {
    gap: 14,
  },

  questionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 8,
  },

  questionNumberBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00D9FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  questionNumberText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F0F0F',
  },

  questionTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#F3EAD7',
    lineHeight: 25,
    marginTop: 7,
  },

  questionDivider: {
    height: 2,
    backgroundColor: '#2D2D2D',
    marginVertical: 24,
    borderRadius: 1,
  },

  conceptSection: {
    gap: 12,
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

  conceptDivider: {
    height: 1,
    backgroundColor: '#1F1F1F',
    marginVertical: 10,
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

  nextBtn: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },

  nextBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F0F0F',
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // Chat styles
  mainContent: {
    flex: 1,
  },

  mainContentWithSidebar: {
    flexDirection: 'row',
    flex: 1,
  },

  floatingChatButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#00D9FF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  chatBadgeDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#00D9FF',
  },

  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },

  overlayDismiss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  chatRoot: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    marginTop: 'auto',
    maxHeight: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },

  chatContainer: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },

  chatSidebar: {
    width: 350,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderLeftWidth: 1,
    borderLeftColor: '#2D2D2D',
  },

  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2D',
    backgroundColor: '#252525',
  },

  chatHeaderText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },

  closeButton: {
    padding: 4,
  },

  chatMessagesContent: {
    padding: 12,
    paddingBottom: 8,
    gap: 12,
  },

  emptyChat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },

  emptyChatText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
  },

  emptyChatSubtext: {
    fontSize: 13,
    color: '#4B5563',
  },

  chatMessageBubble: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 12,
    maxWidth: '85%',
    alignSelf: 'flex-start',
    gap: 4,
  },

  chatMessageBubbleOwn: {
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-end',
    borderWidth: 0,
  },

  chatMessageSender: {
    fontSize: 12,
    fontWeight: '700',
    color: '#34B7F1',
    marginBottom: 2,
  },

  chatMessageText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#EDEDED',
    lineHeight: 20,
  },

  chatMessageTextOwn: {
    color: '#000',
  },

  chatMessageTime: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },

  chatMessageTimeOwn: {
    color: '#666',
  },

  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#2D2D2D',
    backgroundColor: '#1F1F1F',
  },

  chatInput: {
    flex: 1,
    backgroundColor: '#252525',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#FFF',
    maxHeight: 120,
  },

  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#252525',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },

  sendButtonDisabled: {
    opacity: 0.5,
  },
});

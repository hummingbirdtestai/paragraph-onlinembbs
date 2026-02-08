// app/live-class/[id].tsx

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Dimensions,
  Platform,
  Modal,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MessageCircle, Send, X } from 'lucide-react-native';

import { supabase } from '@/lib/supabaseClient';

// Types
interface ChatMessage {
  id: string;
  battle_id: string;
  user_id: string;
  user_name: string;
  message: string;
  created_at: string;
}

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

  const scrollRef = useRef<ScrollView>(null);
  const chatScrollRef = useRef<ScrollView>(null);
  const chatChannelRef = useRef<any>(null);

  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mcqAttempts, setMcqAttempts] = useState<
    Record<number, { selected: 'A' | 'B' | 'C' | 'D' }>
  >({});

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [userName, setUserName] = useState('Student');
  const [userId, setUserId] = useState('');
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  // Platform detection
  const screenWidth = Dimensions.get('window').width;
  const isWeb = Platform.OS === 'web';
  const isMobile = screenWidth < 768;

  // 0️⃣ Load user profile
  useEffect(() => {
    const loadUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);

        // Try to get user profile for display name
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('user_name')
          .eq('user_id', user.id)
          .single();

        if (profile?.user_name) {
          setUserName(profile.user_name);
        }
      }
    };

    loadUserProfile();
  }, []);

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

  // 1️⃣.5️⃣ Load chat history
  useEffect(() => {
    if (!id) return;

    const loadChatHistory = async () => {
      const { data, error } = await supabase.rpc(
        'get_battle_chat_messages',
        { p_battle_id: id }
      );

      if (!error && data) {
        setChatMessages(data);
      }
    };

    loadChatHistory();
  }, [id]);

  // 2️⃣ Subscribe to realtime updates (feed + chat)
  useEffect(() => {
    if (!id) return;

    const feedChannel = supabase
      .channel(`battle:${id}`)
      .on(
        'broadcast',
        { event: 'class-feed-push' },
        payload => {
          setFeed(prev => {
            if (prev.some(p => p.seq === payload.payload.seq)) return prev;

            const next = [...prev, payload.payload];

            // Auto-scroll to latest broadcast
            setTimeout(() => {
              scrollRef.current?.scrollToEnd({ animated: true });
            }, 50);

            return next;
          });
        }
      )
      .subscribe();

    const chatChannel = supabase
      .channel(`battle-chat:${id}`)
      .on(
        'broadcast',
        { event: 'chat-message' },
        payload => {
          setChatMessages(prev => {
            // Deduplicate by id
            if (prev.some(m => m.id === payload.payload.id)) return prev;
            const updated = [...prev, payload.payload];

            // Mark as unread if drawer is closed
            if (!chatDrawerOpen) {
              setHasUnreadMessages(true);
            }

            // Auto-scroll chat to bottom
            setTimeout(() => {
              chatScrollRef.current?.scrollToEnd({ animated: true });
            }, 50);

            return updated;
          });
        }
      )
      .subscribe();

    chatChannelRef.current = chatChannel;

    return () => {
      supabase.removeChannel(feedChannel);
      supabase.removeChannel(chatChannel);
      chatChannelRef.current = null;
    };
  }, [id, chatDrawerOpen]);

  // Send chat message
  const sendChatMessage = async () => {
    if (!chatInput.trim() || !id || sendingMessage || !chatChannelRef.current) return;

    const messageText = chatInput.trim();
    setChatInput('');
    setSendingMessage(true);
    Keyboard.dismiss();

    try {
      // 1️⃣ Insert to DB first
      await supabase.rpc('insert_battle_chat_message', {
        p_battle_id: id,
        p_user_name: userName,
        p_message: messageText,
      });

      // 2️⃣ Fetch the inserted message to get real DB data
      const { data: insertedMessages, error: fetchError } = await supabase
        .from('battle_group_messages')
        .select('*')
        .eq('battle_id', id)
        .eq('user_id', userId)
        .eq('message', messageText)
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      // 3️⃣ Broadcast using real DB row
      if (insertedMessages && insertedMessages.length > 0) {
        await chatChannelRef.current.send({
          type: 'broadcast',
          event: 'chat-message',
          payload: insertedMessages[0],
        });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setChatInput(messageText); // Restore input on error
    } finally {
      setSendingMessage(false);
    }
  };

  // Toggle chat drawer
  const toggleChatDrawer = () => {
    setChatDrawerOpen(!chatDrawerOpen);
    if (!chatDrawerOpen) {
      // Clear unread when opening
      setHasUnreadMessages(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator size="large" color="#00D9FF" />
        <Text style={styles.loadingText}>Loading class...</Text>
      </View>
    );
  }

  // Render chat UI
  const renderChatUI = () => {
    const chatUI = (
      <View style={[styles.chatContainer, isWeb && !isMobile && styles.chatSidebar]}>
        <View style={styles.chatHeader}>
          <MessageCircle size={20} color="#00D9FF" />
          <Text style={styles.chatHeaderText}>Class Chat</Text>
          {isMobile && (
            <TouchableOpacity onPress={toggleChatDrawer} style={styles.closeButton}>
              <X size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          ref={chatScrollRef}
          style={styles.chatMessages}
          contentContainerStyle={styles.chatMessagesContent}
          showsVerticalScrollIndicator={false}
        >
          {chatMessages.length === 0 && (
            <View style={styles.emptyChat}>
              <Text style={styles.emptyChatText}>No messages yet</Text>
              <Text style={styles.emptyChatSubtext}>
                Ask your doubts here
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
            placeholder="Ask a doubt..."
            placeholderTextColor="#6B7280"
            multiline
            maxLength={500}
            onSubmitEditing={sendChatMessage}
            blurOnSubmit={false}
            editable={!sendingMessage}
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

    // Mobile: Modal drawer
    if (isMobile) {
      return (
        <Modal
          visible={chatDrawerOpen}
          transparent
          animationType="none"
          onRequestClose={toggleChatDrawer}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={toggleChatDrawer}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.drawerContainer}
            >
              <TouchableOpacity activeOpacity={1} onPress={() => {}}>
                {chatUI}
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </TouchableOpacity>
        </Modal>
      );
    }

    // Web: Sidebar
    return chatUI;
  };

  return (
    <View style={styles.container}>
      <View style={[styles.mainContent, isWeb && !isMobile && styles.mainContentWithSidebar]}>
        <ScrollView
          ref={scrollRef}
          style={styles.contentScroll}
          contentContainerStyle={styles.contentContainer}
        >
          {feed.map((item, idx) => {
          switch (item.type) {
case 'topic':
  return (
    <View key={item.seq} style={styles.topicBlock}>
      <Text style={styles.topicText}>
        {item.meta?.topic}
      </Text>
    </View>
  );
              
            case 'concept':
              return (
                <View key={item.seq} style={styles.conceptSection}>
                  <View style={styles.conceptHeader}>
                    <View style={styles.conceptBadge}>
                      <Text style={styles.conceptBadgeText}>
                        {item.meta?.ci != null ? item.meta.ci + 1 : ''}
                      </Text>
                    </View>
                    <Text style={styles.conceptTitle}>
                      {item.meta?.title || 'Concept'}
                    </Text>
                  </View>

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
                </View>
              );

            case 'mcq':
              const attempt = mcqAttempts[item.seq];
              const hasAnswered = !!attempt;

              return (
                <View key={item.seq} style={styles.mcqCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.mcqLabel}>MCQ</Text>
                  </View>

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
                </View>
              );

            case 'exam_trap':
              return (
                <View key={item.seq} style={styles.feedbackBlock}>
                  <Text style={styles.feedbackLabel}>Exam Trap</Text>
                  <Text style={styles.feedbackText}>
                    {parseInlineMarkup(item.payload)}
                  </Text>
                </View>
              );

            case 'explanation':
              return (
                <View key={item.seq} style={styles.feedbackBlock}>
                  <Text style={styles.feedbackLabel}>Explanation</Text>
                  <Text style={styles.feedbackText}>
                    {parseInlineMarkup(item.payload)}
                  </Text>
                </View>
              );

            case 'wrong_answers':
              return (
                <View key={item.seq} style={styles.feedbackBlock}>
                  <Text style={styles.feedbackLabel}>
                    Why Other Options Are Wrong
                  </Text>
                  {Object.entries(item.payload).map(
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
                  <Text style={styles.doubtsLabel}>Student Doubts</Text>

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
                </View>
              );

            default:
              return null;
          }
          })}

          <View style={{ height: 40 }} />
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

      {/* Web: Sidebar or Mobile: Drawer */}
      {(isWeb && !isMobile) || chatDrawerOpen ? renderChatUI() : null}
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
topicBlock: {
  marginBottom: 16,
  paddingVertical: 10,
  borderBottomWidth: 2,
  borderBottomColor: '#2D2D2D',
},

topicText: {
  fontSize: 18,
  fontWeight: '900',
  color: '#FACC15',
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
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  drawerContainer: {
    maxHeight: '50%',
  },

  chatContainer: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    height: '100%',
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

  chatMessages: {
    flex: 1,
  },

  chatMessagesContent: {
    padding: 12,
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
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 12,
    maxWidth: '85%',
    alignSelf: 'flex-start',
    gap: 4,
  },

  chatMessageBubbleOwn: {
    backgroundColor: '#00D9FF20',
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderColor: '#00D9FF40',
  },

  chatMessageSender: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00D9FF',
    marginBottom: 2,
  },

  chatMessageText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#E5E7EB',
    lineHeight: 20,
  },

  chatMessageTextOwn: {
    color: '#FFF',
  },

  chatMessageTime: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },

  chatMessageTimeOwn: {
    color: '#9CA3AF',
  },

  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#2D2D2D',
    backgroundColor: '#1F1F1F',
  },

  chatInput: {
    flex: 1,
    backgroundColor: '#252525',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#FFF',
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#2D2D2D',
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
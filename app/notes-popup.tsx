// app/notes-popup.tsx
import MainLayout from '@/components/MainLayout';
import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { StudentBubble } from '@/components/chat/StudentBubble';
import MentorBubbleReply from '@/components/types/MentorBubbleReply';

function stripControlBlocks(text: string) {
  return text
    .replace(/\[SYSTEM_RETRY\]/g, "")
    .replace(
      /\[(CORE_CONCEPT|GAP|EXPLANATION|COMMON_CONFUSION|MEMORY_HOOK|SUB_CONCEPT)\]:\s*/gi,
      ""
    )
    .replace(/\[STUDENT_REPLY_REQUIRED\]/g, "")
    .replace(/\[FEEDBACK_CORRECT\]/g, "")
    .replace(/\[FEEDBACK_WRONG\]/g, "")
    .replace(/\[SESSION_COMPLETED\]/g, "")
    .replace(/^Correct:\s*[A-D]\s*$/gim, "")
    .trim();
}

export default function NotesPopupScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { phase_id } = useLocalSearchParams<{ phase_id: string }>();

  const [conversation, setConversation] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const scrollViewRef = useRef<ScrollView>(null);

  // 🔹 Load archived discussion
  useEffect(() => {
    if (!user?.id || !phase_id) return;

    const loadNotes = async () => {
      setLoading(true);

      const { data, error } = await supabase.rpc(
        'get_archived_phase_discussion',
        {
          p_student_id: user.id,
          p_phase_id: phase_id,
        }
      );

      if (!error && data?.length === 1) {
        setConversation(data[0].dialogs || []);
      }

      setLoading(false);
    };

    loadNotes();
  }, [user?.id, phase_id]);

  // 🔹 Auto scroll (same as live chat)
  useEffect(() => {
    const t = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: false });
    }, 80);
    return () => clearTimeout(t);
  }, [conversation]);

  return (
    <MainLayout>
      <View style={styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            ref={scrollViewRef}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            <View style={styles.webCenterWrapper}>
              <View style={styles.webContent}>
                {/* 🔙 Back */}
                <View style={styles.backButtonContainer}>
                  <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>← Back</Text>
                  </TouchableOpacity>
                </View>

                {/* 🔄 Loading */}
                {loading && (
                  <Text style={{ color: '#999', textAlign: 'center', marginTop: 20 }}>
                    Loading notes…
                  </Text>
                )}

                {/* 🧠 EXACT SAME RENDERING AS LIVE CHAT */}
                {!loading &&
                  conversation
                    .filter(
                      (msg) =>
                        msg.role !== 'system' &&
                        !(msg.role === 'student' && !msg.content?.trim())
                    )
                    .map((msg, index) =>
                      msg.role === 'student' ? (
                        <StudentBubble key={index} text={msg.content} />
                      ) : (
                        <MentorBubbleReply
                          key={index}
                          markdownText={
                            typeof msg.content === 'string'
                              ? stripControlBlocks(msg.content)
                              : ''
                          }
                        />
                      )
                    )}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </MainLayout>
  );
}

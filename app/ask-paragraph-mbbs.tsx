//ask-paragraph-mbbs.tsx
import MainLayout from '@/components/MainLayout';
import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { Send } from 'lucide-react-native';
import { SUBJECTS_BY_YEAR } from '@/constants/subjects';
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import HighYieldFactSheetScreen from "@/components/types/HighYieldFactSheetScreen";
import MCQChatScreen from "@/components/types/MCQScreen";
import CBMERenderer from "@/components/types/CBMERenderer";
import { useRouter } from "expo-router";
import { theme } from '@/constants/theme';
import { StudentBubble } from '@/components/chat/StudentBubble';
import MentorBubbleReply from '@/components/types/MentorBubbleReply';
import { MessageInput } from '@/components/chat/MessageInput';
import LLMMCQCard from '@/components/chat/llm/LLMMCQCard';
import { ActivityIndicator } from 'react-native';
import SubjectProgressDashboard from '@/components/progress/SubjectProgressDashboard';
import ConfettiCannon from 'react-native-confetti-cannon';
function stripControlBlocks(text: string) {
  return text
    .replace(
      /\[(CORE_CONCEPT|GAP|EXPLANATION|COMMON_CONFUSION|MEMORY_HOOK|SUB_CONCEPT)\]:\s*/gi,
      ""
    )
    .replace(/\[STUDENT_REPLY_REQUIRED\]/g, "")
    .replace(/\[FEEDBACK_CORRECT\]/g, "")
    .replace(/\[FEEDBACK_WRONG\]/g, "")
     .replace(/\[SESSION_COMPLETED\]/g, "") // ✅ ADD THIS LINE
    .replace(/^Correct:\s*[A-D]\s*$/gim, "")
    .trim();
}
type Year = 'first' | 'second' | 'third' | 'final';

type Message = {
  id: string;
  text: string;
  sender: 'student' | 'mentor';
  timestamp: Date;
};

export default function AskParagraphChat() {
  const [selectedYear, setSelectedYear] = useState<Year | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [chatStarted, setChatStarted] = useState(false);
 // 🔑 Phase execution state (RPC-driven)
  const [sessionCompleted, setSessionCompleted] = useState(false);
const [showConfetti, setShowConfetti] = useState(false);
const [currentPhase, setCurrentPhase] = useState<any | null>(null);
const [loadingPhase, setLoadingPhase] = useState(false);
  const { user } = useAuth();
const router = useRouter();
  const conversationRef = useRef<any[]>([]);
  const [showSubjectProgress, setShowSubjectProgress] = useState(false);
  const yearOptions: { key: Year; label: string }[] = [
    { key: 'first', label: 'First Year' },
    { key: 'second', label: 'Second Year' },
    { key: 'third', label: 'Third Year' },
    { key: 'final', label: 'Final Year' },
  ];
const [sessionId, setSessionId] = useState<string | null>(null);
  const [activeMcqId, setActiveMcqId] = useState<string | null>(null); // ✅ HERE
const [conversation, setConversation] = useState<any[]>([]);
const [tutorMode, setTutorMode] = useState<"idle" | "active">("idle");
  const [isStartingDiscussion, setIsStartingDiscussion] = useState(false);
const scrollViewRef = useRef<ScrollView>(null);
const [isTyping, setIsTyping] = useState(false);
  useEffect(() => {
  conversationRef.current = conversation;
}, [conversation]);
useEffect(() => {
  const timeout = setTimeout(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, 100);

  return () => clearTimeout(timeout);
}, [conversation, isTyping]);


const [nextSuggestions, setNextSuggestions] = useState<any[]>([]);
const handleSendMessage = async (message: string) => {
if (!message.trim() || isTyping) return;
    // 🔑 EXACT LINE YOU ASKED ABOUT
  if (!user?.id || !activeMcqId) return;


  setConversation(prev => [
    ...prev,
    { role: "student", content: message }
  ]);

  setIsTyping(true);

  try {
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL!;

    const res = await fetch(`${API_BASE_URL}/ask-paragraph-mbbs/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
  student_id: user.id,
  mcq_id: activeMcqId,
  message,
}),
    });

    if (!res.body) throw new Error("No stream body");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    let done = false;

   while (!done) {
  const { value, done: doneReading } = await reader.read();
  done = doneReading;

  if (!value) continue;

  const chunk = decoder.decode(value, { stream: true });

  // 1️⃣ Render streamed chunk ONCE
  setConversation(prev => {
    const updated = [...prev];
    const last = updated[updated.length - 1];

    if (!last || last.role !== "mentor") {
      updated.push({ role: "mentor", content: chunk });
    } else {
      updated[updated.length - 1] = {
        ...last,
        content: last.content + chunk,
      };
    }

    return updated;
  });
// 🔁 SYSTEM RETRY — re-trigger same answer
if (chunk.includes("[SYSTEM_RETRY]")) {
  setIsTyping(false);

  // resend last student answer automatically
  const lastStudent = conversationRef.current
    .slice()
    .reverse()
    .find(m => m.role === "student");

  if (lastStudent?.content) {
    handleSendMessage(lastStudent.content);
  }

  return; // ⛔ stop this stream
}

  // 2️⃣ Detect session completion AFTER rendering
     
  if (chunk.includes("[SESSION_COMPLETED]")) {
    setSessionCompleted(true);
    setTutorMode("idle");
    setIsTyping(false);
      setShowConfetti(true); // 🎉 ADD THIS
    break; // ✅ exit loop cleanly
  }
}
  } catch (e) {
    console.error("Chat error", e);
  } finally {
    setIsTyping(false);
  }
};

  const handleStartChat = async () => {
     setSessionCompleted(false);   // 🔑 ADD THIS LINE
    setShowSubjectProgress(false);
  if (!user?.id || !selectedSubject) return;

  setLoadingPhase(true);

  try {
   const { data, error } = await supabase.rpc(
  "start_pointer",
  {
    p_student_id: user.id,
    p_subject: selectedSubject,
  }
);

// 🔍 RAW RPC RESPONSE
console.log("🟢 start_pointer RAW response:", {
  data,
  error,
});

// 🔍 SANITY CHECK FIELDS
if (data) {
  console.log("🧭 start_pointer PARSED:", {
    status: data.status,
    phase_type: data.phase_type,
    react_order_final: data.react_order_final,
    phase_row_id: data.phase_row_id,
    subject: data.subject,
    chapter: data.chapter,
    topic: data.topic,
    has_phase_json: !!data.phase_json,
    phase_json_keys: data.phase_json ? Object.keys(data.phase_json) : null,
  });
}


    if (error) {
      console.error("❌ start_pointer error", error);
      return;
    }

    if (data?.status === "subject_completed") {
      alert("🎉 Subject completed!");
      return;
    }

    // 🔑 SINGLE SOURCE OF TRUTH
    setCurrentPhase(data);
    setChatStarted(true);

  } finally {
    setLoadingPhase(false);
  }
};
const handleDiscussWithParagraph = async () => {
    setSessionCompleted(false);   // 🔑 ADD THIS LINE
  if (!currentPhase || !user?.id) return;
// ✅ ADD THESE TWO LINES
  setIsStartingDiscussion(true);
  setTutorMode("idle"); // lock input
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL!;

  const payload =
    currentPhase.phase_type === "concept"
      ? {
          type: "concept",
          chapter: currentPhase.chapter,
          topic: currentPhase.topic,
        }
      : currentPhase.phase_json; // MCQ unchanged

  console.log("🚀 Ask-Paragraph START payload", {
    student_id: user.id,
    mcq_id: currentPhase.phase_row_id,
    mcq_payload: payload,
  });

  const res = await fetch(`${API_BASE_URL}/ask-paragraph-mbbs/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      student_id: user.id,
      mcq_id: currentPhase.phase_row_id, // 🔑 always phase row id
      mcq_payload: payload,
    }),
  });

if (!res.ok) {
  console.error("❌ Start failed", res.status);
  setIsStartingDiscussion(false);   // 🔑 IMPORTANT
  return;
}

  const data = await res.json();

  setSessionId(data.session_id);
  setActiveMcqId(currentPhase.phase_row_id);   // 🔑 REQUIRED
  setConversation(data.final_dialogs || []);
  setTutorMode("active");
  setIsStartingDiscussion(false); // ✅ DONE
};



  const renderSelectionScreen = () => (
    <View style={styles.selectionContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.pillContainer}
        contentContainerStyle={styles.pillContentContainer}
      >
        {yearOptions.map((year) => (
          <TouchableOpacity
            key={year.key}
            style={[
              styles.pill,
              styles.pillYear,
              selectedYear === year.key && styles.pillSelected,
            ]}
            onPress={() => {
              setSelectedYear(year.key);
              setSelectedSubject(null);
            }}
          >
            <Text
              style={[
                styles.pillText,
                selectedYear === year.key && styles.pillTextSelected,
              ]}
            >
              {year.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedYear && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pillContainer}
          contentContainerStyle={styles.pillContentContainer}
        >
          {SUBJECTS_BY_YEAR[selectedYear].map((subject) => (
            <TouchableOpacity
              key={subject}
              style={[
                styles.pill,
                styles.pillSubject,
                selectedSubject === subject && styles.pillSelected,
              ]}
              onPress={() => {
  setSelectedSubject(subject);
  setChatStarted(false);
  setShowSubjectProgress(true);
}}
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
        </ScrollView>
      )}

      {selectedYear && selectedSubject && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pillContainer}
          contentContainerStyle={styles.pillContentContainer}
        >
          <TouchableOpacity style={styles.startButton} onPress={handleStartChat}>
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
const renderPhase = () => {
  if (!currentPhase) return null;

  return (
    <View>
      {/* ✅ CBME HEADER */}
      <CBMERenderer
        cbmeMeta={{
          chapter: currentPhase.chapter,
          topic: currentPhase.topic,
          chapter_order: currentPhase.chapter_order,
          topic_order: currentPhase.topic_order,
        }}
      />

      {/* 🔵 CONCEPT PHASE */}
      {currentPhase.phase_type === "concept" && (
        <HighYieldFactSheetScreen
          data={currentPhase.phase_json?.concept ?? ""}
        />
      )}

      {/* 🟣 MCQ PHASE */}
      {currentPhase.phase_type === "mcq" && (
        <MCQChatScreen
          item={currentPhase.phase_json}
          studentId={currentPhase.student_id}
          mcqId={currentPhase.phase_row_id}
          correctAnswer={currentPhase.phase_json?.correct_answer}
          reactOrderFinal={currentPhase.react_order_final}
          phaseUniqueId={currentPhase.phase_row_id}
          subject={currentPhase.subject}
          isBookmarked={false}
          mode="practice"
        />
      )}

     
    </View>
  );
};

return (
  <MainLayout>
    <View style={styles.container}>


      {/* ───────── CHAT SCROLL ───────── */}
      <KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.OS === "ios" ? "padding" : undefined}
>

<ScrollView
  ref={scrollViewRef}
  style={{ flex: 1 }}
  contentContainerStyle={{ paddingBottom: 120 }}
  keyboardShouldPersistTaps="handled"
>
{showSubjectProgress && selectedSubject && user?.id && (
  <SubjectProgressDashboard
    student_id={user.id}
    subject={selectedSubject}
  />
)}

  {/* ───── Selection / Phase content scrolls ───── */}
  {!chatStarted && renderSelectionScreen()}

  {chatStarted && loadingPhase && (
    <Text style={{ color: "#999", textAlign: "center", marginTop: 20 }}>
      Loading…
    </Text>
  )}

  {chatStarted && !loadingPhase && renderPhase()}

  {/* ───── Discuss CTA (VISIBLE AFTER SCROLL) ───── */}
{currentPhase && !sessionId && !isStartingDiscussion && (
  <View style={styles.discussContainer}>
    <TouchableOpacity
      style={styles.discussButton}
      onPress={handleDiscussWithParagraph}
    >
        <Text style={styles.discussButtonText}>
          💬 Discuss with Paragraph AI Tutor
        </Text>
      </TouchableOpacity>
    </View>
  )}
{isStartingDiscussion && (
  <MentorBubbleReply markdownText="⏳ *Paragraph AI Mentor is starting discussion…*" />
)}
  {/* ───── Chat messages (only after chat starts) ───── */}
  {conversation
    .filter(msg => msg.role !== "system")
    .map((msg, index) =>
      msg.role === "student" ? (
        <StudentBubble key={index} text={msg.content} />
      ) : (
        <MentorBubbleReply
          key={index}
          markdownText={
            typeof msg.content === "string"
              ? stripControlBlocks(msg.content)
              : ""
          }
        />
      )
    )
  }
{/* 🔴 NEXT CBME CTA — INSERT HERE */}
{sessionCompleted && (
  <View style={styles.nextConceptContainer}>
    <TouchableOpacity
      style={styles.nextConceptButton}
      onPress={() => {
        setConversation([]);
        setSessionCompleted(false);
        setShowConfetti(false); // ✅ RESET HERE
        setTutorMode("idle");
        setSessionId(null);
        setActiveMcqId(null);
setIsStartingDiscussion(false); // 🔑 ADD THIS
        // 🔑 Load next CBME phase
         // 🔑 ADD THIS LINE HERE
  setCurrentPhase(null);
        handleStartChat();
      }}
    >
      <Text style={styles.nextConceptText}>
        ▶ Next CBME Concept
      </Text>
    </TouchableOpacity>
  </View>
)}

  {isTyping && (
    <MentorBubbleReply markdownText="💬 *Paragraph Mentor is typing…*" />
  )}

</ScrollView>

{/* ───────── INPUT BAR (ONLY AFTER CHAT STARTS) ───────── */}
{tutorMode === "active" && sessionId && !sessionCompleted && (
  <View style={styles.inputContainer}>
    <MessageInput
      onSend={handleSendMessage}
      disabled={isTyping}
      placeholder="Answer or ask anything…"
    />
  </View>
)}
</KeyboardAvoidingView>
    </View>
    {/* 🎉 CONFETTI ON SESSION COMPLETE */}
{showConfetti && (
  <ConfettiCannon
    count={180}
    origin={{ x: -10, y: 0 }}
    fadeOut
  />
)}

  </MainLayout>
);
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b141a',
  },
  selectionContainer: {
    flex: 1,
    paddingTop: 8,
    gap: 12,
  },
  pillContainer: {
    flexGrow: 0,
  },
  pillContentContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#1c2730',
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#1c2730',
  },
  pillSelected: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  pillYear: {
    borderRadius: 20,
    borderWidth: 1.5,
    backgroundColor: '#0d1821',
  },
  pillYearSelected: {
    backgroundColor: '#065f46',
    borderColor: '#10b981',
  },
  pillSubject: {
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#1c2730',
    borderStyle: 'solid',
  },
  pillSubjectSelected: {
    backgroundColor: '#0d9668',
    borderColor: '#10b981',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8b949e',
  },
  pillTextSelected: {
    color: '#fff',
  },
  startButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#059669',
    borderWidth: 2,
    borderColor: '#10b981',
  },
  startButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  messageRow: {
    marginBottom: 12,
    flexDirection: 'row',
  },
  messageRowStudent: {
    justifyContent: 'flex-end',
  },
  messageRowMentor: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  messageBubbleStudent: {
    backgroundColor: '#10b981',
    borderBottomRightRadius: 4,
  },
  messageBubbleMentor: {
    backgroundColor: '#1c2730',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  messageTextStudent: {
    color: '#fff',
  },
  messageTextMentor: {
    color: '#e0e0e0',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8b949e',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#0b141a',
    borderTopWidth: 1,
    borderTopColor: '#1c2730',
  },
  input: {
    flex: 1,
    backgroundColor: '#1c2730',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 12,
    fontSize: 15,
    color: '#fff',
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#1c2730',
  },
  discussContainer: {
  paddingHorizontal: 16,
  paddingVertical: 20,
  borderTopWidth: 1,
  borderTopColor: "#1c2730",
  backgroundColor: "#0b141a",
},

discussButton: {
  paddingVertical: 14,
  borderRadius: 10,
  borderWidth: 1.5,
  borderColor: "#10b981",
  backgroundColor: "#0d2017",
  alignItems: "center",
},

discussButtonText: {
  color: "#10b981",
  fontSize: 15,
  fontWeight: "700",
},
  nextConceptContainer: {
  paddingVertical: 24,
  alignItems: "center",
},

nextConceptButton: {
  paddingVertical: 14,
  paddingHorizontal: 32,
  borderRadius: 24,
  backgroundColor: "#10b981",
},

nextConceptText: {
  color: "#ffffff",
  fontSize: 16,
  fontWeight: "700",
},

});

// cbmeMCQChatScreen.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
} from "react-native";

/* ───────────────────────────────────────────── */
/* TYPES */
/* ───────────────────────────────────────────── */

interface MCQData {
  id: string;
  stem: string;
  options: { [key: string]: string } | string[];
  feedback: {
    wrong: string;
    correct: string;
  };
  learning_gap: string;
  correct_answer: string;
}

/* ───────────────────────────────────────────── */
/* COMPONENT */
/* ───────────────────────────────────────────── */

export default function MCQChatScreen({
  item,
  studentId,
  conceptId,
  mcqId,
  correctAnswer,
  phaseUniqueId,
  mode = "practice",
  onAnswerSelected,
  autoSubmit = false,
}: {
  item: MCQData;
  studentId?: string;
  conceptId?: string;
  mcqId?: string;
  correctAnswer?: string;
  phaseUniqueId?: string;
  mode?: "practice" | "video";
  onAnswerSelected?: (option: string) => void;
  autoSubmit?: boolean;
}) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  /* 🔁 Reset state on new MCQ */
  useEffect(() => {
    setSelectedOption(null);
    setShowFeedback(false);
  }, [item.id]);

  /* ⏰ Auto submit */
  useEffect(() => {
    if (autoSubmit && !selectedOption) {
      const correct = correctAnswer || item.correct_answer;
      setSelectedOption(correct);
      setShowFeedback(true);
      onAnswerSelected?.(correct);
    }
  }, [autoSubmit, selectedOption, correctAnswer, item.correct_answer]);

  /* 🟧 Option select */
  const handleOptionSelect = (option: string) => {
    if (selectedOption) return;

    setSelectedOption(option);
    setShowFeedback(true);
    onAnswerSelected?.(option);

    if (!studentId) return;
  };

  const resolvedCorrect = correctAnswer || item.correct_answer;

  return (
    <View style={styles.mcqContainer}>
      <MCQQuestion mcq={item} />

      <OptionsGrid
        options={item.options}
        selectedOption={selectedOption}
        correctAnswer={resolvedCorrect}
        onSelect={handleOptionSelect}
      />

      {showFeedback && selectedOption && (
        <FeedbackSection
          feedback={
            selectedOption === resolvedCorrect
              ? item.feedback.correct
              : item.feedback.wrong
          }
          learningGap={item.learning_gap}
          correctAnswer={resolvedCorrect}
        />
      )}
    </View>
  );
}

/* ───────────────────────────────────────────── */
/* SUB COMPONENTS */
/* ───────────────────────────────────────────── */

function MCQQuestion({ mcq }: { mcq: MCQData }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      delay: 100,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.mcqCard, { opacity: fadeAnim }]}>
      {renderMarkupText(mcq.stem, styles.mcqStem)}
    </Animated.View>
  );
}

function OptionsGrid({
  options,
  selectedOption,
  correctAnswer,
  onSelect,
}: {
  options: MCQData["options"] | string[];
  selectedOption: string | null;
  correctAnswer: string;
  onSelect: (option: string) => void;
}) {
  const entries = Array.isArray(options)
    ? options.map((opt, i) => [
        String.fromCharCode(65 + i),
        opt.replace(/^([A-D]\)\s*)/, ""),
      ])
    : Object.entries(options || {});

  return (
    <View style={styles.optionsContainer}>
      {entries.map(([key, text]) => {
        const isCorrect = selectedOption && key === correctAnswer;
        const isWrong = selectedOption === key && key !== correctAnswer;
        const disabled = selectedOption !== null;

        return (
          <OptionButton
            key={key}
            label={key}
            text={text}
            isCorrect={isCorrect}
            isWrong={isWrong}
            disabled={disabled}
            onPress={() => onSelect(key)}
          />
        );
      })}
    </View>
  );
}

function OptionButton({
  label,
  text,
  isCorrect,
  isWrong,
  disabled,
  onPress,
}: {
  label: string;
  text: string;
  isCorrect: boolean;
  isWrong: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[
        styles.optionButton,
        {
          backgroundColor: isCorrect
            ? "#1a4d2e"
            : isWrong
            ? "#4d1a1a"
            : "#1f1f1f",
          borderColor: isCorrect
            ? "#25D366"
            : isWrong
            ? "#d32f2f"
            : "#2a2a2a",
          opacity: disabled && !isCorrect ? 0.5 : 1,
        },
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.optionLabel}>{label}</Text>
      {renderMarkupText(text, styles.optionText)}
    </Pressable>
  );
}

function FeedbackSection({
  feedback,
  learningGap,
  correctAnswer,
}: {
  feedback: string;
  learningGap: string;
  correctAnswer: string;
}) {
  return (
    <View style={styles.feedbackContainer}>
      <View style={styles.mentorBubble}>
        {renderMarkupText(feedback, styles.mentorText)}
      </View>

      <View style={styles.mentorBubble}>
        <Text style={styles.learningGapLabel}>📚 Learning Gap</Text>
        {renderMarkupText(learningGap, styles.mentorText)}
      </View>

      <View style={[styles.mentorBubble, styles.correctAnswerBubble]}>
        <Text style={styles.correctAnswerLabel}>✅ Correct Answer</Text>
        <Text style={styles.correctAnswerValue}>{correctAnswer}</Text>
      </View>
    </View>
  );
}

/* ───────────────────────────────────────────── */
/* MARKUP HANDLING (FIXED) */
/* ───────────────────────────────────────────── */

function normalizeUnderscores(text: string) {
  // _word_ → *word*  (exam-safe)
  return text.replace(
    /(^|\s)_([A-Za-z0-9+−→<>/=]+)_(?=\s|$)/g,
    "$1*$2*"
  );
}

function renderMarkupText(
  content: string | undefined | null,
  baseStyle: any
) {
  if (!content || typeof content !== "string") return null;

  const normalized = normalizeUnderscores(content);
  const lines = normalized.split("\n");

  return (
    <Text style={baseStyle}>
      {lines.map((line, i) => (
        <React.Fragment key={i}>
          {parseInlineMarkup(line)}
          {i < lines.length - 1 && "\n"}
        </React.Fragment>
      ))}
    </Text>
  );
}

function parseInlineMarkup(text: string) {
  const parts: React.ReactNode[] = [];
  let key = 0;

  const regex = /(\*_[^_]+_\*|\*[^*]+\*|_[^_]+_)/g;
  const segments = text.split(regex);

  segments.forEach((seg) => {
    if (seg.startsWith("*_")) {
      parts.push(
        <Text key={key++} style={styles.boldItalic}>
          {seg.slice(2, -2)}
        </Text>
      );
    } else if (seg.startsWith("*")) {
      parts.push(
        <Text key={key++} style={styles.bold}>
          {seg.slice(1, -1)}
        </Text>
      );
    } else if (seg.startsWith("_")) {
      parts.push(
        <Text key={key++} style={styles.italic}>
          {seg.slice(1, -1)}
        </Text>
      );
    } else {
      parts.push(<Text key={key++}>{seg}</Text>);
    }
  });

  return <>{parts}</>;
}

/* ───────────────────────────────────────────── */
/* STYLES */
/* ───────────────────────────────────────────── */

const styles = StyleSheet.create({
  mcqContainer: { paddingHorizontal: 16, marginTop: 16 },

  mcqCard: {
    backgroundColor: "#1a3a2e",
    borderLeftWidth: 4,
    borderLeftColor: "#25D366",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },

  mcqStem: { fontSize: 15, lineHeight: 24, color: "#e1e1e1" },

  optionsContainer: { marginBottom: 16 },

  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 2,
  },

  optionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#25D366",
    marginRight: 12,
    minWidth: 24,
  },

  optionText: { flex: 1, fontSize: 15, lineHeight: 22, color: "#e1e1e1" },

  feedbackContainer: { marginTop: 8 },

  mentorBubble: {
    maxWidth: "85%",
    backgroundColor: "#1f1f1f",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },

  mentorText: { fontSize: 15, lineHeight: 22, color: "#e1e1e1" },

  learningGapLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#888",
    marginBottom: 8,
  },

  correctAnswerBubble: {
    backgroundColor: "#1a2a1a",
    borderWidth: 1,
    borderColor: "#25D366",
  },

  correctAnswerLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#888",
    marginBottom: 6,
  },

  correctAnswerValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#25D366",
  },

  bold: { fontWeight: "700" },
  italic: { fontStyle: "italic" },
  boldItalic: { fontWeight: "700", fontStyle: "italic" },
});

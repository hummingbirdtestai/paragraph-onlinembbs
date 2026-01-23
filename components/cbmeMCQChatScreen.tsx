//cbmeMCQChatScreen.tsx
//MCQChatScreen.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Animated,
} from "react-native";

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
// 🔁 Reset MCQ state when a NEW MCQ loads
useEffect(() => {
  console.log("🔄 [MCQScreen] Resetting state for new MCQ", item.id);

  setSelectedOption(null);
  setShowFeedback(false);
}, [item.id]);

  useEffect(() => {
    console.log("🟦 [MCQScreen] Mounted MCQ", {
      mcqId,
      conceptId,
      correctAnswer,
      mcqData: item,
    });
  }, []);

  // Auto-submit correct answer when countdown hits 0
useEffect(() => {
  if (autoSubmit && !selectedOption) {
    const correct_answer = correctAnswer || item.correct_answer;

    console.log("⏰ [MCQScreen] Auto submit triggered", {
      correct_answer,
    });

    setSelectedOption(correct_answer);
    setShowFeedback(true);
    onAnswerSelected?.(correct_answer);
  }
}, [autoSubmit, selectedOption, correctAnswer, item.correct_answer]);

// 🔍 DEBUG: confirm feedback render cycle
useEffect(() => {
  if (showFeedback && selectedOption) {
    console.log("✅ [MCQScreen] Feedback rendered", {
      selectedOption,
      resolvedCorrect: correctAnswer || item.correct_answer,
      isCorrect: selectedOption === (correctAnswer || item.correct_answer),
      feedbackText:
        selectedOption === (correctAnswer || item.correct_answer)
          ? item.feedback.correct
          : item.feedback.wrong,
    });
  }
}, [showFeedback, selectedOption]);

  const handleOptionSelect = async (option: string) => {
    if (selectedOption) return;

    console.log("🟧 [MCQScreen] Option Selected", {
      selected: option,
      mcqId,
      conceptId,
    });

    setSelectedOption(option);
    setShowFeedback(true);
    onAnswerSelected?.(option);

    const correct_answer = correctAnswer || item.correct_answer;
    const is_correct = option === correct_answer;

    if (!studentId) {
      console.log("🧠 Practice Mode → Local Save", {
        mcq_id: mcqId || item.id,
        selected: option,
        correct_answer,
        is_correct,
      });
      return;
    }
  };

  const resolvedCorrect = correctAnswer || item.correct_answer;
const isCorrect = selectedOption === resolvedCorrect;


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
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          {renderMarkupText(mcq.stem, styles.mcqStem)}
        </View>
      </View>
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
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      delay: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  const optionEntries = Array.isArray(options)
    ? options.map((opt, i) => {
        const label = String.fromCharCode(65 + i);
        const cleanText = opt.replace(/^([A-D]\)\s*)/, "");
        return [label, cleanText];
      })
    : options ? Object.entries(options) : [];

  return (
    <Animated.View style={[styles.optionsContainer, { opacity: fadeAnim }]}>
      {optionEntries.map(([key, value]) => {
        const text = value as string;

        const isCorrect = selectedOption !== null && key === correctAnswer;
        const isWrong = selectedOption === key && key !== correctAnswer;
        const isDisabled = selectedOption !== null;

        return (
          <OptionButton
            key={key}
            label={key}
            text={text}
            isSelected={selectedOption === key}
            isCorrect={isCorrect}
            isWrong={isWrong}
            disabled={isDisabled}
            onPress={() => onSelect(key)}
          />
        );
      })}
    </Animated.View>
  );
}

function OptionButton({
  label,
  text,
  isSelected,
  isCorrect,
  isWrong,
  disabled,
  onPress,
}: {
  label: string;
  text: string;
  isSelected: boolean;
  isCorrect: boolean;
  isWrong: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const bg = isCorrect
    ? "#1a4d2e"
    : isWrong
    ? "#4d1a1a"
    : isSelected
    ? "#2a2a2a"
    : "#1f1f1f";

  const border = isCorrect
    ? "#25D366"
    : isWrong
    ? "#d32f2f"
    : isSelected
    ? "#404040"
    : "#2a2a2a";

  return (
    <Pressable
      style={[
        styles.optionButton,
        {
          backgroundColor: bg,
          borderColor: border,
          borderWidth: 2,
          opacity: disabled && !isSelected && !isCorrect ? 0.5 : 1,
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
  const feedbackFade = useRef(new Animated.Value(0)).current;
  const gapFade = useRef(new Animated.Value(0)).current;
  const answerFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Stagger the animations like chat messages
    Animated.sequence([
      Animated.timing(feedbackFade, {
        toValue: 1,
        duration: 400,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.timing(gapFade, {
        toValue: 1,
        duration: 400,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(answerFade, {
        toValue: 1,
        duration: 400,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.feedbackContainer}>
      {/* Feedback as mentor chat bubble */}
      <Animated.View style={[styles.mentorBubble, { opacity: feedbackFade }]}>
        {renderMarkupText(feedback, styles.mentorText)}
      </Animated.View>

      {/* Learning Gap as mentor chat bubble */}
      <Animated.View style={[styles.mentorBubble, { opacity: gapFade }]}>
        <Text style={styles.learningGapLabel}>📚 Learning Gap</Text>
        {renderMarkupText(learningGap, styles.mentorText)}
      </Animated.View>

      {/* Correct Answer as mentor chat bubble */}
      <Animated.View style={[styles.mentorBubble, styles.correctAnswerBubble, { opacity: answerFade }]}>
        <Text style={styles.correctAnswerLabel}>✅ Correct Answer</Text>
        <Text style={styles.correctAnswerValue}>{correctAnswer}</Text>
      </Animated.View>
    </View>
  );
}

/* MARKUP PARSER */
function renderMarkupText(content: string | undefined | null, baseStyle: any) {
  if (!content || typeof content !== "string") {
    return null;
  }

  const lines = content.split("\n");

  return (
    <Text style={baseStyle}>
      {lines.map((line, lineIndex) => (
        <React.Fragment key={lineIndex}>
          {parseInlineMarkup(line)}
          {lineIndex < lines.length - 1 && "\n"}
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

  segments.forEach((segment) => {
    if (segment.startsWith("*_") && segment.endsWith("_*")) {
      parts.push(
        <Text key={key++} style={styles.boldItalic}>
          {segment.slice(2, -2)}
        </Text>
      );
    } else if (segment.startsWith("*") && segment.endsWith("*")) {
      parts.push(
        <Text key={key++} style={styles.bold}>
          {segment.slice(1, -1)}
        </Text>
      );
    } else if (segment.startsWith("_") && segment.endsWith("_")) {
      parts.push(
        <Text key={key++} style={styles.italic}>
          {segment.slice(1, -1)}
        </Text>
      );
    } else {
      parts.push(<Text key={key++}>{segment}</Text>);
    }
  });

  return <>{parts}</>;
}

/* STYLES */
const styles = StyleSheet.create({
  mcqContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  mcqCard: {
    backgroundColor: "#1a3a2e",
    borderLeftWidth: 4,
    borderLeftColor: "#25D366",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  mcqStem: {
    fontSize: 15,
    lineHeight: 24,
    color: "#e1e1e1",
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#25D366",
    marginRight: 12,
    minWidth: 24,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: "#e1e1e1",
  },
  feedbackContainer: {
    marginTop: 8,
  },
  mentorBubble: {
    maxWidth: "85%",
    alignSelf: "flex-start",
    backgroundColor: "#1f1f1f",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  mentorText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#e1e1e1",
  },
  learningGapLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#888888",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  correctAnswerBubble: {
    backgroundColor: "#1a2a1a",
    borderWidth: 1,
    borderColor: "#25D366",
  },
  correctAnswerLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#888888",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
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

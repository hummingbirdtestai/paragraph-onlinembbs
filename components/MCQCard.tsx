//MCQCard.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MarkdownText } from '@/utils/markdownRenderer';

interface MCQCardProps {
  stem: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  feedback: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  onAnswerSelected: (isCorrect: boolean) => void;
  onComplete: () => void;
}

export function MCQCard({
  stem,
  options,
  feedback,
  correctAnswer,
  onAnswerSelected,
  onComplete,
}: MCQCardProps) {
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [timeLeft, setTimeLeft] = useState(20);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (selectedOption || timeLeft === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedOption, timeLeft]);

  useEffect(() => {
    if (showFeedback) {
      const timer = setTimeout(() => {
        onComplete();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [showFeedback, onComplete]);

  const handleOptionPress = (option: 'A' | 'B' | 'C' | 'D') => {
    if (selectedOption) return;
    setSelectedOption(option);
    setShowFeedback(true);
    const isCorrect = option === correctAnswer;
    onAnswerSelected(isCorrect);
  };

  const getOptionStyle = (option: 'A' | 'B' | 'C' | 'D') => {
    if (!selectedOption) return styles.option;

    if (option === correctAnswer) {
      return [styles.option, styles.correctOption];
    }

    if (option === selectedOption && option !== correctAnswer) {
      return [styles.option, styles.incorrectOption];
    }

    return [styles.option, styles.disabledOption];
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.questionLabel}>Question</Text>
        <View style={styles.timerBadge}>
          <Text style={styles.timerText}>{timeLeft}s</Text>
        </View>
      </View>

      <MarkdownText style={styles.stem}>{stem}</MarkdownText>

      <View style={styles.optionsContainer}>
        {(['A', 'B', 'C', 'D'] as const).map((option) => (
          <TouchableOpacity
            key={option}
            style={getOptionStyle(option)}
            onPress={() => handleOptionPress(option)}
            disabled={!!selectedOption}
            activeOpacity={0.7}
          >
            <View style={styles.optionContent}>
              <Text style={styles.optionLabel}>{option}</Text>
              <MarkdownText style={styles.optionText}>{options[option]}</MarkdownText>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {showFeedback && selectedOption && (
        <View style={styles.feedbackContainer}>
          <View style={styles.feedbackBubble}>
            <MarkdownText style={styles.feedbackText}>
              {feedback[selectedOption]}
            </MarkdownText>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  questionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A78BFA',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timerBadge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  stem: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    color: '#E8E8E8',
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    backgroundColor: '#1F1F23',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#3F3F46',
  },
  correctOption: {
    borderColor: '#10B981',
    backgroundColor: '#10B98115',
  },
  incorrectOption: {
    borderColor: '#EF4444',
    backgroundColor: '#EF444415',
  },
  disabledOption: {
    opacity: 0.5,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8B5CF6',
    minWidth: 24,
  },
  optionText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#E8E8E8',
    flex: 1,
  },
  feedbackContainer: {
    marginTop: 20,
  },
  feedbackBubble: {
    backgroundColor: '#1F1F23',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  feedbackText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#E8E8E8',
  },
});

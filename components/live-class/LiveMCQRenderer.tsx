//LiveMCQRenderer.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface LiveMCQRendererProps {
  stem: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
}

export default function LiveMCQRenderer({
  stem,
  options,
  correctAnswer,
}: LiveMCQRendererProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (key: string) => {
    if (revealed) return;
    setSelected(key);
  };

  const revealAnswer = () => {
    setRevealed(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.bubble}>

        {/* Stem */}
        <Text style={styles.stemText}>{stem}</Text>

        {/* Options */}
        {Object.entries(options).map(([key, value]) => {
          const isCorrect = key === correctAnswer;
          const isSelected = key === selected;

          return (
            <TouchableOpacity
              key={key}
              style={[
                styles.optionCard,
                isSelected && styles.selectedOption,
                revealed && isCorrect && styles.correctOption,
                revealed && isSelected && !isCorrect && styles.wrongOption,
              ]}
              onPress={() => handleSelect(key)}
            >
              <Text style={styles.optionText}>
                {key}. {value}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Reveal Button */}
        {!revealed && (
          <TouchableOpacity style={styles.revealButton} onPress={revealAnswer}>
            <Text style={styles.revealText}>Reveal Answer</Text>
          </TouchableOpacity>
        )}

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d', padding: 16 },
  bubble: {
    backgroundColor: '#1f1f1f',
    borderRadius: 18,
    padding: 18,
  },

  stemText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#e1e1e1',
    marginBottom: 20,
  },

  optionCard: {
    backgroundColor: '#242424',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },

  selectedOption: {
    borderWidth: 1,
    borderColor: '#25D366',
  },

  correctOption: {
    backgroundColor: '#133d26',
    borderColor: '#25D366',
    borderWidth: 1,
  },

  wrongOption: {
    backgroundColor: '#3d1a1a',
    borderColor: '#ff4d4d',
    borderWidth: 1,
  },

  optionText: {
    color: '#e1e1e1',
    fontSize: 15,
  },

  revealButton: {
    marginTop: 12,
    backgroundColor: '#25D366',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },

  revealText: {
    color: '#000',
    fontWeight: '700',
  },
});

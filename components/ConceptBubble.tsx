//ConceptBubble.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTypingAnimation } from '@/hooks/useTypingAnimation';

interface ConceptBubbleProps {
  title: string;
  coreIdea: string;
  keyExplanation: string;
  conceptNumber: number;
  totalConcepts: number;
  onComplete?: () => void;
}

function normalizeForTyping(text: string): string {
  if (!text) return text;

  return text
    // **_text_** → ***text***
    .replace(/\*\*_([^_*]+)_\*\*/g, '***$1***')
    // _text_ → text
    .replace(/_([^_]+)_/g, '$1');
}

export function ConceptBubble({
  title,
  coreIdea,
  keyExplanation,
  conceptNumber,
  totalConcepts,
  onComplete
}: ConceptBubbleProps) {
  const [stage, setStage] = useState<'title' | 'core' | 'explanation'>('title');

  const handleTitleComplete = useCallback(() => {
    setTimeout(() => setStage('core'), 300);
  }, []);

  const handleCoreComplete = useCallback(() => {
    setTimeout(() => setStage('explanation'), 300);
  }, []);

  const handleExplanationComplete = useCallback(() => {
    if (onComplete) {
      setTimeout(onComplete, 500);
    }
  }, [onComplete]);

  const titleTyping = useTypingAnimation({
    text: stage === 'title' ? normalizeForTyping(title) : normalizeForTyping(title),
    speed: 30,
    onComplete: handleTitleComplete,
  });

  const coreTyping = useTypingAnimation({
    text: stage === 'core' || stage === 'explanation' ? normalizeForTyping(coreIdea) : '',
    speed: 15,
    onComplete: handleCoreComplete,
  });

  const explanationTyping = useTypingAnimation({
    text: stage === 'explanation' ? normalizeForTyping(keyExplanation) : '',
    speed: 15,
    onComplete: handleExplanationComplete,
  });

  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <View style={styles.titleSection}>
          <Text style={styles.conceptNumber}>Concept {conceptNumber}/{totalConcepts}</Text>
          <Text style={styles.title}>
            {parseInlineMarkup(titleTyping.displayedText)}
          </Text>
        </View>

        {(stage === 'core' || stage === 'explanation') && (
          <View style={styles.sectionBox}>
            <Text style={styles.sectionTitle}>Core Idea</Text>
            <Text style={styles.sectionText}>
              {parseInlineMarkup(coreTyping.displayedText)}
            </Text>
          </View>
        )}

        {stage === 'explanation' && (
          <View style={[styles.sectionBox, styles.explanationBox]}>
            <Text style={[styles.sectionTitle, styles.explanationTitle]}>Key Explanation</Text>
            <Text style={styles.sectionText}>
              {parseInlineMarkup(explanationTyping.displayedText)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

function parseInlineMarkup(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let key = 0;

  const regex = /(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*_[^_]+_\*|\*[^*]+\*|_[^_]+_)/g;
  const segments = text.split(regex);

  segments.forEach((segment) => {
    if (segment.startsWith('***') && segment.endsWith('***')) {
      parts.push(
        <Text key={key++} style={styles.bold}>
          {segment.slice(3, -3)}
        </Text>
      );
    } else if (segment.startsWith('**') && segment.endsWith('**')) {
      parts.push(
        <Text key={key++} style={styles.bold}>
          {segment.slice(2, -2)}
        </Text>
      );
    } else if (segment.startsWith('*_') && segment.endsWith('_*')) {
      parts.push(
        <Text key={key++} style={styles.bold}>
          {segment.slice(2, -2)}
        </Text>
      );
    } else if (segment.startsWith('*') && segment.endsWith('*')) {
      parts.push(
        <Text key={key++} style={styles.bold}>
          {segment.slice(1, -1)}
        </Text>
      );
    } else if (segment.startsWith('_') && segment.endsWith('_')) {
      parts.push(
        <Text key={key++}>
          {segment.slice(1, -1)}
        </Text>
      );
    } else {
      parts.push(<Text key={key++}>{segment}</Text>);
    }
  });

  return <>{parts}</>;
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  bubble: {
    backgroundColor: '#1f1f1f',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 7,
  },
  titleSection: {
    marginBottom: 20,
  },
  conceptNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#e1e1e1',
    lineHeight: 28,
    letterSpacing: 0.3,
  },
  sectionBox: {
    borderLeftWidth: 3,
    borderLeftColor: '#4A90E2',
    paddingLeft: 12,
    marginBottom: 20,
  },
  explanationBox: {
    borderLeftColor: '#FFD700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4A90E2',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  explanationTitle: {
    color: '#FFD700',
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#e1e1e1',
  },
  bold: {
    fontWeight: '700',
    color: '#25D366',
  },
});

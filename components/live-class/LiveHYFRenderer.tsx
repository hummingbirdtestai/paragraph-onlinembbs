//LiveHYFRenderer.tsx
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
} from 'react-native';

interface LiveHYFRendererProps {
  title: string;
  hyfs: string[];
}

export default function LiveHYFRenderer({
  title,
  hyfs,
}: LiveHYFRendererProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.mentorBubble, { opacity: fadeAnim }]}>
          
          {/* Title */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>
              {title}
            </Text>
          </View>

          {/* HYF List */}
          <View style={[styles.sectionBlock, styles.sectionBlockMargin]}>
            {hyfs.map((fact, index) => (
              <View
                key={index}
                style={[
                  styles.factRow,
                  {
                    borderLeftWidth: 3,
                    borderLeftColor: '#FFD700',
                    paddingLeft: 12,
                  },
                ]}
              >
                <Text style={styles.bulletText}>
                  • {parseInlineMarkup(fact)}
                </Text>
              </View>
            ))}
          </View>

        </Animated.View>
      </ScrollView>
    </View>
  );
}

/* ================= INLINE MARKUP ================= */

function parseInlineMarkup(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let key = 0;

  const regex = /(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*_[^_]+_\*|\*[^*]+\*|_[^_]+_)/g;
  const segments = text.split(regex);

  segments.forEach(segment => {
    if (segment.startsWith('***'))
      parts.push(<Text key={key++} style={styles.bold}>{segment.slice(3, -3)}</Text>);
    else if (segment.startsWith('**'))
      parts.push(<Text key={key++} style={styles.bold}>{segment.slice(2, -2)}</Text>);
    else if (segment.startsWith('*_'))
      parts.push(<Text key={key++} style={styles.bold}>{segment.slice(2, -2)}</Text>);
    else if (segment.startsWith('*'))
      parts.push(<Text key={key++} style={styles.bold}>{segment.slice(1, -1)}</Text>);
    else if (segment.startsWith('_'))
      parts.push(<Text key={key++}>{segment.slice(1, -1)}</Text>);
    else
      parts.push(<Text key={key++}>{segment}</Text>);
  });

  return <>{parts}</>;
}

/* ================= STYLES (COPIED EXACT UX) ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d' },
  scrollContent: { padding: 16, paddingBottom: 32 },

  mentorBubble: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    backgroundColor: '#1f1f1f',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 7,
  },

  sectionBlock: { marginBottom: 0 },
  sectionBlockMargin: { marginBottom: 20 },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 14,
    letterSpacing: 0.3,
    color: '#FFD700',
  },

  factRow: {
    marginBottom: 10,
  },

  bulletText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#e1e1e1',
  },

  bold: {
    fontWeight: '700',
    color: '#25D366',
  },
});

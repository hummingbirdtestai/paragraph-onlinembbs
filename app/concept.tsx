// app/concept.tsx

import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import ConceptCard from '@/components/ConceptCard';

export default function ConceptScreen() {
  const {
    topic_id,
    subject,
    chapter,
    topic_name,
    from,
  } = useLocalSearchParams<{
    topic_id: string;
    subject?: string;
    chapter?: string;
    topic_name?: string;
    from?: string;
  }>();

  if (!topic_id) return null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Breadcrumb / Context Header */}
      {(subject || chapter || topic_name) && (
        <View style={styles.breadcrumb}>
          {subject && <Text style={styles.crumb}>{subject}</Text>}
          {chapter && <Text style={styles.crumb}>› {chapter}</Text>}
          {topic_name && (
            <Text style={styles.crumbActive}>› {topic_name}</Text>
          )}
        </View>
      )}

      {/* Concept Content */}
      <ConceptCard topicId={topic_id} subject={subject} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  // Breadcrumb styles
  breadcrumb: {
    marginBottom: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  crumb: {
    fontSize: 13,
    color: '#9FB3C8',
    marginRight: 4,
  },

  crumbActive: {
    fontSize: 13,
    color: '#25D366',
    fontWeight: '700',
  },
});

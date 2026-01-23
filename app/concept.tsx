//concept.tsx
import { ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import ConceptCard from '@/components/ConceptCard';

export default function ConceptScreen() {
  const { topic_id, subject } = useLocalSearchParams<{
    topic_id: string;
    subject?: string;
  }>();

  if (!topic_id) return null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
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
});

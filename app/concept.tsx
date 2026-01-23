// app/concept.tsx

import { ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ConceptCard from '@/components/ConceptCard';

export default function ConceptScreen() {
  const router = useRouter();

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
     
      {/* Concept Content */}
<ConceptCard
  topicId={topic_id}
  topicName={topic_name}
  subject={subject}
  chapter={chapter}
/>


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

  breadcrumb: {
    marginBottom: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
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

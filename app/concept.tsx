//concept.tsx
import { useLocalSearchParams } from 'expo-router';
import ConceptCard from '@/components/ConceptCard';

export default function ConceptScreen() {
  const { topic_id, subject } = useLocalSearchParams<{
    topic_id: string;
    subject?: string;
  }>();

  if (!topic_id) return null;

  return (
    <ConceptCard
      topicId={topic_id}
      subject={subject}
    />
  );
}

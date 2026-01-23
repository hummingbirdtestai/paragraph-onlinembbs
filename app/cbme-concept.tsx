// app/cbme-concept.tsx

import { ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import CBMEConceptCard from "@/components/cbmeconceptcard";

export default function CBMEConceptScreen() {
  const {
    topic_id,
    subject,
    chapter,
    topic_name,
    chapter_order,
    topic_order,
  } = useLocalSearchParams<{
    topic_id: string;
    subject?: string;
    chapter?: string;
    topic_name?: string;
    chapter_order?: string;
    topic_order?: string;
  }>();

  if (!topic_id) return null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <CBMEConceptCard
        topicId={topic_id}
        topicName={topic_name}
        subject={subject}
        chapter={chapter}
        chapter_order={chapter_order ? Number(chapter_order) : undefined}
        topic_order={topic_order ? Number(topic_order) : undefined}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d0d0d",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
});


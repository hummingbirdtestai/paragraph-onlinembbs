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
      {/* Breadcrumb / Context Header */}
      {(subject || chapter || topic_name) && (
        <View style={styles.breadcrumb}>
{/* SUBJECT */}
{subject && (
  <TouchableOpacity
    activeOpacity={0.7}
    onPress={() => {
      router.replace({
        pathname: '/uhs-pyq',
        params: { reset: 'true' },
      });
    }}
  >
    <Text style={styles.crumb}>{subject}</Text>
  </TouchableOpacity>
)}


          {/* CHAPTER */}
          {chapter && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.back()}
            >
              <Text style={styles.crumb}>› {chapter}</Text>
            </TouchableOpacity>
          )}

          {/* TOPIC (ACTIVE) */}
          {topic_name && (
            <Text style={styles.crumbActive}>› {topic_name}</Text>
          )}
        </View>
      )}

      {/* Concept Content */}
      <ConceptCard topicId={topic_id} />
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

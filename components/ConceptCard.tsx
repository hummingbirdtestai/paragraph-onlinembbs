// components/ConceptCard.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { MessageCircle } from "lucide-react-native";
import { supabase } from "@/lib/supabaseClient";
import HighYieldFactSheetScreen from "@/components/types/HighYieldFactSheetScreen";
import { useRouter } from "expo-router";

interface ConceptCardProps {
  topicId: string; // row id from all_subjects_raw
  subject?: string | null;
}

export default function ConceptCard({ topicId, subject }: ConceptCardProps) {
  const router = useRouter();

  const [loading, setLoading] = React.useState(true);
  const [concept, setConcept] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    const fetchConcept = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc(
        "get_pyq_concept_v2",
        { p_id: topicId }
      );

      if (!mounted) return;

      if (error) {
        console.error("❌ Concept fetch failed", error);
        setError("Failed to load concept");
        setLoading(false);
        return;
      }

      const row = data?.[0];
      setConcept(row?.concept ?? "");
      setLoading(false);
    };

    fetchConcept();

    return () => {
      mounted = false;
    };
  }, [topicId]);

  return (
    <View style={styles.card}>
      {/* Subject header */}
      {subject && (
        <Text style={styles.subjectText}>
          {subject}
        </Text>
      )}

      {/* Loading */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#25D366" />
          <Text style={styles.loadingText}>Loading concept…</Text>
        </View>
      )}

      {/* Error */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Concept renderer */}
      {!loading && !error && concept && (
        <>
          <HighYieldFactSheetScreen data={concept} />

          {/* Discuss with Mentor */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.discussButton}
            onPress={() => {
              router.push({
                pathname: "/revision",
                params: {
                  topic_id: topicId,
                  subject: subject ?? undefined,
                  mode: "mentor",
                },
              });
            }}
          >
            <MessageCircle size={18} color="#25D366" />
            <Text style={styles.discussText}>
              Discuss with Paragraph AI Mentor
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#111b21",
    borderRadius: 14,
    marginBottom: 18,
    overflow: "hidden",
  },

  subjectText: {
    color: "#25D366",
    fontSize: 16,
    fontWeight: "700",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },

  loadingContainer: {
    paddingVertical: 48,
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    color: "#9FB3C8",
    fontSize: 14,
    fontWeight: "600",
  },

  errorContainer: {
    padding: 24,
  },

  errorText: {
    color: "#E91E63",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },

  discussButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 18,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#0d2017",
    borderWidth: 1,
    borderColor: "#25D366",
    gap: 8,
  },

  discussText: {
    color: "#25D366",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});

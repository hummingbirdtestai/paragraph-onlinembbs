//StudentLiveClassList.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { MotiView } from 'moti';
import { supabase } from '@/lib/supabaseClient';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

/* ─────────────────────────────────────────────
   🎨 ICON POOL (same pattern as battles)
───────────────────────────────────────────── */

const CLASS_ICON_POOL: Record<string, string[]> = {
  Medicine: ['🩺', '🫀', '🫁', '🧠'],
  Surgery: ['🔪', '⚔️', '🏥', '🩸'],
  Pediatrics: ['🍼', '👶', '🧸'],
  OBGYN: ['🤰', '👶', '🌸'],
  Orthopedics: ['🦴', '🏋️‍♂️', '🦿'],
  Psychiatry: ['🧠', '🎭', '🌙'],
};

const getClassIcon = (subject: string) => {
  const icons = CLASS_ICON_POOL[subject] || ['🎓'];
  return icons[new Date().getDay() % icons.length];
};

/* ─────────────────────────────────────────────
   📘 Types
───────────────────────────────────────────── */

interface LiveClass {
  id: string;
  title: string;
  subject: string;
  description: string;
  scheduled_at: string;
  status: 'scheduled' | 'live' | 'ended';
}

/* ─────────────────────────────────────────────
   🧩 Component
───────────────────────────────────────────── */

export default function StudentLiveClassList() {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const { user } = useAuth();

  /* ─────────────────────────────────────────────
     📡 Fetch Live Classes
  ────────────────────────────────────────────── */

  const fetchClasses = async () => {
    const { data, error } = await supabase
      .from('live_classes')
      .select('*')
      .order('scheduled_at', { ascending: true });

    if (!error && data) setClasses(data);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchClasses();
    setRefreshing(false);
  };

  /* ─────────────────────────────────────────────
     🕒 Helpers
  ────────────────────────────────────────────── */

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString([], {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });

  const getStatusBadge = (status: LiveClass['status']) => {
    switch (status) {
      case 'live':
        return { text: '🔴 LIVE', color: '#EF4444' };
      case 'scheduled':
        return { text: '⏳ UPCOMING', color: '#00D9FF' };
      default:
        return { text: '✅ ENDED', color: '#4CAF50' };
    }
  };

  /* ─────────────────────────────────────────────
     🚀 Entry Handler
  ────────────────────────────────────────────── */

  const handleClassPress = (cls: LiveClass) => {
    router.push({
      pathname: '/live-class/[id]',
      params: { id: cls.id },
    });
  };

  /* ─────────────────────────────────────────────
     🖼️ Render
  ────────────────────────────────────────────── */

  return (
    <View style={styles.container}>
      {/* ───────────── Header ───────────── */}
<View style={styles.header}>
  <Text style={styles.headerTitle}>🤖 Paragraph AI-Tutored Sessions</Text>
  <Text style={styles.headerSubtitle}>
    Live, instructor-guided interactive classes
  </Text>
</View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00D9FF"
          />
        }
      >
        {classes.map((cls, index) => {
          const badge = getStatusBadge(cls.status);

          return (
            <MotiView
              key={cls.id}
              from={{ opacity: 0, translateY: 20, scale: 0.96 }}
              animate={{ opacity: 1, translateY: 0, scale: 1 }}
              transition={{ delay: index * 80 }}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleClassPress(cls)}
                style={styles.cardWrapper}
              >
                <View
                  style={[
                    styles.card,
                    {
                      flexDirection: isMobile ? 'column' : 'row',
                      alignItems: isMobile ? 'center' : 'flex-start',
                    },
                  ]}
                >
                  <View style={styles.iconCircle}>
                    <Text style={styles.icon}>{getClassIcon(cls.subject)}</Text>
                  </View>

                  <View
                    style={[
                      styles.info,
                      { alignItems: isMobile ? 'center' : 'flex-start' },
                    ]}
                  >
                    <Text style={styles.title} numberOfLines={1}>
                      {cls.title}
                    </Text>

                    <Text style={styles.subject}>{cls.subject}</Text>

                    <View style={styles.timeRow}>
                      <Text style={styles.time}>{formatTime(cls.scheduled_at)}</Text>
                      <Text style={styles.date}>{formatDate(cls.scheduled_at)}</Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: `${badge.color}20` },
                    ]}
                  >
                    <Text style={[styles.badgeText, { color: badge.color }]}>
                      {badge.text}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </MotiView>
          );
        })}
      </ScrollView>
    </View>
  );
}

/* ─────────────────────────────────────────────
   🎨 Styles (mirrors BattleListScreen)
───────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 28,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subject: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFD93D',
  },
  timeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  time: {
    fontSize: 20,
    fontWeight: '800',
    color: '#00D9FF',
  },
  date: {
    fontSize: 15,
    fontWeight: '600',
    color: '#BBBBBB',
  },
  badge: {
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  header: {
  paddingTop: 60,
  paddingBottom: 16,
  paddingHorizontal: 20,
  backgroundColor: '#0F0F0F',
  borderBottomWidth: 1,
  borderBottomColor: '#1A1A1A',
},
headerTitle: {
  fontSize: 28,
  fontWeight: '900',
  color: '#FFFFFF',
},
headerSubtitle: {
  marginTop: 4,
  fontSize: 14,
  fontWeight: '600',
  color: '#9CA3AF',
},

});

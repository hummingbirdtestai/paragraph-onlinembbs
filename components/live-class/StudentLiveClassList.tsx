// StudentLiveClassList.tsx
// -----------------------------------------------------------------------------
// Paragraph AI — Student Live Class Listing Screen
// Stable AI-Bot Icon System + RPC Driven Schedule
// -----------------------------------------------------------------------------

import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';

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

// -----------------------------------------------------------------------------
// 📘 Types (RPC driven — do NOT loosen)
// -----------------------------------------------------------------------------

interface LiveClass {
  battle_id: string;
  title: string;
  scheduled_at: string;
  status: 'active' | 'upcoming' | 'completed';
}

// -----------------------------------------------------------------------------
// 🔁 Status Normalizer (DB → UI)
// -----------------------------------------------------------------------------

const normalizeStatus = (status: string): LiveClass['status'] => {
  switch (status) {
    case 'Active':
      return 'active';
    case 'Upcoming':
      return 'upcoming';
    case 'Completed':
      return 'completed';
    default:
      return 'upcoming';
  }
};

// -----------------------------------------------------------------------------
// 🤖 AI BOT ICON SET (FIXED, STABLE, NO FLICKER)
// -----------------------------------------------------------------------------

const AI_BOT_ICONS = [
  '🤖',      // classic robot
  '🧠',      // intelligence
  '🦾',      // AI strength
  '🤖‍💻',    // coding bot
  '🧑‍💻',    // human-AI hybrid
  '🛰️',      // satellite AI
  '🧬',      // bio-AI
  '⚙️',      // engine AI
  '📡',      // signal AI
  '🔮',      // future AI
];

// -----------------------------------------------------------------------------
// 🧮 Deterministic Hash → Icon Resolver
// Same battle_id ALWAYS maps to same icon
// -----------------------------------------------------------------------------

const getBotIconFromBattleId = (battleId: string): string => {
  let hash = 0;

  for (let i = 0; i < battleId.length; i++) {
    hash = battleId.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % AI_BOT_ICONS.length;
  return AI_BOT_ICONS[index];
};

// -----------------------------------------------------------------------------
// 🧩 Main Component
// -----------------------------------------------------------------------------

export default function StudentLiveClassList() {
  // ---------------------------------------------------------------------------
  // 📐 Responsive
  // ---------------------------------------------------------------------------

  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  // ---------------------------------------------------------------------------
  // 🧠 State
  // ---------------------------------------------------------------------------

  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // ---------------------------------------------------------------------------
  // 📡 Fetch Classes via RPC
  // ---------------------------------------------------------------------------

  const fetchClasses = useCallback(async () => {
    const { data, error } = await supabase.rpc('get_battle_schedule_for_now');

    if (error) {
      console.error('❌ get_battle_schedule_for_now failed:', error);
      return;
    }

    if (!data) return;

    const formatted: LiveClass[] = data.map((item: any) => ({
      battle_id: item.battle_id,
      title: item.title,
      scheduled_at: `${item.scheduled_date}T${item.scheduled_time}+05:30`,
      status: normalizeStatus(item.status),
    }));

    formatted.sort(
      (a, b) =>
        new Date(a.scheduled_at).getTime() -
        new Date(b.scheduled_at).getTime()
    );

    setClasses(formatted);
  }, []);

  // ---------------------------------------------------------------------------
  // 🧲 Initial Load
  // ---------------------------------------------------------------------------

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // ---------------------------------------------------------------------------
  // 🔄 Pull-to-Refresh
  // ---------------------------------------------------------------------------

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchClasses();
    setRefreshing(false);
  };

  // ---------------------------------------------------------------------------
  // 🕒 Date / Time Helpers
  // ---------------------------------------------------------------------------

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString([], {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });

  // ---------------------------------------------------------------------------
  // 🏷 Status Badge Resolver
  // ---------------------------------------------------------------------------

  const getStatusBadge = (status: LiveClass['status']) => {
    switch (status) {
      case 'active':
        return { text: '🔴 LIVE', color: '#EF4444' };
      case 'upcoming':
        return { text: '⏳ UPCOMING', color: '#00D9FF' };
      default:
        return { text: '✅ ENDED', color: '#4CAF50' };
    }
  };

  // ---------------------------------------------------------------------------
  // 🚀 Navigation
  // ---------------------------------------------------------------------------

  const handleClassPress = (cls: LiveClass) => {
    router.push({
      pathname: '/live-class/[id]',
      params: { id: cls.battle_id },
    });
  };

  // ---------------------------------------------------------------------------
  // 🖼️ Render
  // ---------------------------------------------------------------------------

  return (
    <View style={styles.container}>
      {/* ------------------------------------------------------------------- */}
      {/* Header                                                              */}
      {/* ------------------------------------------------------------------- */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          🤖 Paragraph AI-Tutored Sessions
        </Text>
        <Text style={styles.headerSubtitle}>
          Live, instructor-guided interactive classes
        </Text>
      </View>

      {/* ------------------------------------------------------------------- */}
      {/* Class List                                                          */}
      {/* ------------------------------------------------------------------- */}
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
const botIcon = getBotIconFromBattleId(cls.battle_id);


          return (
            <MotiView
              key={cls.battle_id}
              from={{ opacity: 0, translateY: 20, scale: 0.96 }}
              animate={{ opacity: 1, translateY: 0, scale: 1 }}
              transition={{ delay: index * 80 }}
            >
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={
                  cls.status === 'completed'
                    ? undefined
                    : () => handleClassPress(cls)
                }
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
                  {/* ------------------------------------------------------- */}
                  {/* AI BOT ICON                                             */}
                  {/* ------------------------------------------------------- */}
                  <View style={styles.iconCircle}>
                    <Text style={styles.icon}>{botIcon}</Text>
                  </View>

                  {/* ------------------------------------------------------- */}
                  {/* Info                                                    */}
                  {/* ------------------------------------------------------- */}
                  <View
                    style={[
                      styles.info,
                      { alignItems: isMobile ? 'center' : 'flex-start' },
                    ]}
                  >
                    <Text style={styles.title} numberOfLines={1}>
                      {cls.title}
                    </Text>

                    <View style={styles.timeRow}>
                      <Text style={styles.time}>
                        {formatTime(cls.scheduled_at)}
                      </Text>
                      <Text style={styles.date}>
                        {formatDate(cls.scheduled_at)}
                      </Text>
                    </View>
                  </View>

                  {/* ------------------------------------------------------- */}
                  {/* Status Badge                                            */}
                  {/* ------------------------------------------------------- */}
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

// -----------------------------------------------------------------------------
// 🎨 Styles
// -----------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },

  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
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
    fontSize: 30,
    lineHeight: 32,
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
});

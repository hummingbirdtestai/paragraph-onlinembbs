// app/live-class/[id].tsx

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabaseClient';

export default function StudentLiveClassRoom() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1️⃣ Load persisted feed (replay)
  useEffect(() => {
    if (!id) return;

    const loadFeed = async () => {
      const { data, error } = await supabase.rpc(
        'get_battle_class_feed',
        { p_battle_id: id }
      );

      if (!error && data) {
        setFeed(data);
      }
      setLoading(false);
    };

    loadFeed();
  }, [id]);

  // 2️⃣ Subscribe to realtime updates
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`battle:${id}`)
      .on(
        'broadcast',
        { event: 'class-feed-push' },
        payload => {
          setFeed(prev => [...prev, payload.payload]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <ScrollView>
      {feed.map(item => (
        <View key={item.seq}>
          <Text>{item.type}</Text>
          {/* render card based on type */}
        </View>
      ))}
    </ScrollView>
  );
}

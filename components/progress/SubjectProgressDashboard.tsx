//components/progress/SubjectProgressDashboard.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { supabase } from '@/lib/supabaseClient';

interface SubjectProgressDashboardProps {
  student_id: string;
  subject: string;
}

interface ProgressData {
  subject: string;
  total_topics: number;
  total_hours: number;
  completed_topics: number;
  completed_mcqs: number;
  time_spent_hours: number;
  remaining_hours: number;
  completion_percent: number;
}

type TabType = 'Overview' | 'Topics' | 'MCQs' | 'Time';

export default function SubjectProgressDashboard({ student_id, subject }: SubjectProgressDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ProgressData | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('Overview');

  useEffect(() => {
    fetchProgress();
  }, [student_id, subject]);

  const fetchProgress = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: result, error: rpcError } = await supabase.rpc('get_subject_progress_v4', {
        p_student_id: student_id,
        p_subject: subject
      });

      if (rpcError) throw rpcError;
      
      if (!result || result.length === 0) {
        setData(null);
        setError('No progress data available');
      } else {
        setData(result[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch progress data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Loading progress...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No data available</Text>
      </View>
    );
  }

  const remainingTopics = data.total_topics - data.completed_topics;

  const renderGraphicalView = () => (
    <View style={{ padding: 20 }}>
      <View style={{ marginBottom: 40 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
          Completion Progress
        </Text>
        <View style={{ alignItems: 'center', marginVertical: 20 }}>
          <View style={{ 
            width: 150, 
            height: 150, 
            borderRadius: 75, 
            borderWidth: 10,
       borderColor: '#10b981',   // 🔥 REQUIRED
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Text style={{ fontSize: 32, fontWeight: 'bold' }}>
              {data.completion_percent.toFixed(1)}%
            </Text>
          </View>
        </View>
      </View>

      <View>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
          Time Distribution
        </Text>
        <View style={{ marginVertical: 20 }}>
          <View style={{ flexDirection: 'row', marginBottom: 10 }}>
            <View style={{ flex: 1 }}>
              <Text>Time Spent</Text>
              <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
                {data.time_spent_hours.toFixed(1)}h
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text>Remaining</Text>
              <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
                {data.remaining_hours.toFixed(1)}h
              </Text>
            </View>
          </View>
          <View style={{ height: 20, backgroundColor: '#e0e0e0', borderRadius: 10, overflow: 'hidden' }}>
            <View 
              style={{ 
                height: '100%', 
                width: `${(data.time_spent_hours / data.total_hours) * 100}%`,
                backgroundColor: '#4CAF50'
              }} 
            />
          </View>
        </View>
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <View style={{ padding: 20 }}>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16 }}>Total Topics</Text>
              <Text style={{ fontSize: 28, fontWeight: 'bold' }}>{data.total_topics}</Text>
            </View>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16 }}>Total Hours</Text>
              <Text style={{ fontSize: 28, fontWeight: 'bold' }}>{data.total_hours}</Text>
            </View>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16 }}>Completion</Text>
              <Text style={{ fontSize: 28, fontWeight: 'bold' }}>{data.completion_percent.toFixed(1)}%</Text>
            </View>
          </View>
        );

      case 'Topics':
        return (
          <View style={{ padding: 20 }}>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16 }}>Completed Topics</Text>
              <Text style={{ fontSize: 28, fontWeight: 'bold' }}>{data.completed_topics}</Text>
            </View>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16 }}>Remaining Topics</Text>
              <Text style={{ fontSize: 28, fontWeight: 'bold' }}>{remainingTopics}</Text>
            </View>
          </View>
        );

      case 'MCQs':
        return (
          <View style={{ padding: 20 }}>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16 }}>Completed MCQs</Text>
              <Text style={{ fontSize: 28, fontWeight: 'bold' }}>{data.completed_mcqs}</Text>
            </View>
          </View>
        );

      case 'Time':
        return (
          <View style={{ padding: 20 }}>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16 }}>Time Spent (hours)</Text>
              <Text style={{ fontSize: 28, fontWeight: 'bold' }}>{data.time_spent_hours.toFixed(2)}</Text>
            </View>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16 }}>Remaining Time (hours)</Text>
              <Text style={{ fontSize: 28, fontWeight: 'bold' }}>{data.remaining_hours.toFixed(2)}</Text>
            </View>
          </View>
        );
    }
  };

    return (
    <View
      style={{
        backgroundColor: '#0d1821',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#1c2730',
        margin: 16,
        overflow: 'hidden',
      }}
    >
      <ScrollView>
        <View style={{ padding: 20 }}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: 'bold',
              color: '#e5e7eb',
              marginBottom: 12,
            }}
          >
            {data.subject}
          </Text>
        </View>

        {renderGraphicalView()}

        <View style={{ padding: 20 }}>
          <View style={{ flexDirection: 'row', marginBottom: 20 }}>
            {(['Overview', 'Topics', 'MCQs', 'Time'] as TabType[]).map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  alignItems: 'center',
                  borderBottomWidth: activeTab === tab ? 2 : 0,
                  borderBottomColor: '#10b981',
                }}
              >
                <Text
                  style={{
                    fontWeight: activeTab === tab ? '700' : '500',
                    color: activeTab === tab ? '#10b981' : '#9ca3af',
                  }}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {renderTabContent()}
        </View>
      </ScrollView>
    </View>
  );
}

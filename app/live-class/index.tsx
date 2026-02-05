// app/live-class/index.tsx
import { View, ActivityIndicator } from 'react-native';
import MainLayout from '@/components/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';

import StudentLiveClassList from '@/components/live-class/StudentLiveClassList';
import TeacherLiveClassDashboard from '@/components/live-class/TeacherLiveClassDashboard';

export default function LiveClassScreen() {
  const { user } = useAuth();
  const userProfile = useUserProfile(user?.id);

  if (!userProfile) {
    return (
      <MainLayout>
        <ActivityIndicator style={{ marginTop: 40 }} />
      </MainLayout>
    );
  }

  const isTeacher = userProfile.is_teacher === true;

  return (
    <MainLayout>
      {isTeacher ? (
        <TeacherLiveClassDashboard />
      ) : (
        <StudentLiveClassList />
      )}
    </MainLayout>
  );
}

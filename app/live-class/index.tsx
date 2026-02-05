//app/live-class/index.tsx
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';

import StudentLiveClassList from '@/components/live-class/StudentLiveClassList';
import TeacherLiveClassDashboard from '@/components/live-class/TeacherLiveClassDashboard';

export default function LiveClassScreen() {
  const { user } = useAuth();
  const userProfile = useUserProfile(user?.id);

  if (!userProfile) {
    return <ActivityIndicator />;
  }

  const isTeacher = userProfile.is_teacher === true;

  return (
    <View style={{ flex: 1 }}>
      {isTeacher ? (
        <TeacherLiveClassDashboard />
      ) : (
        <StudentLiveClassList />
      )}
    </View>
  );
}

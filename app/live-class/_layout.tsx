// app/live-class/_layout.tsx
import { Slot } from 'expo-router';
import MainLayout from '@/components/MainLayout';

export default function LiveClassLayout() {
  return (
    <MainLayout>
      <Slot />
    </MainLayout>
  );
}

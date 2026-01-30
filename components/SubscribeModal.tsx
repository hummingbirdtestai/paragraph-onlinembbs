// SubscribeModal.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { X, Check } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

interface SubscribeModalProps {
  visible: boolean;
  onClose: () => void;
}

const API_BASE = 'https://paragraph-pg-production.up.railway.app';

export default function SubscribeModal({ visible, onClose }: SubscribeModalProps) {
  const { user } = useAuth();
  const { height } = useWindowDimensions();
  const isShortScreen = height < 700;

  const [paymentError, setPaymentError] = useState<string | null>(null);

  // ─────────────────────────────────────────────
  // GUARD — USER MUST BE LOGGED IN
  // ─────────────────────────────────────────────
  if (!user?.id) {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#9ca3af" />
          </TouchableOpacity>

          <View style={styles.loginGuard}>
            <Text style={styles.loginText}>Please login to subscribe</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // ─────────────────────────────────────────────
  // CASHFREE LOADER
  // ─────────────────────────────────────────────
  function waitForCashfree(timeout = 3000): Promise<any> {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const timer = setInterval(() => {
        if ((window as any).Cashfree) {
          clearInterval(timer);
          resolve((window as any).Cashfree);
        }
        if (Date.now() - start > timeout) {
          clearInterval(timer);
          reject(new Error('Cashfree SDK not loaded'));
        }
      }, 100);
    });
  }

  // ─────────────────────────────────────────────
  // SUBSCRIBE HANDLER
  // ─────────────────────────────────────────────
  async function handleSubscribe() {
    try {
      setPaymentError(null);

      const CashfreeSDK = await waitForCashfree();

      const res = await fetch(`${API_BASE}/api/payments/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: user.id,
          plan: "1",     // 👈 ALWAYS send 1-month plan
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.payment_session_id) {
        setPaymentError(data?.detail || 'Unable to start payment');
        return;
      }

      const cashfree = CashfreeSDK({ mode: 'production' });

      cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: '_self',
      });
    } catch (err) {
      console.error(err);
      setPaymentError('Payment system is loading. Please try again.');
    }
  }

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* ❌ ALWAYS VISIBLE */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X size={24} color="#9ca3af" />
        </TouchableOpacity>

        {/* SCROLLABLE CONTENT */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            isShortScreen && { paddingBottom: 40 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.cardWrapper}>
            <View style={styles.card}>
              <Text style={styles.planTitle}>Paragraph Pro</Text>
              <Text style={styles.planDuration}>1 Month Access</Text>
              <Text style={styles.planPrice}>₹2,000</Text>

              {/* CORE */}
              <View style={styles.featuresSection}>
                <Text style={styles.sectionTitle}>What You Get (Core)</Text>

                <Feature text="633 Major + 206 Minor Topics mapped to NEET-PG" />
                <Feature text="10,000 PYQs with Conversational AI Tutor" />
                <Feature text="Every PYQ linked to concepts, mistakes & exam patterns" />
                <Feature text="Bi-weekly full-length NEET-PG mock tests" />
                <Feature text="200-hour smart study planner (daily targets)" />
              </View>

              {/* OPTIONAL */}
              <View style={styles.featuresSection}>
                <Text style={styles.sectionTitleMuted}>Also Included</Text>

                <Feature text="45,000 Flash Cards for rapid recall" muted />
                <Feature text="5,000 Clinical Vignette MCQs" muted />
                <Feature text="Daily group quizzes (exam temperament)" muted />
                <Feature text="Concise notes & synoptic tables" muted />
              </View>

              <TouchableOpacity
                style={styles.subscribeButton}
                onPress={handleSubscribe}
              >
                <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
              </TouchableOpacity>

              {paymentError && (
                <Text style={styles.errorText}>{paymentError}</Text>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─────────────────────────────────────────────
// FEATURE ROW
// ─────────────────────────────────────────────
function Feature({ text, muted }: { text: string; muted?: boolean }) {
  return (
    <View style={styles.featureRow}>
      <Check size={16} color={muted ? '#6b7280' : '#10b981'} />
      <Text style={[styles.featureText, muted && styles.featureTextMuted]}>
        {text}
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingTop: 90, // 👈 reserves space for ❌
    paddingHorizontal: 20,
    alignItems: 'center',
  },

  cardWrapper: {
    width: '100%',
    alignItems: 'center',
  },

  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 28,
    width: '100%',
    maxWidth: 440,
    borderWidth: 1,
    borderColor: '#1f2937',
  },

  planTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },

  planDuration: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 4,
  },

  planPrice: {
    fontSize: 40,
    fontWeight: '800',
    color: '#10b981',
    textAlign: 'center',
    marginVertical: 16,
  },

  featuresSection: {
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 10,
  },

  sectionTitleMuted: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
    marginBottom: 10,
  },

  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },

  featureText: {
    fontSize: 14,
    color: '#e5e7eb',
    flex: 1,
    lineHeight: 20,
  },

  featureTextMuted: {
    color: '#9ca3af',
  },

  subscribeButton: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },

  subscribeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  errorText: {
    marginTop: 12,
    color: '#fca5a5',
    fontSize: 14,
    textAlign: 'center',
  },

  loginGuard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loginText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
  },

  closeText: {
    color: '#10b981',
    fontSize: 16,
  },
});

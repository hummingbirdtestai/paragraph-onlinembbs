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
import { TextInput } from 'react-native';

interface SubscribeModalProps {
  visible: boolean;
  onClose: () => void;
}

const API_BASE = 'https://mainonlinembbspy-production.up.railway.app';


export default function SubscribeModal({ visible, onClose }: SubscribeModalProps) {
  const { user } = useAuth();
  const { height } = useWindowDimensions();
  const isShortScreen = height < 700;

  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const BASE_PRICE = 5500;

  const [finalPrice, setFinalPrice] = useState(BASE_PRICE);
  const [originalPrice, setOriginalPrice] = useState<number | null>(null);

  const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);
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

async function applyPromoCode() {
  if (!promoCode.trim()) {
    setPromoError('Please enter a coupon code');
    return;
  }

  setIsCheckingCoupon(true);
  setPromoError('');

  try {
    const res = await fetch(`${API_BASE}/api/payments/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan: '12', // hard-locked
        coupon_code: promoCode.trim().toUpperCase(),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setPromoError(data?.detail || 'Invalid coupon');
      setFinalPrice(BASE_PRICE);
      setOriginalPrice(null);
      return;
    }

    setOriginalPrice(BASE_PRICE);
    setFinalPrice(data.final_amount);
  } catch {
    setPromoError('Unable to validate coupon');
  } finally {
    setIsCheckingCoupon(false);
  }
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
        plan: "12",
        coupon_code: promoCode || null,
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
<Text style={styles.planDuration}>1 Year Access</Text>
<View style={{ alignItems: 'center', marginVertical: 16 }}>
  {originalPrice && originalPrice !== finalPrice && (
    <Text style={styles.oldPrice}>
      ₹{originalPrice.toLocaleString('en-IN')}
    </Text>
  )}

  <Text style={styles.planPrice}>
    ₹{finalPrice.toLocaleString('en-IN')}
  </Text>
</View>

              <View style={styles.couponBox}>
  <View style={styles.couponRow}>
    <TextInput
      style={styles.couponInput}
      placeholder="Have a coupon?"
      placeholderTextColor="#6b7280"
      value={promoCode}
      onChangeText={(text) => {
        setPromoCode(text);
        setPromoError('');
        setOriginalPrice(null);
        setFinalPrice(BASE_PRICE);
        setOriginalPrice(null);
      }}
      autoCapitalize="characters"
    />
    <TouchableOpacity
      style={styles.couponApply}
      onPress={applyPromoCode}
      disabled={isCheckingCoupon}
    >
      <Text style={styles.couponApplyText}>
        {isCheckingCoupon ? 'Checking...' : 'Apply'}
      </Text>
    </TouchableOpacity>
  </View>

  {promoError ? (
    <Text style={styles.couponError}>{promoError}</Text>
  ) : null}
</View>


              {/* CORE */}
              <View style={styles.featuresSection}>
                <Text style={styles.sectionTitle}>What You Get (Core)</Text>

<Feature text="Complete CBME-mapped MBBS curriculum (all years)" />
<Feature text="MBBS PYQ question bank with AI tutor" />
<Feature text="Concept → Recall → Application learning flow" />
<Feature text="Flashcards with spaced repetition" />
<Feature text="Daily AI-guided study planning" />

              </View>

              {/* OPTIONAL */}
              <View style={styles.featuresSection}>
                <Text style={styles.sectionTitleMuted}>Also Included</Text>

                <Feature text="Clinical case discussions" muted />
<Feature text="Rapid revision tables & notes" muted />
<Feature text="Exam-oriented recall drills" muted />
<Feature text="24×7 AI doubt solving" muted />

              </View>

              <TouchableOpacity
                style={[
                  styles.subscribeButton,
                  isCheckingCoupon && { opacity: 0.6 },
                ]}
                onPress={handleSubscribe}
                disabled={isCheckingCoupon}
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

  couponBox: {
    marginBottom: 16,
  },
  
  couponRow: {
    flexDirection: 'row',
    gap: 8,
  },
  
  couponInput: {
    flex: 1,
    backgroundColor: '#1f2937',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#374151',
  },
  
  couponApply: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 8,
  },
  
  couponApplyText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  
  couponError: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 6,
  },

  oldPrice: {
    fontSize: 18,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
    marginBottom: 4,
  },
});

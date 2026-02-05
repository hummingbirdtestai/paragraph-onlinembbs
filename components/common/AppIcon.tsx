import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Rect,
  Circle,
  Path,
  Defs,
  LinearGradient,
  Stop
} from 'react-native-svg';

interface AppIconProps {
  size?: number;
  variant?: 'default' | 'simple' | 'pulse';
}

export default function AppIcon({ size = 512, variant = 'default' }: AppIconProps) {
  const renderDefault = () => (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs>
        <LinearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#0A0A0A" />
          <Stop offset="100%" stopColor="#1A1A1A" />
        </LinearGradient>
        <LinearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#00D9FF" />
          <Stop offset="100%" stopColor="#00B8D9" />
        </LinearGradient>
      </Defs>

      {/* Background with rounded corners */}
      <Rect width="512" height="512" rx="120" fill="url(#bg)" />

      {/* Medical cross with AI circuit pattern */}
      <Path
        d="M 256 140 L 256 220 L 176 220 L 176 292 L 256 292 L 256 372 L 328 372 L 328 292 L 408 292 L 408 220 L 328 220 L 328 140 Z"
        fill="url(#accent)"
      />

      {/* AI Brain nodes - top left */}
      <Circle cx="140" cy="140" r="8" fill="#00D9FF" opacity="0.6" />
      <Circle cx="120" cy="170" r="6" fill="#00D9FF" opacity="0.4" />
      <Path d="M 140 140 L 120 170" stroke="#00D9FF" strokeWidth="2" opacity="0.3" />

      {/* AI Brain nodes - top right */}
      <Circle cx="372" cy="140" r="8" fill="#00D9FF" opacity="0.6" />
      <Circle cx="392" cy="170" r="6" fill="#00D9FF" opacity="0.4" />
      <Path d="M 372 140 L 392 170" stroke="#00D9FF" strokeWidth="2" opacity="0.3" />

      {/* AI Brain nodes - bottom left */}
      <Circle cx="140" cy="372" r="8" fill="#00D9FF" opacity="0.6" />
      <Circle cx="120" cy="342" r="6" fill="#00D9FF" opacity="0.4" />
      <Path d="M 140 372 L 120 342" stroke="#00D9FF" strokeWidth="2" opacity="0.3" />

      {/* AI Brain nodes - bottom right */}
      <Circle cx="372" cy="372" r="8" fill="#00D9FF" opacity="0.6" />
      <Circle cx="392" cy="342" r="6" fill="#00D9FF" opacity="0.4" />
      <Path d="M 372 372 L 392 342" stroke="#00D9FF" strokeWidth="2" opacity="0.3" />

      {/* Live indicator - pulsing red dot */}
      <Circle cx="410" cy="102" r="28" fill="#EF4444" opacity="0.2" />
      <Circle cx="410" cy="102" r="18" fill="#EF4444" opacity="0.5" />
      <Circle cx="410" cy="102" r="12" fill="#EF4444" />
    </Svg>
  );

  const renderSimple = () => (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs>
        <LinearGradient id="bgSimple" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#0F0F0F" />
          <Stop offset="100%" stopColor="#1F1F1F" />
        </LinearGradient>
      </Defs>

      {/* Background */}
      <Rect width="512" height="512" rx="120" fill="url(#bgSimple)" />

      {/* Minimalist medical cross */}
      <Rect x="236" y="128" width="40" height="256" rx="8" fill="#00D9FF" />
      <Rect x="128" y="236" width="256" height="40" rx="8" fill="#00D9FF" />

      {/* AI chip corner accents */}
      <Rect x="100" y="100" width="40" height="4" fill="#00D9FF" opacity="0.6" />
      <Rect x="100" y="100" width="4" height="40" fill="#00D9FF" opacity="0.6" />

      <Rect x="372" y="100" width="40" height="4" fill="#00D9FF" opacity="0.6" />
      <Rect x="408" y="100" width="4" height="40" fill="#00D9FF" opacity="0.6" />

      <Rect x="100" y="408" width="40" height="4" fill="#00D9FF" opacity="0.6" />
      <Rect x="100" y="372" width="4" height="40" fill="#00D9FF" opacity="0.6" />

      <Rect x="372" y="408" width="40" height="4" fill="#00D9FF" opacity="0.6" />
      <Rect x="408" y="372" width="4" height="40" fill="#00D9FF" opacity="0.6" />

      {/* Live dot */}
      <Circle cx="420" cy="92" r="16" fill="#EF4444" />
    </Svg>
  );

  const renderPulse = () => (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs>
        <LinearGradient id="bgPulse" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#0A0A0A" />
          <Stop offset="100%" stopColor="#1A1A1A" />
        </LinearGradient>
      </Defs>

      {/* Background */}
      <Rect width="512" height="512" rx="120" fill="url(#bgPulse)" />

      {/* Heartbeat ECG line */}
      <Path
        d="M 80 256 L 140 256 L 170 200 L 200 320 L 230 256 L 280 256 L 310 200 L 340 320 L 370 256 L 432 256"
        fill="none"
        stroke="#00D9FF"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Medical cross background element */}
      <Path
        d="M 256 80 L 256 180 L 156 180 L 156 256 L 100 256 L 100 276 L 156 276 L 156 332 L 256 332 L 256 432 L 276 432 L 276 332 L 376 332 L 376 276 L 412 276 L 412 256 L 376 256 L 376 180 L 276 180 L 276 80 Z"
        fill="#1A1A1A"
        opacity="0.5"
      />

      {/* AI nodes */}
      <Circle cx="100" cy="120" r="6" fill="#00D9FF" opacity="0.8" />
      <Circle cx="412" cy="120" r="6" fill="#00D9FF" opacity="0.8" />
      <Circle cx="100" cy="392" r="6" fill="#00D9FF" opacity="0.8" />
      <Circle cx="412" cy="392" r="6" fill="#00D9FF" opacity="0.8" />

      {/* Live indicator */}
      <Circle cx="420" cy="92" r="20" fill="#EF4444" opacity="0.3" />
      <Circle cx="420" cy="92" r="12" fill="#EF4444" />
    </Svg>
  );

  return (
    <View style={styles.container}>
      {variant === 'simple' && renderSimple()}
      {variant === 'pulse' && renderPulse()}
      {variant === 'default' && renderDefault()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

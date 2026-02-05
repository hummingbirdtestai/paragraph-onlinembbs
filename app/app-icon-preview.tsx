import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import AppIcon from '@/components/common/AppIcon';

export default function AppIconPreview() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>App Icon Variants</Text>
        <Text style={styles.subtitle}>
          Modern, minimal, high-contrast icons for AI-tutored medical classes
        </Text>
      </View>

      <View style={[styles.grid, isMobile && styles.gridMobile]}>
        {/* Default Variant */}
        <View style={styles.card}>
          <View style={styles.iconWrapper}>
            <AppIcon size={isMobile ? 200 : 300} variant="default" />
          </View>
          <Text style={styles.variantTitle}>Default</Text>
          <Text style={styles.variantDesc}>
            Medical cross with AI circuit nodes and live indicator
          </Text>
        </View>

        {/* Simple Variant */}
        <View style={styles.card}>
          <View style={styles.iconWrapper}>
            <AppIcon size={isMobile ? 200 : 300} variant="simple" />
          </View>
          <Text style={styles.variantTitle}>Simple</Text>
          <Text style={styles.variantDesc}>
            Minimalist cross with tech corner accents
          </Text>
        </View>

        {/* Pulse Variant */}
        <View style={styles.card}>
          <View style={styles.iconWrapper}>
            <AppIcon size={isMobile ? 200 : 300} variant="pulse" />
          </View>
          <Text style={styles.variantTitle}>Pulse</Text>
          <Text style={styles.variantDesc}>
            ECG heartbeat line with medical cross background
          </Text>
        </View>
      </View>

      {/* Smaller sizes preview */}
      <View style={styles.sizesSection}>
        <Text style={styles.sectionTitle}>Different Sizes</Text>
        <View style={styles.sizesRow}>
          <View style={styles.sizeCard}>
            <AppIcon size={48} variant="default" />
            <Text style={styles.sizeLabel}>48px</Text>
          </View>
          <View style={styles.sizeCard}>
            <AppIcon size={64} variant="default" />
            <Text style={styles.sizeLabel}>64px</Text>
          </View>
          <View style={styles.sizeCard}>
            <AppIcon size={96} variant="default" />
            <Text style={styles.sizeLabel}>96px</Text>
          </View>
          <View style={styles.sizeCard}>
            <AppIcon size={128} variant="default" />
            <Text style={styles.sizeLabel}>128px</Text>
          </View>
        </View>
      </View>

      {/* Color breakdown */}
      <View style={styles.colorsSection}>
        <Text style={styles.sectionTitle}>Color Palette</Text>
        <View style={styles.colorsGrid}>
          <View style={styles.colorCard}>
            <View style={[styles.colorSwatch, { backgroundColor: '#00D9FF' }]} />
            <Text style={styles.colorName}>Primary Cyan</Text>
            <Text style={styles.colorHex}>#00D9FF</Text>
          </View>
          <View style={styles.colorCard}>
            <View style={[styles.colorSwatch, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.colorName}>Live Red</Text>
            <Text style={styles.colorHex}>#EF4444</Text>
          </View>
          <View style={styles.colorCard}>
            <View style={[styles.colorSwatch, { backgroundColor: '#0F0F0F' }]} />
            <Text style={styles.colorName}>Dark Background</Text>
            <Text style={styles.colorHex}>#0F0F0F</Text>
          </View>
          <View style={styles.colorCard}>
            <View style={[styles.colorSwatch, { backgroundColor: '#FFFFFF' }]} />
            <Text style={styles.colorName}>White</Text>
            <Text style={styles.colorHex}>#FFFFFF</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    lineHeight: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 24,
    gap: 24,
    justifyContent: 'center',
  },
  gridMobile: {
    flexDirection: 'column',
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D2D2D',
    minWidth: 320,
  },
  iconWrapper: {
    marginBottom: 24,
  },
  variantTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  variantDesc: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  sizesSection: {
    padding: 24,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  sizesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    justifyContent: 'center',
  },
  sizeCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  sizeLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 12,
    fontWeight: '600',
  },
  colorsSection: {
    padding: 24,
    marginTop: 16,
    marginBottom: 100,
  },
  colorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  colorCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D2D2D',
    minWidth: 140,
  },
  colorSwatch: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  colorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  colorHex: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'monospace',
  },
});

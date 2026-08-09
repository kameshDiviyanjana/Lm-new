import React from 'react';
import { View, Text, StyleSheet, Pressable, ImageBackground, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spacing } from '@/constants/theme';
import { router } from 'expo-router';

import { useLMS } from '@/context/LMSContext';

export default function OnboardingScreen() {
  const { userId, user } = useLMS();

  const handleGetStarted = () => {
    if (userId) {
      if (user?.role === 'instructor') {
        router.replace('/instructor' as any);
      } else {
        router.replace('/dashboard' as any);
      }
    } else {
      router.replace('/login' as any);
    }
  };

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1080&auto=format&fit=crop&q=80' }}
      style={styles.backgroundImage}
      blurRadius={10}
    >
      <View style={styles.overlay} />
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Logo & Brand Info */}
          <View style={styles.brandContainer}>
            <View style={styles.logoPill}>
              <Text style={styles.logoText}>📐 LMS</Text>
            </View>
            <Text style={styles.brandName}>AETHER ACADEMY</Text>
          </View>

          {/* Hero Content Section */}
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>
              Shape Your Future,{'\n'}
              <Text style={styles.highlightText}>Master New Skills</Text>
            </Text>
            <Text style={styles.heroSubtitle}>
              Experience a premium learning ecosystem with modules taught by leading experts in Development, Design, AI, and Marketing.
            </Text>
          </View>

          {/* Platform Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.glassCard}>
              <Text style={styles.statNumber}>15K+</Text>
              <Text style={styles.statLabel}>Students</Text>
            </View>
            <View style={styles.glassCard}>
              <Text style={styles.statNumber}>4.9★</Text>
              <Text style={styles.statLabel}>Average Rating</Text>
            </View>
            <View style={styles.glassCard}>
              <Text style={styles.statNumber}>98%</Text>
              <Text style={styles.statLabel}>Completion</Text>
            </View>
          </View>

          {/* Action Button */}
          <View style={styles.actionContainer}>
            <Pressable
              onPress={handleGetStarted}
              style={({ pressed }) => [
                styles.primaryButton,
                {
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
            >
              <Text style={styles.buttonText}>Get Started</Text>
              <Text style={styles.buttonArrow}> →</Text>
            </Pressable>
            
            <Text style={styles.footerNote}>
              By signing up, you agree to our Terms of Service & Privacy Policy.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.75)', // Deep Slate Blue opacity cover
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Platform.OS === 'ios' ? 0 : Spacing.two,
  },
  logoPill: {
    backgroundColor: '#6366F1',
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logoText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  brandName: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  heroSection: {
    marginVertical: Spacing.four,
    gap: Spacing.three,
  },
  heroTitle: {
    color: '#FFF',
    fontSize: 38,
    fontWeight: '900',
    lineHeight: 46,
    letterSpacing: -1,
  },
  highlightText: {
    color: '#818CF8', // Bright Indigo
  },
  heroSubtitle: {
    color: '#CBD5E1',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginVertical: Spacing.three,
  },
  glassCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    padding: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  statNumber: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
  },
  actionContainer: {
    gap: Spacing.three,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  primaryButton: {
    backgroundColor: '#6366F1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonArrow: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  footerNote: {
    color: '#64748B',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
});

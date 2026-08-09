import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, Dimensions, Share } from 'react-native';
import { useLMS, Course } from '@/context/LMSContext';
import { Colors, Spacing } from '@/constants/theme';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { user, courses, isDarkMode, toggleTheme, resetProgress } = useLMS();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [selectedCertCourse, setSelectedCertCourse] = useState<Course | null>(null);

  // Compute Stats
  const enrolledCourses = courses.filter(course => user.enrolled[course.id] !== undefined);
  const completedCourses = enrolledCourses.filter(
    course => user.enrolled[course.id]?.progress === 100 && user.enrolled[course.id]?.quizCompleted
  );

  const quizScores = enrolledCourses
    .map(c => user.enrolled[c.id]?.quizScore)
    .filter((s): s is number => s !== undefined);
    
  const averageQuizScore = quizScores.length > 0
    ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
    : 0;

  const handleShareCertificate = async (courseTitle: string) => {
    try {
      await Share.share({
        message: `I just unlocked my professional Certificate of Completion for "${courseTitle}" on Aether Academy! 🎓🚀 #learning #achievement`,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Profile Card Header */}
        <View style={[styles.profileHeaderCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
          <View style={[styles.avatarPlaceholder, { borderColor: theme.primary }]}>
            <Text style={styles.avatarEmoji}>👩‍💻</Text>
          </View>
          <Text style={[styles.profileName, { color: theme.text }]}>{user.name}</Text>
          <Text style={[styles.profileBio, { color: theme.textSecondary }]}>{user.title}</Text>
          <View style={[styles.roleBadge, { backgroundColor: theme.primaryLight }]}>
            <Text style={[styles.roleText, { color: theme.primary }]}>{user.role.toUpperCase()} PROFILE</Text>
          </View>
        </View>

        {/* Detailed Statistics Dashboard */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Learning Metrics</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.metricCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
            <Text style={styles.metricVal}>{completedCourses.length}</Text>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Courses Done</Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
            <Text style={styles.metricVal}>{user.xp}</Text>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>XP Accrued</Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
            <Text style={styles.metricVal}>{averageQuizScore}%</Text>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Avg Quiz Score</Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
            <Text style={styles.metricVal}>{user.streak}d</Text>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Daily Streak</Text>
          </View>
        </View>

        {/* Credentials & Certificates Drawer */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Credentials & Certificates</Text>
        </View>

        {completedCourses.length === 0 ? (
          <View style={[styles.emptyCertCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
            <Text style={styles.emptyCertEmoji}>🎖</Text>
            <Text style={[styles.emptyCertTitle, { color: theme.text }]}>No Certificates Earned Yet</Text>
            <Text style={[styles.emptyCertSub, { color: theme.textSecondary }]}>
              {"Complete 100% of any course's lectures and score on its final quiz to unlock your professional credential!"}
            </Text>
          </View>
        ) : (
          <View style={styles.certList}>
            {completedCourses.map((course) => {
              const state = user.enrolled[course.id];
              return (
                <Pressable
                  key={course.id}
                  onPress={() => setSelectedCertCourse(course)}
                  style={({ pressed }) => [
                    styles.certItem,
                    {
                      backgroundColor: theme.backgroundElement,
                      borderColor: theme.border,
                      opacity: pressed ? 0.9 : 1,
                    },
                  ]}
                >
                  <View style={styles.certIconPill}>
                    <Text style={styles.certIcon}>🎓</Text>
                  </View>
                  <View style={styles.certMeta}>
                    <Text style={[styles.certCourseName, { color: theme.text }]}>{course.title}</Text>
                    <Text style={[styles.certDateText, { color: theme.textSecondary }]}>
                      Grade: {state.quizScore}% • Completed {state.completedAt ? new Date(state.completedAt).toLocaleDateString() : 'recently'}
                    </Text>
                  </View>
                  <View style={[styles.viewCertBtn, { backgroundColor: theme.primaryLight }]}>
                    <Text style={[styles.viewCertBtnText, { color: theme.primary }]}>View</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Global Settings Panel */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Preferences & Settings</Text>
        </View>

        <View style={[styles.settingsPanel, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
          <Pressable
            onPress={toggleTheme}
            style={({ pressed }) => [
              styles.settingRow,
              { backgroundColor: pressed ? theme.backgroundSelected : 'transparent' },
            ]}
          >
            <Text style={[styles.settingLabel, { color: theme.text }]}>🌓 Toggle Color Theme</Text>
            <Text style={[styles.settingValue, { color: theme.primary }]}>
              {isDarkMode ? 'Dark Mode' : 'Light Mode'}
            </Text>
          </Pressable>

          <Pressable
            onPress={resetProgress}
            style={({ pressed }) => [
              styles.settingRow,
              { backgroundColor: pressed ? 'rgba(239, 68, 68, 0.05)' : 'transparent' },
            ]}
          >
            <Text style={styles.dangerLabel}>⚠️ Reset Local Progress</Text>
            <Text style={styles.dangerValue}>Wipe Data</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Premium Certificate Viewer Modal */}
      <Modal
        visible={selectedCertCourse !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedCertCourse(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: '#0B132B' }]}>
            {/* Scrollable for smaller devices/web viewports */}
            <ScrollView contentContainerStyle={styles.modalScroll}>
              {/* Gold border credential style */}
              <View style={styles.certificateBorder}>
                <View style={styles.certificateInnerBorder}>
                  {/* Decorative corner headers */}
                  <View style={styles.certCorner} />
                  
                  {/* Certificate Content */}
                  <View style={styles.certContent}>
                    <Text style={styles.certHeading}>CERTIFICATE OF COMPLETION</Text>
                    <Text style={styles.certSubheading}>AETHER LEARNING ACADEMY</Text>

                    <View style={styles.dividerLine} />

                    <Text style={styles.certPitch}>This professional credential is proudly awarded to</Text>
                    <Text style={styles.certStudentName}>{user.name}</Text>
                    
                    <Text style={styles.certPitch}>for outstanding dedication and mastery in completing</Text>
                    <Text style={styles.certCourseTitle}>{"\"" + selectedCertCourse?.title + "\""}</Text>

                    <Text style={styles.certGradeText}>
                      Passing Grade of <Text style={{ color: '#F59E0B', fontWeight: '800' }}>{selectedCertCourse ? user.enrolled[selectedCertCourse.id]?.quizScore : 0}%</Text>
                    </Text>

                    <View style={styles.certificateSealRow}>
                      <View style={styles.sealBlock}>
                        <Text style={styles.sealSignTitle}>{selectedCertCourse?.instructor}</Text>
                        <View style={styles.signatureLine} />
                        <Text style={styles.sealSignRole}>Course Instructor</Text>
                      </View>
                      
                      {/* Gold Academy Seal */}
                      <View style={styles.academySeal}>
                        <Text style={styles.sealIconText}>🏆</Text>
                      </View>

                      <View style={styles.sealBlock}>
                        <Text style={styles.sealSignTitle}>
                          {selectedCertCourse && user.enrolled[selectedCertCourse.id]?.completedAt
                            ? new Date(user.enrolled[selectedCertCourse.id].completedAt!).toLocaleDateString()
                            : new Date().toLocaleDateString()}
                        </Text>
                        <View style={styles.signatureLine} />
                        <Text style={styles.sealSignRole}>Date Verified</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* Share & Close Buttons */}
              <View style={styles.modalActionsRow}>
                <Pressable
                  onPress={() => selectedCertCourse && handleShareCertificate(selectedCertCourse.title)}
                  style={[styles.modalActionBtn, { backgroundColor: '#6366F1' }]}
                >
                  <Text style={styles.modalBtnText}>🔗 Share Credential</Text>
                </Pressable>

                <Pressable
                  onPress={() => setSelectedCertCourse(null)}
                  style={[styles.modalActionBtn, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}
                >
                  <Text style={styles.modalBtnText}>Close</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  profileHeaderCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: Spacing.four,
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  avatarEmoji: {
    fontSize: 44,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '800',
  },
  profileBio: {
    fontSize: 13,
    textAlign: 'center',
  },
  roleBadge: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sectionHeader: {
    marginTop: Spacing.three,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  metricCard: {
    width: (width - Spacing.four * 2 - Spacing.two) / 2 - 2,
    padding: Spacing.three,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  metricVal: {
    fontSize: 24,
    fontWeight: '800',
    color: '#6366F1',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyCertCard: {
    padding: Spacing.five,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    gap: Spacing.two,
  },
  emptyCertEmoji: {
    fontSize: 44,
  },
  emptyCertTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyCertSub: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  certList: {
    gap: Spacing.two,
  },
  certItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: 16,
    borderWidth: 1,
  },
  certIconPill: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
  },
  certIcon: {
    fontSize: 20,
  },
  certMeta: {
    flex: 1,
    gap: 4,
  },
  certCourseName: {
    fontSize: 14,
    fontWeight: '700',
  },
  certDateText: {
    fontSize: 11,
  },
  viewCertBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewCertBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  settingsPanel: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.three,
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  dangerLabel: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  dangerValue: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },
  // Certificate Modal Styling
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.three,
  },
  modalCard: {
    width: '100%',
    maxWidth: 580,
    borderRadius: 24,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: '#1E293B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },
  modalScroll: {
    alignItems: 'center',
    gap: Spacing.four,
  },
  certificateBorder: {
    width: '100%',
    borderWidth: 3,
    borderColor: '#D97706', // Gold double border
    padding: 3,
    borderRadius: 12,
  },
  certificateInnerBorder: {
    borderWidth: 1,
    borderColor: '#F59E0B',
    padding: Spacing.four,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    position: 'relative',
  },
  certCorner: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: 6,
    bottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.15)',
    borderRadius: 6,
    pointerEvents: 'none',
  },
  certContent: {
    alignItems: 'center',
    gap: 12,
  },
  certHeading: {
    color: '#FBBF24',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
  },
  certSubheading: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3,
    marginTop: -4,
  },
  dividerLine: {
    height: 1,
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    width: '60%',
    marginVertical: Spacing.two,
  },
  certPitch: {
    color: '#94A3B8',
    fontSize: 11,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  certStudentName: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: '800',
    marginVertical: 4,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  certCourseTitle: {
    color: '#F3F4F6',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 24,
  },
  certGradeText: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: Spacing.two,
  },
  certificateSealRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: Spacing.four,
    gap: Spacing.two,
  },
  sealBlock: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  sealSignTitle: {
    color: '#E5E7EB',
    fontSize: 11,
    fontWeight: '600',
  },
  signatureLine: {
    height: 1,
    backgroundColor: '#475569',
    width: '80%',
    marginVertical: 2,
  },
  sealSignRole: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '500',
  },
  academySeal: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  sealIconText: {
    fontSize: 22,
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    justifyContent: 'center',
    width: '100%',
    marginTop: Spacing.two,
  },
  modalActionBtn: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  modalBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

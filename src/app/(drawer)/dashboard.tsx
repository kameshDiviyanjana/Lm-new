import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, Platform } from 'react-native';
import { useLMS } from '@/context/LMSContext';
import { Colors, Spacing } from '@/constants/theme';
import { router } from 'expo-router';

export default function DashboardScreen() {
  const { user, courses, isDarkMode } = useLMS();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  // Filter enrolled courses
  const enrolledCourses = courses.filter(course => user.enrolled[course.id] !== undefined);

  // Get active course (most progressed but not fully completed course)
  const activeCourse = enrolledCourses
    .filter(course => {
      const state = user.enrolled[course.id];
      return state.progress > 0 && state.progress < 100;
    })
    .sort((a, b) => {
      const pA = user.enrolled[a.id]?.progress || 0;
      const pB = user.enrolled[b.id]?.progress || 0;
      return pB - pA; // highest progress first
    })[0] || enrolledCourses.find(c => (user.enrolled[c.id]?.progress || 0) < 100); // fallback to any uncompleted enrolled course

  const completedCoursesCount = enrolledCourses.filter(
    course => user.enrolled[course.id]?.progress === 100 && user.enrolled[course.id]?.quizCompleted
  ).length;

  const navigateToCourse = (id: string) => {
    router.push(`/course/${id}` as any);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Welcome Banner */}
      <View style={styles.welcomeSection}>
        <View>
          <Text style={[styles.welcomeSub, { color: theme.textSecondary }]}>Welcome Back</Text>
          <Text style={[styles.welcomeTitle, { color: theme.text }]}>{user.name} 👋</Text>
        </View>
        <Pressable onPress={() => router.push('/profile' as any)}>
          <Image source={{ uri: user.avatar }} style={styles.profilePic} />
        </Pressable>
      </View>

      {/* Overview Cards */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
          <Text style={styles.statEmoji}>⚡</Text>
          <Text style={[styles.statNum, { color: theme.text }]}>{user.xp}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>XP Earned</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
          <Text style={styles.statEmoji}>🔥</Text>
          <Text style={[styles.statNum, { color: theme.text }]}>{user.streak}d</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Streak</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
          <Text style={styles.statEmoji}>🎓</Text>
          <Text style={[styles.statNum, { color: theme.text }]}>{completedCoursesCount}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Completed</Text>
        </View>
      </View>

      {/* Active Course / Resume Banner */}
      {activeCourse && (
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Continue Learning</Text>
          <Pressable
            onPress={() => navigateToCourse(activeCourse.id)}
            style={({ pressed }) => [
              styles.resumeCard,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.border,
                transform: [{ scale: pressed ? 0.99 : 1 }],
                shadowColor: theme.shadow,
              },
            ]}
          >
            {/* Colored top gradient decoration */}
            <View style={[styles.gradientHeader, { backgroundColor: activeCourse.gradientColors[0] }]} />
            
            <View style={styles.resumeCardBody}>
              <View style={styles.resumeInfo}>
                <View style={[styles.categoryBadge, { backgroundColor: theme.primaryLight }]}>
                  <Text style={[styles.categoryText, { color: theme.primary }]}>{activeCourse.category}</Text>
                </View>
                <Text style={[styles.resumeCourseTitle, { color: theme.text }]}>{activeCourse.title}</Text>
                <Text style={[styles.resumeInstructor, { color: theme.textSecondary }]}>By {activeCourse.instructor}</Text>
              </View>

              {/* Progress visualizer */}
              <View style={styles.progressContainer}>
                <View style={styles.progressTextRow}>
                  <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>Overall Progress</Text>
                  <Text style={[styles.progressVal, { color: theme.primary }]}>{user.enrolled[activeCourse.id]?.progress}%</Text>
                </View>
                <View style={[styles.progressBarBg, { backgroundColor: theme.border }]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        backgroundColor: theme.primary,
                        width: `${user.enrolled[activeCourse.id]?.progress}%`,
                      },
                    ]}
                  />
                </View>
              </View>
              
              <View style={styles.resumeActionRow}>
                <Text style={[styles.resumeActionText, { color: theme.primary }]}>Resume Course →</Text>
              </View>
            </View>
          </Pressable>
        </View>
      )}

      {/* Enrolled Courses list */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>My Courses</Text>
          {enrolledCourses.length > 0 && (
            <Pressable onPress={() => router.push('/explore' as any)}>
              <Text style={[styles.seeAllLink, { color: theme.primary }]}>Browse Catalog</Text>
            </Pressable>
          )}
        </View>

        {enrolledCourses.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No Enrolled Courses</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Explore our diverse learning tracks and start building your custom skill portfolio!
            </Text>
            <Pressable
              onPress={() => router.push('/explore' as any)}
              style={({ pressed }) => [
                styles.emptyActionBtn,
                {
                  backgroundColor: theme.primary,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <Text style={styles.emptyActionText}>Browse Courses</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.coursesGrid}>
            {enrolledCourses.map((course) => {
              const state = user.enrolled[course.id];
              const isCompleted = state.progress === 100 && state.quizCompleted;

              return (
                <Pressable
                  key={course.id}
                  onPress={() => navigateToCourse(course.id)}
                  style={({ pressed }) => [
                    styles.courseItemCard,
                    {
                      backgroundColor: theme.backgroundElement,
                      borderColor: theme.border,
                      shadowColor: theme.shadow,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    },
                  ]}
                >
                  <View style={[styles.courseIconPill, { backgroundColor: course.gradientColors[0] }]}>
                    <Text style={styles.courseIconText}>{course.title.charAt(0)}</Text>
                  </View>

                  <View style={styles.courseDetail}>
                    <Text numberOfLines={1} style={[styles.courseTitleText, { color: theme.text }]}>
                      {course.title}
                    </Text>
                    
                    {isCompleted ? (
                      <View style={styles.completedBadgeRow}>
                        <View style={[styles.completedBadge, { backgroundColor: theme.successLight }]}>
                          <Text style={[styles.completedText, { color: theme.success }]}>✓ Completed</Text>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.itemProgressContainer}>
                        <View style={[styles.itemProgressBarBg, { backgroundColor: theme.border }]}>
                          <View style={[styles.itemProgressBarFill, { backgroundColor: theme.primary, width: `${state.progress}%` }]} />
                        </View>
                        <Text style={[styles.itemProgressText, { color: theme.textSecondary }]}>{state.progress}%</Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      {/* Suggested Track Quick Section */}
      <View style={[styles.suggestedPanel, { backgroundColor: theme.primaryLight }]}>
        <Text style={styles.suggestedEmoji}>💡</Text>
        <View style={styles.suggestedInfo}>
          <Text style={[styles.suggestedTitle, { color: theme.primary }]}>Tip of the day</Text>
          <Text style={[styles.suggestedDesc, { color: theme.text }]}>
            Taking a quick 5-question quiz after a coding session increases retention by up to 60%!
          </Text>
        </View>
      </View>
    </ScrollView>
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
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 0 : Spacing.two,
  },
  welcomeSub: {
    fontSize: 14,
    fontWeight: '500',
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginTop: 2,
  },
  profilePic: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  statBox: {
    flex: 1,
    padding: Spacing.three,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  statEmoji: {
    fontSize: 22,
  },
  statNum: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  sectionContainer: {
    gap: Spacing.three,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  seeAllLink: {
    fontSize: 13,
    fontWeight: '600',
  },
  resumeCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  gradientHeader: {
    height: 6,
  },
  resumeCardBody: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  resumeInfo: {
    gap: 6,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
  },
  resumeCourseTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  resumeInstructor: {
    fontSize: 13,
  },
  progressContainer: {
    gap: 8,
    marginTop: 4,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressVal: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  resumeActionRow: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  resumeActionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: Spacing.five,
    alignItems: 'center',
    gap: Spacing.two,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyActionBtn: {
    marginTop: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: 12,
  },
  emptyActionText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  coursesGrid: {
    gap: Spacing.two,
  },
  courseItemCard: {
    flexDirection: 'row',
    padding: Spacing.three,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  courseIconPill: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
  },
  courseIconText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  courseDetail: {
    flex: 1,
    gap: 6,
  },
  courseTitleText: {
    fontSize: 15,
    fontWeight: '700',
  },
  itemProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemProgressBarBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  itemProgressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  itemProgressText: {
    fontSize: 11,
    fontWeight: '600',
    minWidth: 28,
    textAlign: 'right',
  },
  completedBadgeRow: {
    flexDirection: 'row',
  },
  completedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  completedText: {
    fontSize: 10,
    fontWeight: '700',
  },
  suggestedPanel: {
    flexDirection: 'row',
    padding: Spacing.three,
    borderRadius: 16,
    gap: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  suggestedEmoji: {
    fontSize: 24,
  },
  suggestedInfo: {
    flex: 1,
    gap: 2,
  },
  suggestedTitle: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  suggestedDesc: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
});

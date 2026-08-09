import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Pressable, Platform } from 'react-native';
import { useLMS } from '@/context/LMSContext';
import { Colors, Spacing } from '@/constants/theme';
import { router } from 'expo-router';

export default function ExploreScreen() {
  const { courses, user, enrollInCourse, isDarkMode } = useLMS();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Development' | 'Design' | 'Marketing' | 'Business'>('All');
  const [selectedLevel, setSelectedLevel] = useState<'All' | 'Beginner' | 'Intermediate' | 'Advanced'>('All');

  const categories: ('All' | 'Development' | 'Design' | 'Marketing' | 'Business')[] = [
    'All', 'Development', 'Design', 'Marketing', 'Business'
  ];

  const levels: ('All' | 'Beginner' | 'Intermediate' | 'Advanced')[] = [
    'All', 'Beginner', 'Intermediate', 'Advanced'
  ];

  // Filtering Logic
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'All' || course.level === selectedLevel;

    return matchesSearch && matchesCategory && matchesLevel;
  });

  const handleEnroll = (courseId: string) => {
    enrollInCourse(courseId);
    router.push(`/course/${courseId}` as any);
  };

  const handleCoursePress = (courseId: string) => {
    router.push(`/course/${courseId}` as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header and Search */}
      <View style={[styles.searchSection, { backgroundColor: theme.backgroundElement, borderBottomColor: theme.border }]}>
        <Text style={[styles.searchTitle, { color: theme.text }]}>Discover Skills</Text>
        <View style={[styles.searchBar, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder="Search courses, instructors, keywords..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: theme.text }]}
          />
          {searchQuery !== '' && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Text style={[styles.clearIcon, { color: theme.textSecondary }]}>✕</Text>
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Categories Chips */}
        <View style={styles.filterSection}>
          <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>CATEGORIES</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
            {categories.map((category) => {
              const isSelected = selectedCategory === category;
              return (
                <Pressable
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  style={({ pressed }) => [
                    styles.chip,
                    {
                      backgroundColor: isSelected ? theme.primary : theme.backgroundElement,
                      borderColor: isSelected ? theme.primary : theme.border,
                      opacity: pressed ? 0.9 : 1,
                    },
                  ]}
                >
                  <Text style={[styles.chipText, { color: isSelected ? '#FFF' : theme.text, fontWeight: isSelected ? '700' : '500' }]}>
                    {category}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Levels Selector */}
        <View style={styles.filterSection}>
          <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>DIFFICULTY LEVEL</Text>
          <View style={styles.levelContainer}>
            {levels.map((level) => {
              const isSelected = selectedLevel === level;
              return (
                <Pressable
                  key={level}
                  onPress={() => setSelectedLevel(level)}
                  style={({ pressed }) => [
                    styles.levelPill,
                    {
                      backgroundColor: isSelected ? theme.primaryLight : 'transparent',
                      borderColor: isSelected ? theme.primary : theme.border,
                      opacity: pressed ? 0.9 : 1,
                    },
                  ]}
                >
                  <Text style={[styles.levelPillText, { color: isSelected ? theme.primary : theme.text, fontWeight: isSelected ? '700' : '500' }]}>
                    {level}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Courses Feed */}
        <View style={styles.feedSection}>
          <View style={styles.feedHeader}>
            <Text style={[styles.feedTitle, { color: theme.text }]}>
              {filteredCourses.length} {filteredCourses.length === 1 ? 'Course' : 'Courses'} Available
            </Text>
          </View>

          {filteredCourses.length === 0 ? (
            <View style={styles.emptyFeed}>
              <Text style={styles.emptyFeedIcon}>🔍</Text>
              <Text style={[styles.emptyFeedTitle, { color: theme.text }]}>No Matches Found</Text>
              <Text style={[styles.emptyFeedSub, { color: theme.textSecondary }]}>
                Try adjusting your search terms or filters to find what you are looking for.
              </Text>
            </View>
          ) : (
            filteredCourses.map((course) => {
              const enrollment = user.enrolled[course.id];
              const isEnrolled = enrollment !== undefined;
              const progress = enrollment?.progress || 0;
              const isCompleted = progress === 100 && enrollment?.quizCompleted;

              return (
                <Pressable
                  key={course.id}
                  onPress={() => handleCoursePress(course.id)}
                  style={({ pressed }) => [
                    styles.courseCard,
                    {
                      backgroundColor: theme.backgroundElement,
                      borderColor: theme.border,
                      shadowColor: theme.shadow,
                      transform: [{ scale: pressed ? 0.99 : 1 }],
                    },
                  ]}
                >
                  {/* Decorative Banner */}
                  <View style={[styles.cardBanner, { backgroundColor: course.gradientColors[0] }]}>
                    <View style={styles.badgeRow}>
                      <View style={[styles.categoryBadge, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                        <Text style={styles.badgeText}>{course.category}</Text>
                      </View>
                      <View style={[styles.levelBadge, { backgroundColor: 'rgba(15, 23, 42, 0.4)' }]}>
                        <Text style={styles.badgeText}>{course.level}</Text>
                      </View>
                    </View>
                    <Text style={styles.bannerIcon}>{course.category === 'Development' ? '💻' : course.category === 'Design' ? '🎨' : course.category === 'Marketing' ? '📈' : '💼'}</Text>
                  </View>

                  {/* Card Info */}
                  <View style={styles.cardContent}>
                    <View style={styles.metaRow}>
                      <Text style={[styles.metaText, { color: theme.textSecondary }]}>⏱ {course.duration}</Text>
                      <Text style={[styles.metaText, { color: theme.textSecondary }]}>👤 {course.studentsEnrolled.toLocaleString()} enrolled</Text>
                    </View>

                    <Text style={[styles.courseTitle, { color: theme.text }]} numberOfLines={2}>
                      {course.title}
                    </Text>

                    <Text style={[styles.courseInstructor, { color: theme.textSecondary }]}>
                      Led by {course.instructor} • <Text style={styles.ratingText}>★ {course.rating}</Text>
                    </Text>

                    <Text style={[styles.courseDescription, { color: theme.textSecondary }]} numberOfLines={2}>
                      {course.description}
                    </Text>

                    {/* Action Bar */}
                    <View style={[styles.cardActionRow, { borderTopColor: theme.border }]}>
                      {isCompleted ? (
                        <View style={[styles.statusBadge, { backgroundColor: theme.successLight }]}>
                          <Text style={[styles.statusText, { color: theme.success }]}>✓ Completed</Text>
                        </View>
                      ) : isEnrolled ? (
                        <View style={styles.progressSummary}>
                          <Text style={[styles.progressPctText, { color: theme.primary }]}>In Progress ({progress}%)</Text>
                          <View style={[styles.progressMiniBarBg, { backgroundColor: theme.border }]}>
                            <View style={[styles.progressMiniBarFill, { backgroundColor: theme.primary, width: `${progress}%` }]} />
                          </View>
                        </View>
                      ) : (
                        <Text style={[styles.enrollPitch, { color: theme.textSecondary }]}>Get 200 XP upon completion</Text>
                      )}

                      <Pressable
                        onPress={() => isEnrolled ? handleCoursePress(course.id) : handleEnroll(course.id)}
                        style={({ pressed }) => [
                          styles.enrollBtn,
                          {
                            backgroundColor: isEnrolled ? theme.backgroundSelected : theme.primary,
                            opacity: pressed ? 0.9 : 1,
                          },
                        ]}
                      >
                        <Text style={[styles.enrollBtnText, { color: isEnrolled ? theme.text : '#FFF' }]}>
                          {isEnrolled ? 'Resume' : 'Enroll Now'}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </Pressable>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchSection: {
    padding: Spacing.four,
    borderBottomWidth: 1,
    gap: Spacing.three,
    zIndex: 10,
  },
  searchTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
    gap: 8,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    padding: 0,
    ...Platform.select({
      web: {
        outlineStyle: 'none' as any,
      },
    }),
  },
  clearIcon: {
    fontSize: 14,
    padding: 4,
  },
  scrollContent: {
    paddingVertical: Spacing.four,
    gap: Spacing.four,
  },
  filterSection: {
    gap: Spacing.two,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    paddingHorizontal: Spacing.four,
  },
  chipsScroll: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
  },
  levelContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  levelPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  levelPillText: {
    fontSize: 12,
  },
  feedSection: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feedTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptyFeed: {
    alignItems: 'center',
    paddingVertical: Spacing.six,
    gap: Spacing.two,
  },
  emptyFeedIcon: {
    fontSize: 48,
  },
  emptyFeedTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyFeedSub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  courseCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: Spacing.three,
  },
  cardBanner: {
    height: 100,
    padding: Spacing.three,
    justifyContent: 'space-between',
    position: 'relative',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  bannerIcon: {
    position: 'absolute',
    right: Spacing.four,
    bottom: Spacing.two,
    fontSize: 48,
    opacity: 0.8,
  },
  cardContent: {
    padding: Spacing.four,
    gap: Spacing.two,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '600',
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 22,
  },
  courseInstructor: {
    fontSize: 13,
    fontWeight: '500',
  },
  ratingText: {
    color: '#F59E0B',
    fontWeight: '700',
  },
  courseDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginVertical: 4,
  },
  cardActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: Spacing.three,
    marginTop: Spacing.two,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressSummary: {
    flex: 1,
    marginRight: Spacing.four,
    gap: 4,
  },
  progressPctText: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressMiniBarBg: {
    height: 4,
    borderRadius: 2,
    width: '100%',
  },
  progressMiniBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  enrollPitch: {
    fontSize: 11,
    fontWeight: '500',
  },
  enrollBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
    borderRadius: 10,
  },
  enrollBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});

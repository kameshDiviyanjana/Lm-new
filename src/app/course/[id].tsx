import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Dimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useLMS, Lecture } from '@/context/LMSContext';
import { Colors, Spacing } from '@/constants/theme';

const { width } = Dimensions.get('window');

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams();
  const { courses, user, enrollInCourse, completeLecture, submitQuizScore, isDarkMode } = useLMS();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const course = courses.find(c => c.id === id);

  const enrollment = course ? user.enrolled[course.id] : undefined;
  const isEnrolled = enrollment !== undefined;

  // Determine the default active lecture
  const defaultLecture = (() => {
    if (!isEnrolled || !course || !enrollment) return null;
    for (const mod of course.modules) {
      for (const lec of mod.lectures) {
        if (!enrollment.completedLectures.includes(lec.id)) {
          return lec;
        }
      }
    }
    return course.modules[0]?.lectures[0] || null;
  })();

  const [selectedLectureState, setSelectedLecture] = useState<Lecture | null>(null);
  const selectedLecture = selectedLectureState || defaultLecture;

  // Tabs: 'About' | 'Syllabus' | 'Player' | 'Quiz'
  const [activeTab, setActiveTab] = useState<'About' | 'Syllabus' | 'Player' | 'Quiz'>(
    isEnrolled ? 'Player' : 'About'
  );

  // Quiz Player State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // EARLY RETURN IF COURSE NOT FOUND (Must be here, after all hooks!)
  if (!course) {
    return (
      <View style={[styles.fallbackContainer, { backgroundColor: theme.background }]}>
        <Text style={styles.fallbackEmoji}>🔍</Text>
        <Text style={[styles.fallbackTitle, { color: theme.text }]}>Course Not Found</Text>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: theme.primary }]}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const handleEnroll = () => {
    enrollInCourse(course.id);
    // Hook triggers useEffect which switches tab to 'Player'
  };

  const handleSelectLecture = (lec: Lecture) => {
    setSelectedLecture(lec);
    setActiveTab('Player');
  };

  const handleMarkComplete = () => {
    if (selectedLecture) {
      completeLecture(course.id, selectedLecture.id);
      
      // Auto-advance to next lecture if possible
      let currentLecIndex = -1;
      let currentModIndex = -1;

      // Find indices
      course.modules.forEach((mod, mIdx) => {
        const lIdx = mod.lectures.findIndex(l => l.id === selectedLecture.id);
        if (lIdx !== -1) {
          currentLecIndex = lIdx;
          currentModIndex = mIdx;
        }
      });

      if (currentLecIndex !== -1 && currentModIndex !== -1) {
        const currentModule = course.modules[currentModIndex];
        if (currentLecIndex < currentModule.lectures.length - 1) {
          // Next lecture in same module
          setSelectedLecture(currentModule.lectures[currentLecIndex + 1]);
        } else if (currentModIndex < course.modules.length - 1) {
          // First lecture in next module
          const nextModule = course.modules[currentModIndex + 1];
          if (nextModule.lectures.length > 0) {
            setSelectedLecture(nextModule.lectures[0]);
          }
        } else {
          // Completed all modules, suggest taking the quiz!
          alert('🎉 All lectures cleared! Head over to the Quiz tab to unlock your certificate!');
          setActiveTab('Quiz');
        }
      }
    }
  };

  const handleAnswerSelect = (optionIdx: number) => {
    const question = course.quiz.questions[currentQuestionIndex];
    setSelectedAnswers(prev => ({
      ...prev,
      [question.id]: optionIdx
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < course.quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Calculate Score
      let correctCount = 0;
      course.quiz.questions.forEach((q) => {
        if (selectedAnswers[q.id] === q.correctOptionIndex) {
          correctCount++;
        }
      });
      const score = correctCount / course.quiz.questions.length;
      submitQuizScore(course.id, score);
      setQuizScore(score * 100);
      setQuizFinished(true);
    }
  };

  const handleResetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizFinished(false);
    setQuizScore(0);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      
      {/* Dynamic Header Banner */}
      <View style={[styles.heroBanner, { backgroundColor: course.gradientColors[0] }]}>
        <View style={styles.topActionRow}>
          <Pressable onPress={() => router.back()} style={styles.roundHeaderBtn}>
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>{course.title}</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.bannerMeta}>
          <View style={styles.badgeRow}>
            <View style={[styles.categoryBadge, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
              <Text style={styles.categoryText}>{course.category}</Text>
            </View>
            {user.role === 'instructor' && course.instructor === user.name && (
              <Pressable
                onPress={() => router.push(`/instructor?courseId=${course.id}` as any)}
                style={({ pressed }) => [
                  styles.manageBadge,
                  {
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                    opacity: pressed ? 0.8 : 1,
                  }
                ]}
              >
                <Text style={styles.manageBadgeText}>⚙️ Manage Questions</Text>
              </Pressable>
            )}
          </View>
          <Text style={styles.bannerInstructor}>Led by {course.instructor}</Text>
        </View>
      </View>

      {/* Tabs Selector Navigation */}
      <View style={[styles.tabBarRow, { backgroundColor: theme.backgroundElement, borderBottomColor: theme.border }]}>
        <Pressable onPress={() => setActiveTab('About')} style={[styles.tabItem, activeTab === 'About' && { borderBottomColor: theme.primary }]}>
          <Text style={[styles.tabItemText, { color: activeTab === 'About' ? theme.primary : theme.textSecondary }]}>About</Text>
        </Pressable>
        <Pressable onPress={() => setActiveTab('Syllabus')} style={[styles.tabItem, activeTab === 'Syllabus' && { borderBottomColor: theme.primary }]}>
          <Text style={[styles.tabItemText, { color: activeTab === 'Syllabus' ? theme.primary : theme.textSecondary }]}>Syllabus</Text>
        </Pressable>
        {isEnrolled && (
          <>
            <Pressable onPress={() => setActiveTab('Player')} style={[styles.tabItem, activeTab === 'Player' && { borderBottomColor: theme.primary }]}>
              <Text style={[styles.tabItemText, { color: activeTab === 'Player' ? theme.primary : theme.textSecondary }]}>Player</Text>
            </Pressable>
            <Pressable onPress={() => setActiveTab('Quiz')} style={[styles.tabItem, activeTab === 'Quiz' && { borderBottomColor: theme.primary }]}>
              <Text style={[styles.tabItemText, { color: activeTab === 'Quiz' ? theme.primary : theme.textSecondary }]}>Quiz</Text>
            </Pressable>
          </>
        )}
      </View>

      {/* Scrollable View Panel */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Tab 1: About Description */}
        {activeTab === 'About' && (
          <View style={styles.tabPanel}>
            <View style={[styles.cardBlock, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
              <Text style={[styles.panelHeading, { color: theme.text }]}>Course Overview</Text>
              <Text style={[styles.panelBodyText, { color: theme.textSecondary }]}>{course.description}</Text>
            </View>

            <View style={styles.quickSpecs}>
              <View style={[styles.specItem, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
                <Text style={styles.specIcon}>⏱</Text>
                <Text style={[styles.specVal, { color: theme.text }]}>{course.duration}</Text>
                <Text style={[styles.specLabel, { color: theme.textSecondary }]}>Runtime</Text>
              </View>
              <View style={[styles.specItem, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
                <Text style={styles.specIcon}>📶</Text>
                <Text style={[styles.specVal, { color: theme.text }]}>{course.level}</Text>
                <Text style={[styles.specLabel, { color: theme.textSecondary }]}>Difficulty</Text>
              </View>
              <View style={[styles.specItem, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
                <Text style={styles.specIcon}>★</Text>
                <Text style={[styles.specVal, { color: theme.text }]}>{course.rating}</Text>
                <Text style={[styles.specLabel, { color: theme.textSecondary }]}>Rating</Text>
              </View>
            </View>

            {/* Instructor Bios */}
            <View style={[styles.cardBlock, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
              <Text style={[styles.panelHeading, { color: theme.text }]}>Your Instructor</Text>
              <View style={styles.instructorProfile}>
                <View style={styles.instructorAvatar}>
                  <Text style={styles.instructorAvatarText}>{course.instructor.charAt(0)}</Text>
                </View>
                <View>
                  <Text style={[styles.instructorName, { color: theme.text }]}>{course.instructor}</Text>
                  <Text style={[styles.instructorTitle, { color: theme.textSecondary }]}>{course.instructorTitle}</Text>
                </View>
              </View>
            </View>

            {/* General CTA button */}
            {!isEnrolled && (
              <Pressable
                onPress={handleEnroll}
                style={({ pressed }) => [
                  styles.enrollCtaBtn,
                  {
                    backgroundColor: theme.primary,
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
              >
                <Text style={styles.enrollCtaBtnText}>Enroll in Course (+50 XP)</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Tab 2: Syllabus Curriculum */}
        {activeTab === 'Syllabus' && (
          <View style={styles.tabPanel}>
            <Text style={[styles.panelHeading, { color: theme.text, paddingHorizontal: 4 }]}>Curriculum Outline</Text>
            
            {course.modules.map((mod, modIdx) => (
              <View key={mod.id} style={[styles.syllabusModuleCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
                <Text style={[styles.moduleTitle, { color: theme.text }]}>
                  Module {modIdx + 1}: {mod.title}
                </Text>
                <View style={styles.moduleLecturesList}>
                  {mod.lectures.map((lec) => {
                    const isLecCompleted = enrollment?.completedLectures.includes(lec.id) || false;
                    const isActive = selectedLecture?.id === lec.id;

                    return (
                      <Pressable
                        key={lec.id}
                        onPress={() => isEnrolled ? handleSelectLecture(lec) : alert('Please enroll in the course to play lectures!')}
                        style={({ pressed }) => [
                          styles.lectureRow,
                          {
                            backgroundColor: isActive ? theme.backgroundSelected : 'transparent',
                          },
                        ]}
                      >
                        <View style={styles.lectureRowLeft}>
                          <Text style={styles.lectureIcon}>{lec.type === 'video' ? '📺' : lec.type === 'code' ? '💻' : '📖'}</Text>
                          <View>
                            <Text numberOfLines={1} style={[styles.lectureRowTitle, { color: theme.text, fontWeight: isActive ? '700' : '500' }]}>
                              {lec.title}
                            </Text>
                            <Text style={[styles.lectureRowDuration, { color: theme.textSecondary }]}>Duration: {lec.duration}</Text>
                          </View>
                        </View>

                        {isLecCompleted ? (
                          <Text style={[styles.completionCheck, { color: theme.success }]}>✓</Text>
                        ) : (
                          <Text style={[styles.completionUncheck, { color: theme.border }]}>○</Text>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Tab 3: Lecture Content Player */}
        {activeTab === 'Player' && selectedLecture && (
          <View style={styles.tabPanel}>
            <View style={[styles.playerCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
              {/* Simulator video container for video types */}
              {selectedLecture.type === 'video' && (
                <View style={styles.videoPlaceholder}>
                  <View style={styles.videoControlsOverlay}>
                    <Text style={styles.playIcon}>▶</Text>
                    <Text style={styles.videoLengthText}>{selectedLecture.duration} High Definition Video</Text>
                  </View>
                </View>
              )}

              <View style={styles.playerBody}>
                <View style={styles.badgeRow}>
                  <View style={[styles.typeBadge, { backgroundColor: theme.background }]}>
                    <Text style={[styles.typeBadgeText, { color: theme.textSecondary }]}>
                      {selectedLecture.type.toUpperCase()} LECTURE
                    </Text>
                  </View>
                </View>

                <Text style={[styles.playerLectureTitle, { color: theme.text }]}>{selectedLecture.title}</Text>
                
                {/* Rich Content rendering */}
                <Text style={[styles.playerContentText, { color: theme.text, backgroundColor: theme.background }]}>
                  {selectedLecture.content}
                </Text>

                {/* If lecture is of type code, display formatted block */}
                {selectedLecture.type === 'code' && selectedLecture.codeSnippet && (
                  <View style={styles.codeContainer}>
                    <View style={styles.codeHeader}>
                      <Text style={styles.codeHeaderText}>boilerplate_file.tsx</Text>
                      <Pressable onPress={() => alert('Code snippet copied to clipboard!')}>
                        <Text style={styles.copyBtnText}>Copy Code</Text>
                      </Pressable>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <Text style={styles.codeText}>{selectedLecture.codeSnippet}</Text>
                    </ScrollView>
                  </View>
                )}

                {/* Complete Action Button */}
                {enrollment && !enrollment.completedLectures.includes(selectedLecture.id) ? (
                  <Pressable
                    onPress={handleMarkComplete}
                    style={({ pressed }) => [
                      styles.completeBtn,
                      {
                        backgroundColor: theme.success,
                        opacity: pressed ? 0.9 : 1,
                      },
                    ]}
                  >
                    <Text style={styles.completeBtnText}>Mark Lesson as Completed (+20 XP)</Text>
                  </Pressable>
                ) : (
                  <View style={[styles.completedBanner, { backgroundColor: theme.successLight }]}>
                    <Text style={[styles.completedBannerText, { color: theme.success }]}>✓ Lesson Cleared</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Tab 4: Interactive Quiz Assessment */}
        {activeTab === 'Quiz' && (
          <View style={styles.tabPanel}>
            {enrollment?.quizCompleted || quizFinished ? (
              <View style={[styles.quizResultsCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
                <Text style={styles.resultsEmoji}>🏆</Text>
                <Text style={[styles.resultsTitle, { color: theme.text }]}>Quiz Assessment Completed!</Text>
                
                <View style={styles.resultsScoreRow}>
                  <Text style={[styles.resultsScoreLabel, { color: theme.textSecondary }]}>Final Grade</Text>
                  <Text style={styles.resultsScoreVal}>
                    {quizFinished ? quizScore : enrollment?.quizScore}%
                  </Text>
                </View>

                <Text style={[styles.resultsFeedback, { color: theme.textSecondary }]}>
                  {(quizFinished ? quizScore : enrollment?.quizScore!) >= 80
                    ? 'Congratulations! You cleared the assessment criteria and unlocked your certification!'
                    : 'Good attempt! Read through the lessons once more and try again to improve your standing.'}
                </Text>

                <Pressable
                  onPress={handleResetQuiz}
                  style={({ pressed }) => [
                    styles.resetQuizBtn,
                    {
                      backgroundColor: theme.primary,
                      opacity: pressed ? 0.9 : 1,
                    },
                  ]}
                >
                  <Text style={styles.resetQuizBtnText}>Retake Assessment</Text>
                </Pressable>
              </View>
            ) : (
              <View style={[styles.quizCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
                <View style={styles.quizHeader}>
                  <Text style={[styles.quizTitleText, { color: theme.text }]}>{course.quiz.title}</Text>
                  <Text style={[styles.quizProgressText, { color: theme.textSecondary }]}>
                    Question {currentQuestionIndex + 1} of {course.quiz.questions.length}
                  </Text>
                </View>

                {/* Render Question */}
                <View style={styles.quizBody}>
                  <Text style={[styles.questionText, { color: theme.text }]}>
                    {course.quiz.questions[currentQuestionIndex].questionText}
                  </Text>

                  <View style={styles.optionsList}>
                    {course.quiz.questions[currentQuestionIndex].options.map((option, idx) => {
                      const questionId = course.quiz.questions[currentQuestionIndex].id;
                      const isSelected = selectedAnswers[questionId] === idx;

                      return (
                        <Pressable
                          key={idx}
                          onPress={() => handleAnswerSelect(idx)}
                          style={[
                            styles.optionRow,
                            {
                              borderColor: isSelected ? theme.primary : theme.border,
                              backgroundColor: isSelected ? theme.primaryLight : theme.background,
                            },
                          ]}
                        >
                          <View
                            style={[
                              styles.radioCircle,
                              {
                                borderColor: isSelected ? theme.primary : theme.textSecondary,
                              },
                            ]}
                          >
                            {isSelected && <View style={[styles.radioFill, { backgroundColor: theme.primary }]} />}
                          </View>
                          <Text style={[styles.optionLabel, { color: theme.text, fontWeight: isSelected ? '700' : '500' }]}>
                            {option}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  <Pressable
                    onPress={handleNextQuestion}
                    disabled={selectedAnswers[course.quiz.questions[currentQuestionIndex].id] === undefined}
                    style={({ pressed }) => [
                      styles.submitQuestionBtn,
                      {
                        backgroundColor: selectedAnswers[course.quiz.questions[currentQuestionIndex].id] === undefined 
                          ? theme.border 
                          : theme.primary,
                        opacity: pressed ? 0.9 : 1,
                      },
                    ]}
                  >
                    <Text style={styles.submitQuestionBtnText}>
                      {currentQuestionIndex === course.quiz.questions.length - 1 ? 'Finish Assessment' : 'Next Question'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.three,
  },
  fallbackEmoji: {
    fontSize: 54,
  },
  fallbackTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  backBtn: {
    paddingHorizontal: Spacing.four,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  heroBanner: {
    padding: Spacing.four,
    paddingTop: Platform.OS === 'ios' ? 56 : Spacing.four,
    gap: Spacing.three,
  },
  topActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  roundHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
  },
  bannerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  bannerInstructor: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    fontWeight: '600',
  },
  tabBarRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabItemText: {
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
  },
  tabPanel: {
    gap: Spacing.four,
  },
  cardBlock: {
    padding: Spacing.four,
    borderRadius: 18,
    borderWidth: 1,
    gap: Spacing.two,
  },
  panelHeading: {
    fontSize: 16,
    fontWeight: '800',
  },
  panelBodyText: {
    fontSize: 14,
    lineHeight: 22,
  },
  quickSpecs: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  specItem: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.three,
    alignItems: 'center',
    gap: 4,
  },
  specIcon: {
    fontSize: 18,
  },
  specVal: {
    fontSize: 13,
    fontWeight: '800',
  },
  specLabel: {
    fontSize: 9,
    fontWeight: '600',
  },
  instructorProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginTop: 4,
  },
  instructorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#818CF8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructorAvatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  instructorName: {
    fontSize: 15,
    fontWeight: '700',
  },
  instructorTitle: {
    fontSize: 12,
  },
  enrollCtaBtn: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.two,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  enrollCtaBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  syllabusModuleCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  moduleTitle: {
    fontSize: 14,
    fontWeight: '800',
    padding: Spacing.three,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  moduleLecturesList: {
    paddingVertical: Spacing.two,
  },
  lectureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
  },
  lectureRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    flex: 1,
  },
  lectureIcon: {
    fontSize: 18,
  },
  lectureRowTitle: {
    fontSize: 13,
    maxWidth: width * 0.55,
  },
  lectureRowDuration: {
    fontSize: 10,
    marginTop: 2,
  },
  completionCheck: {
    fontSize: 16,
    fontWeight: '700',
  },
  completionUncheck: {
    fontSize: 16,
  },
  playerCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  videoPlaceholder: {
    height: 200,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoControlsOverlay: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  playIcon: {
    fontSize: 48,
    color: '#FFF',
  },
  videoLengthText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  playerBody: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  playerLectureTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  playerContentText: {
    fontSize: 14,
    lineHeight: 22,
    padding: Spacing.three,
    borderRadius: 12,
  },
  codeContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: Spacing.two,
  },
  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
  },
  codeHeaderText: {
    color: '#94A3B8',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  copyBtnText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
  },
  codeText: {
    color: '#34D399',
    fontSize: 12,
    fontFamily: 'monospace',
    padding: Spacing.three,
    lineHeight: 18,
  },
  completeBtn: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.three,
  },
  completeBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  completedBanner: {
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.three,
  },
  completedBannerText: {
    fontSize: 13,
    fontWeight: '700',
  },
  // Quiz Stylings
  quizCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  quizHeader: {
    padding: Spacing.four,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    gap: 4,
  },
  quizTitleText: {
    fontSize: 15,
    fontWeight: '800',
  },
  quizProgressText: {
    fontSize: 12,
  },
  quizBody: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: Spacing.two,
  },
  optionsList: {
    gap: Spacing.two,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    gap: Spacing.three,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioFill: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  optionLabel: {
    fontSize: 13,
    flex: 1,
  },
  submitQuestionBtn: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.three,
  },
  submitQuestionBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  // Quiz Results Styling
  quizResultsCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: Spacing.five,
    alignItems: 'center',
    gap: Spacing.three,
  },
  resultsEmoji: {
    fontSize: 54,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  resultsScoreRow: {
    alignItems: 'center',
    marginVertical: Spacing.two,
  },
  resultsScoreLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  resultsScoreVal: {
    fontSize: 48,
    fontWeight: '900',
    color: '#F59E0B',
  },
  resultsFeedback: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: Spacing.two,
  },
  resetQuizBtn: {
    paddingHorizontal: Spacing.five,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: Spacing.two,
  },
  resetQuizBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  manageBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  manageBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
});

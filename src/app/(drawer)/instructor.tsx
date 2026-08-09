import { Colors, Spacing } from '@/constants/theme';
import { useLMS } from '@/context/LMSContext';
import { useState, useEffect } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

export default function InstructorScreen() {
  const { user, courses, createCourse, switchRole, isDarkMode, addQuizQuestion } = useLMS();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  // Retrieve passed parameters
  const { courseId } = useLocalSearchParams();

  // Route protection
  useEffect(() => {
    if (user.role !== 'instructor') {
      router.replace('/dashboard' as any);
    }
  }, [user.role]);

  // Set courseId if passed
  useEffect(() => {
    if (courseId && typeof courseId === 'string') {
      setSelectedCourseId(courseId);
    }
  }, [courseId]);

  // Form State
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'Development' | 'Design' | 'Marketing' | 'Business'>('Development');
  const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [duration, setDuration] = useState('8h 30m');
  const [syllabusLec1, setSyllabusLec1] = useState('1.1 Introduction to the Course');
  const [syllabusLec2, setSyllabusLec2] = useState('1.2 Practical Implementation Guide');

  // Selected Course for Exam Details
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // New Question Form State
  const [newQuestionText, setNewQuestionText] = useState('');
  const [opt0, setOpt0] = useState('');
  const [opt1, setOpt1] = useState('');
  const [opt2, setOpt2] = useState('');
  const [opt3, setOpt3] = useState('');
  const [correctOptionIdx, setCorrectOptionIdx] = useState<number>(0);

  // Filter courses authored by the current instructor
  // To simulate, we'll look for courses with instructor matching the user's name or author status
  const instructorName = user.name;
  const myCourses = courses.filter(course => course.instructor === instructorName);

  // Compute Instructor Stats
  const totalStudents = myCourses.reduce((sum, c) => sum + c.studentsEnrolled, 0);
  const totalEarnings = totalStudents * 49; // Assume $49 per enrollment
  const avgRating = myCourses.length > 0
    ? (myCourses.reduce((sum, c) => sum + c.rating, 0) / myCourses.length).toFixed(1)
    : 'N/A';

  const handleCreateCourse = () => {
    if (title.trim() === '' || description.trim() === '') {
      alert('Please fill out the Course Title and Description.');
      return;
    }

    createCourse({
      title,
      description,
      category,
      level,
      duration,
      instructor: user.name,
      instructorTitle: 'Authorized Academy Instructor',
      modules: [
        {
          id: 'custom-mod1',
          title: 'Module 1: Foundations & Core Concepts',
          lectures: [
            {
              id: `lec-${Date.now()}-1`,
              title: syllabusLec1,
              duration: '10m',
              type: 'reading',
              content: `Welcome to the first module of ${title}. In this lecture, we cover the core principles of our subject. Read carefully through the curriculum, prepare your coding environments, and make notes as you advance through the syllabus.`,
            },
            {
              id: `lec-${Date.now()}-2`,
              title: syllabusLec2,
              duration: '15m',
              type: 'code',
              content: 'In this section, we review a hands-on implementation snippet. See the boilerplate configuration below to initialize your structure.',
              codeSnippet: `// Welcome to the Boilerplate code snippet\nfunction initializeSystem() {\n  console.log("Ready to execute local actions...");\n}\ninitializeSystem();`
            }
          ]
        }
      ],
      quiz: {
        id: `quiz-custom-${Date.now()}`,
        title: `${title} Final Assessment`,
        questions: [
          {
            id: 'q1',
            questionText: `What is the primary objective of this course?`,
            options: ['To learn and execute concepts', 'To write temporary scripts', 'To ignore coding standards', 'To compile without validation'],
            correctOptionIndex: 0
          }
        ]
      }
    });

    // Reset Form
    setTitle('');
    setDescription('');
    setSyllabusLec1('1.1 Introduction to the Course');
    setSyllabusLec2('1.2 Practical Implementation Guide');
    setShowCreateForm(false);
    alert('🎉 Course created successfully! You earned +200 XP!');
  };

  // If the user's current role is not set to instructor, prompt them to switch
  if (user.role !== 'instructor') {
    return (
      <View style={[styles.nonInstructorContainer, { backgroundColor: theme.background }]}>
        <Text style={styles.errorEmoji}>🚀</Text>
        <Text style={[styles.errorTitle, { color: theme.text }]}>Instructor Portal Inactive</Text>
        <Text style={[styles.errorSubtitle, { color: theme.textSecondary }]}>
          You are currently in Student Mode. Switch your profile role to Instructor to publish curriculum, manage student enrollments, and track course analytics.
        </Text>
        <Pressable
          onPress={() => switchRole('instructor')}
          style={({ pressed }) => [
            styles.actionBtn,
            {
              backgroundColor: theme.success,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          <Text style={styles.actionBtnText}>Activate Instructor Mode</Text>
        </Pressable>
      </View>
    );
  }

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  const handleAddQuestion = async () => {
    if (!selectedCourseId) return;
    if (newQuestionText.trim() === '' || opt0.trim() === '' || opt1.trim() === '' || opt2.trim() === '' || opt3.trim() === '') {
      alert('Please fill out the question text and all 4 options.');
      return;
    }

    try {
      await addQuizQuestion(selectedCourseId, {
        questionText: newQuestionText.trim(),
        options: [opt0.trim(), opt1.trim(), opt2.trim(), opt3.trim()],
        correctOptionIndex: correctOptionIdx
      });

      // Reset form
      setNewQuestionText('');
      setOpt0('');
      setOpt1('');
      setOpt2('');
      setOpt3('');
      setCorrectOptionIdx(0);
      alert('🎉 New question added to course assessment successfully!');
    } catch (err) {
      console.error('Failed to add question:', err);
      alert('Failed to add question. Please try again.');
    }
  };

  if (selectedCourseId && selectedCourse) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Back Button Header */}
        <Pressable
          onPress={() => {
            setSelectedCourseId(null);
            setNewQuestionText('');
            setOpt0('');
            setOpt1('');
            setOpt2('');
            setOpt3('');
            setCorrectOptionIdx(0);
          }}
          style={({ pressed }) => [
            styles.backHeaderBtn,
            {
              backgroundColor: theme.backgroundElement,
              borderColor: theme.border,
              opacity: pressed ? 0.9 : 1,
            }
          ]}
        >
          <Text style={[styles.backHeaderBtnText, { color: theme.primary }]}>← Back to Course Panel</Text>
        </Pressable>

        {/* Selected Course Header Info */}
        <View style={[styles.courseHeaderCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
          <Text style={[styles.courseHeaderTitle, { color: theme.text }]}>{selectedCourse.title}</Text>
          <Text style={[styles.courseHeaderDesc, { color: theme.textSecondary }]}>{selectedCourse.description}</Text>
          
          <View style={styles.badgeRow}>
            <View style={[styles.pubBadge, { backgroundColor: theme.border }]}>
              <Text style={[styles.pubBadgeText, { color: theme.text }]}>{selectedCourse.category}</Text>
            </View>
            <View style={[styles.pubBadge, { backgroundColor: theme.primaryLight }]}>
              <Text style={[styles.pubBadgeText, { color: theme.primary }]}>{selectedCourse.level}</Text>
            </View>
            <View style={[styles.pubBadge, { backgroundColor: theme.successLight }]}>
              <Text style={[styles.pubBadgeText, { color: theme.success }]}>{selectedCourse.studentsEnrolled} Enrolled</Text>
            </View>
          </View>
        </View>

        {/* Assessment / Mock Exam Info Panel */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Exam Assessment Questions ({selectedCourse.quiz?.questions?.length || 0})</Text>
          <Text style={[styles.sectionSubtitleText, { color: theme.textSecondary }]}>
            These questions constitute the final assessment/mock exam for the students. Correct options are highlighted in green.
          </Text>
        </View>

        {/* List of Questions */}
        <View style={styles.questionsList}>
          {(!selectedCourse.quiz?.questions || selectedCourse.quiz.questions.length === 0) ? (
            <View style={[styles.emptyQuestionsCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
              <Text style={styles.emptyQuestionsIcon}>❓</Text>
              <Text style={[styles.emptyQuestionsTitle, { color: theme.text }]}>No Questions Added Yet</Text>
              <Text style={[styles.emptyQuestionsSub, { color: theme.textSecondary }]}>
                Add multiple-choice assessment questions below to create a certification test for this course.
              </Text>
            </View>
          ) : (
            selectedCourse.quiz.questions.map((question, qIdx) => (
              <View key={question.id || qIdx} style={[styles.questionCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
                <View style={styles.questionCardHeader}>
                  <Text style={[styles.questionNumberText, { color: theme.primary }]}>Question {qIdx + 1}</Text>
                </View>
                <Text style={[styles.questionTextDisplay, { color: theme.text }]}>{question.questionText}</Text>
                
                <View style={styles.optionsDisplayList}>
                  {question.options.map((opt, oIdx) => {
                    const isCorrect = oIdx === question.correctOptionIndex;
                    return (
                      <View 
                        key={oIdx} 
                        style={[
                          styles.optionDisplayRow, 
                          { 
                            borderColor: isCorrect ? theme.success : theme.border,
                            backgroundColor: isCorrect ? theme.successLight : theme.background 
                          }
                        ]}
                      >
                        <Text style={[styles.optionIndexLabel, { color: isCorrect ? theme.success : theme.textSecondary }]}>
                          {String.fromCharCode(65 + oIdx)}.
                        </Text>
                        <Text style={[styles.optionTextLabel, { color: theme.text, fontWeight: isCorrect ? '700' : '400' }]}>
                          {opt}
                        </Text>
                        {isCorrect && (
                          <Text style={[styles.correctCheckIcon, { color: theme.success }]}>✓ Correct</Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            ))
          )}
        </View>

        {/* Add Question Form */}
        <View style={[styles.formContainer, { backgroundColor: theme.backgroundElement, borderColor: theme.border, marginTop: Spacing.two }]}>
          <Text style={[styles.formTitle, { color: theme.text }]}>Add New Assessment Question</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>QUESTION TEXT</Text>
            <TextInput
              style={[styles.inputField, styles.textArea, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
              placeholder="e.g. Which hook is used to manage side effects in React?"
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={3}
              value={newQuestionText}
              onChangeText={setNewQuestionText}
            />
          </View>

          <Text style={[styles.formSubtitle, { color: theme.text }]}>Answer Choices</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>OPTION A</Text>
            <TextInput
              style={[styles.inputField, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
              placeholder="e.g. useState"
              placeholderTextColor={theme.textSecondary}
              value={opt0}
              onChangeText={setOpt0}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>OPTION B</Text>
            <TextInput
              style={[styles.inputField, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
              placeholder="e.g. useEffect"
              placeholderTextColor={theme.textSecondary}
              value={opt1}
              onChangeText={setOpt1}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>OPTION C</Text>
            <TextInput
              style={[styles.inputField, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
              placeholder="e.g. useContext"
              placeholderTextColor={theme.textSecondary}
              value={opt2}
              onChangeText={setOpt2}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>OPTION D</Text>
            <TextInput
              style={[styles.inputField, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
              placeholder="e.g. useReducer"
              placeholderTextColor={theme.textSecondary}
              value={opt3}
              onChangeText={setOpt3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>SELECT CORRECT ANSWER CHOICE</Text>
            <View style={styles.pickerOptionRow}>
              {([
                { label: 'A', idx: 0 },
                { label: 'B', idx: 1 },
                { label: 'C', idx: 2 },
                { label: 'D', idx: 3 },
              ] as const).map(item => (
                <Pressable
                  key={item.idx}
                  onPress={() => setCorrectOptionIdx(item.idx)}
                  style={[
                    styles.pickerOptionBtn,
                    {
                      backgroundColor: correctOptionIdx === item.idx ? theme.success : theme.background,
                      borderColor: correctOptionIdx === item.idx ? theme.success : theme.border,
                    }
                  ]}
                >
                  <Text style={[styles.pickerOptionText, { color: correctOptionIdx === item.idx ? '#FFF' : theme.text }]}>
                    Choice {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Pressable
            onPress={handleAddQuestion}
            style={({ pressed }) => [
              styles.submitBtn,
              {
                backgroundColor: theme.primary,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <Text style={styles.submitBtnText}>Add Question to Assessment</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Metrics Banner */}
      <View style={styles.metricsHeader}>
        <View style={[styles.metricBox, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
          <Text style={[styles.metricVal, { color: theme.success }]}>${totalEarnings.toLocaleString()}</Text>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Total Revenue</Text>
        </View>
        <View style={[styles.metricBox, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
          <Text style={[styles.metricVal, { color: theme.primary }]}>{totalStudents}</Text>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Active Students</Text>
        </View>
        <View style={[styles.metricBox, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
          <Text style={[styles.metricVal, { color: theme.text }]}>{myCourses.length}</Text>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>My Courses</Text>
        </View>
        <View style={[styles.metricBox, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
          <Text style={[styles.metricVal, { color: theme.warning }]}>★ {avgRating}</Text>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Average Rating</Text>
        </View>
      </View>

      {/* Course Creator Actions */}
      <Pressable
        onPress={() => setShowCreateForm(prev => !prev)}
        style={({ pressed }) => [
          styles.toggleCreateBtn,
          {
            backgroundColor: showCreateForm ? theme.border : theme.primary,
            opacity: pressed ? 0.9 : 1,
          },
        ]}
      >
        <Text style={[styles.toggleCreateText, { color: showCreateForm ? theme.text : '#FFF' }]}>
          {showCreateForm ? 'Cancel Creation Form' : '＋ Create New Course'}
        </Text>
      </Pressable>

      {/* Course Creator Form */}
      {showCreateForm && (
        <View style={[styles.formContainer, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
          <Text style={[styles.formTitle, { color: theme.text }]}>Course Details</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>COURSE TITLE</Text>
            <TextInput
              style={[styles.inputField, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
              placeholder="e.g. Master SolidJS in 4 Hours"
              placeholderTextColor={theme.textSecondary}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>DESCRIPTION</Text>
            <TextInput
              style={[styles.inputField, styles.textArea, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
              placeholder="Provide a comprehensive course summary for prospective students..."
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View style={styles.formRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>CATEGORY</Text>
              <View style={styles.categorySelectRow}>
                {(['Development', 'Design', 'Marketing', 'Business'] as const).map(cat => (
                  <Pressable
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={[
                      styles.formOptionBtn,
                      {
                        backgroundColor: category === cat ? theme.primaryLight : theme.background,
                        borderColor: category === cat ? theme.primary : theme.border,
                      }
                    ]}
                  >
                    <Text style={[styles.formOptionText, { color: category === cat ? theme.primary : theme.text }]}>{cat}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>DIFFICULTY LEVEL</Text>
              <View style={styles.categorySelectRow}>
                {(['Beginner', 'Intermediate', 'Advanced'] as const).map(lvl => (
                  <Pressable
                    key={lvl}
                    onPress={() => setLevel(lvl)}
                    style={[
                      styles.formOptionBtn,
                      {
                        backgroundColor: level === lvl ? theme.primaryLight : theme.background,
                        borderColor: level === lvl ? theme.primary : theme.border,
                      }
                    ]}
                  >
                    <Text style={[styles.formOptionText, { color: level === lvl ? theme.primary : theme.text }]}>{lvl}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>COURSE RUNTIME</Text>
            <TextInput
              style={[styles.inputField, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
              placeholder="e.g. 5h 45m"
              placeholderTextColor={theme.textSecondary}
              value={duration}
              onChangeText={setDuration}
            />
          </View>

          <Text style={[styles.formSubtitle, { color: theme.text }]}>Syllabus Setup (Module 1)</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>LESSON 1 TITLE (READING)</Text>
            <TextInput
              style={[styles.inputField, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
              value={syllabusLec1}
              onChangeText={setSyllabusLec1}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>LESSON 2 TITLE (CODE DEMO)</Text>
            <TextInput
              style={[styles.inputField, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
              value={syllabusLec2}
              onChangeText={setSyllabusLec2}
            />
          </View>

          <Pressable
            onPress={handleCreateCourse}
            style={({ pressed }) => [
              styles.submitBtn,
              {
                backgroundColor: theme.success,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <Text style={styles.submitBtnText}>Publish Course Curriculum</Text>
          </Pressable>
        </View>
      )}

      {/* Published Courses Panel */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Published Curriculum</Text>
      </View>

      {myCourses.length === 0 ? (
        <View style={[styles.emptyPubCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
          <Text style={styles.emptyPubIcon}>✏️</Text>
          <Text style={[styles.emptyPubTitle, { color: theme.text }]}>No Courses Published Yet</Text>
          <Text style={[styles.emptyPubSub, { color: theme.textSecondary }]}>
            Use the creation panel above to build, launch, and monetize your professional learning curriculum.
          </Text>
        </View>
      ) : (
        <View style={styles.myCoursesList}>
          {myCourses.map((course) => (
            <Pressable
              key={course.id}
              onPress={() => setSelectedCourseId(course.id)}
              style={({ pressed }) => [
                styles.pubCourseCard,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.border,
                  opacity: pressed ? 0.85 : 1,
                  transform: [{ scale: pressed ? 0.99 : 1 }]
                }
              ]}
            >
              <View style={styles.pubCourseMain}>
                <Text style={[styles.pubCourseTitle, { color: theme.text }]}>{course.title}</Text>
                <View style={styles.badgeRow}>
                  <View style={[styles.pubBadge, { backgroundColor: theme.border }]}>
                    <Text style={[styles.pubBadgeText, { color: theme.text }]}>{course.category}</Text>
                  </View>
                  <View style={[styles.pubBadge, { backgroundColor: theme.primaryLight }]}>
                    <Text style={[styles.pubBadgeText, { color: theme.primary }]}>{course.level}</Text>
                  </View>
                  <View style={[styles.pubBadge, { backgroundColor: theme.successLight }]}>
                    <Text style={[styles.pubBadgeText, { color: theme.success }]}>Manage Questions →</Text>
                  </View>
                </View>
              </View>
              <View style={[styles.pubCourseMetrics, { borderLeftColor: theme.border }]}>
                <Text style={[styles.metricNum, { color: theme.text }]}>{course.studentsEnrolled}</Text>
                <Text style={[styles.metricSub, { color: theme.textSecondary }]}>Students</Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}
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
  nonInstructorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.five,
    gap: Spacing.three,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: Spacing.two,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  errorSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 300,
    marginBottom: Spacing.three,
  },
  actionBtn: {
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.three,
    borderRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  metricsHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginTop: 4,
  },
  metricBox: {
    flex: 1,
    minWidth: '45%',
    padding: Spacing.three,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  metricVal: {
    fontSize: 22,
    fontWeight: '800',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  toggleCreateBtn: {
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: Spacing.two,
  },
  toggleCreateText: {
    fontSize: 14,
    fontWeight: '700',
  },
  formContainer: {
    borderWidth: 1,
    borderRadius: 20,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: Spacing.two,
  },
  formSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: Spacing.three,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  inputField: {
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    fontSize: 14,
    fontWeight: '500',
    ...Platform.select({
      web: {
        outlineStyle: 'none' as any,
      },
    }),
  },
  textArea: {
    height: 80,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  formRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  categorySelectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  formOptionBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  formOptionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  submitBtn: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.three,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionHeader: {
    marginTop: Spacing.three,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  emptyPubCard: {
    padding: Spacing.five,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    gap: Spacing.two,
  },
  emptyPubIcon: {
    fontSize: 44,
  },
  emptyPubTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyPubSub: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  myCoursesList: {
    gap: Spacing.two,
  },
  pubCourseCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.three,
    alignItems: 'center',
  },
  pubCourseMain: {
    flex: 1,
    gap: 8,
    paddingRight: Spacing.two,
  },
  pubCourseTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  pubBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pubBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  pubCourseMetrics: {
    width: 80,
    borderLeftWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  metricNum: {
    fontSize: 18,
    fontWeight: '800',
  },
  metricSub: {
    fontSize: 10,
    fontWeight: '600',
  },
  backHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginBottom: Spacing.two,
  },
  backHeaderBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  courseHeaderCard: {
    padding: Spacing.four,
    borderRadius: 20,
    borderWidth: 1,
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  courseHeaderTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  courseHeaderDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  sectionSubtitleText: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  questionsList: {
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  emptyQuestionsCard: {
    padding: Spacing.five,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    gap: Spacing.two,
  },
  emptyQuestionsIcon: {
    fontSize: 44,
  },
  emptyQuestionsTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyQuestionsSub: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  questionCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  questionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionNumberText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  questionTextDisplay: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  optionsDisplayList: {
    gap: 8,
  },
  optionDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    gap: 8,
  },
  optionIndexLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  optionTextLabel: {
    fontSize: 13,
    flex: 1,
  },
  correctCheckIcon: {
    fontSize: 11,
    fontWeight: '700',
  },
  pickerOptionRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 4,
  },
  pickerOptionBtn: {
    flex: 1,
    minWidth: 80,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerOptionText: {
    fontSize: 13,
    fontWeight: '700',
  },
});

const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms';
console.log("MDB URI: ", MONGODB_URI);

// Define Schemas
const LectureSchema = new mongoose.Schema({
  id: String,
  title: String,
  duration: String,
  type: { type: String, enum: ['video', 'reading', 'code'] },
  content: String,
  codeSnippet: String
});

const ModuleSchema = new mongoose.Schema({
  id: String,
  title: String,
  lectures: [LectureSchema]
});

const QuestionSchema = new mongoose.Schema({
  id: String,
  questionText: String,
  options: [String],
  correctOptionIndex: Number
});

const QuizSchema = new mongoose.Schema({
  id: String,
  title: String,
  questions: [QuestionSchema]
});

const CourseSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  title: String,
  description: String,
  category: { type: String, enum: ['Development', 'Design', 'Marketing', 'Business'] },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'] },
  rating: Number,
  duration: String,
  instructor: String,
  instructorTitle: String,
  studentsEnrolled: Number,
  gradientColors: [String],
  modules: [ModuleSchema],
  quiz: QuizSchema
});

const EnrollmentStateSchema = new mongoose.Schema({
  progress: { type: Number, default: 0 },
  completedLectures: { type: [String], default: [] },
  quizCompleted: { type: Boolean, default: false },
  quizScore: Number,
  completedAt: String
});

const UserProfileSchema = new mongoose.Schema({
  userId: { type: String, unique: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String },
  name: { type: String, default: 'Jane Doe' },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
  title: { type: String, default: 'Aspiring Full Stack Engineer' },
  role: { type: String, enum: ['student', 'instructor'], default: 'student' },
  xp: { type: Number, default: 320 },
  streak: { type: Number, default: 5 },
  enrolled: {
    type: Map,
    of: EnrollmentStateSchema,
    default: {}
  }
});

// Group Schemas
const MessageSchema = new mongoose.Schema({
  id: String,
  senderId: String,
  senderName: String,
  senderAvatar: String,
  senderRole: String,
  content: String,
  timestamp: { type: Date, default: Date.now }
});

const FileSchema = new mongoose.Schema({
  id: String,
  name: String,
  size: String,
  sharedBy: String,
  timestamp: { type: Date, default: Date.now },
  url: String
});

const AnnouncementSchema = new mongoose.Schema({
  id: String,
  title: String,
  content: String,
  timestamp: { type: Date, default: Date.now },
  postedBy: String
});

const GroupSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  name: String,
  description: String,
  code: { type: String, unique: true },
  createdBy: String, // userId of instructor
  members: [String], // userIds
  discussions: [MessageSchema],
  files: [FileSchema],
  announcements: [AnnouncementSchema]
});

// Models
const Course = mongoose.model('Course', CourseSchema);
const UserProfile = mongoose.model('UserProfile', UserProfileSchema);
const Group = mongoose.model('Group', GroupSchema);

// Initial Mock Data
const INITIAL_COURSES = [
  {
    id: 'rn-expo-101',
    title: 'React Native & Expo: Ultimate Guide',
    description: 'Learn to build premium cross-platform mobile apps for iOS, Android, and Web using Expo Router, Reanimated, and native APIs.',
    category: 'Development',
    level: 'Beginner',
    rating: 4.8,
    duration: '12h 45m',
    instructor: 'Alex Rivers',
    instructorTitle: 'Senior Mobile Architect',
    studentsEnrolled: 12430,
    gradientColors: ['#6366F1', '#4F46E5'],
    modules: [
      {
        id: 'mod1',
        title: 'Introduction & Setup',
        lectures: [
          {
            id: 'lec1-1',
            title: '1.1 Welcome & Course Overview',
            duration: '5m',
            type: 'video',
            content: 'In this lecture, we introduce the concept of React Native and why Expo has become the modern standard for mobile development. You will learn about our upcoming projects and how you will build universal apps running on iOS, Android and Web.',
          },
          {
            id: 'lec1-2',
            title: '1.2 Setting up the Environment',
            duration: '12m',
            type: 'reading',
            content: 'Setting up Expo is incredibly fast. You need Node.js installed on your machine. We will run:\n\n1. `npx create-expo-app@latest MyNewApp`\n2. Open the directory in VS Code.\n3. Run `npm run start` to boot up the Expo Metro bundler.\n\nYou can scan the QR code using the Expo Go app on your physical iOS/Android device to see the app load instantly!',
          }
        ]
      },
      {
        id: 'mod2',
        title: 'Layouts & Styling',
        lectures: [
          {
            id: 'lec2-1',
            title: '2.1 Mastering Flexbox in React Native',
            duration: '15m',
            type: 'code',
            content: 'Flexbox in React Native works similarly to CSS Flexbox on the web, with a few crucial exceptions:\n\n1. `flexDirection` defaults to `column` instead of `row`.\n2. All styling units are unitless density-independent pixels (dp).\n\nCheck out the layout code snippet below for a responsive, centered container with child items.',
            codeSnippet: `import { StyleSheet, View, Text } from 'react-native';

export default function LayoutSample() {
  return (
    <View style={styles.container}>
      <View style={styles.box}><Text>1</Text></View>
      <View style={styles.box}><Text>2</Text></View>
      <View style={styles.box}><Text>3</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#F5F5FA',
  },
  box: {
    width: 60,
    height: 60,
    backgroundColor: '#6366F1',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  }
});`
          },
          {
            id: 'lec2-2',
            title: '2.2 Dark Mode and Custom Themes',
            duration: '10m',
            type: 'reading',
            content: 'Expo Router allows responsive styling based on color schemes. You can utilize React Native\'s `useColorScheme` hook from `react-native` to query if the OS is in dark mode, and conditionally apply style configurations. For maximum performance and structure, configure a semantic Colors object and inject it via React Context or pass stylesheet definitions dynamically.',
          }
        ]
      }
    ],
    quiz: {
      id: 'quiz-rn',
      title: 'React Native & Expo Assessment',
      questions: [
        {
          id: 'q1',
          questionText: 'What is the default flexDirection in React Native Flexbox?',
          options: ['row', 'column', 'row-reverse', 'column-reverse'],
          correctOptionIndex: 1
        },
        {
          id: 'q2',
          questionText: 'Which utility is used to run the Expo Metro bundler locally?',
          options: ['expo run', 'npx start-expo', 'npx expo start', 'expo bundler'],
          correctOptionIndex: 2
        },
        {
          id: 'q3',
          questionText: 'How are units of spacing (e.g. width, margin) represented in React Native styles?',
          options: ['Pixels (px)', 'Percentage (%)', 'Density-independent pixels (dp) / unitless numbers', 'Rem units'],
          correctOptionIndex: 2
        }
      ]
    }
  },
  {
    id: 'design-figma-102',
    title: 'Advanced UI/UX Design & Prototyping',
    description: 'Learn the secrets of designing premium interfaces. Build consistent design tokens, layout grids, auto layouts, and high-fidelity prototypes in Figma.',
    category: 'Design',
    level: 'Intermediate',
    rating: 4.9,
    duration: '8h 20m',
    instructor: 'Zara Lin',
    instructorTitle: 'Principal Product Designer',
    studentsEnrolled: 8940,
    gradientColors: ['#EC4899', '#D946EF'],
    modules: [
      {
        id: 'mod1',
        title: 'Design Systems in Figma',
        lectures: [
          {
            id: 'lec1-1',
            title: '1.1 Introduction to Design Tokens',
            duration: '10m',
            type: 'reading',
            content: 'Design tokens are the atomic values of a design system—such as hex codes for colors, pixel sizes for spacing, and font families. Setting up variables and components in Figma ensures that style transformations are automatically propagated across all design files, creating visual harmony and seamless handoff to engineers.',
          },
          {
            id: 'lec1-2',
            title: '1.2 Advanced Auto-Layout Techniques',
            duration: '15m',
            type: 'video',
            content: 'Auto Layout is Figma\'s strongest feature. It allows you to create dynamic frames that expand or contract as the content changes. You can set constraints, padding, gaps, wrap-around behaviors, and nested grids. We will practice constructing a responsive navigation sidebar and dynamic product grid card templates.',
          }
        ]
      }
    ],
    quiz: {
      id: 'quiz-design',
      title: 'UI/UX Design Assessment',
      questions: [
        {
          id: 'q1',
          questionText: 'What are Design Tokens?',
          options: ['Digital coupons for design assets', 'Visual badges for designers', 'Atomic variables (colors, sizing, etc.) that represent style decisions', 'JSON scripts to render websites'],
          correctOptionIndex: 2
        },
        {
          id: 'q2',
          questionText: 'Which Figma feature allows layouts to scale automatically when elements inside change?',
          options: ['Smart Scale', 'Auto Layout', 'Flex Grid', 'Responsive Pinning'],
          correctOptionIndex: 1
        }
      ]
    }
  },
  {
    id: 'marketing-grow-103',
    title: 'Growth Marketing & Brand Building',
    description: 'Master SEO, content frameworks, and marketing funnels. Build an audience, generate leads, and design optimized landing pages.',
    category: 'Marketing',
    level: 'Beginner',
    rating: 4.6,
    duration: '6h 15m',
    instructor: 'Marc Bennett',
    instructorTitle: 'VP of Growth at SaaS Scale',
    studentsEnrolled: 4120,
    gradientColors: ['#F59E0B', '#EF4444'],
    modules: [
      {
        id: 'mod1',
        title: 'Understanding Funnels',
        lectures: [
          {
            id: 'lec1-1',
            title: '1.1 AARRR Pirate Metrics Framework',
            duration: '8m',
            type: 'reading',
            content: 'The AARRR framework tracks customer lifecycle: Acquisition, Activation, Retention, Referral, and Revenue. By breaking down and tracking conversion percentages at each stage, growth marketers can pinpoint bottlenecks and deploy focused tests to scale the user base efficiently.',
          }
        ]
      }
    ],
    quiz: {
      id: 'quiz-mktg',
      title: 'Growth Marketing Assessment',
      questions: [
        {
          id: 'q1',
          questionText: 'What does the first A in the AARRR funnel framework stand for?',
          options: ['Activation', 'Acquisition', 'Affiliate', 'Average Daily Users'],
          correctOptionIndex: 1
        }
      ]
    }
  }
];

const INITIAL_USER = {
  userId: 'jane_doe_default',
  name: 'Jane Doe',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  title: 'Aspiring Full Stack Engineer',
  role: 'student',
  xp: 320,
  streak: 5,
  enrolled: {
    'rn-expo-101': {
      progress: 25,
      completedLectures: ['lec1-1'],
      quizCompleted: false,
    }
  }
};

// Database Seeding
async function seedDatabase() {
  try {
    const courseCount = await Course.countDocuments();
    if (courseCount === 0) {
      await Course.insertMany(INITIAL_COURSES);
      console.log('Seeded database with initial courses');
    }

    // Seed student user
    let studentUser = await UserProfile.findOne({ email: 'student@aether.com' });
    if (!studentUser) {
      studentUser = new UserProfile({
        userId: 'student_jane',
        email: 'student@aether.com',
        password: 'password',
        name: 'Jane Doe',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        title: 'Aspiring Full Stack Engineer',
        role: 'student',
        xp: 320,
        streak: 5,
        enrolled: {
          'rn-expo-101': {
            progress: 25,
            completedLectures: ['lec1-1'],
            quizCompleted: false
          }
        }
      });
      await studentUser.save();
      console.log('Seeded student profile');
    }

    // Seed instructor user
    let instructorUser = await UserProfile.findOne({ email: 'alex@aether.com' });
    if (!instructorUser) {
      instructorUser = new UserProfile({
        userId: 'instructor_alex',
        email: 'alex@aether.com',
        password: 'password',
        name: 'Alex Rivers',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        title: 'Senior Mobile Architect',
        role: 'instructor',
        xp: 1200,
        streak: 12,
        enrolled: {}
      });
      await instructorUser.save();
      console.log('Seeded instructor profile');
    }
  } catch (err) {
    console.error('Seeding failed:', err);
  }
}

// Connect to database
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB');
    seedDatabase();
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
  });

// API Routes

// Fetch all courses
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await Course.find().sort({ _id: -1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// Create course
app.post('/api/courses', async (req, res) => {
  try {
    const courseData = req.body;
    const newCourse = new Course({
      ...courseData,
      id: `course-${Date.now()}`,
      rating: 5.0,
      studentsEnrolled: 0,
      gradientColors: ['#10B981', '#059669']
    });
    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create course: ' + err.message });
  }
});

// Add question to course quiz
app.post('/api/courses/:courseId/quiz/questions', async (req, res) => {
  try {
    const { courseId } = req.params;
    const { questionText, options, correctOptionIndex } = req.body;

    if (!questionText || !options || !Array.isArray(options) || correctOptionIndex === undefined) {
      return res.status(400).json({ error: 'Missing required question fields (questionText, options, correctOptionIndex)' });
    }

    const course = await Course.findOne({ id: courseId });
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Ensure the course has a quiz structure initialized
    if (!course.quiz) {
      course.quiz = {
        id: `quiz-custom-${Date.now()}`,
        title: `${course.title} Assessment`,
        questions: []
      };
    }

    const newQuestion = {
      id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      questionText,
      options,
      correctOptionIndex
    };

    course.quiz.questions.push(newQuestion);
    await course.save();

    res.status(201).json(newQuestion);
  } catch (err) {
    res.status(400).json({ error: 'Failed to add quiz question: ' + err.message });
  }
});


// Helper to get userId from header
const getUserId = (req) => req.headers['x-user-id'] || 'student_jane';

// Login route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter email and password' });
    }
    const user = await UserProfile.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: 'Login failed: ' + err.message });
  }
});

// Register route
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Please fill in all fields' });
    }
    const existingUser = await UserProfile.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const newUserId = `user-${Date.now()}`;
    const newUser = new UserProfile({
      userId: newUserId,
      email: email.toLowerCase(),
      password,
      name,
      avatar: `https://images.unsplash.com/photo-${['1535713875002-d1d0cf377fde', '1494790108377-be9c29b29330', '1599566150163-29194dcaad36', '1507003211169-0a1dd7228f2d'][Math.floor(Math.random()*4)]}?w=150&auto=format&fit=crop&q=80`,
      title: role === 'instructor' ? 'Authorized Academy Instructor' : 'Aspiring Full Stack Engineer',
      role: role || 'student',
      xp: role === 'instructor' ? 0 : 0, // Keep at 0 for new signups
      streak: 1,
      enrolled: {}
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ error: 'Registration failed: ' + err.message });
  }
});

// Fetch user profile
app.get('/api/user', async (req, res) => {
  try {
    const userId = getUserId(req);
    let user = await UserProfile.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// Enroll in a course
app.post('/api/user/enroll', async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = getUserId(req);
    let user = await UserProfile.findOne({ userId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.enrolled.has(courseId)) {
      return res.json(user); // Already enrolled
    }

    user.enrolled.set(courseId, {
      progress: 0,
      completedLectures: [],
      quizCompleted: false
    });
    user.xp += 50; // Reward XP for enrolling

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: 'Enrollment failed: ' + err.message });
  }
});

// Complete a lecture
app.post('/api/user/lecture/complete', async (req, res) => {
  try {
    const { courseId, lectureId } = req.body;
    const userId = getUserId(req);
    let user = await UserProfile.findOne({ userId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const course = await Course.findOne({ id: courseId });
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const enrollState = user.enrolled.get(courseId);
    if (!enrollState) return res.status(400).json({ error: 'User not enrolled in course' });

    if (enrollState.completedLectures.includes(lectureId)) {
      return res.json(user); // Already completed
    }

    enrollState.completedLectures.push(lectureId);

    // Calculate progress
    const totalLectures = course.modules.reduce((sum, mod) => sum + mod.lectures.length, 0);
    const progress = totalLectures > 0 ? Math.round((enrollState.completedLectures.length / totalLectures) * 100) : 0;
    enrollState.progress = progress;

    if (progress === 100 && enrollState.quizCompleted) {
      enrollState.completedAt = new Date().toISOString();
    }

    user.xp += 20; // 20 XP per lecture completion
    user.enrolled.set(courseId, enrollState); // Mark map as modified

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: 'Lecture completion failed: ' + err.message });
  }
});

// Submit quiz score
app.post('/api/user/quiz/submit', async (req, res) => {
  try {
    const { courseId, score } = req.body;
    const userId = getUserId(req);
    let user = await UserProfile.findOne({ userId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const enrollState = user.enrolled.get(courseId);
    if (!enrollState) return res.status(400).json({ error: 'User not enrolled in course' });

    const scorePct = Math.round(score * 100);
    const isFirstComplete = !enrollState.quizCompleted;
    const xpBonus = isFirstComplete ? 100 + (scorePct >= 80 ? 50 : 0) : 0;

    enrollState.quizCompleted = true;
    enrollState.quizScore = scorePct;

    if (enrollState.progress === 100) {
      enrollState.completedAt = new Date().toISOString();
    }

    user.xp += xpBonus;
    user.enrolled.set(courseId, enrollState);

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: 'Quiz submission failed: ' + err.message });
  }
});

// Switch role
app.post('/api/user/switch-role', async (req, res) => {
  try {
    const { role } = req.body;
    const userId = getUserId(req);
    let user = await UserProfile.findOne({ userId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.role = role;
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: 'Role switch failed: ' + err.message });
  }
});

// Reset user profile
app.post('/api/user/reset', async (req, res) => {
  try {
    const userId = getUserId(req);
    await UserProfile.deleteOne({ userId });
    
    // Seed new profile or fallback initial values based on user role
    const isAlex = userId === 'instructor_alex';
    const seededUser = new UserProfile({
      userId,
      email: isAlex ? 'alex@aether.com' : 'student@aether.com',
      password: 'password',
      name: isAlex ? 'Alex Rivers' : 'Jane Doe',
      avatar: isAlex 
        ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80' 
        : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      title: isAlex ? 'Senior Mobile Architect' : 'Aspiring Full Stack Engineer',
      role: isAlex ? 'instructor' : 'student',
      xp: isAlex ? 1200 : 320,
      streak: isAlex ? 12 : 5,
      enrolled: isAlex ? {} : {
        'rn-expo-101': {
          progress: 25,
          completedLectures: ['lec1-1'],
          quizCompleted: false
        }
      }
    });
    await seededUser.save();
    res.json(seededUser);
  } catch (err) {
    res.status(400).json({ error: 'Reset failed: ' + err.message });
  }
});

// Collaborative Group Workspace Endpoints

// Fetch all groups the current user is a member of
app.get('/api/groups', async (req, res) => {
  try {
    const userId = getUserId(req);
    const groups = await Group.find({ members: userId }).sort({ _id: -1 });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch groups: ' + err.message });
  }
});

// Create a new group (Instructor only)
app.post('/api/groups', async (req, res) => {
  try {
    const userId = getUserId(req);
    const user = await UserProfile.findOne({ userId });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role !== 'instructor') {
      return res.status(403).json({ error: 'Only instructors can create groups' });
    }

    const { name, description } = req.body;
    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required' });
    }

    // Generate unique code (e.g. GR-1234)
    let code;
    let codeExists = true;
    while (codeExists) {
      const rand = Math.floor(1000 + Math.random() * 9000);
      code = `GR-${rand}`;
      const existing = await Group.findOne({ code });
      if (!existing) codeExists = false;
    }

    const newGroup = new Group({
      id: `group-${Date.now()}`,
      name,
      description,
      code,
      createdBy: userId,
      members: [userId],
      discussions: [],
      files: [],
      announcements: []
    });

    await newGroup.save();
    res.status(201).json(newGroup);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create group: ' + err.message });
  }
});

// Join group via code (Student only)
app.post('/api/groups/join', async (req, res) => {
  try {
    const userId = getUserId(req);
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Group code is required' });
    }

    const group = await Group.findOne({ code: code.toUpperCase().trim() });
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (group.members.includes(userId)) {
      return res.status(400).json({ error: 'You are already a member of this group' });
    }

    group.members.push(userId);
    await group.save();
    res.json(group);
  } catch (err) {
    res.status(400).json({ error: 'Failed to join group: ' + err.message });
  }
});

// Post an announcement (Instructor only)
app.post('/api/groups/:groupId/announcements', async (req, res) => {
  try {
    const userId = getUserId(req);
    const user = await UserProfile.findOne({ userId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { groupId } = req.params;
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const group = await Group.findOne({ id: groupId });
    if (!group) return res.status(404).json({ error: 'Group not found' });

    if (group.createdBy !== userId && user.role !== 'instructor') {
      return res.status(403).json({ error: 'Only instructors can post announcements' });
    }

    const announcement = {
      id: `ann-${Date.now()}`,
      title,
      content,
      timestamp: new Date(),
      postedBy: user.name
    };

    group.announcements.push(announcement);
    await group.save();
    res.status(201).json(group);
  } catch (err) {
    res.status(400).json({ error: 'Failed to post announcement: ' + err.message });
  }
});

// Post a message in the discussion chat (Student & Instructor)
app.post('/api/groups/:groupId/messages', async (req, res) => {
  try {
    const userId = getUserId(req);
    const user = await UserProfile.findOne({ userId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { groupId } = req.params;
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const group = await Group.findOne({ id: groupId });
    if (!group) return res.status(404).json({ error: 'Group not found' });

    if (!group.members.includes(userId)) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    const message = {
      id: `msg-${Date.now()}`,
      senderId: userId,
      senderName: user.name,
      senderAvatar: user.avatar,
      senderRole: user.role,
      content,
      timestamp: new Date()
    };

    group.discussions.push(message);
    await group.save();
    res.status(201).json(group);
  } catch (err) {
    res.status(400).json({ error: 'Failed to post message: ' + err.message });
  }
});

// Share a file in the workspace (Student & Instructor)
app.post('/api/groups/:groupId/files', async (req, res) => {
  try {
    const userId = getUserId(req);
    const user = await UserProfile.findOne({ userId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { groupId } = req.params;
    const { name, size } = req.body;
    if (!name || !size) {
      return res.status(400).json({ error: 'File name and size are required' });
    }

    const group = await Group.findOne({ id: groupId });
    if (!group) return res.status(404).json({ error: 'Group not found' });

    if (!group.members.includes(userId)) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    const fileObj = {
      id: `file-${Date.now()}`,
      name,
      size,
      sharedBy: user.name,
      timestamp: new Date(),
      url: '#'
    };

    group.files.push(fileObj);
    await group.save();
    res.status(201).json(group);
  } catch (err) {
    res.status(400).json({ error: 'Failed to share file: ' + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`LMS Express Server running on port ${PORT}`);
});

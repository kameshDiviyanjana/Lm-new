import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

// Type Definitions
export interface Lecture {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'reading' | 'code';
  content: string;
  codeSnippet?: string;
}

export interface Module {
  id: string;
  title: string;
  lectures: Lecture[];
}

export interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
}

export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: 'Development' | 'Design' | 'Marketing' | 'Business';
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  rating: number;
  duration: string;
  instructor: string;
  instructorTitle: string;
  studentsEnrolled: number;
  gradientColors: [string, string];
  modules: Module[];
  quiz: Quiz;
}

export interface EnrollmentState {
  progress: number; // 0 to 100
  completedLectures: string[]; // list of lectureIds
  quizCompleted: boolean;
  quizScore?: number;
  completedAt?: string;
}

export interface UserProfile {
  name: string;
  avatar: string;
  // title: string;
  role: 'student' | 'instructor';
  xp: number;
  streak: number;
  enrolled: Record<string, EnrollmentState>;
}

export interface GroupMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderRole: 'student' | 'instructor';
  content: string;
  timestamp: string;
}

export interface GroupFile {
  id: string;
  name: string;
  size: string;
  sharedBy: string;
  timestamp: string;
  url: string;
}

export interface GroupAnnouncement {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  postedBy: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  code: string;
  createdBy: string;
  members: string[];
  discussions: GroupMessage[];
  files: GroupFile[];
  announcements: GroupAnnouncement[];
}

interface LMSContextType {
  courses: Course[];
  user: UserProfile;
  isDarkMode: boolean;
  userId: string | null;
  groups: Group[];
  enrollInCourse: (courseId: string) => void;
  completeLecture: (courseId: string, lectureId: string) => void;
  submitQuizScore: (courseId: string, score: number) => void;
  createCourse: (courseData: Omit<Course, 'id' | 'rating' | 'studentsEnrolled' | 'gradientColors'>) => void;
  toggleTheme: () => void;
  switchRole: (role: 'student' | 'instructor') => void;
  resetProgress: () => void;
  addQuizQuestion: (courseId: string, question: Omit<Question, 'id'>) => Promise<void>;
  login: (email: string, password: string) => Promise<UserProfile | null>;
  register: (email: string, password: string, name: string, role: 'student' | 'instructor') => Promise<UserProfile | null>;
  logout: () => void;
  fetchGroups: () => Promise<void>;
  createGroup: (name: string, description: string) => Promise<Group | null>;
  joinGroup: (code: string) => Promise<Group | null>;
  postAnnouncement: (groupId: string, title: string, content: string) => Promise<Group | null>;
  postMessage: (groupId: string, content: string) => Promise<Group | null>;
  shareFile: (groupId: string, name: string, size: string) => Promise<Group | null>;
}

const LMSContext = createContext<LMSContextType | undefined>(undefined);

// Initial Mock Courses
const INITIAL_COURSES: Course[] = [
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
    gradientColors: ['#6366F1', '#4F46E5'], // Purple-Indigo
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
    gradientColors: ['#EC4899', '#D946EF'], // Pink-Magenta
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
    gradientColors: ['#F59E0B', '#EF4444'], // Amber-Red
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

// const BASE_URL = Platform.select({
//   android: 'http://10.0.2.2:5001/api',
//   ios: 'http://localhost:5001/api',
//   default: 'http://localhost:5001/api'
// });

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL_BE;


export const LMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(() => {
    if (Platform.OS === 'web') {
      return localStorage.getItem('lms_user_id');
    }
    return null;
  });
  const [user, setUser] = useState<UserProfile>({
    name: 'Guest',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    role: 'student',
    xp: 0,
    streak: 0,
    enrolled: {}
  });

  // Fetch initial data on mount and whenever userId changes
  useEffect(() => {
    fetchCourses();
    if (userId) {
      fetchUser(userId);
      fetchGroups();
    } else {
      setGroups([]);
    }
  }, [userId]);

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${BASE_URL}/courses`);
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  };

  const fetchUser = async (activeUserId?: string) => {
    const idToUse = activeUserId || userId;
    if (!idToUse) return;
    try {
      const res = await fetch(`${BASE_URL}/user`, {
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': idToUse
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.enrolled && typeof data.enrolled === 'object') {
          setUser(data);
        } else {
          setUser({ ...data, enrolled: {} });
        }
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
    }
  };

  const login = async (email: string, password: string): Promise<UserProfile | null> => {
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const userData = await res.json();
        setUserId(userData.userId);
        setUser(userData);
        if (Platform.OS === 'web') {
          localStorage.setItem('lms_user_id', userData.userId);
        }
        return userData;
      } else {
        const errData = await res.json();
        alert(errData.error || 'Login failed');
        return null;
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('Login error. Please try again.');
      return null;
    }
  };

  const register = async (email: string, password: string, name: string, role: 'student' | 'instructor'): Promise<UserProfile | null> => {
    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role })
      });
      if (res.ok) {
        const userData = await res.json();
        setUserId(userData.userId);
        setUser(userData);
        if (Platform.OS === 'web') {
          localStorage.setItem('lms_user_id', userData.userId);
        }
        return userData;
      } else {
        const errData = await res.json();
        alert(errData.error || 'Registration failed');
        return null;
      }
    } catch (err) {
      console.error('Registration error:', err);
      alert('Registration error. Please try again.');
      return null;
    }
  };

  const logout = () => {
    setUserId(null);
    setUser({
      name: 'Guest',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      role: 'student',
      xp: 0,
      streak: 0,
      enrolled: {}
    });
    if (Platform.OS === 'web') {
      localStorage.removeItem('lms_user_id');
    }
  };

  const enrollInCourse = async (courseId: string) => {
    if (!userId) return;
    try {
      const res = await fetch(`${BASE_URL}/user/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({ courseId })
      });
      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error('Failed to enroll:', err);
    }
  };

  const completeLecture = async (courseId: string, lectureId: string) => {
    if (!userId) return;
    try {
      const res = await fetch(`${BASE_URL}/user/lecture/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({ courseId, lectureId })
      });
      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error('Failed to complete lecture:', err);
    }
  };

  const submitQuizScore = async (courseId: string, score: number) => {
    if (!userId) return;
    try {
      const res = await fetch(`${BASE_URL}/user/quiz/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({ courseId, score })
      });
      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error('Failed to submit quiz score:', err);
    }
  };

  const createCourse = async (courseData: Omit<Course, 'id' | 'rating' | 'studentsEnrolled' | 'gradientColors'>) => {
    if (!userId) return;
    try {
      const res = await fetch(`${BASE_URL}/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify(courseData)
      });
      if (res.ok) {
        const newCourse = await res.json();
        setCourses(prev => [newCourse, ...prev]);
        fetchUser(); // Re-fetch user profile to sync updated XP
      }
    } catch (err) {
      console.error('Failed to create course:', err);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const switchRole = async (role: 'student' | 'instructor') => {
    if (!userId) return;
    try {
      const res = await fetch(`${BASE_URL}/user/switch-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({ role })
      });
      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error('Failed to switch role:', err);
    }
  };

  const resetProgress = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${BASE_URL}/user/reset`, {
        method: 'POST',
        headers: {
          'x-user-id': userId
        }
      });
      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error('Failed to reset user progress:', err);
    }
  };

  const addQuizQuestion = async (courseId: string, question: Omit<Question, 'id'>) => {
    if (!userId) return;
    try {
      const res = await fetch(`${BASE_URL}/courses/${courseId}/quiz/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify(question)
      });
      if (res.ok) {
        await fetchCourses();
      } else {
        console.error('Failed to add quiz question, server responded with error');
      }
    } catch (err) {
      console.error('Failed to add quiz question:', err);
    }
  };

  const fetchGroups = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${BASE_URL}/groups`, {
        headers: {
          'x-user-id': userId
        }
      });
      if (res.ok) {
        const data = await res.json();
        setGroups(data);
      }
    } catch (err) {
      console.error('Failed to fetch groups:', err);
    }
  };

  const createGroup = async (name: string, description: string): Promise<Group | null> => {
    if (!userId) return null;
    try {
      const res = await fetch(`${BASE_URL}/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({ name, description })
      });
      if (res.ok) {
        const data = await res.json();
        setGroups(prev => [data, ...prev]);
        return data;
      }
      return null;
    } catch (err) {
      console.error('Failed to create group:', err);
      return null;
    }
  };

  const joinGroup = async (code: string): Promise<Group | null> => {
    if (!userId) return null;
    try {
      const res = await fetch(`${BASE_URL}/groups/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({ code })
      });
      if (res.ok) {
        const data = await res.json();
        setGroups(prev => [data, ...prev]);
        return data;
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to join group');
        return null;
      }
    } catch (err) {
      console.error('Failed to join group:', err);
      return null;
    }
  };

  const postAnnouncement = async (groupId: string, title: string, content: string): Promise<Group | null> => {
    if (!userId) return null;
    try {
      const res = await fetch(`${BASE_URL}/groups/${groupId}/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({ title, content })
      });
      if (res.ok) {
        const data = await res.json();
        setGroups(prev => prev.map(g => g.id === groupId ? data : g));
        return data;
      }
      return null;
    } catch (err) {
      console.error('Failed to post announcement:', err);
      return null;
    }
  };

  const postMessage = async (groupId: string, content: string): Promise<Group | null> => {
    if (!userId) return null;
    try {
      const res = await fetch(`${BASE_URL}/groups/${groupId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({ content })
      });
      if (res.ok) {
        const data = await res.json();
        setGroups(prev => prev.map(g => g.id === groupId ? data : g));
        return data;
      }
      return null;
    } catch (err) {
      console.error('Failed to post message:', err);
      return null;
    }
  };

  const shareFile = async (groupId: string, name: string, size: string): Promise<Group | null> => {
    if (!userId) return null;
    try {
      const res = await fetch(`${BASE_URL}/groups/${groupId}/files`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({ name, size })
      });
      if (res.ok) {
        const data = await res.json();
        setGroups(prev => prev.map(g => g.id === groupId ? data : g));
        return data;
      }
      return null;
    } catch (err) {
      console.error('Failed to share file:', err);
      return null;
    }
  };

  return (
    <LMSContext.Provider
      value={{
        courses,
        groups,
        user,
        isDarkMode,
        userId,
        enrollInCourse,
        completeLecture,
        submitQuizScore,
        createCourse,
        toggleTheme,
        switchRole,
        resetProgress,
        addQuizQuestion,
        login,
        register,
        logout,
        fetchGroups,
        createGroup,
        joinGroup,
        postAnnouncement,
        postMessage,
        shareFile
      }}
    >
      {children}
    </LMSContext.Provider>
  );
};

export const useLMS = () => {
  const context = useContext(LMSContext);
  if (context === undefined) {
    throw new Error('useLMS must be used within an LMSProvider');
  }
  return context;
};

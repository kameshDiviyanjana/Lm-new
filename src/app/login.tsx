import { Colors, Spacing } from '@/constants/theme';
import { useLMS } from '@/context/LMSContext';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const { login, register, isDarkMode } = useLMS();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  // Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'instructor'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (email.trim() === '' || password.trim() === '') {
      alert('Please enter your email and password.');
      return;
    }

    setLoading(true);
    if (activeTab === 'signin') {
      const loggedInUser = await login(email.trim(), password);
      setLoading(false);
      if (loggedInUser) {
        if (loggedInUser.role === 'admin') {
          router.replace('/admin' as any);
        } else if (loggedInUser.role === 'instructor') {
          router.replace('/instructor' as any);
        } else {
          router.replace('/dashboard' as any);
        }
      }
    } else {
      if (name.trim() === '') {
        alert('Please enter your name.');
        setLoading(false);
        return;
      }
      const registeredUser = await register(email.trim(), password, name.trim(), role);
      setLoading(false);
      if (registeredUser) {
        if (registeredUser.role === 'admin') {
          router.replace('/admin' as any);
        } else if (registeredUser.role === 'instructor') {
          router.replace('/instructor' as any);
        } else {
          router.replace('/dashboard' as any);
        }
      }
    }
  };

  const handleDemoLogin = async (role: 'student' | 'instructor' | 'admin') => {
    setLoading(true);
    let demoEmail = 'student@aether.com';
    if (role === 'instructor') {
      demoEmail = 'alex@aether.com';
    } else if (role === 'admin') {
      demoEmail = 'admin@aether.com';
    }
    const loggedInUser = await login(demoEmail, 'password');
    setLoading(false);
    if (loggedInUser) {
      if (loggedInUser.role === 'admin') {
        router.replace('/admin' as any);
      } else if (loggedInUser.role === 'instructor') {
        router.replace('/instructor' as any);
      } else {
        router.replace('/dashboard' as any);
      }
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo & Header */}
          <View style={styles.headerSection}>
            <Text style={styles.logoEmoji}>📐</Text>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              {activeTab === 'signin' ? 'Welcome Back' : 'Create Account'}
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              {activeTab === 'signin'
                ? 'Sign in to access your custom learning portal'
                : 'Join Aether Academy and expand your skills'}
            </Text>
          </View>

          {/* Sign In / Sign Up Selector Tabs */}
          <View style={[styles.tabBar, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
            <Pressable
              onPress={() => {
                setActiveTab('signin');
                setEmail('');
                setPassword('');
                setName('');
              }}
              style={[
                styles.tabBtn,
                activeTab === 'signin' && { backgroundColor: theme.backgroundSelected }
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: activeTab === 'signin' ? theme.primary : theme.textSecondary,
                    fontWeight: activeTab === 'signin' ? '700' : '500'
                  }
                ]}
              >
                Sign In
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setActiveTab('signup');
                setEmail('');
                setPassword('');
                setName('');
              }}
              style={[
                styles.tabBtn,
                activeTab === 'signup' && { backgroundColor: theme.backgroundSelected }
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: activeTab === 'signup' ? theme.primary : theme.textSecondary,
                    fontWeight: activeTab === 'signup' ? '700' : '500'
                  }
                ]}
              >
                Register
              </Text>
            </Pressable>
          </View>

          {/* Form */}
          <View style={[styles.formCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
            {activeTab === 'signup' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>FULL NAME</Text>
                  <TextInput
                    style={[styles.inputField, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                    placeholder="e.g. John Doe"
                    placeholderTextColor={theme.textSecondary}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>SELECT YOUR ROLE</Text>
                  <View style={[styles.roleSelectContainer, { borderColor: theme.border, backgroundColor: theme.background }]}>
                    <Pressable
                      onPress={() => setRole('student')}
                      style={[
                        styles.roleSelectBtn,
                        role === 'student' && { backgroundColor: theme.primary }
                      ]}
                    >
                      <Text
                        style={[
                          styles.roleSelectText,
                          { color: role === 'student' ? '#FFF' : theme.textSecondary }
                        ]}
                      >
                        🎓 Student
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setRole('instructor')}
                      style={[
                        styles.roleSelectBtn,
                        role === 'instructor' && { backgroundColor: theme.primary }
                      ]}
                    >
                      <Text
                        style={[
                          styles.roleSelectText,
                          { color: role === 'instructor' ? '#FFF' : theme.textSecondary }
                        ]}
                      >
                        🚀 Instructor
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </>
            )}

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>EMAIL ADDRESS</Text>
              <TextInput
                style={[styles.inputField, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                placeholder="e.g. user@aether.com"
                placeholderTextColor={theme.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>PASSWORD</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.inputField,
                    styles.passwordField,
                    { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }
                  ]}
                  placeholder="Enter your password"
                  placeholderTextColor={theme.textSecondary}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  <Text style={styles.eyeText}>{showPassword ? '👁️' : '🙈'}</Text>
                </Pressable>
              </View>
            </View>

            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              style={({ pressed }) => [
                styles.submitBtn,
                {
                  backgroundColor: theme.primary,
                  opacity: loading || pressed ? 0.9 : 1,
                }
              ]}
            >
              <Text style={styles.submitBtnText}>
                {loading ? 'Processing...' : activeTab === 'signin' ? 'Sign In' : 'Register Account'}
              </Text>
            </Pressable>
          </View>

          {/* Demo Logins Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            <Text style={[styles.dividerText, { color: theme.textSecondary }]}>OR SIGN IN AS</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          </View>

          {/* Quick Demo Login Grid */}
          <View style={styles.demoGrid}>
            <Pressable
              onPress={() => handleDemoLogin('student')}
              disabled={loading}
              style={({ pressed }) => [
                styles.demoCard,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.border,
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }]
                }
              ]}
            >
              <Text style={styles.demoEmoji}>🎓</Text>
              <Text style={[styles.demoTitle, { color: theme.text }]}>Student</Text>
              <Text style={[styles.demoSub, { color: theme.textSecondary }]}>student@aether.com</Text>
            </Pressable>

            <Pressable
              onPress={() => handleDemoLogin('instructor')}
              disabled={loading}
              style={({ pressed }) => [
                styles.demoCard,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.border,
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }]
                }
              ]}
            >
              <Text style={styles.demoEmoji}>🚀</Text>
              <Text style={[styles.demoTitle, { color: theme.text }]}>Instructor</Text>
              <Text style={[styles.demoSub, { color: theme.textSecondary }]}>alex@aether.com</Text>
            </Pressable>

            <Pressable
              onPress={() => handleDemoLogin('admin')}
              disabled={loading}
              style={({ pressed }) => [
                styles.demoCard,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.border,
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }]
                }
              ]}
            >
              <Text style={styles.demoEmoji}>🛠️</Text>
              <Text style={[styles.demoTitle, { color: theme.text }]}>Admin</Text>
              <Text style={[styles.demoSub, { color: theme.textSecondary }]}>admin@aether.com</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    justifyContent: 'center',
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginTop: Spacing.three,
    gap: 8,
  },
  logoEmoji: {
    fontSize: 48,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 18,
  },
  tabBar: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  tabBtn: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 13,
  },
  formCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: Spacing.four,
    gap: Spacing.three,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
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
  passwordContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordField: {
    paddingRight: 48,
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    height: 40,
    width: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeText: {
    fontSize: 16,
  },
  submitBtn: {
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginVertical: Spacing.one,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  demoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  demoCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.three,
    alignItems: 'center',
    gap: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  demoEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  demoTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  demoSub: {
    fontSize: 10,
  },
  roleSelectContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  roleSelectBtn: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleSelectText: {
    fontSize: 13,
    fontWeight: '700',
  },
});

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import { useLMS, UserProfile } from '@/context/LMSContext';
import { Colors, Spacing } from '@/constants/theme';

export default function AdminScreen() {
  const {
    isDarkMode,
    fetchAdminStats,
    fetchAdminUsers,
    createAdminUser,
    deleteAdminUser,
  } = useLMS();

  const theme = isDarkMode ? Colors.dark : Colors.light;

  // State variables
  const [stats, setStats] = useState<{ students: number; instructors: number; courses: number; groups: number } | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'student' | 'instructor'>('student');
  const [newUserTitle, setNewUserTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    const [statsData, usersData] = await Promise.all([
      fetchAdminStats(),
      fetchAdminUsers(),
    ]);
    if (statsData) setStats(statsData);
    if (usersData) setUsers(usersData);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData(false);
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    const performDelete = async () => {
      setLoading(true);
      const success = await deleteAdminUser(userId);
      if (success) {
        if (Platform.OS !== 'web') {
          Alert.alert('Success', 'User deleted successfully.');
        } else {
          alert('User deleted successfully.');
        }
        loadData(false);
      } else {
        setLoading(false);
      }
    };

    if (Platform.OS === 'web') {
      const confirm = window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`);
      if (confirm) {
        performDelete();
      }
    } else {
      Alert.alert(
        'Confirm Delete',
        `Are you sure you want to delete ${userName}? This action cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: performDelete,
          },
        ]
      );
    }
  };

  const handleAddUser = async () => {
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
      if (Platform.OS === 'web') {
        alert('Please fill in Name, Email, and Password.');
      } else {
        Alert.alert('Error', 'Please fill in Name, Email, and Password.');
      }
      return;
    }

    setSubmitting(true);
    const success = await createAdminUser({
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      password: newUserPassword,
      role: newUserRole,
      title: newUserTitle.trim() || undefined,
    });

    setSubmitting(false);
    if (success) {
      if (Platform.OS === 'web') {
        alert('User added successfully.');
      } else {
        Alert.alert('Success', 'User added successfully.');
      }
      setModalVisible(false);
      // Reset form
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('student');
      setNewUserTitle('');
      loadData(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      (u as any).email?.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.primary} />
      }
    >
      {/* Stats Cards */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Platform Summary</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
            <Text style={styles.statIcon}>🎓</Text>
            <View>
              <Text style={[styles.statValue, { color: theme.text }]}>{stats ? stats.students : '-'}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Students</Text>
            </View>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
            <Text style={styles.statIcon}>🚀</Text>
            <View>
              <Text style={[styles.statValue, { color: theme.text }]}>{stats ? stats.instructors : '-'}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Instructors</Text>
            </View>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
            <Text style={styles.statIcon}>📚</Text>
            <View>
              <Text style={[styles.statValue, { color: theme.text }]}>{stats ? stats.courses : '-'}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Courses</Text>
            </View>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
            <Text style={styles.statIcon}>👥</Text>
            <View>
              <Text style={[styles.statValue, { color: theme.text }]}>{stats ? stats.groups : '-'}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Study Groups</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Users Management */}
      <View style={styles.section}>
        <View style={styles.usersHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>User Directory</Text>
          <Pressable
            onPress={() => setModalVisible(true)}
            style={({ pressed }) => [
              styles.addButton,
              { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <Text style={styles.addButtonText}>＋ Add User</Text>
          </Pressable>
        </View>

        {/* Search */}
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: theme.backgroundElement,
              color: theme.text,
              borderColor: theme.border,
            },
          ]}
          placeholder="Search by name, email, or role..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={styles.loader} />
        ) : filteredUsers.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No users found</Text>
            <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
              Try altering your query or create a new user account using the button above.
            </Text>
          </View>
        ) : (
          <View style={styles.userList}>
            {filteredUsers.map((userItem) => (
              <View
                key={userItem.userId || (userItem as any)._id}
                style={[
                  styles.userCard,
                  { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                ]}
              >
                <Image source={{ uri: userItem.avatar }} style={styles.avatar} />
                <View style={styles.userInfo}>
                  <Text style={[styles.userName, { color: theme.text }]}>{userItem.name}</Text>
                  <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{(userItem as any).email || 'No email'}</Text>
                  <View style={styles.badgeRow}>
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor:
                            userItem.role === 'admin'
                              ? theme.danger
                              : userItem.role === 'instructor'
                              ? theme.successLight
                              : theme.primaryLight,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          {
                            color:
                              userItem.role === 'admin'
                                ? '#FFF'
                                : userItem.role === 'instructor'
                                ? theme.success
                                : theme.primary,
                          },
                        ]}
                      >
                        {userItem.role.toUpperCase()}
                      </Text>
                    </View>
                    {userItem.role !== 'admin' && (
                      <>
                        <Text style={[styles.userStat, { color: theme.textSecondary }]}>⚡ {userItem.xp} XP</Text>
                        <Text style={[styles.userStat, { color: theme.textSecondary }]}>🔥 {userItem.streak}d</Text>
                      </>
                    )}
                  </View>
                </View>
                {userItem.role !== 'admin' && (
                  <Pressable
                    onPress={() => handleDeleteUser(userItem.userId, userItem.name)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteText}>🗑️</Text>
                  </Pressable>
                )}
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Add User Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundElement }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Add New Account</Text>

            {/* Role selection */}
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>ROLE</Text>
            <View style={[styles.roleSelectContainer, { borderColor: theme.border, backgroundColor: theme.background }]}>
              <Pressable
                onPress={() => setNewUserRole('student')}
                style={[
                  styles.roleSelectBtn,
                  newUserRole === 'student' && { backgroundColor: theme.primary },
                ]}
              >
                <Text
                  style={[
                    styles.roleSelectText,
                    { color: newUserRole === 'student' ? '#FFF' : theme.textSecondary },
                  ]}
                >
                  🎓 Student
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setNewUserRole('instructor')}
                style={[
                  styles.roleSelectBtn,
                  newUserRole === 'instructor' && { backgroundColor: theme.primary },
                ]}
              >
                <Text
                  style={[
                    styles.roleSelectText,
                    { color: newUserRole === 'instructor' ? '#FFF' : theme.textSecondary },
                  ]}
                >
                  🚀 Instructor
                </Text>
              </Pressable>
            </View>

            {/* Input Name */}
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>FULL NAME</Text>
            <TextInput
              style={[
                styles.modalInput,
                { color: theme.text, borderColor: theme.border, backgroundColor: theme.background },
              ]}
              placeholder="e.g. John Smith"
              placeholderTextColor={theme.textSecondary}
              value={newUserName}
              onChangeText={setNewUserName}
            />

            {/* Input Email */}
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>EMAIL ADDRESS</Text>
            <TextInput
              style={[
                styles.modalInput,
                { color: theme.text, borderColor: theme.border, backgroundColor: theme.background },
              ]}
              placeholder="e.g. user@aether.com"
              placeholderTextColor={theme.textSecondary}
              value={newUserEmail}
              onChangeText={setNewUserEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Input Password */}
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>PASSWORD</Text>
            <TextInput
              style={[
                styles.modalInput,
                { color: theme.text, borderColor: theme.border, backgroundColor: theme.background },
              ]}
              placeholder="Min 6 characters"
              placeholderTextColor={theme.textSecondary}
              value={newUserPassword}
              onChangeText={setNewUserPassword}
              secureTextEntry={true}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Input Custom Title */}
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>CUSTOM TITLE (OPTIONAL)</Text>
            <TextInput
              style={[
                styles.modalInput,
                { color: theme.text, borderColor: theme.border, backgroundColor: theme.background },
              ]}
              placeholder={
                newUserRole === 'instructor'
                  ? 'e.g. Lead Dev Advocate'
                  : 'e.g. Aspiring Full Stack Engineer'
              }
              placeholderTextColor={theme.textSecondary}
              value={newUserTitle}
              onChangeText={setNewUserTitle}
            />

            {/* Actions */}
            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setModalVisible(false)}
                style={[styles.modalBtn, styles.cancelBtn, { borderColor: theme.border }]}
              >
                <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={handleAddUser}
                disabled={submitting}
                style={[styles.modalBtn, { backgroundColor: theme.primary }]}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.confirmBtnText}>Add Account</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.three,
    gap: Spacing.four,
  },
  section: {
    gap: Spacing.two,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: 14,
    borderWidth: 1,
    gap: Spacing.two,
  },
  statIcon: {
    fontSize: 22,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  usersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  searchInput: {
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    fontSize: 13,
    fontWeight: '500',
    ...Platform.select({
      web: {
        outlineStyle: 'none' as any,
      },
    }),
  },
  loader: {
    marginTop: Spacing.five,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginVertical: Spacing.three,
  },
  emptyIcon: {
    fontSize: 32,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptySub: {
    fontSize: 11,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 16,
  },
  userList: {
    gap: Spacing.two,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: 14,
    borderWidth: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: Spacing.three,
  },
  userInfo: {
    flex: 1,
    gap: 3,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 11,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  userStat: {
    fontSize: 10,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
  },
  deleteText: {
    fontSize: 16,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: Spacing.four,
    gap: Spacing.three,
    ...Platform.select({
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
    }),
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: Spacing.one,
  },
  inputLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
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
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleSelectText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalInput: {
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    fontSize: 13,
    fontWeight: '500',
    ...Platform.select({
      web: {
        outlineStyle: 'none' as any,
      },
    }),
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  modalBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  confirmBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

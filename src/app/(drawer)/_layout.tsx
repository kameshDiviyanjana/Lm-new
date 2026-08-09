import { Colors, Spacing } from '@/constants/theme';
import { useLMS } from '@/context/LMSContext';
import { router, usePathname } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

function CustomDrawerContent(props: any) {
  const { user, isDarkMode, toggleTheme, switchRole, resetProgress, logout } = useLMS();
  const pathname = usePathname();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const menuItems = [
    {
      name: 'Dashboard',
      icon: '🏡',
      path: '/dashboard',
    },
    {
      name: 'Explore Courses',
      icon: '🔍',
      path: '/explore',
    },
    {
      name: 'My Profile',
      icon: '👤',
      path: '/profile',
    },
    {
      name: 'Instructor Portal',
      icon: '🚀',
      path: '/instructor',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Profile Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <View style={styles.headerInfo}>
          <Text style={[styles.userName, { color: theme.text }]}>{user.name}</Text>
          {/* <Text style={[styles.userTitle, { color: theme.textSecondary }]}>{user.title}</Text> */}
          <View style={[styles.roleBadge, { backgroundColor: user.role === 'instructor' ? theme.successLight : theme.primaryLight }]}>
            <Text style={[styles.roleText, { color: user.role === 'instructor' ? theme.success : theme.primary }]}>
              {user.role.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {/* Stats Quick View */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: theme.backgroundElement }]}>
          <Text style={styles.statIcon}>⚡</Text>
          <View>
            <Text style={[styles.statValue, { color: theme.text }]}>{user.xp}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total XP</Text>
          </View>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.backgroundElement }]}>
          <Text style={styles.statIcon}>🔥</Text>
          <View>
            <Text style={[styles.statValue, { color: theme.text }]}>{user.streak}d</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Streak</Text>
          </View>
        </View>
      </View>

      {/* Navigation List */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.menuContainer}>
          {menuItems.filter(item => item.path !== '/instructor' || user.role === 'instructor').map((item) => {
            const isActive = pathname === item.path;
            return (
              <Pressable
                key={item.path}
                onPress={() => router.push(item.path as any)}
                style={({ pressed }) => [
                  styles.menuItem,
                  {
                    backgroundColor: isActive
                      ? theme.primaryLight
                      : pressed
                        ? theme.backgroundSelected
                        : 'transparent',
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  },
                ]}
              >
                <View style={[styles.iconContainer, { backgroundColor: isActive ? theme.primary : theme.backgroundElement }]}>
                  <Text style={[styles.menuIcon, { color: isActive ? '#FFF' : theme.text }]}>{item.icon}</Text>
                </View>
                <Text
                  style={[
                    styles.menuText,
                    {
                      color: isActive ? theme.primary : theme.text,
                      fontWeight: isActive ? '700' : '500',
                    },
                  ]}
                >
                  {item.name}
                </Text>
                {isActive && <View style={[styles.activeIndicator, { backgroundColor: theme.primary }]} />}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Footer Options */}
      <View style={[styles.footer, { borderTopColor: theme.border }]}>

        {/* Theme Toggler */}
        <View style={styles.footerRow}>
          <Text style={[styles.footerLabel, { color: theme.text }]}>Dark Mode</Text>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor={'#FFF'}
          />
        </View>

        {/* Reset Progress */}
        <Pressable
          onPress={resetProgress}
          style={({ pressed }) => [
            styles.resetButton,
            {
              backgroundColor: pressed ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
            },
          ]}
        >
          <Text style={styles.resetButtonText}>Reset Application Data</Text>
        </Pressable>

        {/* Logout */}
        <Pressable
          onPress={() => {
            logout();
            router.replace('/login' as any);
          }}
          style={({ pressed }) => [
            styles.logoutButton,
            {
              backgroundColor: pressed ? theme.border : theme.primaryLight,
            },
          ]}
        >
          <Text style={[styles.logoutButtonText, { color: theme.primary }]}>🚪 Sign Out</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function DrawerLayout() {
  const { isDarkMode } = useLMS();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.backgroundElement,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        },
        headerTintColor: theme.text,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
        drawerStyle: {
          width: 280,
        },
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          drawerItemStyle: { display: 'none' } as any,
          title: 'Dashboard Redirect',
        }}
      />
      <Drawer.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
        }}
      />
      <Drawer.Screen
        name="explore"
        options={{
          title: 'Explore Courses',
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{
          title: 'My Profile',
        }}
      />
      <Drawer.Screen
        name="instructor"
        options={{
          title: 'Instructor Workspace',
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: Spacing.four,
    paddingTop: Platform.OS === 'ios' ? 60 : Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: Spacing.three,
  },
  headerInfo: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
  },
  userTitle: {
    fontSize: 12,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
  },
  roleText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.two,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.two,
    borderRadius: 12,
    gap: 8,
  },
  statIcon: {
    fontSize: 20,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 10,
  },
  scrollContent: {
    paddingTop: 0,
  },
  menuContainer: {
    paddingHorizontal: Spacing.three,
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    borderRadius: 12,
    position: 'relative',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
  },
  menuIcon: {
    fontSize: 18,
  },
  menuText: {
    fontSize: 15,
  },
  activeIndicator: {
    position: 'absolute',
    right: Spacing.three,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  footer: {
    padding: Spacing.four,
    borderTopWidth: 1,
    gap: Spacing.three,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  resetButton: {
    marginTop: Spacing.two,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
  },
  logoutButton: {
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 4,
  },
  logoutButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
});

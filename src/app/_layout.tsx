import { LMSProvider, useLMS } from '@/context/LMSContext';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LMSProvider>
        <RootLayoutNav />
      </LMSProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  const { isDarkMode } = useLMS();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(drawer)" />
        <Stack.Screen 
          name="login" 
          options={{ 
            headerShown: false,
            animation: 'fade',
          }} 
        />
        <Stack.Screen 
          name="course/[id]" 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right',
          }} 
        />
      </Stack>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
    </>
  );
}

// Root layout for mobile app

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#3b82f6',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'HUMMBL',
          }}
        />
        <Stack.Screen
          name="mental-models/index"
          options={{
            title: 'Mental Models',
          }}
        />
        <Stack.Screen
          name="narratives/index"
          options={{
            title: 'Narratives',
          }}
        />
        <Stack.Screen
          name="search"
          options={{
            title: 'Search',
          }}
        />
        <Stack.Screen
          name="bookmarks"
          options={{
            title: 'Bookmarks',
          }}
        />
      </Stack>
    </>
  );
}

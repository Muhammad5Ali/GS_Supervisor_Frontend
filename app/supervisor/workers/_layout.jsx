  import { Stack } from 'expo-router';

  export default function WorkersLayout() {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen 
          name="add" 
          options={{ 
            title: 'Add Worker',
            headerBackTitleVisible: true,
            headerBackTitle: 'Workers',
            headerShown: false
          }} 
        />
        <Stack.Screen 
          name="attendance/[id]" 
          options={{ 
            title: 'Attendance',
            headerBackTitleVisible: true,
            headerBackTitle: 'Workers',
            headerShown: false
          }} 
        />
        <Stack.Screen 
          name="mark-attendance/[id]" 
          options={{ 
            title: 'Mark Attendance',
            headerBackTitleVisible: true,
            headerBackTitle: 'Attendance',
            headerShown: false
          }} 
        />
        <Stack.Screen 
          name="attendance-history/[id]" 
          options={{ 
            title: 'Attendance History',
            headerBackTitleVisible: true,
            headerBackTitle: 'Attendance',
            headerShown: false
          }} 
        />
      </Stack>
    );
  }
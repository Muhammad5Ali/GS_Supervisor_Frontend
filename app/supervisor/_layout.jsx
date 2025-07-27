// app/supervisor/_layout.jsx
import { Slot } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import COLORS from '../../constants/colors';

export default function SupervisorLayout() {
  return (
    <View style={{ flex: 1 }}>
      {/* Simplified header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Supervisor Dashboard</Text>
      </View>
      
      {/* Single Slot for all nested routes */}
      <Slot />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.primary,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  }
});
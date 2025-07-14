import { Slot, useRouter } from 'expo-router';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../../store/authStore';
import COLORS from '../../constants/colors';

export default function SupervisorLayout() {
  const { logout } = useAuthStore();
  const router = useRouter();
  
  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)');
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Header with Logout Button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Supervisor Dashboard</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="white" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      {/* Content - Now renders the tab navigator */}
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
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  logoutText: {
    marginLeft: 8,
    color: 'white',
    fontWeight: 'bold',
  }
});
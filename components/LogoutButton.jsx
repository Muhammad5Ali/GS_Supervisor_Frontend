import { logoutRedirect } from '../lib/navigationService';
import useAuthStore from '../store/authStore';
import { TouchableOpacity, Text, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/colors'; // Import COLORS

export default function LogoutButton() {
    const { logout } = useAuthStore();
    
    const confirmLogout = () => {
        Alert.alert(
            "Confirm Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Logout", 
                    onPress: () => logout(),
                    style: "destructive"
                }
            ]
        );
    }

    return (
        <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.white}/>
            <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
    );
}

// Add styles directly in the component file
const styles = StyleSheet.create({
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        padding: 12,
        borderRadius: 8,
        marginTop: 20,
        justifyContent: 'center',
    },
    logoutText: {
        color: COLORS.white,
        marginLeft: 10,
        fontSize: 16,
        fontWeight: 'bold',
    }
});
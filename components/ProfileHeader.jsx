import { View, Text } from 'react-native';
import { Image } from "expo-image";
import  useAuthStore from '../store/authStore';
import styles from '../assets/styles/profile.styles';
import { formatMemberSince} from '../lib/utils';
import { getImageUrl } from '../lib/utils';
  //{formatMemberSince(user.createdAt)}
export default function ProfileHeader() {
    const {user}=useAuthStore();
    if(!user) return null;
  return (
    <View style={styles.profileHeader}>
        {/* <Image source={{uri:user.profileImage}} style={styles.profileImage}/> */}
        <Image 
  source={{ uri: getImageUrl(user.profileImage)}} 
  style={styles.profileImage}
  onError={(e) => console.log("Profile avatar error:", e.nativeEvent.error)}
/>
        <View style={styles.profileInfo}>
            <Text style={styles.username}>{user.username}</Text>
            <Text style={styles.email}>{user.email}</Text>
          <Text style={styles.memberSince}>
  {user?.createdAt 
    ? `Joined ${formatMemberSince(user.createdAt)}` 
    : 'Member since unknown'}
</Text>
            {/* <Text style={styles.memberSince}>Joined as a Member</Text> */}
        </View>
    </View>
  );
}
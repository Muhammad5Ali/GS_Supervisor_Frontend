import { StyleSheet } from "react-native";
import COLORS from "../../constants/colors";

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F8F9FA',
      padding: 16
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8
    },
    headerTitle: {
       fontSize: 29,
       fontFamily: "JetBrainsMono-Medium",
       letterSpacing: 0.5,
       color: COLORS.primary,
       marginBottom: 8,
     },
    subHeader: {
      fontSize: 16,
      color: COLORS.textSecondary,
      textAlign: 'center',
      marginBottom: 24
    },
    trophyIcon: {
      marginBottom: 4
    },
    list: {
      paddingBottom: 16
    },
    reporterCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6
    },
    firstPlace: {
      borderWidth: 2,
      borderColor: '#FFD700',
      backgroundColor: '#FFF9E6'
    },
    secondPlace: {
      borderWidth: 2,
      borderColor: '#C0C0C0',
      backgroundColor: '#F8F8F8'
    },
    thirdPlace: {
      borderWidth: 2,
      borderColor: '#CD7F32',
      backgroundColor: '#FDF4E7'
    },
    rankBadge: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#EDF2F7',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16
    },
    firstBadge: {
      backgroundColor: '#FFF9E6',
      borderWidth: 2,
      borderColor: '#FFD700'
    },
    secondBadge: {
      backgroundColor: '#F8F8F8',
      borderWidth: 2,
      borderColor: '#C0C0C0'
    },
    thirdBadge: {
      backgroundColor: '#FDF4E7',
      borderWidth: 2,
      borderColor: '#CD7F32'
    },
    rankText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: COLORS.textPrimary,
      position: 'absolute'
    },
    firstRank: {
      color: '#D4AF37',
      fontSize: 20
    },
    secondRank: {
      color: '#A0A0A0',
      fontSize: 18
    },
    thirdRank: {
      color: '#B08D57',
      fontSize: 16
    },
    avatarContainer: {
      position: 'relative',
      marginRight: 16
    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      borderWidth: 2,
      borderColor: '#E2E8F0'
    },
    crownContainer: {
      position: 'absolute',
      top: -8,
      right: -8,
      backgroundColor: 'white',
      borderRadius: 12,
      padding: 4,
      elevation: 2
    },
    reporterInfo: {
      flex: 1
    },
    username: {
      fontSize: 18,
      fontWeight: '700',
      color: COLORS.textPrimary,
      marginBottom: 8
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    statText: {
      fontSize: 14,
      color: COLORS.textSecondary,
      marginLeft: 6
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40
    },
    emptyText: {
      color: COLORS.textSecondary,
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 8
    },
    emptySubtext: {
      color: COLORS.textSecondary,
      fontSize: 14,
      textAlign: 'center'
    },
    errorText: {
      color: COLORS.error,
      fontSize: 16,
      textAlign: 'center',
      marginTop: 20
    },
 
  });
  export default styles;
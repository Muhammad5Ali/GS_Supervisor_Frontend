// styles/home.styles.js
import { StyleSheet } from "react-native";
import COLORS from "../../constants/colors";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80, 
  },
  header: {
  alignItems: 'center',
  paddingBottom: 15,
  marginBottom: 10,
},
headerTitle: {
  fontSize: 29,
  fontFamily: "JetBrainsMono-Medium",
  letterSpacing: 0.5,
  color: COLORS.primary,
  position: 'relative',
},
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  reportCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    marginBottom: 20,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  username: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  reportImageContainer: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    backgroundColor: COLORS.border,
  },
  reportImage: {
    width: "100%",
    height: "100%",
  },
  reportDetails: {
    padding: 4,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  caption: {
    fontSize: 14,
    color: COLORS.textDark,
    marginBottom: 8,
    lineHeight: 20,
  },
  date: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  footerLoader: {
    marginVertical: 20,
  },
headerTitleContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 5,
},
leafContainer: {
  position: 'absolute',
  right: -34, // Adjust based on your font
  bottom: -4, // Align with underline
  zIndex: 1,
},
headerIcon: {
  marginLeft: 8, // Space between text and icon
  transform: [{ rotate: '15deg' }],
  marginTop: 4, // Fine-tune this value for perfect vertical alignment
},
headerSubtitle: {
  fontSize: 14,
  color: COLORS.textSecondary,
  textAlign: 'center',
  paddingHorizontal: 20,
},
headerTitleContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center', // Center horizontally
  marginBottom: 5,
},
// In home.styles.js
rateLimitText: {
  color: COLORS.warning,
  textAlign: 'center',
  marginTop: 8,
  fontSize: 12,
},
footerContainer: {
  paddingVertical: 20,
  alignItems: 'center',
},
});

export default styles;
import { StyleSheet } from 'react-native';
import COLORS from "../../constants/colors";

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: COLORS.background,
  },
  resolvedBy: {
  fontSize: 12,
  color: COLORS.textSecondary,
  marginTop: 4,
},
emptyContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20,
  marginTop: 50,
},
emptyText: {
  fontSize: 18,
  fontWeight: '600',
  color: '#555',
  marginTop: 15,
  textAlign: 'center',
},
emptySubtext: {
  fontSize: 14,
  color: '#888',
  marginTop: 5,
  textAlign: 'center',
},
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reporterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  resolvedBy: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  content: {
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.textPrimary,
  },
  details: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  location: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  date: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: COLORS.textSecondary,
    fontSize: 16,
  },
   badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
   badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  badgePending: {
    backgroundColor: COLORS.warning, // Orange/Yellow
  },
  badgeInProgress: {
    backgroundColor: COLORS.info,    // Blue
  },
  badgeResolved: {
    backgroundColor: COLORS.success, // Green
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  // Add to your existing dashboard.styles
cardHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 8,
},
statusBadge: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 4,
  paddingHorizontal: 10,
  borderRadius: 12,
},
statusText: {
  color: 'white',
  fontWeight: 'bold',
  fontSize: 12,
  marginLeft: 4,
},
});
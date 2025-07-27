import { StyleSheet } from 'react-native';
import COLORS from '../../constants/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: COLORS.primary,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.textPrimary,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  statusPending: {
    backgroundColor: COLORS.warning,
  },
  statusInProgress: {
    backgroundColor: COLORS.info,
  },
  statusResolved: {
    backgroundColor: COLORS.success,
  },
  statusText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  details: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  address: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  date: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  supervisorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  supervisorName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
 mapContainer: {
  height: 200, // Keep height but remove other map-specific styles
  borderRadius: 8,
  overflow: 'hidden',
  marginTop: 10,
},
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
   markerContainer: {
    backgroundColor: COLORS.white,
    padding: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  markerTitle: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 12,
  }
});
import { StyleSheet } from 'react-native';
import COLORS from '../../constants/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 15,
  },
  locationButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  cameraButton: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  locationInfo: {
    backgroundColor: COLORS.cardBackground,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 5,
  },
  addressText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    marginTop: 10,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imagePicker: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  placeholderText: {
    marginTop: 10,
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  instructionText: {
    marginTop: 5,
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 300,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  Text:{
    color: COLORS.textSecondary,
    fontSize: 16,
  }
});
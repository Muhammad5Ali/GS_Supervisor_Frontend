import { StyleSheet } from 'react-native';
import COLORS from '../../constants/colors'; 

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    color: COLORS.darkGray,
  },
  input: {
    height: 50,
    borderColor: COLORS.lightGray,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 18,
    textAlign: 'center',
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  timerText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  cooldownText: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  // Updated resend button styles
  resendButton: {
    backgroundColor: COLORS.background,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginTop: 20,
    alignItems: 'center',
  },
  resendText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});
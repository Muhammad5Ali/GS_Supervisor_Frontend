import { StyleSheet } from 'react-native';
import COLORS from "../../constants/colors";

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: COLORS.primary,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inProgressButton: {
    backgroundColor: COLORS.warning,
  },
  resolvedButton: {
    backgroundColor: COLORS.success,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
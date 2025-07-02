// styles/create.styles.js
import { StyleSheet } from "react-native";
import COLORS from "../../constants/colors";

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  scrollViewStyle: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  locationPreview: {
  flex: 1,
  paddingVertical: 12,
},
coordinatesText: {
  fontSize: 14,
  color: COLORS.textPrimary,
  marginVertical: 2,
},
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  form: {
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: COLORS.textPrimary,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
    color: COLORS.textDark,
  },
  textArea: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    height: 100,
    color: COLORS.textDark,
  },
  typeButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  typeButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeButtonText: {
    color: COLORS.textSecondary,
  },
  typeButtonTextActive: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  imagePicker: {
    width: "100%",
    height: 200,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  placeholderContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 50,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  buttonIcon: {
    marginRight: 8,
  },
  imagePreviewContainer: {
  position: 'relative',
  borderRadius: 10,
  overflow: 'hidden',
},
validationOverlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},
invalidOverlay: {
  backgroundColor: 'rgba(220,50,50,0.7)',
},
validationText: {
  color: COLORS.white,
  marginTop: 8,
  fontWeight: 'bold',
},
errorText: {
  color: COLORS.error, // Make sure this is defined in your colors
  marginTop: 8,
  textAlign: 'center',
  fontSize: 14,
},
validationOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.7)',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 8,
},
locationHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 5
},
photoHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 5
},
refreshLink: {
  color: COLORS.primary,
  fontSize: 14,
  fontWeight: '500'
},
charCounter: {
  textAlign: 'right',
  fontSize: 12,
  color: COLORS.textSecondary,
  marginTop: 4
},
verifyingText: {
  textAlign: 'center',
  color: COLORS.warning || COLORS.primary,
  fontStyle: 'italic',
  marginVertical: 10,
},
validationText: {
  color: COLORS.white,
  marginTop: 8,
  fontWeight: 'bold',
},
imagePreviewContainer: {
  position: 'relative',
  width: '100%',
  height: 200,
},
verificationContainer: {
  padding: 10,
  borderRadius: 8,
  marginVertical: 10,
  alignItems: 'center'
},
classificationBadge: {
  position: 'absolute',
  bottom: 10,
  left: 10,
  right: 10,
  backgroundColor: 'rgba(0,0,0,0.7)',
  padding: 8,
  borderRadius: 8,
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center'
},
badgeText: {
  color: 'white',
  fontWeight: 'bold',
  marginRight: 5
},
instructionText: {
  color: COLORS.textSecondary,
  fontSize: 12,
  textAlign: 'center',
  marginTop: 10,
  lineHeight: 16
},
verificationText: {
  fontSize: 16,
  fontWeight: 'bold'
},
verifiedSuccess: {
  color: 'green'
},
verifiedWarning: {
  color: 'orange'
},
verifiedError: {
  color: 'red'
},
});

export default styles;
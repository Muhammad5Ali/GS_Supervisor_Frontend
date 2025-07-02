import {
View,
Text,
KeyboardAvoidingView,
Platform,
ScrollView,
TextInput,
TouchableOpacity,
Alert,
Image,
ActivityIndicator
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import styles from "../../assets/styles/create.styles";
import { Ionicons } from "@expo/vector-icons";
import COLORS from '../../constants/colors';
import * as ImagePicker from "expo-image-picker";
import * as Location from 'expo-location';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import useAuthStore from '../../store/authStore';
import { API_URL } from '../../constants/api';
import { Buffer } from 'buffer';

export default function CreateComplaint() {
const [title, setTitle] = useState("");
const [details, setDetails] = useState("");
const [address, setAddress] = useState("");
const [image, setImage] = useState(null);
const [imageBase64, setImageBase64] = useState(null);
const [loading, setLoading] = useState(false);
const [verifying, setVerifying] = useState(false);
const [locationLoading, setLocationLoading] = useState(false);
const [locationCoords, setLocationCoords] = useState(null);
const [photoTimestamp, setPhotoTimestamp] = useState(null);
const [reportType, setReportType] = useState('standard'); 
const [verificationStatus, setVerificationStatus] = useState(null);
const [verificationMessage, setVerificationMessage] = useState(null);
const [classificationResult, setClassificationResult] = useState(null);
const router = useRouter();
const { token } = useAuthStore();

useEffect(() => {
  (async () => {
    // Request both permissions upfront
    const [locationStatus, cameraStatus] = await Promise.all([
      Location.requestForegroundPermissionsAsync(),
      ImagePicker.requestCameraPermissionsAsync()
    ]);
    
    if (locationStatus.status !== 'granted') {
      Alert.alert(
        'Location Permission', 
        'Location access is required for accurate reporting'
      );
    }
    
    if (cameraStatus.status !== 'granted') {
      Alert.alert(
        'Camera Permission', 
        'Camera access is required to take photos of waste'
      );
    }
  })();
}, []);
  
const captureLocation = async () => {
  try {
    setLocationLoading(true);
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      timeout: 10000
    });

    setLocationCoords(location.coords);

    const geocode = await Location.reverseGeocodeAsync(location.coords);
    if (geocode.length > 0) {
      const firstResult = geocode[0];
      const addressParts = [
        firstResult.name,
        firstResult.street,
        `${firstResult.city}, ${firstResult.region} ${firstResult.postalCode}`,
        firstResult.country
      ].filter(Boolean);
      
      setAddress(addressParts.join('\n'));
    }
  } catch (error) {
    Alert.alert(
      "Location Error", 
      "Could not get location. Please ensure location services are enabled."
    );
    console.error("Location Error:", error);
  } finally {
    setLocationLoading(false);
  }
};

const takePhoto = async () => {
  try {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true,
      exif: true 
    });

    if (!result.canceled && result.assets?.length > 0) {
      const asset = result.assets[0];
      let timestamp = new Date().toISOString();

      // Extract timestamp from EXIF if available
      if (asset.exif?.DateTimeOriginal) {
        try {
          const [date, time] = asset.exif.DateTimeOriginal.split(' ');
          const [year, month, day] = date.split(':');
          const [hour, minute, second] = time.split(':');
          timestamp = new Date(
            parseInt(year, 10),
            parseInt(month, 10) - 1,
            parseInt(day, 10),
            parseInt(hour, 10),
            parseInt(minute, 10),
            parseInt(second, 10)
          ).toISOString();
        } catch (e) {
          console.warn("Failed to parse EXIF date", e);
        }
      }

      // 📉 Resize + recompress at 0.7 quality, get raw base64
      const compressedImage = await manipulateAsync(
        asset.uri,
        [{ resize: { width: 640 } }],
        {
          compress: 0.7,            // <-- bump quality to 0.7
          format: SaveFormat.JPEG,
          base64: true              // get base64 straight back
        }
      );

      if (compressedImage.base64) {
        // 🔍 Log the length of the base64 string
        console.log("Base64 length:", compressedImage.base64.length);

        // ✅ Use directly, no need to strip prefix yourself
        setImage(compressedImage.uri);
        setImageBase64(compressedImage.base64);
        setPhotoTimestamp(timestamp);
      }
    }
  } catch (error) {
    console.error("Camera Error:", error);
    Alert.alert(
      "Camera Error",
      "Failed to capture photo. Please try again."
    );
  }
};

const validateForm = () => {
  const errors = [];
  
  if (!title.trim()) errors.push('Complaint title');
  if (!details.trim()) errors.push('Issue details');
  if (!address.trim()) errors.push('Location address');
  if (!imageBase64) errors.push('Evidence photo');
  if (!locationCoords) errors.push('GPS coordinates');
  
  return errors;
};

/*
Place these functions inside your React Native screen/component where you handle report submissions.
Make sure you have the following in scope:
  • title, details, address (useState strings)
  • image, imageBase64, locationCoords, photoTimestamp, reportType (useState)
  • token, API_URL, router (Next.js router or React Navigation)
  • setLoading, setVerifying (useState booleans)
  • validateForm(), takePhoto() helpers
*/

// Common payload for both normal and forced submits
const payloadBase = (classificationResult = null) => ({
  title: title.trim(),
  details: details.trim(),
  address: address.trim(),
  image: imageBase64,
  latitude: locationCoords.latitude,
  longitude: locationCoords.longitude,
  photoTimestamp,
  reportType,
  ...(classificationResult && { classification: classificationResult })
});

const testClassification = async () => {
  try {
    const pureBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const response = await fetch(`${API_URL}/classify/test`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ image: pureBase64 }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Service error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("Classification result:", JSON.stringify(result, null, 2));
    
    // 🔐 Store result for UI or submission use
    setClassificationResult(result);

    // 🎯 Handle different verification levels
    switch (result.verification) {
      case "high_confidence":
        if (result.isVerifiedWaste) {
          Alert.alert(
            "Verified Waste",
            `AI verified waste with ${(result.confidence * 100).toFixed(1)}% confidence.`,
            [
              { 
                text: "Submit Report", 
                onPress: () => handleSubmit(true) 
              }
            ]
          );
          return true;
        } else {
          Alert.alert(
            "Verified Non-Waste",
            `AI verified this is not waste (${(result.confidence * 100).toFixed(1)}% confidence).`,
            [
              { text: "Retake Photo", onPress: takePhoto }
            ]
          );
          return false;
        }

      case "medium_confidence":
        Alert.alert(
          "Potential Waste Detected",
          `AI detected waste with ${(result.confidence * 100).toFixed(1)}% confidence.`,
          [
            { text: "Retake Photo", onPress: takePhoto },
            { text: "Submit Anyway", onPress: handleForceSubmit }
          ]
        );
        return false;

      case "unverified":
        Alert.alert(
          "Uncertain Classification",
          `AI is unsure about this image (${(result.confidence * 100).toFixed(1)}% confidence).`,
          [
            { text: "Retake Photo", onPress: takePhoto },
            { text: "Submit Anyway", onPress: handleForceSubmit }
          ]
        );
        return false;

      default:
        // Catch other unexpected cases
        Alert.alert(
          "Verification Failed",
          "AI service returned an unexpected result. Submit anyway?",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Submit Anyway", onPress: handleForceSubmit }
          ]
        );
        return false;
    }

  } catch (error) {
    console.error("Classification test failed:", error.message);
    
    Alert.alert(
      "Verification Failed",
      "AI service is unavailable. Submit anyway?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Submit Anyway", onPress: handleForceSubmit }
      ]
    );

    return false;
  }
};

// 1) Regular submit with AI check and "Try Anyway"
const handleSubmit = async (isVerified = false) => {
  // 0️⃣ Ensure we actually have an image
  if (!imageBase64) {
    return Alert.alert("Missing Image", "Please take a photo first");
  }

  // 1️⃣ Check base64 payload size (5 MB limit)
  const maxBytes = 5 * 1024 * 1024;
  const byteSize = Buffer.byteLength(imageBase64, "base64");
  if (byteSize > maxBytes) {
    return Alert.alert(
      "Image Too Large",
      `Your photo is ${(byteSize / (1024 * 1024)).toFixed(2)} MB; max is 5 MB.`
    );
  }

  // 2️⃣ Validate required fields
  const formErrors = validateForm();
  if (formErrors.length > 0) {
    return Alert.alert(
      "Missing Information",
      `Please provide: ${formErrors.join(", ")}`
    );
  }

  try {
    setLoading(true);
    setVerifying(true);
    setVerificationStatus(null);
    setVerificationMessage(null);

    // 🔍 Run AI classification check if not already verified
    if (!isVerified) {
      const isValidWaste = await testClassification();
      if (!isValidWaste) return;
    } else {
      // ✅ UI feedback if already verified (manual submit from "Submit Report")
      setVerificationStatus("high_confidence");
      // setVerificationMessage("✅ Verified waste - Submitting report...");
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // 📡 Submit the report with classification data
    const payload = payloadBase(classificationResult);

    const response = await fetch(`${API_URL}/report`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // 📖 Read raw text to handle edge-case responses
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error(`Invalid response from server: ${text.slice(0, 50)}`);
    }

    // 3️⃣ Handle HTTP errors
    if (!response.ok) {
      switch (data.code) {
        case "NOT_WASTE":
          return Alert.alert(
            "Invalid Waste",
            `AI detected: ${data.classification?.label || "Non-waste"}`
          );
        case "LOW_CONFIDENCE":
          return Alert.alert(
            "Low Confidence",
            `Confidence: ${((data.classification?.confidence ?? 0) * 100).toFixed(1)}%`
          );
        default:
          return Alert.alert(
            "Error",
            data.message || `Server error ${response.status}`
          );
      }
    }

    // 4️⃣ Success
    Alert.alert("Success", "Report submitted successfully!", [
      {
        text: "OK",
        onPress: () => {
          // reset form
          setTitle("");
          setDetails("");
          setAddress("");
          setImage(null);
          setImageBase64(null);
          setLocationCoords(null);
          setPhotoTimestamp(null);
          setReportType("standard");
          router.push("/");
        },
      },
    ]);

  } catch (error) {
    console.error("Submission Error:", error);
    let message = error.message || "Failed to submit report";

    if (message.includes("SERVICE_DOWN")) {
      message = "AI service is offline. Report submitted with basic checks.";
    } else if (message.includes("TIMEOUT")) {
      message = "Verification took too long. Report submitted with basic checks.";
    } else if (message.includes("GRADIO_TIMEOUT")) {
      message = "AI verification took too long. Please try again.";
    }

    Alert.alert("Notice", message);
  } finally {
    setLoading(false);
    setVerifying(false);
  }
};

// 2) Forced submit when user overrides AI check
const handleForceSubmit = async () => {
try {
  setLoading(true);
  setVerifying(true);

  const response = await fetch(`${API_URL}/report`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...payloadBase(),
      forceSubmit: true,
    }),
  });

  const text = await response.text();
  if (text.startsWith("<!DOCTYPE html")) {
    throw new Error("Server returned HTML error page");
  }
  const data = JSON.parse(text);

  if (!response.ok) {
    throw new Error(data.message || `Server error ${response.status}`);
  }

  Alert.alert("Success", "Report submitted with force flag.", [
    {
      text: "OK",
      onPress: () => {
        setTitle("");
        setDetails("");
        setAddress("");
        setImage(null);
        setImageBase64(null);
        setLocationCoords(null);
        setPhotoTimestamp(null);
        setReportType("standard");
        router.push("/");
      },
    },
  ]);

} catch (err) {
  console.error("Force Submission Error:", err);
  Alert.alert("Notice", err.message || "Failed to force submit report");
} finally {
  setLoading(false);
  setVerifying(false);
}
};



return (
  <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === "ios" ? "padding" : "height"}
  >
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Report a Waste Issue</Text>
          <Text style={styles.subTitle}>Help keep our environment clean</Text>
        </View>

        <View style={styles.form}>
          {/* Complaint Title */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Complaint Title*</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="document-text-outline"
                size={20}
                color={COLORS.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="e.g., Overflowing bin"
                placeholderTextColor={COLORS.placeholderText}
                value={title}
                onChangeText={setTitle}
                maxLength={100}
              />
            </View>
          </View>
          
          {/* Report Type */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Report Type*</Text>
            <View style={styles.typeButtonsContainer}>
              <TouchableOpacity 
                style={[
                  styles.typeButton, 
                  reportType === 'standard' && styles.typeButtonActive
                ]}
                onPress={() => setReportType('standard')}
              >
                <Text style={[
                  styles.typeButtonText,
                  reportType === 'standard' && styles.typeButtonTextActive
                ]}>
                  Standard
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.typeButton, 
                  reportType === 'hazardous' && styles.typeButtonActive
                ]}
                onPress={() => setReportType('hazardous')}
              >
                <Text style={[
                  styles.typeButtonText,
                  reportType === 'hazardous' && styles.typeButtonTextActive
                ]}>
                  Hazardous
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.typeButton, 
                  reportType === 'large' && styles.typeButtonActive
                ]}
                onPress={() => setReportType('large')}
              >
                <Text style={[
                  styles.typeButtonText,
                  reportType === 'large' && styles.typeButtonTextActive
                ]}>
                  Large
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Location Group */}
          <View style={styles.formGroup}>
            <View style={styles.locationHeader}>
              <Text style={styles.label}>Location*</Text>
              <TouchableOpacity onPress={captureLocation} disabled={locationLoading}>
                <Text style={styles.refreshLink}>
                  {locationLoading ? 'Locating...' : 'Refresh Location'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.inputContainer}
              onPress={captureLocation}
              disabled={locationLoading}
            >
              <Ionicons
                name="location-outline"
                size={20}
                color={COLORS.textSecondary}
                style={styles.inputIcon}
              />
              <View style={styles.locationPreview}>
                {locationLoading ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : locationCoords ? (
                  <>
                    <Text style={styles.coordinatesText}>
                      Lat: {locationCoords.latitude.toFixed(5)}
                    </Text>
                    <Text style={styles.coordinatesText}>
                      Lon: {locationCoords.longitude.toFixed(5)}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.placeholderText}>Tap to capture location</Text>
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Address */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Exact Address*</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="pencil-outline"
                size={20}
                color={COLORS.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter or capture address"
                placeholderTextColor={COLORS.placeholderText}
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          
          {/* Photo */}
<View style={styles.formGroup}>
  <View style={styles.photoHeader}>
    <Text style={styles.label}>Evidence Photo*</Text>
    {image && (
      <TouchableOpacity onPress={() => { 
        setImage(null); 
        setImageBase64(null);
        setClassificationResult(null); // Reset AI result
      }}>
        <Text style={styles.refreshLink}>Retake</Text>
      </TouchableOpacity>
    )}
  </View>

  <TouchableOpacity 
    style={styles.imagePicker} 
    onPress={takePhoto}
    disabled={loading}
  >
    {image ? (
      <View style={styles.imagePreviewContainer}>
        <Image source={{ uri: image }} style={styles.previewImage} />

        {/* AI classification badge */}
        {classificationResult && (
          <View style={styles.classificationBadge}>
            <Text style={styles.badgeText}>
              {classificationResult.label} (
              {(classificationResult.confidence * 100).toFixed(1)}%
              )
            </Text>
            {classificationResult.isVerifiedWaste && (
              <Ionicons name="checkmark-circle" size={20} color="green" />
            )}
          </View>
        )}

        {/* Loading overlay */}
        {loading && (
          <View style={styles.validationOverlay}>
            <ActivityIndicator size="large" color={COLORS.white} />
            <Text style={styles.validationText}>Verifying waste...</Text>
          </View>
        )}
      </View>
    ) : (
      <View style={styles.placeholderContainer}>
        <Ionicons name="camera-outline" size={40} color={COLORS.textSecondary} />
        <Text style={styles.placeholderText}>Tap to take photo</Text>
        <Text style={styles.instructionText}>
          Focus on waste items only{"\n"}
          Avoid hands, feet, or people{"\n"}
          Capture clear, well-lit images
        </Text>
      </View>
    )}
  </TouchableOpacity>
</View>


          {/* Details */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Issue Details*</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={20}
                color={COLORS.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe the waste issue in detail..."
                placeholderTextColor={COLORS.placeholderText}
                value={details}
                onChangeText={setDetails}
                multiline
                numberOfLines={5}
                maxLength={500}
              />
            </View>
            <Text style={styles.charCounter}>
              {details.length}/500 characters
            </Text>
          </View>
            {/* Verifying Message */}
          {verifying && (
            <Text style={styles.verifyingText}>
              Verifying waste image...
            </Text>
          )}
          {/* Verification Result Message */}
{verificationMessage && (
  <View style={styles.verificationContainer}>
    <Text style={[
      styles.verificationText,
      verificationStatus === 'high_confidence' && styles.verifiedSuccess,
      verificationStatus === 'medium_confidence' && styles.verifiedWarning,
      verificationStatus === 'unverified' && styles.verifiedError
    ]}>
      {verificationMessage}
    </Text>
  </View>
)}

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.button, (loading || !imageBase64) && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading || !imageBase64}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Ionicons
                  name="send-outline"
                  size={20}
                  color={COLORS.white}
                  style={styles.buttonIcon}
                />
                <Text style={styles.buttonText}>Submit Report</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  </KeyboardAvoidingView>
);
}
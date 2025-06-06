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
import { useAuthStore } from '../../store/authStore';
import { API_URL } from '../../constants/api';

export default function CreateComplaint() {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [address, setAddress] = useState("");
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false); // New loading state
  const [locationCoords, setLocationCoords] = useState(null);
  const [photoTimestamp, setPhotoTimestamp] = useState(null);
  const [reportType, setReportType] = useState('standard'); 

  const router = useRouter();
  const { token } = useAuthStore();

  // Request location permission on mount
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Location access is required to submit reports');
      }
    })();
  }, []);

  // Handle location capture
  const captureLocation = async () => {
    try {
      setLocationLoading(true); // Start loading
       const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Location timeout")), 15000)
    );
      const location = await Promise.race([
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High
        }),
        timeoutPromise
      ]);

      setLocationCoords(location.coords);

      const geocode = await Location.reverseGeocodeAsync(location.coords);
      if (geocode.length > 0) {
        const firstResult = geocode[0];
        const formattedAddress = [
          firstResult.name,
          firstResult.street,
          firstResult.city,
          firstResult.region,
          firstResult.postalCode,
          firstResult.country
        ].filter(Boolean).join(', ');
        setAddress(formattedAddress);
      }
    } catch (error) {
      Alert.alert("Location Error", "Failed to get current location");
      console.error("Location Error:", error);
    } finally {
      setLocationLoading(false); // End loading
    }
  };

  // Capture photo with camera

const takePhoto = async () => {
    try {
      // First capture location
      if (!locationCoords) {
        Alert.alert("Location Required", "Please capture location first");
        return;
      }
      
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Required", "Camera access is required to take photos");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true,
        exif: true 
      });

      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];
        // Extract timestamp from EXIF if available
      let photoTimestamp;
      if (asset.exif && asset.exif.DateTimeOriginal) {
        // Convert EXIF date string to ISO format
        const [datePart, timePart] = asset.exif.DateTimeOriginal.split(' ');
        const [year, month, day] = datePart.split(':');
        const [hour, minute, second] = timePart.split(':');
        photoTimestamp = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          parseInt(hour),
          parseInt(minute),
          parseInt(second)
        ).toISOString();
      } else {
        // Fallback to current time
        photoTimestamp = new Date().toISOString();
      }

      
        const timestamp = new Date();
        
        const compressedImage = await manipulateAsync(
          asset.uri,
          [{ resize: { width: 800 } }],
          {
            compress: 0.6,
            format: SaveFormat.JPEG,
            base64: true,
          }
        );

        setImage(compressedImage.uri);
        setImageBase64(compressedImage.base64);
       setPhotoTimestamp(photoTimestamp);
      }
    } catch (error) {
      console.error("Camera Error:", error);
      Alert.alert("Error", "Failed to capture photo");
    }
  };


  const handleSubmit = async () => {
    const trimmedTitle = title.trim();
    const trimmedDetails = details.trim();
    const trimmedAddress = address.trim();

    if (!trimmedTitle || !trimmedDetails || !trimmedAddress || !imageBase64 || !locationCoords) {
      Alert.alert("Missing Information", "All fields are required");
      return;
    }
    // Add image size validation
  if (imageBase64 && imageBase64.length > 5 * 1024 * 1024) { // 5MB limit
     Alert.alert(
    "Image Too Large", 
    "Please reduce image size. Max 5MB allowed.",
    [{ text: "Retry", onPress: takePhoto }] // Add retry option
  );
    return;
  }

    try {
      setLoading(true);

      // const imageDataUrl = `data:image/jpeg;base64,${imageBase64}`;
      // To: (Send raw base64 without prefix)
     const imageData = imageBase64;

      const response = await fetch(`${API_URL}/report`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: trimmedTitle,
          details: trimmedDetails,
          address: trimmedAddress,
          image: imageData,
          latitude: locationCoords.latitude,
          longitude: locationCoords.longitude,
          photoTimestamp,
          createdTime: new Date().toISOString(),
          reportType: reportType
        }),
      });

      const responseText = await response.text();
      
      if (responseText.startsWith("<!DOCTYPE html")) {
        throw new Error("Server error - invalid response");
      }

      const responseData = JSON.parse(responseText);

      if (!response.ok) {
        throw new Error(responseData.message || `Server error: ${response.status}`);
      }

      Alert.alert("Success", "Report submitted successfully!");
      // Reset form
      setTitle("");
      setDetails("");
      setAddress("");
      setImage(null);
      setImageBase64(null);
      setLocationCoords(null);
      router.push("/");
    } catch (error) {
      console.error("Submission Error:", error);
      Alert.alert(
        "Submission Failed", 
        error.message || "Failed to submit report. Check your connection."
      );
    } finally {
      setLoading(false);
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
              <Text style={styles.label}>Complaint Title</Text>
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
                />
              </View>
            </View>
            {/*  Buttons (better UX) */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Report Type</Text>
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
            <View style={styles.formGroup}>
      <Text style={styles.label}>Location</Text>
      <TouchableOpacity 
        style={styles.inputContainer}
        onPress={captureLocation}
        disabled={locationLoading} // Disable during loading
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

    {/* Exact Address - MODIFIED (now read-only) */}
    <View style={styles.formGroup}>
      <Text style={styles.label}>Exact Address</Text>
      <View style={styles.inputContainer}>
        <Ionicons
          name="pencil-outline"
          size={20}
          color={COLORS.textSecondary}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder={
            locationCoords 
              ? "Address captured automatically" 
              : "Capture location to get address"
          }
          placeholderTextColor={COLORS.placeholderText}
          value={address}
          onChangeText={setAddress}
          multiline
          editable={false} // Make non-editable
        />
      </View>
    </View>

            {/* Photo Capture */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Evidence Photo</Text>
              <TouchableOpacity 
                style={styles.imagePicker} 
                onPress={takePhoto}
                disabled={loading}
              >
                {image ? (
                  <Image source={{ uri: image }} style={styles.previewImage} />
                ) : (
                  <View style={styles.placeholderContainer}>
                    <Ionicons name="camera-outline" size={40} color={COLORS.textSecondary} />
                    <Text style={styles.placeholderText}>Tap to take photo</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Details */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Issue in Detail</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={20}
                  color={COLORS.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Detailed description..."
                  placeholderTextColor={COLORS.placeholderText}
                  value={details}
                  onChangeText={setDetails}
                  multiline
                  numberOfLines={4}
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.button, loading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={loading}
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
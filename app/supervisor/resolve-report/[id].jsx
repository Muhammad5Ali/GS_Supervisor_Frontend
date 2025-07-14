import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  Alert,
  StyleSheet
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import useAuthStore from '../../../store/authStore';
import { API_URL } from '../../../constants/api';
import COLORS from '../../../constants/colors';
import styles from '../../../assets/styles/resolveReport.styles';
import { Ionicons } from '@expo/vector-icons';

export default function ResolveReportScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { token } = useAuthStore();
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);

  // Request camera permissions on mount
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission', 
          'Camera access is required to take photos of cleaned areas'
        );
      }
    })();
  }, []);

  // Capture current location
  const captureLocation = async () => {
    try {
      setIsCapturingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission', 
          'Location access is required to verify cleanup'
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 15000
      });

      setLocation(location.coords);

      // Reverse geocode to get address
      const geocode = await Location.reverseGeocodeAsync(location.coords);
      if (geocode.length > 0) {
        const firstResult = geocode[0];
        setAddress(
          [firstResult.street, firstResult.city, firstResult.region, firstResult.country]
            .filter(Boolean)
            .join(', ')
        );
      }
    } catch (error) {
      console.error("Location Error:", error);
      Alert.alert(
        "Location Error", 
        "Could not get location. Please ensure location services are enabled."
      );
    } finally {
      setIsCapturingLocation(false);
    }
  };

  // Take photo of cleaned area
  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true
      });

      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];
        
        // Compress image
        const compressedImage = await manipulateAsync(
          asset.uri,
          [{ resize: { width: 800 } }],
          {
            compress: 0.8,
            format: SaveFormat.JPEG,
            base64: true
          }
        );

        if (compressedImage.base64) {
          const fullBase64 = `data:image/jpeg;base64,${compressedImage.base64}`;
          setImage(compressedImage.uri);
          setImageBase64(fullBase64);
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

  // Submit resolution data
  const submitResolution = async () => {
    if (!imageBase64) {
      return Alert.alert("Missing Image", "Please take a photo of the cleaned area");
    }
    
    if (!location) {
      return Alert.alert("Missing Location", "Please capture your current location");
    }

    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_URL}/supervisor/reports/${id}/resolve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          image: imageBase64,
          latitude: location.latitude,
          longitude: location.longitude,
          address
        })
      });

      if (!response.ok) {
        throw new Error('Failed to resolve report');
      }

      Alert.alert("Success", "Report resolved successfully!", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error("Resolution Error:", error);
      Alert.alert("Error", error.message || "Failed to resolve report");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resolve Waste Report</Text>
      <Text style={styles.subtitle}>Capture proof of cleanup</Text>

      {/* Location Capture */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location Verification</Text>
        <TouchableOpacity 
          style={styles.locationButton}
          onPress={captureLocation}
          disabled={isCapturingLocation}
        >
          {isCapturingLocation ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Capture Current Location</Text>
          )}
        </TouchableOpacity>
        
        {location && (
          <View style={styles.locationInfo}>
            <Text style={styles.infoText}>
              Lat: {location.latitude.toFixed(6)}
            </Text>
            <Text style={styles.infoText}>
              Lon: {location.longitude.toFixed(6)}
            </Text>
            {address ? (
              <Text style={styles.addressText}>{address}</Text>
            ) : null}
          </View>
        )}
      </View>

      {/* Photo Capture - Updated with camera icon */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Proof of Cleanup</Text>
        <TouchableOpacity 
          style={styles.imagePicker} 
          onPress={takePhoto}
        >
          {image ? (
            <Image source={{ uri: image }} style={styles.imagePreview} />
          ) : (
            <View style={styles.placeholderContainer}>
              <Ionicons name="camera-outline" size={40} color={COLORS.textSecondary} />
              <Text style={styles.placeholderText}>Tap to take photo</Text>
              <Text style={styles.instructionText}>
                Capture clear image of cleaned area
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={styles.submitButton}
        onPress={submitResolution}
        disabled={isLoading || !imageBase64 || !location}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Submit Resolution</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

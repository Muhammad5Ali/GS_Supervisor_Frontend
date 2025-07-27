import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  ActivityIndicator, 
  ScrollView, 
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../../../store/authStore';
import { API_URL } from '../../../constants/api';
import LeafletMap from '../../../components/LeafletMap';
import ComparisonMap from '../../../components/ComparisonMap';
import COLORS from '../../../constants/colors';

const SafeText = ({ value, style, fallback = '', ...props }) => (
  <Text style={style} {...props}>
    {value === null || value === undefined ? fallback : String(value)}
  </Text>
);

export default function PermanentResolvedDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/supervisor/reports/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch report details');
        }

        const data = await response.json();
        setReport(data.report);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.container}>
        <Text>Report not found</Text>
      </View>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid date format';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Permanent Resolved Report</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.section}>
        <SafeText 
          style={styles.title} 
          value={report.title} 
          fallback="Untitled Report" 
        />
        <View style={styles.statusBadgePermanent}>
          <Text style={styles.statusText}>Permanently Resolved</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Original Report</Text>
        {report.image ? (
          <Image 
            source={{ uri: report.image }} 
            style={styles.image} 
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Text>No Image Available</Text>
          </View>
        )}
        <SafeText 
          style={styles.details} 
          value={report.details} 
          fallback="No details provided"
        />
        <SafeText 
          style={styles.address} 
          value={report.address} 
          fallback="Address not available"
        />
        
        {report.location?.coordinates && (
          <View style={{ marginVertical: 10 }}>
            <Text style={styles.mapSubtitle}>Report Location</Text>
            <LeafletMap 
              coordinates={report.location.coordinates}
              title="Report Location"
              style={styles.mapContainer}
            />
          </View>
        )}
        
        <SafeText 
          style={styles.date}
          value={`Reported on: ${formatDate(report.createdAt)}`} 
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resolution Details</Text>
        {report.resolvedImage ? (
          <Image 
            source={{ uri: report.resolvedImage }} 
            style={styles.image} 
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Text>No Cleanup Image</Text>
          </View>
        )}
        <SafeText 
          style={styles.details}
          value={report.resolvedAddress} 
          fallback="No cleanup address provided"
        />
        {report.resolvedBy && (
          <View style={styles.supervisorContainer}>
            {report.resolvedBy.profileImage ? (
              <Image 
                source={{ uri: report.resolvedBy.profileImage }} 
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.placeholderAvatar]}>
                <Ionicons name="person" size={20} color={COLORS.darkGray} />
              </View>
            )}
            <View style={styles.supervisorInfo}>
              <SafeText 
                style={styles.supervisorName}
                value={report.resolvedBy.username} 
                fallback="Unknown supervisor"
              />
              {report.resolvedBy.email && (
                <SafeText 
                  style={styles.supervisorEmail}
                  value={`Email: ${report.resolvedBy.email}`} 
                />
              )}
            </View>
          </View>
        )}
        <SafeText 
          style={styles.date}
          value={`Resolved on: ${formatDate(report.resolvedAt)}`} 
        />
      </View>

      {report.resolvedLocation?.coordinates && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cleanup Location</Text>
          <LeafletMap 
            coordinates={report.resolvedLocation.coordinates}
            title="Cleanup Location"
            style={styles.mapContainer}
          />
        </View>
      )}
      
      {report.location?.coordinates && report.resolvedLocation?.coordinates && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location Comparison</Text>
          <ComparisonMap 
            pointA={report.location.coordinates}
            pointB={report.resolvedLocation.coordinates}
            titleA="Reported Location"
            titleB="Cleanup Location"
          />
          <Text style={styles.comparisonNote}>
            R = Reported Location • C = Cleanup Location
          </Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Permanent Closure</Text>
        
        {report.permanentlyResolvedBy && (
          <View style={styles.adminContainer}>
            {report.permanentlyResolvedBy.profileImage ? (
              <Image 
                source={{ uri: report.permanentlyResolvedBy.profileImage }} 
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.placeholderAvatar]}>
                <Ionicons name="person" size={20} color={COLORS.darkGray} />
              </View>
            )}
            <View style={styles.adminInfo}>
              <SafeText 
                style={styles.adminName}
                value={report.permanentlyResolvedBy.username} 
                fallback="GSAdmin"
              />
              {report.permanentlyResolvedBy.email && (
                <SafeText 
                  style={styles.adminEmail}
                  value={`Email: ${report.permanentlyResolvedBy.email}`} 
                />
              )}
            </View>
          </View>
        )}
        
        <View style={styles.distanceContainer}>
          <Ionicons name="locate" size={20} color={COLORS.primary} />
          <SafeText 
            style={styles.distanceText}
            value={`Verified within ${report.distanceToReported?.toFixed(2) || 'N/A'} meters`} 
          />
        </View>
        
        <SafeText 
          style={styles.date}
          value={`Permanently closed on: ${formatDate(report.permanentlyResolvedAt)}`} 
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  statusBadgePermanent: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: COLORS.persuccess,
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
  placeholder: {
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderStyle: 'dashed',
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
    marginTop: 8,
  },
  supervisorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  supervisorInfo: {
    marginLeft: 10,
    flex: 1,
  },
  supervisorName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  supervisorEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  placeholderAvatar: {
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  mapSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: COLORS.textPrimary,
  },
  adminContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  adminInfo: {
    marginLeft: 10,
  },
  adminName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  adminEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    padding: 10,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  distanceText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  comparisonNote: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginTop: 8,
  },
});
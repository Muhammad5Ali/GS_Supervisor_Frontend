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
import { format } from 'date-fns';

const SafeText = ({ value, style, fallback = '', ...props }) => (
  <Text style={style} {...props}>
    {value === null || value === undefined ? fallback : String(value)}
  </Text>
);

export default function RejectedReportDetails() {
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
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading report details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => fetchReport()}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
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

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rejected Report Details</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Report Status */}
      <View style={styles.section}>
        <View style={[styles.statusBadge, styles.statusRejected]}>
          <Text style={styles.statusText}>Rejected</Text>
        </View>
      </View>

      {/* Original Report Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Original Report</Text>
        
        <SafeText 
          style={styles.title} 
          value={report.title} 
          fallback="Untitled Report" 
        />
        
        {report.image && (
          <Image 
            source={{ uri: report.image }} 
            style={styles.image} 
            resizeMode="cover"
          />
        )}
        
        <SafeText 
          style={styles.details} 
          value={report.details} 
          fallback="No details provided"
        />
        
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={20} color={COLORS.primary} />
          <SafeText 
            style={styles.address} 
            value={report.address} 
            fallback="Address not available"
          />
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
          <Text style={styles.date}>
            Reported on: {report.createdAt ? 
              format(new Date(report.createdAt), 'dd MMM yyyy, h:mm a') : 
              'Date not available'}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={20} color={COLORS.primary} />
          <SafeText 
            style={styles.user} 
            value={report.user?.username} 
            fallback="Unknown user"
          />
        </View>
        
        {report.location?.coordinates && (
          <View style={{ marginVertical: 10 }}>
            <Text style={styles.mapSubtitle}>Reported Location</Text>
            <LeafletMap 
              coordinates={report.location.coordinates}
              title="Report Location"
              style={styles.mapContainer}
            />
          </View>
        )}
      </View>

      {/* Resolution Attempt Section */}
      {report.resolvedImage && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cleanup Attempt</Text>
          
          <Image 
            source={{ uri: report.resolvedImage }} 
            style={styles.image} 
            resizeMode="cover"
          />
          
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color={COLORS.primary} />
            <SafeText 
              style={styles.address} 
              value={report.resolvedAddress} 
              fallback="Cleanup address not available"
            />
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
            <Text style={styles.date}>
              Cleanup attempted on: {report.resolvedAt ? 
                format(new Date(report.resolvedAt), 'dd MMM yyyy, h:mm a') : 
                'Date not available'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color={COLORS.primary} />
            <SafeText 
              style={styles.user} 
              value={report.resolvedBy?.username} 
              fallback="Unknown supervisor"
            />
          </View>
          
          {report.resolvedLocation?.coordinates && (
            <View style={{ marginVertical: 10 }}>
              <Text style={styles.mapSubtitle}>Cleanup Location</Text>
              <LeafletMap 
                coordinates={report.resolvedLocation.coordinates}
                title="Cleanup Location"
                style={styles.mapContainer}
              />
            </View>
          )}
        </View>
      )}

      {/* Location Comparison */}
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

      {/* Rejection Details Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rejection Details</Text>
        
        {report.rejectedBy && (
          <View style={styles.adminContainer}>
            {report.rejectedBy.profileImage ? (
              <Image 
                source={{ uri: report.rejectedBy.profileImage }} 
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
                value={report.rejectedBy.username} 
                fallback="GSAdmin"
              />
              <SafeText 
                style={styles.adminEmail}
                value={report.rejectedBy.email} 
                fallback="admin@gmail.com"
              />
            </View>
          </View>
        )}
        
        <View style={styles.rejectionContainer}>
          <Ionicons name="alert-circle" size={24} color={COLORS.error} />
          <SafeText 
            style={styles.rejectionReason}
            value={report.rejectionReason} 
            fallback="No reason provided"
          />
        </View>
        
        {report.rejectedAt && (
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
            <Text style={styles.date}>
              Rejected on: {report.rejectedAt ? 
                format(new Date(report.rejectedAt), 'dd MMM yyyy, h:mm a') : 
                'Date not available'}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    paddingBottom: 8,
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
  statusRejected: {
    backgroundColor: COLORS.error,
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
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  address: {
    marginLeft: 10,
    fontSize: 15,
    color: COLORS.text,
    flex: 1,
  },
  date: {
    marginLeft: 10,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  user: {
    marginLeft: 10,
    fontSize: 15,
    color: COLORS.text,
  },
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 10,
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
  rejectionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 12,
    padding: 10,
    backgroundColor: '#f8d7da',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  rejectionReason: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  comparisonNote: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginTop: 8,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 8,
    alignSelf: 'center',
  },
  retryText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
});
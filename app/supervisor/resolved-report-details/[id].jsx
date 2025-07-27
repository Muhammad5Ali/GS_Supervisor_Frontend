import React, { useState, useEffect } from 'react';
import { View, Text, Image, ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import useAuthStore from '../../../store/authStore';
import { API_URL } from '../../../constants/api';
import COLORS from '../../../constants/colors';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
// Import LeafletMap component
import LeafletMap from '../../../components/LeafletMap';
// Import the ComparisonMap component
import ComparisonMap from '../../../components/ComparisonMap';

export default function ResolvedReportDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { token } = useAuthStore();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('resolution'); // 'original', 'resolution', or 'comparison'

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/supervisor/reports/resolved/${id}`, {
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

  return (
    <ScrollView style={styles.container}>
      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'original' && styles.activeTab]}
          onPress={() => setActiveTab('original')}
        >
          <Text style={[styles.tabText, activeTab === 'original' && styles.activeText]}>
            Original
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'resolution' && styles.activeTab]}
          onPress={() => setActiveTab('resolution')}
        >
          <Text style={[styles.tabText, activeTab === 'resolution' && styles.activeText]}>
            Resolution
          </Text>
        </TouchableOpacity>
        
        {/* Added Comparison Tab */}
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'comparison' && styles.activeTab]}
          onPress={() => setActiveTab('comparison')}
        >
          <Text style={[styles.tabText, activeTab === 'comparison' && styles.activeText]}>
            Comparison
          </Text>
        </TouchableOpacity>
      </View>

      {/* Original Report Section */}
      {activeTab === 'original' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Original Report</Text>
          <Image 
            source={{ uri: report.image }} 
            style={styles.image} 
            resizeMode="cover"
          />
          <Text style={styles.title}>{report.title}</Text>
          <Text style={styles.details}>{report.details}</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color={COLORS.primary} />
            <Text style={styles.address}>{report.address}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
            <Text style={styles.date}>
              Reported on: {format(new Date(report.createdTime), 'dd MMM yyyy, h:mm a')}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color={COLORS.primary} />
            <Text style={styles.user}>
              Reported by: {report.user?.username}
            </Text>
          </View>
          
          {/* Map for Original Location */}
          {report.location?.coordinates && (
            <View style={styles.mapContainer}>
              <LeafletMap 
                coordinates={report.location.coordinates}
                title="Report Location"
                style={{ height: 250 }}
              />
            </View>
          )}
        </View>
      )}

      {/* Resolution Section */}
      {activeTab === 'resolution' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resolution Details</Text>
          <Image 
            source={{ uri: report.resolvedImage }} 
            style={styles.image} 
            resizeMode="cover"
          />
          
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color={COLORS.primary} />
            <Text style={styles.address}>{report.resolvedAddress}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
            <Text style={styles.date}>
              Resolved on: {format(new Date(report.resolvedAt), 'dd MMM yyyy, h:mm a')}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color={COLORS.primary} />
            <Text style={styles.user}>
              Resolved by: {report.resolvedBy?.username}
            </Text>
          </View>
          
          {/* Map for Resolution Location */}
          {report.resolvedLocation?.coordinates && (
            <View style={styles.mapContainer}>
              <LeafletMap 
                coordinates={report.resolvedLocation.coordinates}
                title="Cleanup Location"
                style={{ height: 250 }}
              />
            </View>
          )}
        </View>
      )}

      {/* Comparison Section */}
      {activeTab === 'comparison' && report.location?.coordinates && report.resolvedLocation?.coordinates && (
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.background,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabButton: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  activeText: {
    color: COLORS.white,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: COLORS.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    paddingBottom: 8,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.text,
  },
  details: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 15,
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
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 15,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  // Added style for comparison note
  comparisonNote: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginTop: 8,
  },
});
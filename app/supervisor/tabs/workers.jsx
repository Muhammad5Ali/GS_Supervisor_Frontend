import React, { useState, useEffect } from 'react';
import { 
  View, FlatList, Text, TouchableOpacity, 
  ActivityIndicator, StyleSheet, Alert, RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../../../store/authStore';
import { API_URL } from '../../../constants/api';
import COLORS from '../../../constants/colors';
import Loader from '../../../components/Loader';

// API Timeout function
const fetchWithTimeout = (url, options, timeout = 8000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]);
};

export default function WorkerListScreen() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [workerCache, setWorkerCache] = useState({});
  const { token, refreshToken } = useAuthStore();
  const router = useRouter();

  

  const fetchWorkers = async () => {
    try {
      const response = await fetchWithTimeout(`${API_URL}/workers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await response.json();
      setWorkers(data.workers || []);
      
      const newCache = {...workerCache};
      data.workers.forEach(worker => {
        newCache[worker._id] = worker;
      });
      setWorkerCache(newCache);
    } catch (error) {
      if (error.message === 'Request timeout') {
        Alert.alert('Error', 'Request timed out. Please try again.');
      } else if (error.message.includes('401')) {
        try {
          await refreshToken();
          const retryResponse = await fetchWithTimeout(`${API_URL}/workers`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const retryData = await retryResponse.json();
          setWorkers(retryData.workers || []);
        } catch (refreshError) {
          Alert.alert('Error', 'Session expired. Please log in again.');
          router.replace('/(auth)/login');
        }
      } else {
        Alert.alert('Error', 'Failed to fetch workers');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchWorkers();
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleRefresh = async () => {
    if (token) {
      setRefreshing(true);
      await fetchWorkers();
    }
  };

  const deleteWorker = async (workerId) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this worker?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: async () => {
            try {
              setDeletingId(workerId);
              const response = await fetchWithTimeout(
                `${API_URL}/workers/${workerId}`, 
                {
                  method: 'DELETE',
                  headers: { Authorization: `Bearer ${token}` }
                },
                8000
              );
              
              if (!response.ok) throw new Error('Failed to delete worker');
              
              setWorkers(workers.filter(w => w._id !== workerId));
              setWorkerCache(prev => {
                const newCache = {...prev};
                delete newCache[workerId];
                return newCache;
              });
              
              Alert.alert('Success', 'Worker deleted successfully');
            } catch (error) {
              if (error.message === 'Request timeout') {
                Alert.alert('Error', 'Delete request timed out. Please try again.');
              } else {
                Alert.alert('Error', error.message || 'Failed to delete worker');
              }
            } finally {
              setDeletingId(null);
            }
          } 
        }
      ]
    );
  };

  const getWorkerInfo = (workerId) => {
    return workerCache[workerId] || workers.find(w => w._id === workerId);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => router.push('/supervisor/workers/add')}
      >
        <Ionicons name="add" size={24} color="white" />
        <Text style={styles.addButtonText}>Add Worker</Text>
      </TouchableOpacity>
        <TouchableOpacity 
  style={styles.addButton}
  onPress={() => router.push('/supervisor/workers/attendance-history')}
>
  <Ionicons name="stats-chart-outline" size={24} color="white" />
  <Text style={styles.addButtonText}>Attendance Summary</Text>
</TouchableOpacity>


      {loading ? (
        <Loader />
      ) : (
        <FlatList
          data={workers}
          keyExtractor={item => item._id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          renderItem={({ item }) => {
            const worker = getWorkerInfo(item._id) || item;
            return (
              <TouchableOpacity 
                 style={styles.workerCard}
    onPress={() => {
      router.push({
        pathname: '/supervisor/workers/attendance/[id]',
        params: { id: item._id }
      });
    }}
  >
                <View style={styles.workerInfoContainer}>
                  <Text style={styles.workerName}>{worker.name}</Text>
                  <Text style={styles.workerDetails}>{worker.phone} • {worker.area}</Text>
                </View>
                
                <View style={styles.actionsContainer}>
                  {deletingId === item._id ? (
                    <ActivityIndicator size="small" color={COLORS.error} />
                  ) : (
                    <TouchableOpacity 
                      onPress={() => deleteWorker(item._id)}
                      style={styles.deleteButton}
                    >
                      <Ionicons name="trash-bin-outline" size={20} color={COLORS.error} />
                    </TouchableOpacity>
                  )}
                  <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color={COLORS.lightGray} />
              <Text style={styles.emptyText}>No workers added yet</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16,
    backgroundColor: COLORS.background,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  addButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16
  },
  workerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  workerInfoContainer: {
    flex: 1,
  },
  workerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  workerDetails: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    padding: 8,
    marginRight: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 16,
    color: COLORS.textSecondary,
    fontSize: 16,
  }
});
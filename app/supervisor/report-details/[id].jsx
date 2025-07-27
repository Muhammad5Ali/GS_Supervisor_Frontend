import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import styles from '../../../assets/styles/reportDetail.styles';
import useAuthStore from '../../../store/authStore';
import { API_URL } from '../../../constants/api';

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [updating, setUpdating] = useState(false);
  const [report, setReport] = useState(null);
  const [comment, setComment] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeMode, setActiveMode] = useState(null); // 'in-progress' or 'out-of-scope'

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(`${API_URL}/supervisor/reports/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch report details');
        }
        
        const data = await response.json();
        setReport(data.report);
      } catch (error) {
        Alert.alert('Error', error.message || 'Could not load report details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReport();
  }, [id, token]);

  const handleStatusUpdate = async (status) => {
    setUpdating(true);
    try {
      let endpoint, method, body;
      
      if (status === 'out-of-scope') {
        endpoint = `${API_URL}/supervisor/reports/${id}/out-of-scope`;
        method = 'PUT';
        body = JSON.stringify({ reason });
      } else {
        endpoint = `${API_URL}/supervisor/reports/${id}/status`;
        method = 'PUT';
      body = JSON.stringify({ 
  status,
  assignedTo: user?._id,
  assignedMsg: status === 'in-progress' ? comment : undefined // Changed key name
})
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update status');
      }
      
      Alert.alert('Success', `Report status updated to ${status}`);
      router.back();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.container}>
        <Text style={extendedStyles.errorText}>Report not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Update Report Status</Text>
      
      {/* Mode Selection Buttons */}
      {!activeMode && (
        <View style={extendedStyles.buttonGroup}>
          <TouchableOpacity 
            style={[styles.button, extendedStyles.inProgressButton]}
            onPress={() => setActiveMode('in-progress')}
          >
            <Text style={styles.buttonText}>Mark as In Progress</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, extendedStyles.outOfScopeButton]}
            onPress={() => setActiveMode('out-of-scope')}
          >
            <Text style={styles.buttonText}>Mark as Out of Scope</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* In Progress Section */}
      {activeMode === 'in-progress' && (
        <>
          <Text style={extendedStyles.sectionTitle}>Add Comment</Text>
          <TextInput
            style={extendedStyles.input}
            placeholder="Describe the action being taken..."
            placeholderTextColor="#999"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
          />
          
          <View style={extendedStyles.actionRow}>
            <TouchableOpacity 
              style={[styles.button, extendedStyles.cancelButton]}
              onPress={() => setActiveMode(null)}
              disabled={updating}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, extendedStyles.inProgressButton]}
              onPress={() => handleStatusUpdate('in-progress')}
              disabled={updating || !comment.trim()}
            >
              {updating ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Confirm</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
    )}
      
      {/* Out of Scope Section */}
      {activeMode === 'out-of-scope' && (
        <>
          <Text style={extendedStyles.sectionTitle}>Reason for Out of Scope</Text>
          <TextInput
            style={extendedStyles.input}
            placeholder="Explain why this report is out of scope..."
            placeholderTextColor="#999"
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={4}
          />
          
          <View style={extendedStyles.actionRow}>
            <TouchableOpacity 
              style={[styles.button, extendedStyles.cancelButton]}
              onPress={() => setActiveMode(null)}
              disabled={updating}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, extendedStyles.outOfScopeButton]}
              onPress={() => handleStatusUpdate('out-of-scope')}
              disabled={updating || !reason.trim()}
            >
              {updating ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Confirm</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}

      
    </View>
  );
}

// Extended styles
const extendedStyles = {
  buttonGroup: {
    marginTop: 20,
    gap: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 25,
    marginBottom: 10,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    minHeight: 120,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
    fontSize: 16,
  },
  inProgressButton: {
    backgroundColor: '#2196F3', // Blue
  },
  outOfScopeButton: {
    backgroundColor: '#FF9800', // Orange
  },
  cancelButton: {
    backgroundColor: '#9E9E9E', // Gray
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  }
};
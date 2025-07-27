// import React, { useState, useEffect } from 'react';
// import { 
//   View, 
//   Text, 
//   Image, 
//   ActivityIndicator, 
//   ScrollView, 
//   StyleSheet,
//   TouchableOpacity
// } from 'react-native';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import useAuthStore from '../../store/authStore';
// import { API_URL } from '../../constants/api';
// // Import LeafletMap instead of MapView
// import LeafletMap from '../../components/LeafletMap';
// import COLORS from '../../constants/colors';

// // Helper function to safely render text
// const SafeText = ({ value, style, fallback = '', ...props }) => (
//   <Text style={style} {...props}>
//     {value === null || value === undefined ? fallback : String(value)}
//   </Text>
// );

// export default function ReportDetails() {
//   const { id, from } = useLocalSearchParams();
//   const router = useRouter();
//   const [report, setReport] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const { token } = useAuthStore();

//   useEffect(() => {
//     const fetchReport = async () => {
//       try {
//         setLoading(true);
//         const response = await fetch(`${API_URL}/report/${id}`, {
//           headers: { Authorization: `Bearer ${token}` }
//         });

//         if (!response.ok) {
//           throw new Error('Failed to fetch report details');
//         }

//         const data = await response.json();
//         setReport(data);
//       } catch (error) {
//         setError(error.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchReport();
//   }, [id]);

//   if (loading) {
//     return (
//       <View style={styles.container}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.errorText}>{error}</Text>
//       </View>
//     );
//   }

//   if (!report) {
//     return (
//       <View style={styles.container}>
//         <Text>Report not found</Text>
//       </View>
//     );
//   }

//   // Function to format date with safety checks
//   const formatDate = (dateString) => {
//     if (!dateString) return 'Date not available';
    
//     const date = new Date(dateString);
//     if (isNaN(date.getTime())) return 'Invalid date';
    
//     return date.toLocaleDateString('en-US', { 
//       year: 'numeric', 
//       month: 'long', 
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   return (
//     <ScrollView style={styles.container}>
//       {/* Updated back button */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => {
//           if (from === 'profile') {
//             router.push('/(tabs)/profile')
//           } else {
//             router.back()
//           }
//         }}>
//           <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Report Details</Text>
//         <View style={{ width: 24 }} />
//       </View>

//       {/* Report Title and Status */}
//       <View style={styles.section}>
//         <SafeText 
//           style={styles.title} 
//           value={report.title} 
//           fallback="Untitled Report" 
//         />
//         <View style={[
//           styles.statusBadge,
//           report.status === 'pending' && styles.statusPending,
//           report.status === 'in-progress' && styles.statusInProgress,
//           report.status === 'resolved' && styles.statusResolved,
//         ]}>
//           <SafeText
//             style={styles.statusText}
//             value={report.status === 'in-progress' ? 'In Progress' : (report.status || 'Unknown Status')}
//           />
//         </View>
//       </View>

//       {/* Original Report Section */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Original Report</Text>
//         {report.image ? (
//           <Image 
//             source={{ uri: report.image }} 
//             style={styles.image} 
//             resizeMode="cover"
//           />
//         ) : (
//           <View style={[styles.image, styles.placeholder]}>
//             <Text>No Image Available</Text>
//           </View>
//         )}
//         <SafeText 
//           style={styles.details} 
//           value={report.details} 
//           fallback="No details provided"
//         />
//         <SafeText 
//           style={styles.address} 
//           value={report.address} 
//           fallback="Address not available"
//         />
        
//         {/* Replaced MapView with LeafletMap for Report Location */}
//         {report.location?.coordinates && (
//           <View style={{ marginVertical: 10 }}>
//             <Text style={styles.mapSubtitle}>Report Location</Text>
//             <LeafletMap 
//               coordinates={report.location.coordinates}
//               title="Report Location"
//               style={styles.mapContainer}
//             />
//           </View>
//         )}
        
//         <SafeText 
//           style={styles.date}
//           value={`Reported on: ${formatDate(report.createdAt)}`} 
//         />
//       </View>

//       {/* In Progress Section */}
//       {report.status === 'in-progress' && report.assignedTo && (
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Assigned Supervisor</Text>
//           <View style={styles.supervisorContainer}>
//             {report.assignedTo.profileImage ? (
//               <Image 
//                 source={{ uri: report.assignedTo.profileImage }} 
//                 style={styles.avatar}
//               />
//             ) : (
//               <View style={[styles.avatar, styles.placeholderAvatar]}>
//                 <Ionicons name="person" size={20} color={COLORS.darkGray} />
//               </View>
//             )}
//             <SafeText 
//               style={styles.supervisorName}
//               value={report.assignedTo.username} 
//               fallback="Unknown supervisor"
//             />
//           </View>
//           {report.assignedAt && (
//             <SafeText 
//               style={styles.date}
//               value={`Assigned on: ${formatDate(report.assignedAt)}`} 
//             />
//           )}
//         </View>
//       )}

//       {/* Resolution Section */}
//       {report.status === 'resolved' && (
//         <>
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>Resolution Details</Text>
//             {report.resolvedImage ? (
//               <Image 
//                 source={{ uri: report.resolvedImage }} 
//                 style={styles.image} 
//                 resizeMode="cover"
//               />
//             ) : (
//               <View style={[styles.image, styles.placeholder]}>
//                 <Text>No Cleanup Image</Text>
//               </View>
//             )}
//             <SafeText 
//               style={styles.details}
//               value={report.resolvedAddress} 
//               fallback="No cleanup address provided"
//             />
//             {report.resolvedBy && (
//               <View style={styles.supervisorContainer}>
//                 {report.resolvedBy.profileImage ? (
//                   <Image 
//                     source={{ uri: report.resolvedBy.profileImage }} 
//                     style={styles.avatar}
//                   />
//                 ) : (
//                   <View style={[styles.avatar, styles.placeholderAvatar]}>
//                     <Ionicons name="person" size={20} color={COLORS.darkGray} />
//                   </View>
//                 )}
//                 <SafeText 
//                   style={styles.supervisorName}
//                   value={report.resolvedBy.username} 
//                   fallback="Unknown supervisor"
//                 />
//               </View>
//             )}
//             <SafeText 
//               style={styles.date}
//               value={`Resolved on: ${formatDate(report.resolvedAt)}`} 
//             />
//           </View>

//           {/* Replaced MapView with LeafletMap for Cleanup Location */}
//           {report.resolvedLocation?.coordinates && (
//             <View style={styles.section}>
//               <Text style={styles.sectionTitle}>Cleanup Location</Text>
//               <LeafletMap 
//                 coordinates={report.resolvedLocation.coordinates}
//                 title="Cleanup Location"
//                 style={styles.mapContainer}
//               />
//             </View>
//           )}
//         </>
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.background,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 16,
//     backgroundColor: COLORS.white,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.lightGray,
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: COLORS.textPrimary,
//   },
//   section: {
//     backgroundColor: COLORS.white,
//     borderRadius: 8,
//     padding: 16,
//     margin: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 12,
//     color: COLORS.primary,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 8,
//     color: COLORS.textPrimary,
//   },
//   statusBadge: {
//     alignSelf: 'flex-start',
//     paddingVertical: 4,
//     paddingHorizontal: 12,
//     borderRadius: 12,
//     marginBottom: 12,
//   },
//   statusPending: {
//     backgroundColor: COLORS.warning,
//   },
//   statusInProgress: {
//     backgroundColor: COLORS.info,
//   },
//   statusResolved: {
//     backgroundColor: COLORS.success,
//   },
//   statusText: {
//     color: COLORS.white,
//     fontWeight: 'bold',
//   },
//   image: {
//     width: '100%',
//     height: 200,
//     borderRadius: 8,
//     marginBottom: 12,
//   },
//   placeholder: {
//     backgroundColor: COLORS.lightGray,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: COLORS.lightGray,
//     borderStyle: 'dashed',
//   },
//   details: {
//     fontSize: 16,
//     color: COLORS.textSecondary,
//     marginBottom: 8,
//   },
//   address: {
//     fontSize: 14,
//     color: COLORS.textSecondary,
//     marginBottom: 8,
//     fontStyle: 'italic',
//   },
//   date: {
//     fontSize: 12,
//     color: COLORS.darkGray,
//   },
//   supervisorContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   avatar: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     marginRight: 10,
//   },
//   placeholderAvatar: {
//     backgroundColor: COLORS.lightGray,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: COLORS.gray,
//   },
//   supervisorName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.textPrimary,
//   },
//   mapContainer: {
//     height: 200,
//     borderRadius: 8,
//     overflow: 'hidden',
//     marginTop: 10,
//   },
//   errorText: {
//     color: 'red',
//     fontSize: 16,
//     textAlign: 'center',
//     marginTop: 20,
//   },
//   mapSubtitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     marginBottom: 8,
//     color: COLORS.textPrimary,
//   },
// });

//upper code does n't show location comparsion
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
import useAuthStore from '../../store/authStore';
import { API_URL } from '../../constants/api';
import LeafletMap from '../../components/LeafletMap';
import ComparisonMap from '../../components/ComparisonMap';
import COLORS from '../../constants/colors';

const SafeText = ({ value, style, fallback = '', ...props }) => (
  <Text style={style} {...props}>
    {value === null || value === undefined ? fallback : String(value)}
  </Text>
);

export default function ReportDetails() {
  const { id, from } = useLocalSearchParams();
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/report/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch report details');
        }

        const data = await response.json();
        setReport(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'in-progress': return 'In Progress';
      case 'permanent-resolved': return 'Permanently Resolved';
      case 'rejected': return 'Rejected';
      case 'out-of-scope': return 'Out of Scope';
      default: return status;
    }
  };

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
        <TouchableOpacity onPress={() => {
          if (from === 'profile') {
            router.push('/(tabs)/profile')
          } else {
            router.back()
          }
        }}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.section}>
        <SafeText 
          style={styles.title} 
          value={report.title} 
          fallback="Untitled Report" 
        />
        <View style={[
          styles.statusBadge,
          report.status === 'pending' && styles.statusPending,
          report.status === 'in-progress' && styles.statusInProgress,
          report.status === 'resolved' && styles.statusResolved,
          report.status === 'permanent-resolved' && styles.statusPermanentResolved,
          report.status === 'rejected' && styles.statusRejected,
          report.status === 'out-of-scope' && styles.statusOutOfScope,
        ]}>
          <SafeText
            style={styles.statusText}
            value={getStatusDisplay(report.status)}
          />
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

      {report.status === 'in-progress' && report.assignedTo && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assigned Supervisor</Text>
          <View style={styles.supervisorContainer}>
            {report.assignedTo.profileImage ? (
              <Image 
                source={{ uri: report.assignedTo.profileImage }} 
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
                value={report.assignedTo.username} 
                fallback="Unknown supervisor"
              />
              {/* Added supervisor email display */}
              {report.assignedTo.email && (
                <SafeText 
                  style={styles.supervisorEmail}
                  value={`Email: ${report.assignedTo.email}`} 
                />
              )}
            </View>
           
          </View>
          

          {/* Added assigned message display */}
      {report.assignedMsg && (
  <View style={styles.messageContainer}>
    <Ionicons name="chatbox-outline" size={16} color={COLORS.primary} />
    <SafeText 
      style={styles.messageText}
      value={report.assignedMsg} 
      fallback="No message provided"
    />
  </View>
)}
          {report.assignedAt && (
            <SafeText 
              style={styles.date}
              value={`Assigned on: ${formatDate(report.assignedAt)}`} 
            />
          )}
        </View>
      )}

      {(report.status === 'resolved' || 
       report.status === 'permanent-resolved' || 
       report.status === 'rejected') && (
        <>
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
                  {/* Added resolved by email display */}
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
        </>
      )}

      {report.status === 'rejected' && (
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
                {/* Added rejected by email display */}
                {report.rejectedBy.email && (
                  <SafeText 
                    style={styles.adminEmail}
                    value={`Email: ${report.rejectedBy.email}`} 
                    fallback="admin@gmail.com"
                  />
                )}
              </View>
            </View>
          )}
          
          <View style={styles.rejectionContainer}>
            <Ionicons name="warning" size={20} color={COLORS.error} />
            <SafeText 
              style={styles.rejectionReason}
              value={report.rejectionReason} 
              fallback="No reason provided"
            />
          </View>
          
          <SafeText 
            style={styles.date}
            value={`Rejected on: ${formatDate(report.rejectedAt)}`} 
          />
        </View>
      )}

      {report.status === 'permanent-resolved' && (
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
                {/* Added permanently resolved by email display */}
                {report.permanentlyResolvedBy.email && (
                  <SafeText 
                    style={styles.adminEmail}
                    value={`Email: ${report.permanentlyResolvedBy.email}`} 
                    fallback="admin@gmail.com"
                  />
                )}
              </View>
            </View>
          )}
          
          {report.distanceToReported !== undefined && (
            <View style={styles.distanceContainer}>
              <Ionicons name="locate" size={20} color={COLORS.primary} />
              <SafeText 
                style={styles.distanceText}
                value={`Verified within ${report.distanceToReported.toFixed(2)} meters`} 
              />
            </View>
          )}
          
          {report.permanentlyResolvedAt && (
            <SafeText 
              style={styles.date}
              value={`Permanently closed on: ${formatDate(report.permanentlyResolvedAt)}`} 
            />
          )}
        </View>
      )}

      {/* Out of Scope Section */}
      {report.status === 'out-of-scope' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Out of Scope Details</Text>
          
          {report.outOfScopeBy && (
            <View style={styles.supervisorContainer}>
              {report.outOfScopeBy.profileImage ? (
                <Image 
                  source={{ uri: report.outOfScopeBy.profileImage }} 
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
                  value={report.outOfScopeBy.username} 
                  fallback="Unknown supervisor"
                />
                {/* Added out of scope by email display */}
                {report.outOfScopeBy.email && (
                  <SafeText 
                    style={styles.supervisorEmail}
                    value={`Email: ${report.outOfScopeBy.email}`} 
                  />
                )}
              </View>
            </View>
          )}
          
          <View style={styles.reasonContainer}>
            <Ionicons name="alert-circle-outline" size={20} color={COLORS.warning} />
            <SafeText 
              style={styles.reasonText}
              value={report.outOfScopeReason} 
              fallback="No reason provided"
            />
          </View>
          
          {report.outOfScopeAt && (
            <SafeText 
              style={styles.date}
              value={`Marked out of scope on: ${formatDate(report.outOfScopeAt)}`} 
            />
          )}
        </View>
      )}
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
  statusPending: {
    backgroundColor: COLORS.warning,
  },
  statusInProgress: {
    backgroundColor: COLORS.info,
  },
  statusResolved: {
    backgroundColor: COLORS.success,
  },
  statusPermanentResolved: {
    backgroundColor: COLORS.persuccess,
  },
  statusRejected: {
    backgroundColor: COLORS.error,
  },
  statusOutOfScope: {
    backgroundColor: COLORS.outOfScope,
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
  comparisonNote: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginTop: 8,
  },
  adminContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  adminInfo: {
    marginLeft: 10,
    flex: 1,
  },
  adminName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  adminEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  distanceText: {
    marginLeft: 6,
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
  },
  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    padding: 10,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  reasonText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    padding: 10,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  messageText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
});
import { useState } from 'react';
import { View, Text, Alert, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { API_URL } from '../../constants/api';
import { useAuthStore } from '../../store/authStore';
import { useEffect } from 'react';
import styles from '../../assets/styles/profile.styles';
import ProfileHeader from '../../components/ProfileHeader';
import LogoutButton from '../../components/LogoutButton';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';
import {Image} from "expo-image"; 
import { getImageUrl } from '../../lib/utils';
import { sleep } from '.';
import Loader from '../../components/Loader';

export default function Profile() {
  const [reports,setReports]=useState([]);
  const [isLoading,setisLoading]=useState(false);
  const [refreshing,setRefreshing]=useState(false);
  const [deleteReportId,setDeleteReportId]=useState(null);

  const {token}=useAuthStore();
  
  const router=useRouter();
  const fetchData=async()=>{
   try {
    setisLoading(true);
    const response=await fetch(`${API_URL}/report/user`,{
    headers:{Authorization:`Bearer ${token}`},
    });
    const data=await response.json();
    if(!response.ok) throw new Error(data.message || "Failed to fetch your reported reports")
    setReports(data);

   } catch (error) {
    console.error("Error fetching data:",error);
    Alert.alert("Error","Failed to load profile data. Pull down to refresh.");
   }
   finally{
    setisLoading(false);
   }


  }
  useEffect(()=>{
    fetchData();
  },[]);


  const handleDeleteReport=async(reportId)=>{
    try {
      setDeleteReportId(reportId);
      const response = await fetch(`${API_URL}/report/${reportId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || "Failed to delete report");
          setReports(reports.filter(report => report._id !== reportId));
          Alert.alert("Success", "Report deleted successfully.");
    } catch (error) {
      console.error("Error deleting report:", error);
      Alert.alert("Error",error.message || "Failed to delete report.");
    }
    finally {
      setDeleteReportId(null);
    }

  };


  const confirmDelete=(reportId)=>{
    Alert.alert("Delete Report","Are you sure you want to delete this report?",[
      { text:"Cancel",style:"cancel"},
      {text:"Delete",style:"destructive",onPress:()=>handleDeleteReport(reportId)},

    ]);
  };
  const renderReportsItem=({item})=>(
    <View style={styles.reportsItem}>
      {/* <Image source={{uri:item.image}} style={styles.reportsImage} /> */}
       <Image 
    source={{ uri: getImageUrl(item.image) }} 
    style={styles.reportsImage}
    onError={(e) => console.log("Report image error:", e.nativeEvent.error)}
  />
      <View style={styles.reportsInfo}>
        <Text style={styles.reportsTitle}>{item.title}</Text>
        <Text style={styles.reportsCaption} numberOfLines={2}>Details: {item.details}
        </Text>
         {/* <Text style={styles.reportsCaption} numberOfLines={1}>Report Type: {item.reportType}</Text> */}
        <Text style={styles.reportsLocation} numberOfLines={1}>Address: {item.address}</Text>
        <Text style={styles.reportsDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      <TouchableOpacity style={styles.deleteButton} onPress={()=>confirmDelete(item._id)}>
        {deleteReportId === item._id ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <Ionicons name="trash-outline" size={20} color={COLORS.primary} />
        )}
      </TouchableOpacity>
    </View>
  );
  const handleRefresh=async()=>{
    setRefreshing(true);
    await sleep(500);
    await fetchData();
    setRefreshing(false);
  }
  if (isLoading && !refreshing) return <Loader/>

  return (
    <View style={styles.container}>
      <ProfileHeader/>
      <LogoutButton />

      {/* Display user's reported reports */}
      <View style={styles.reportsHeader}>
        <Text style={styles.reportsTitle}>Your Reports</Text>
        <Text style={styles.reportsCount}>{reports.length} reports</Text>
      </View>

      <FlatList
      data={reports}
      renderItem={renderReportsItem}
      keyExtractor={(item)=>item._id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.reportsList}
      refreshControl={
        <RefreshControl
        refreshing={refreshing}
        onRefresh={handleRefresh}
        colors={[COLORS.primary]}
        tintColor={COLORS.primary}
        />
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Ionicons name="trash" size={50} color={COLORS.textSecondary} />
          <Text style={styles.emptyText}>No reports found</Text>
          <TouchableOpacity style={styles.addButton} onPress={()=>router.push("/create")}>
            <Text style={styles.addButtonText}>File Your First Report Today</Text>

          </TouchableOpacity>
        </View>

      }

      />
    </View>
  );
}
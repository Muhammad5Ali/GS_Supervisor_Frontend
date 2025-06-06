
import { View, Text,FlatList, ActivityIndicator, RefreshControl} from 'react-native';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore'; //import the auth store
import styles from '../../assets/styles/home.styles';
import { API_URL } from '../../constants/api';
import { formatPublishDate } from '../../lib/utils';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image'; //expo-image is used to load the images
import COLORS from '../../constants/colors';
import Loader from '../../components/Loader'; //import the loader component

// Add helper import
import { getImageUrl } from '../../lib/utils';

const HeaderWithIcon = () => (
  <View style={styles.header}>
    <View style={styles.headerTitleContainer}>
      <Text style={styles.headerTitle}>GreenSnap</Text>
      <Ionicons 
        name="leaf" 
        size={26} 
        color={COLORS.primary} 
        style={styles.headerIcon} 
      />
    </View>
    <Text style={styles.headerSubtitle}>Explore the latest reports shared by our community</Text>
  </View>
);

//arrow function that will add some delays even for the bad internt connection
 export const sleep=(ms)=>new Promise((resolve)=>setTimeout(resolve,ms));
export default function Home() {
  const {token}=useAuthStore();
  const [reports,setReports]=useState([]); //state to hold the reports
  const [loading,setLoading]=useState(true); //state to hold the loading state if false
  const [refreshing,setRefreshing]=useState(false); //state to hold the refreshing state
  const [page,setPage]=useState(1); //state to hold the page number
  const [hasMore,setHasMore]=useState(true); //state to hold if there are more reports to load


  const fetchReports=async(pageNum=1,refresh=false)=>{
  try {
    if(refresh) setRefreshing(true);
    else if(pageNum===1) setLoading(true);

    const response= await fetch(`${API_URL}/report?page=${pageNum}&limit=2`,{
      headers:{Authorization: `Bearer ${token}`},
    });
    const data=await response.json();
    if(!response.ok) throw new Error(data.message || "Failed to fetch reports");
    //todo fix it as for some cases it will cause the duplication
    //setReports((prevReports)=>[...prevReports,...data.reports]);
    // To precautionly handles for the case of duplicate reports
    const uniqueReports =
    refresh || pageNum === 1
    ? data.reports
    :Array.from(new Set([...reports,...data.reports].map(report => report._id)))
      .map((id) =>[...reports,...data.reports].find((report) => report._id === id));
      setReports(uniqueReports);

    // If current pages is less than total pg's than we have more to fetch
    setHasMore(pageNum<data.totalPages);
    setPage(pageNum);
  } catch (error) {
    console.log("Error fetching reports",error); 
  } finally{
    if(refresh){ 
      await sleep(800);
      setRefreshing(false);
    }
    else setLoading(false);
  }


  };
  useEffect(()=>{
   fetchReports();
  },[]);

  const handleLoadMore=async()=>{
    if(hasMore && !loading && !refreshing){
      //we comment it out as not a good solution in real world application
      //await sleep(1000);
      await fetchReports(page+1);
    }
  }

  // Item is here every single report that we got in the array
  const renderItem=({item})=>(
  <View style={styles.reportCard}>
    <View style={styles.reportHeader}>
      <View style={styles.userInfo}>
    {/* <Image source={{uri:item.user.profileImage}} style={styles.avatar}/> */}
    <Image 
    source={{ uri: getImageUrl(item.user.profileImage) }} 
    style={styles.avatar}
    onError={(e) => console.log("Avatar load error:", e.nativeEvent.error)}
  />
    <Text style={styles.username}>{item.user.username}</Text>
      </View>
    </View>
    <View style={styles.reportImageContainer}>
      {/* <Image source={{uri:item.image}} style={styles.reportImage} contentFit="cover"/> */}
       <Image 
    source={{ uri: getImageUrl(item.image) }} 
    style={styles.reportImage}
    onError={(e) => console.log("Report image error:", e.nativeEvent.error)}
  />
    </View>
    <View style={styles.reportDetails}>
      <Text style={styles.reportTitle}>{item.title}</Text>
      <Text style={styles.reportDetails}>{item.details}</Text>
      <Text style={styles.date}>Shared on {formatPublishDate(item.createdAt)}</Text>
    </View>
    </View>
  )
//console.log(reports);
if (loading) return <Loader />
  
    
  
  return (
    <View style={styles.container}>
      {/* We use flatlist here becz we wanna render some data */}
      <FlatList
      
       data={reports}
       renderItem={renderItem}
       keyExtractor={(item)=>item._id}
       contentContainerStyle={styles.listContainer}
       showsVerticalScrollIndicator={false}
       refreshControl={
        <RefreshControl
         refreshing={refreshing}
         onRefresh={()=>fetchReports(1,true)}
         tintColor={COLORS.primary}
        />
       }
       onEndReached={handleLoadMore}
       onEndReachedThreshold={0.1} // Trigger load more when 10% from the end is reached
      //  ListHeaderComponent={
      //   <View style={styles.header}>
      //     <Text style={styles.headerTitle}>GreenSnap</Text>
      //     <Text style={styles.headerSubtitle}>Explore the latest reports shared by our community</Text>
      //   </View>
      //  }
      ListHeaderComponent={<HeaderWithIcon />}
        // ListFooterComponent={
        //   hasMore && !loading ? (
        //     <View style={styles.footer}>
        //       <Text style={styles.footerText}>Loading more reports...</Text>
        //     </View>
        //   ) : null
        // }
        ListFooterComponent={
          hasMore && reports.length > 0 ? (
            <ActivityIndicator style={styles.footerLoader} size="small" color={COLORS.primary}/>
          ) :null
        }
       ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Ionicons name="trash-sharp" size={60} color={COLORS.textSecondary} />
          <Text style={styles.emptyText}>No reports found</Text>
          <Text style={styles.emptySubtext}>Be the first to share a report</Text>

        </View>
       }
      />
    </View>
  );
}
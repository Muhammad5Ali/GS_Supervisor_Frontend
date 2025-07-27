import React from 'react';
import { WebView } from 'react-native-webview';
import { View, Text, StyleSheet } from 'react-native';
import COLORS from '../constants/colors';

const ComparisonMap = ({ pointA, pointB, titleA, titleB }) => {
  const [lngA, latA] = pointA;
  const [lngB, latB] = pointB;
  
  // Calculate distance between points (Haversine formula)
  const calculateDistance = () => {
    const R = 6371; // Earth radius in km
    const dLat = (latB - latA) * Math.PI / 180;
    const dLon = (lngB - lngA) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(latA * Math.PI / 180) * Math.cos(latB * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c * 1000).toFixed(1); // Distance in meters
  };

  const distance = calculateDistance();
  
  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
      body, html, #map { height: 100%; width: 100%; margin: 0; padding: 0; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      // Calculate center between points
      const centerLat = (${latA} + ${latB}) / 2;
      const centerLng = (${lngA} + ${lngB}) / 2;
      
      // Initialize map
      const map = L.map('map').setView([centerLat, centerLng], 15);
      
      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      
      // Create custom markers
      const iconA = L.divIcon({
        className: 'custom-icon',
        html: \`<div style="
          background: #e74c3c;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 0 10px rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          color: white;
          font-weight: bold;
        ">R</div>\`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      
      const iconB = L.divIcon({
        className: 'custom-icon',
        html: \`<div style="
          background: #2ecc71;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 0 10px rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          color: white;
          font-weight: bold;
        ">C</div>\`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      
      // Add markers
      const markerA = L.marker([${latA}, ${lngA}], { icon: iconA })
        .bindPopup("${titleA}")
        .addTo(map);
      
      const markerB = L.marker([${latB}, ${lngB}], { icon: iconB })
        .bindPopup("${titleB}")
        .addTo(map);
      
      // Add connecting line
      const line = L.polyline([[${latA}, ${lngA}], [${latB}, ${lngB}]], {
        color: '#3498db',
        weight: 3,
        dashArray: '5, 10'
      }).addTo(map);
      
      // Add distance label
      const midPoint = line.getCenter();
      L.marker(midPoint, {
        icon: L.divIcon({
          className: 'distance-label',
          html: \`<div style="
            background: rgba(52, 152, 219, 0.8);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
            white-space: nowrap;
          ">\${${distance}}m</div>\`,
          iconSize: null,
          iconAnchor: [0, 0]
        })
      }).addTo(map);
      
      // Fit bounds to show both markers
      const bounds = L.latLngBounds([markerA.getLatLng(), markerB.getLatLng()]);
      map.fitBounds(bounds, { padding: [50, 50] });
      
      // Disable unnecessary interactions
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
      map.scrollWheelZoom.disable();
    </script>
  </body>
  </html>
  `;

  return (
    <View style={styles.container}>
      <View style={styles.distanceBadge}>
        <Text style={styles.distanceText}>Distance: {distance} meters</Text>
      </View>
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scrollEnabled={false}
        overScrollMode="never"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  distanceBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 1000,
    backgroundColor: 'rgba(52, 152, 219, 0.9)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  distanceText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default ComparisonMap;
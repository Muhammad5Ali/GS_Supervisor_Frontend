import React from 'react';
import { View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const CustomIonIcons = ({ name, size, color, style }) => {
  // Filter out problematic icons
  const problematicIcons = ['checkmark-circle', 'close-circle'];
  
  if (problematicIcons.includes(name)) {
    return (
      <View style={[style, { width: size, height: size }]}>
        <Ionicons 
          name={name.replace('-circle', '')} 
          size={size} 
          color={color} 
        />
      </View>
    );
  }
  
  return <Ionicons name={name} size={size} color={color} style={style} />;
};

export default CustomIonIcons;
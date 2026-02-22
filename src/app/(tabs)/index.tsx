import { AppleMaps, GoogleMaps } from 'expo-maps';
import { AppleMapsMapType } from 'expo-maps/build/apple/AppleMaps.types';
import { GoogleMapsMapType } from 'expo-maps/build/google/GoogleMaps.types';
import React from 'react';
import { Platform, StyleSheet, Text } from 'react-native';

const SF_ZOOM = 15;

export default function HomeScreen() {
  const cameraPosition = {
    coordinates: {
      latitude: 45.479145,
      longitude: -122.6135512,
    },
    zoom: SF_ZOOM,
  };

  if (Platform.OS === 'ios') {
    return (
      <AppleMaps.View
        style={StyleSheet.absoluteFill}
        cameraPosition={cameraPosition}
        properties={{
          isTrafficEnabled: false,
          mapType: AppleMapsMapType.STANDARD,
          selectionEnabled: true,
        }}
      />
    );
  } else if (Platform.OS === 'android') {
    return (
      <GoogleMaps.View
        style={StyleSheet.absoluteFill}
        cameraPosition={cameraPosition}
        properties={{
          mapType: GoogleMapsMapType.NORMAL,
          selectionEnabled: true,
          isTrafficEnabled: false,
        }}
      />
    );
  } else {
    return <Text>Maps are only available on Android and iOS</Text>;
  }
}

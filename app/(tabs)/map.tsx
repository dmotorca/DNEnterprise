import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect, useState } from 'react';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';

// Only import leaflet on web platform
let L: any = null;
let MapContainer: any = null;
let TileLayer: any = null;
let Marker: any = null;
let Popup: any = null;

if (Platform.OS === 'web') {
  try {
    L = require('leaflet');
    require('react-leaflet');
    const reactLeaflet = require('react-leaflet');
    MapContainer = reactLeaflet.MapContainer;
    TileLayer = reactLeaflet.TileLayer;
    Marker = reactLeaflet.Marker;
    Popup = reactLeaflet.Popup;
    
    // Fix for default markers in react-leaflet
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  } catch (error) {
    console.warn('Leaflet not available:', error);
  }
}

const { width, height } = Dimensions.get('window');

// Sample public transportation stops (these would be real data in production)
const transitStops = [
  { id: 1, name: 'Central Station', lat: 40.7128, lng: -74.0060, type: 'subway' },
  { id: 2, name: 'Bus Stop A', lat: 40.7150, lng: -74.0080, type: 'bus' },
  { id: 3, name: 'Transit Hub', lat: 40.7100, lng: -74.0040, type: 'hub' },
];

export default function MapScreen() {
  const colorScheme = useColorScheme();
  const [isClient, setIsClient] = useState(false);
  const [location, setLocation] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleGetLocation = async () => {
    try {
      // Request location permissions
      let { status } = await (Location as any).requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        console.log('Permission to access location was denied');
        return;
      }

      // Get current location
      let location = await (Location as any).getCurrentPositionAsync({});
      setLocation(location);
      console.log('Current Location:', {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        altitude: location.coords.altitude,
        accuracy: location.coords.accuracy,
      });
      setErrorMsg(null);
    } catch (error) {
      setErrorMsg('Error getting location');
      console.error('Error getting location:', error);
    }
  };

  const getAccessibleTileUrl = () => {
    // ESRI World Imagery for satellite view
    return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
  };

  const getMarkerColor = (type: string) => {
    switch (type) {
      case 'subway': return '#2E7D32'; // High contrast green
      case 'bus': return '#1565C0'; // High contrast blue  
      case 'hub': return '#C62828'; // High contrast red
      default: return '#424242'; // Dark gray
    }
  };

  if (Platform.OS !== 'web') {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.titleContainer}>
          <IconSymbol 
            size={32} 
            name="map.fill" 
            color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'} 
          />
          <ThemedText 
            type="title" 
            style={{ fontFamily: Fonts.rounded, marginLeft: 12 }}
          >
            Transit Map
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.notAvailableContainer}>
          <IconSymbol 
            size={64} 
            name="exclamationmark.triangle.fill" 
            color="#FF9800" 
          />
          <ThemedText type="defaultSemiBold" style={styles.notAvailableText}>
            Map View
          </ThemedText>
          <ThemedText style={styles.notAvailableDescription}>
            The interactive transit map is only available on web. Please use a web browser to access the map functionality.
          </ThemedText>
          <ThemedText style={styles.accessibilityInfo}>
            This map is designed with accessibility features for users with visual disabilities, including high contrast colors and screen reader support.
          </ThemedText>
          <View style={styles.mobileLocationContainer}>
            <ThemedText type="defaultSemiBold" style={styles.locationTitle}>
              My Location
            </ThemedText>
            <View style={styles.locationButtonContainer}>
              <button 
                onClick={handleGetLocation}
                style={styles.locationButton}
                aria-label="Get my current location"
              >
                <IconSymbol size={20} name="location.fill" color="#FFFFFF" />
                <span style={{ marginLeft: 8 }}>Get My Location</span>
              </button>
            </View>
            {errorMsg && (
              <ThemedText style={styles.errorText}>{errorMsg}</ThemedText>
            )}
            {location && (
              <View style={styles.locationInfo}>
                <ThemedText style={styles.locationText}>
                  Latitude: {location.coords.latitude.toFixed(6)}
                </ThemedText>
                <ThemedText style={styles.locationText}>
                  Longitude: {location.coords.longitude.toFixed(6)}
                </ThemedText>
                <ThemedText style={styles.locationText}>
                  Accuracy: ±{location.coords.accuracy.toFixed(0)}m
                </ThemedText>
              </View>
            )}
          </View>
        </ThemedView>
      </ThemedView>
    );
  }

  if (!isClient || !MapContainer) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading map...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.titleContainer}>
        <IconSymbol 
          size={32} 
          name="map.fill" 
          color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'} 
        />
        <ThemedText 
          type="title" 
          style={{ fontFamily: Fonts.rounded, marginLeft: 12 }}
        >
          Transit Map
        </ThemedText>
      </View>
      
      <View style={styles.mapContainer}>
        <MapContainer
          center={[40.7128, -74.0060]}
          zoom={14}
          style={styles.map}
          attributionControl={false}
          aria-label="Interactive public transportation map"
        >
          <TileLayer
            url={getAccessibleTileUrl()}
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
            maxZoom={19}
          />
          
          {transitStops.map((stop) => (
            <Marker
              key={stop.id}
              position={[stop.lat, stop.lng]}
              aria-label={`${stop.name} - ${stop.type} stop`}
            >
              <Popup>
                <View style={styles.popupContent}>
                  <ThemedText type="defaultSemiBold">{stop.name}</ThemedText>
                  <ThemedText>Type: {stop.type}</ThemedText>
                  <ThemedText style={styles.accessibilityNote}>
                    Accessible features available
                  </ThemedText>
                </View>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </View>


      <View style={styles.locationContainer}>
        <ThemedText type="defaultSemiBold" style={styles.locationTitle}>
          My Location
        </ThemedText>
        <View style={styles.locationButtonContainer}>
          <button 
            onClick={handleGetLocation}
            style={styles.locationButton}
            aria-label="Get my current location"
          >
            <IconSymbol size={20} name="location.fill" color="#FFFFFF" />
            <span style={{ marginLeft: 8 }}>Get My Location</span>
          </button>
        </View>
        {errorMsg && (
          <ThemedText style={styles.errorText}>{errorMsg}</ThemedText>
        )}
        {location && (
          <View style={styles.locationInfo}>
            <ThemedText style={styles.locationText}>
              Latitude: {location.coords.latitude.toFixed(6)}
            </ThemedText>
            <ThemedText style={styles.locationText}>
              Longitude: {location.coords.longitude.toFixed(6)}
            </ThemedText>
            <ThemedText style={styles.locationText}>
              Accuracy: ±{location.coords.accuracy.toFixed(0)}m
            </ThemedText>
          </View>
        )}
      </View>

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  mapContainer: {
    height: height * 0.5,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#000000',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  popupContent: {
    padding: 8,
  },
  accessibilityNote: {
    fontSize: 12,
    color: '#2E7D32',
    marginTop: 4,
  },
  legendContainer: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#000000',
  },
  legendTitle: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 50,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#000000',
  },
  accessibilityInfoContainer: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1565C0',
  },
  accessibilityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1565C0',
  },
  accessibilityFeature: {
    marginBottom: 4,
    fontSize: 14,
  },
  notAvailableContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  notAvailableText: {
    fontSize: 24,
    marginTop: 16,
    marginBottom: 8,
  },
  notAvailableDescription: {
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  accessibilityInfo: {
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#666666',
    lineHeight: 18,
  },
  locationContainer: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#000000',
  },
  mobileLocationContainer: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#000000',
  },
  locationTitle: {
    marginBottom: 12,
    fontSize: 16,
    fontWeight: 'bold',
  },
  locationButtonContainer: {
    marginBottom: 12,
  },
  locationButton: {
    backgroundColor: '#1976D2',
    color: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 0,
    fontSize: 16,
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
  },
  locationInfo: {
    marginTop: 8,
  },
  locationText: {
    fontSize: 14,
    marginBottom: 2,
    fontFamily: 'monospace',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    marginTop: 8,
  },
});

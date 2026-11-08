import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BottomNavBar from './nav-bar';

const MARKERS = [
  {
    id: 1,
    coordinate: { latitude: 37.78825, longitude: -122.4324 },
    title: 'Location 1',
    description: 'This is location 1',
  },
  {
    id: 2,
    coordinate: { latitude: 37.78925, longitude: -122.4334 },
    title: 'Location 2',
    description: 'This is location 2',
  },
];

const formatPlace = (place?: Location.LocationGeocodedAddress) =>
  place?.city ?? place?.district ?? place?.subregion ?? place?.region ?? 'Unknown location';

export default function MainPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [placeName, setPlaceName] = useState('Locating...');

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let cancelled = false;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;

      if (status !== 'granted') {
        setErrorMsg('Location permission was denied. Enable it in your settings to see the map.');
        setIsLoading(false);
        return;
      }

      const initial = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      if (cancelled) return;
      setLocation(initial);
      setIsLoading(false);

      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        setLocation
      );

      if (cancelled) sub.remove();
      else subscription = sub;
    })();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, []);


  const geoKey = location
    ? `${location.coords.latitude.toFixed(2)},${location.coords.longitude.toFixed(2)}`
    : null;

  useEffect(() => {
    if (!geoKey) return;
    const [latitude, longitude] = geoKey.split(',').map(Number);
    let cancelled = false;

    Location.reverseGeocodeAsync({ latitude, longitude })
      .then(([place]) => {
        if (!cancelled) setPlaceName(formatPlace(place));
      })
      .catch(() => {
        if (!cancelled) setPlaceName('Unknown location');
      });

    return () => {
      cancelled = true;
    };
  }, [geoKey]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (errorMsg || !location) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{errorMsg ?? 'Could not get your location.'}</Text>
      </View>
    );
  }

  const initialRegion = {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        style={StyleSheet.absoluteFill}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {MARKERS.map((marker) => (
          <Marker key={marker.id} coordinate={marker.coordinate}>
            <View style={styles.markerContainer}>
              <View style={styles.marker} />
            </View>
            <Callout style={styles.callout}>
              <View>
                <Text style={styles.calloutTitle}>{marker.title}</Text>
                <Text style={styles.calloutDescription}>{marker.description}</Text>
                <TouchableOpacity
                  style={styles.calloutButton}
                  onPress={() => router.push('/sign-in')}
                >
                  <Text style={styles.calloutButtonText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Top: current location name */}
      <View style={[styles.topContainer, { paddingTop: insets.top - 8 }]} pointerEvents="box-none">
        <View style={styles.locationPill} pointerEvents="none">
          <Ionicons name="location-sharp" size={18} color="white" />
          <Text style={styles.locationText} numberOfLines={1}>
            {placeName}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.profileButton, { top: insets.top - 8 }]}
          onPress={() => router.push('/sign-in')}
          accessibilityLabel="Profile"
        >
          <Ionicons name="person" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Bottom: navigation bar */}
      <BottomNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
  },

  topContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: '70%',
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 100,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  locationText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    flexShrink: 1,
  },
  profileButton: {
    position: 'absolute',
    right: 16,
    width: 60,
    height: 60,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    marginTop: 0
  },

  markerContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF0000',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  callout: {
    width: 200,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  calloutDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 10,
  },
  calloutButton: {
    backgroundColor: '#0066FF',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  calloutButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

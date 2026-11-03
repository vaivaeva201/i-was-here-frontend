import { AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from "react-native-maps";




export default function MainPage() {
  const router = useRouter();
  const [selectedMarker, setSelectedMarker] = useState(0);
  const [location, setLocation] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // Request location permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        alert('Permission denied Please enable location services to use this feature');
        setIsLoading(false);
        return;
      }

      let initialLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      setLocation(initialLocation);
      setIsLoading(false);

      // Start watching position
      let locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (newLocation: any) => {
          setLocation(newLocation);
        }
      );

      // Cleanup subscription on unmount
      return () => {
        if (locationSubscription) {
          locationSubscription.remove();
        }
      };
    })();
  }, []);

  if (isLoading || !location) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const initialRegion = location ? {
    latitude: location?.coords?.latitude || 37.78825,
    longitude: location?.coords?.longitude || -122.4324,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  } : {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const markers = [
    {
      id: 1,
      coordinate: { latitude: 37.78825, longitude: -122.4324 },
      title: "Location 1",
      description: "This is location 1",
    },
    {
      id: 2,
      coordinate: { latitude: 37.78925, longitude: -122.4334 },
      title: "Location 2",
      description: "This is location 2",
    },
  ];

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        followsUserLocation={true}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            onPress={() => setSelectedMarker(marker.id)}
          >
            <View style={styles.markerContainer}>
              <View style={styles.marker} />
            </View>
            <Callout style={styles.callout}>
              <View>
                <Text style={styles.calloutTitle}>{marker.title}</Text>
                <Text style={styles.calloutDescription}>{marker.description}</Text>
                <TouchableOpacity 
                  style={styles.calloutButton}
                  onPress={() => router.push("/sign-in")}
                >
                  <Text style={styles.calloutButtonText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </Callout>
          </Marker>
        ))}
        <Marker coordinate={{ latitude: 37.78825, longitude: -122.4324 }} />
      </MapView>

      <View style={styles.topButtonContainer}>
        <TouchableOpacity
          style={styles.topButton}
          onPress={() => router.push("/sign-in")}
        >
          <AntDesign name="user" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.feedButton}
        onPress={() => router.push("/feed-page")}
      >
        <AntDesign name="home" size={26} color="white" />
      </TouchableOpacity>

      <View style={styles.bottomButtonContainer}>
        <LinearGradient
          colors={['#8663FC', '#61D2E9']}
          start={{ x: 0, y: 0.5}}
          end={{ x: 0.5, y: 0 }}
          style={styles.bottomButtonGradient}
        >
          <TouchableOpacity
            style={styles.bottomButton}
            onPress={() => router.push("/sign-in")}
          >
            <AntDesign name="plus" size={24} color="white" />
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? 0 : undefined,
  },
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },


  topButton: {
    position: "absolute",
    top: 20,
    height: 48,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    width: 'auto',
    paddingHorizontal: 15,
    marginRight: 15,
  },
  topButtonContainer: {
    position: 'absolute',
    width: '100%',
    alignItems: 'flex-end',
  },

  feedButton: {
    position: 'absolute',
    bottom: 50,
    left: 40,  
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
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

  bottomButtonContainer: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    alignItems: 'center',
  },
  bottomButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bottomButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

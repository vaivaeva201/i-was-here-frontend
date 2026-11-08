import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BottomNavBar from './nav-bar';

const COLORS = {
  background: '#252424',
  surface: '#2B2B2B',
  glass: 'rgba(0,0,0,0.6)',
  border: '#5E5E5E',
  accent: '#61D2E9',
  accentDark: '#8663FC',
  onAccent: '#FFFFFF',
  textPrimary: '#FFFFFF',
  textSecondary: '#C9C9C9',
  textMuted: '#999999',
};

const { height } = Dimensions.get('window');

type MarkerData = {
  id: string;
  coordinate: { latitude: number; longitude: number };
  title: string;
  description: string;
  author: string;
  authorUuid?: string;
  timestamp: string;
};

export default function MainPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Location
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [placeName, setPlaceName] = useState('Locating...');

  // Posts (kept in memory for now, they reset when the app reloads)
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);

  // Create post form
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postMessage, setPostMessage] = useState('');

  // Ask for permission, read the position once, then look up the city name once
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Location permission was denied. Enable it in your settings to see nearby posts.');
          return;
        }

        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (cancelled) return;
        setLocation(current);

        try {
          const [place] = await Location.reverseGeocodeAsync({
            latitude: current.coords.latitude,
            longitude: current.coords.longitude,
          });
          if (!cancelled) setPlaceName(place?.city ?? 'Unknown location');
        } catch {
          if (!cancelled) setPlaceName('Unknown location');
        }
      } catch (error) {
        console.error('Location error:', error);
        if (!cancelled) setErrorMsg('Could not get your location.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const closeCreatePost = () => {
    setShowCreatePost(false);
    setPostTitle('');
    setPostMessage('');
  };

  const handleCreatePost = () => {
    const title = postTitle.trim();
    const message = postMessage.trim();
    if (!location || !title || !message) return;

    setMarkers((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        coordinate: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        title,
        description: placeName,
        author: 'You',
        timestamp: 'just now',
      },
    ]);

    // The form closes when the user taps OK
    Alert.alert('Success', 'Your post has been published.', [
      { text: 'OK', onPress: closeCreatePost },
    ]);
  };

  // Loading screen (also shows the error message if something went wrong)
  if (!location) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <Text style={styles.loadingText}>{errorMsg ?? 'Finding your location...'}</Text>
        </View>
      </View>
    );
  }

  const region = {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    latitudeDelta: 0.004,
    longitudeDelta: 0.004,
  };

  const selected = markers.find((m) => m.id === selectedMarker) ?? null;
  const canPost = postTitle.trim().length > 0 && postMessage.trim().length > 0;

  return (
    <View style={styles.container}>
      <MapView
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        userInterfaceStyle="dark"
        style={styles.map}
        initialRegion={region}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        onPress={() => setSelectedMarker(null)}
      >
        <Marker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={styles.userLocationMarker}>
            <View style={styles.userLocationDot} />
          </View>
        </Marker>

        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            pinColor={selectedMarker === marker.id ? COLORS.accent : COLORS.accentDark}
            onPress={() => setSelectedMarker(selectedMarker === marker.id ? null : marker.id)}
            stopPropagation
          />
        ))}
      </MapView>

      {/* Top bar: location name in the middle, profile button on the right */}
      <View
        style={[styles.header, { paddingTop: Math.max(insets.top - 8, 8) }]}
        pointerEvents="box-none"
      >
        <View style={styles.headerContent} pointerEvents="box-none">
          <View style={styles.headerSpacer} />

          <View style={styles.locationPill} pointerEvents="none">
            <Ionicons name="location" size={20} color={COLORS.accent} />
            <Text style={styles.locationText} numberOfLines={1}>
              {placeName}
            </Text>
          </View>

          <Pressable
            style={styles.headerButton}
            onPress={() => router.push('/sign-in')}
            accessibilityLabel="Profile"
          >
            <Ionicons name="person-outline" size={28} color={COLORS.textPrimary} />
          </Pressable>
        </View>
      </View>

      {/* Popup for the selected post */}
      {selected && (
        <View style={styles.popupContainer}>
          <Pressable
            style={styles.postPopup}
            onPress={() =>
              router.push({ pathname: '/comments', params: { postId: selected.id } })
            }
          >
            <View style={styles.popupHeader}>
              <View style={styles.popupLocation}>
                <Ionicons name="location" size={14} color={COLORS.accent} />
                <Text style={styles.popupLocationText}>{selected.description}</Text>
              </View>
              <Pressable
                style={styles.popupCloseButton}
                onPress={(e) => {
                  e.stopPropagation();
                  setSelectedMarker(null);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close-circle" size={24} color={COLORS.textMuted} />
              </Pressable>
            </View>

            <Text style={styles.popupDescription}>{selected.title}</Text>

            <View style={styles.popupFooter}>
              <Pressable
                onPress={() => {
                  if (selected.authorUuid) {
                    router.push({ pathname: '/sign-in', params: { uuid: selected.authorUuid } });
                  }
                }}
              >
                <Text style={styles.popupAuthor}>
                  by {selected.author} • {selected.timestamp}
                </Text>
              </Pressable>
              <View style={styles.popupAction}>
                <Text style={styles.popupActionText}>View Post</Text>
                <Ionicons name="chevron-forward" size={14} color={COLORS.accent} />
              </View>
            </View>
          </Pressable>
        </View>
      )}

      {/* The Add button on the nav bar opens the create post form */}
      <BottomNavBar onAddPress={() => setShowCreatePost(true)} />

      {/* Create post form */}
      <Modal
        visible={showCreatePost}
        transparent
        animationType="slide"
        onRequestClose={closeCreatePost}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          {/* Tapping the dark area closes the form */}
          <Pressable style={styles.modalBackdrop} onPress={closeCreatePost} />

          <View style={styles.createPostContainer}>
            <View style={styles.modalHandle} />

            <View style={styles.createPostHeader}>
              <Text style={styles.createPostTitle}>Create Post</Text>
              <Pressable style={styles.closeButton} onPress={closeCreatePost}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </Pressable>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Title</Text>
              <TextInput
                style={styles.titleInput}
                placeholder="Give your post a title..."
                placeholderTextColor={COLORS.textMuted}
                value={postTitle}
                onChangeText={setPostTitle}
                maxLength={100}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Message</Text>
              <TextInput
                style={styles.messageInput}
                placeholder="What's happening here?"
                placeholderTextColor={COLORS.textMuted}
                value={postMessage}
                onChangeText={setPostMessage}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={500}
              />
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                pressed && styles.submitButtonPressed,
                !canPost && styles.submitButtonDisabled,
              ]}
              onPress={handleCreatePost}
              disabled={!canPost}
            >
              <LinearGradient
                colors={[COLORS.accent, COLORS.accentDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.submitButtonGradient}
              >
                <Ionicons name="paper-plane" size={20} color={COLORS.onAccent} />
                <Text style={styles.submitButtonText}>Post</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  map: {
    ...StyleSheet.absoluteFill,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerSpacer: {
    width: 44,
  },
  headerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.glass,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  locationPill: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.glass,
    borderRadius: 20,
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  locationText: {
    flexShrink: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
  },

  userLocationMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(66, 133, 244, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userLocationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4285F4',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#4285F4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },

  popupContainer: {
    position: 'absolute',
    bottom: 120, // sits above the nav bar
    left: 24,
    right: 24,
  },
  postPopup: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  popupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  popupLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  popupCloseButton: {
    padding: 4,
    marginRight: -4,
    marginTop: -4,
  },
  popupLocationText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  popupDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  popupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  popupAuthor: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  popupAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  popupActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.accent,
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  createPostContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: height * 0.85,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  createPostHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  createPostTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  titleInput: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  messageInput: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 120,
  },
  submitButton: {
    marginTop: 16,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onAccent,
    letterSpacing: 0.3,
  },
  submitButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
});

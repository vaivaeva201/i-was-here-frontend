
import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  Text,
  TextInput,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import Octicons from '@expo/vector-icons/Octicons';
import { Ionicons } from '@expo/vector-icons';

import BottomNavBar from './nav-bar';

const COLORS = {
  background: '#252424',
  surface: '#2B2B2B',
  glass: 'rgba(0,0,0,0.6)',
  border: '#5E5E5E',
  accent: '#61D2E9',
  accentDark: '#8663FC',
  like: '#FF5A6E',
  onAccent: '#FFFFFF',
  textPrimary: '#FFFFFF',
  textSecondary: '#C9C9C9',
  textMuted: '#999999',
};

const { width, height } = Dimensions.get('window');
const wp = (percent: number) => (width * percent) / 100;
const hp = (percent: number) => (height * percent) / 100;

type Post = {
  id: string;
  username: string;
  message: string;
  likes: number;
  comments: number;
  liked: boolean;
  createdAt: number; 
  distanceM: number;
};

const minutesAgo = (m: number) => Date.now() - m * 60 * 1000;

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    username: 'Ieva',
    message: 'The old town square is surprisingly quiet this morning. Great time for coffee.',
    likes: 12,
    comments: 3,
    liked: false,
    createdAt: minutesAgo(25),
    distanceM: 300,
  },
  {
    id: '2',
    username: 'Mantas',
    message: 'Found a tiny bookshop behind the cathedral. Worth the detour!',
    likes: 45,
    comments: 8,
    liked: false,
    createdAt: minutesAgo(130),
    distanceM: 850,
  },
  {
    id: '3',
    username: 'Gabija',
    message: 'Street musicians by the river tonight, if anyone is nearby.',
    likes: 7,
    comments: 1,
    liked: false,
    createdAt: minutesAgo(60 * 6),
    distanceM: 1400,
  },
];

const formatMeta = (createdAt: number, distanceM: number) => {
  const minutes = Math.max(1, Math.floor((Date.now() - createdAt) / 60000));
  let time: string;
  if (minutes < 60) time = `${minutes}m ago`;
  else if (minutes < 1440) time = `${Math.floor(minutes / 60)}h ago`;
  else time = `${Math.floor(minutes / 1440)}d ago`;

  if (distanceM === 0) return time;

  const dist =
    distanceM < 1000 ? `${distanceM} m away` : `${(distanceM / 1000).toFixed(1)} km away`;
  return `${time}  \u00B7  ${dist}`;
};

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);

  const [showCreatePost, setShowCreatePost] = useState(false);
  const [postMessage, setPostMessage] = useState('');

  const toggleLike = (id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
      )
    );
  };

  const openComments = (_postId: string) => {
    Alert.alert('Comments', 'Comments are coming soon.');
  };

  const closeCreatePost = () => {
    setShowCreatePost(false);
    setPostMessage('');
  };

  const handleCreatePost = () => {
    const message = postMessage.trim();
    if (!message) return;

    const newPost: Post = {
      id: String(Date.now()),
      username: 'You',
      message,
      likes: 0,
      comments: 0,
      liked: false,
      createdAt: Date.now(),
      distanceM: 0,
    };

    setPosts((prev) => [newPost, ...prev]);
    closeCreatePost();
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.main}>
        <View style={styles.locationBar}>
          <Ionicons name="location-sharp" size={20} color={COLORS.accent} />
          <Text style={styles.locationText}>Nearby</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {posts.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={56} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>No posts nearby yet</Text>
              <Text style={styles.emptyText}>Tap + to share something with people around you.</Text>
            </View>
          )}

          {posts.map((post) => (
            <View key={post.id} style={styles.feedItem}>
              <View style={styles.userRow}>
                <Ionicons
                  name="person-circle-outline"
                  size={wp(11)}
                  color="rgba(255,255,255,0.7)"
                />
                <View>
                  <Text style={styles.username}>{post.username}</Text>
                  <Text style={styles.meta}>{formatMeta(post.createdAt, post.distanceM)}</Text>
                </View>
              </View>

              <Text style={styles.message}>{post.message}</Text>

              <View style={styles.statsRow}>
                <Pressable
                  style={styles.statsItem}
                  onPress={() => toggleLike(post.id)}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={post.liked ? 'Unlike post' : 'Like post'}
                >
                  {post.liked ? (
                    <Octicons name="heart-fill" size={hp(3)} color={COLORS.like} />
                  ) : (
                    <SimpleLineIcons name="heart" size={hp(3)} color="white" />
                  )}
                  <Text style={[styles.statsText, post.liked && styles.statsTextLiked]}>
                    {post.likes}
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.statsItem}
                  onPress={() => openComments(post.id)}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel="Open comments"
                >
                  <Ionicons name="chatbubble-outline" size={hp(3)} color="white" />
                  <Text style={styles.statsText}>{post.comments}</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>

        <BottomNavBar onAddPress={() => setShowCreatePost(true)} />

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
            <Pressable style={styles.modalBackdrop} onPress={closeCreatePost} />

            <View style={styles.sheet}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Create Post</Text>
                <Pressable onPress={closeCreatePost} hitSlop={10}>
                  <Ionicons name="close" size={26} color="white" />
                </Pressable>
              </View>

              <TextInput
                style={styles.messageInput}
                placeholder="What's on your mind?"
                placeholderTextColor={COLORS.textMuted}
                value={postMessage}
                onChangeText={setPostMessage}
                multiline
                maxLength={500}
                textAlignVertical="top"
              />

              <Pressable
                style={[styles.submitButton, !postMessage.trim() && styles.submitButtonDisabled]}
                onPress={handleCreatePost}
                disabled={!postMessage.trim()}
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
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: COLORS.background },

  locationBar: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  locationText: {
    color: 'white',
    fontSize: hp(3),
    fontWeight: '600',
    opacity: 0.7,
  },

  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: hp(2),
    paddingBottom: hp(14),
  },

  feedItem: {
    width: wp(90),
    backgroundColor: COLORS.surface,
    borderRadius: wp(3),
    marginVertical: hp(1.5),
    padding: wp(3),
  },

  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1),
    gap: wp(3),
  },

  username: {
    color: 'white',
    fontSize: hp(2),
    fontWeight: '600',
  },

  meta: {
    color: COLORS.textMuted,
    fontSize: hp(1.6),
    marginTop: 2,
  },

  message: {
    color: '#fff',
    fontSize: hp(1.9),
    marginBottom: hp(1),
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: wp(10),
  },

  statsItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statsText: {
    color: 'white',
    fontSize: hp(1.8),
    marginLeft: wp(1),
  },

  statsTextLiked: {
    color: COLORS.like,
  },

  emptyState: {
    alignItems: 'center',
    paddingTop: hp(12),
    paddingHorizontal: 32,
    gap: 8,
  },

  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },

  emptyText: {
    color: COLORS.textMuted,
    fontSize: 15,
    textAlign: 'center',
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: COLORS.glass,
  },

  sheet: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: COLORS.surface,
  },

  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  sheetTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: '700',
  },

  messageInput: {
    minHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    color: 'white',
    fontSize: 16,
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

  submitButtonDisabled: {
    opacity: 0.5,
  },
});

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
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';

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
  onAccent: '#FFFFFF',
  textPrimary: '#FFFFFF',
  textSecondary: '#C9C9C9',
  textMuted: '#999999',
};

const { width, height } = Dimensions.get('window');
const wp = (percent: number) => (width * percent) / 100;
const hp = (percent: number) => (height * percent) / 100;

type Post = {
  id: number;
  username: string;
  message: string;
  likes: number;
  comments: number;
  liked: boolean;
};

const MOCK_POSTS: Post[] = [
  { id: 1, username: 'User1', message: 'This is a message from User1', likes: 12, comments: 3, liked: false },
  { id: 2, username: 'User2', message: 'This is a message from User2', likes: 45, comments: 8, liked: false },
  { id: 3, username: 'User3', message: 'This is a message from User3', likes: 7, comments: 1, liked: false },
];

export default function Feed() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);

  const [showCreatePost, setShowCreatePost] = useState(false);
  const [postMessage, setPostMessage] = useState('');

  const toggleLike = (id: number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
      )
    );
  };

  const openComments = (postId: number) => {
    router.push(`/comments`);
  };

  const closeCreatePost = () => {
    setShowCreatePost(false);
    setPostMessage('');
  };

  const handleCreatePost = () => {
    const message = postMessage.trim();
    if (!message) return;

    const newPost: Post = {
      id: Date.now(),
      username: 'You',
      message,
      likes: 0,
      comments: 0,
      liked: false,
    };

    setPosts((prev) => [newPost, ...prev]);
    closeCreatePost();
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.main}>

        <View style={styles.locationBar}>
          <Text style={styles.locationText}>Nearby</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {posts.map((post) => (
            <View key={post.id} style={styles.feedItem}>

              <View style={styles.userRow}>
                <Ionicons name="person-circle-outline" size={wp(11)} color="rgba(255,255,255,0.7)" />
                <Text style={styles.username}>{post.username}</Text>
              </View>

              <Text style={styles.message}>{post.message}</Text>

              <View style={styles.statsRow}>

                <Pressable style={styles.statsItem} onPress={() => toggleLike(post.id)}>
                  {post.liked ? (
                    <Octicons name="heart-fill" size={hp(3)} color="white" />
                  ) : (
                    <SimpleLineIcons name="heart" size={hp(3)} color="white" />
                  )}
                  <Text style={styles.statsText}>{post.likes}</Text>
                </Pressable>

                <Pressable style={styles.statsItem} onPress={() => openComments(post.id)}>
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
                placeholderTextColor="#999"
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
  main: { flex: 1, backgroundColor: '#252424' },

  locationBar: {
    height: hp(7),
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: hp(0.2),
    borderBottomColor: '#5E5E5E',
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
    backgroundColor: '#2B2B2B',
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


  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#2B2B2B',
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
    borderColor: '#5E5E5E',
    backgroundColor: '#252424',
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
  submitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});

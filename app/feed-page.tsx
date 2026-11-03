import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  Text,
  Pressable,
  Image,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import Octicons from '@expo/vector-icons/Octicons';
import { Ionicons } from '@expo/vector-icons';

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

export default function Feed() {
  const router = useRouter();
  const [locationName, setLocationName] = useState('Unknown');
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      const locations = ['New York', 'London', 'Paris', 'Tokyo'];
      const newLocation = locations[Math.floor(Math.random() * locations.length)];
      setLocationName(newLocation);

      const examplePosts = Array.from(
        { length: Math.floor(Math.random() * 5) + 1 },
        (_, i) => ({
          id: i,
          username: `User${i + 1}`,
          message: `This is a message from User${i + 1} at ${newLocation}`,
          likes: Math.floor(Math.random() * 100),
          comments: Math.floor(Math.random() * 20),
          liked: false,
        })
      );

      setPosts(examplePosts);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.main}>

        <View style={styles.locationBar}>
          <Text style={styles.locationText}>{locationName}</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {posts.map((post) => (
            <View key={post.id} style={styles.feedItem}>

              <View style={styles.userRow}>
                <Ionicons name="person-circle-outline" size={wp(11)} color="white"  opacity='0.7'/>
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

        <View style={styles.bottomBar}>

          <Pressable style={styles.bottomButton} onPress={() => router.push('/MainPage')}>
            <Image
              source={require('../assets/images/logo-iwh.png')}
              style={styles.mainButtonImage}
              resizeMode="contain"
            />
          </Pressable>

          <LinearGradient
            colors={['#8663FC', '#61D2E9']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 0.5, y: 0 }}
            style={styles.addButtonGradient}
          >
            <Pressable style={styles.addButton} onPress={() => router.push('/MainPage')}>
              <Ionicons name="add" size={hp(4)} color="white" />
            </Pressable>
          </LinearGradient>

          <Pressable style={styles.bottomButton} onPress={() => router.push('/MainPage')}>
            <Ionicons name="person-outline" size={hp(4)} color="white" />
          </Pressable>

        </View>
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

  bottomBar: {
    position: 'absolute',
    bottom: hp(2),
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  bottomButton: {
    marginHorizontal: wp(10),
    justifyContent: 'center',
    alignItems: 'center',
  },

  mainButtonImage: {
    width: wp(15),
    height: wp(15),
    marginLeft: wp(-7)
  },

  addButtonGradient: {
    width: wp(14),
    height: wp(14),
    borderRadius: wp(7),
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: wp(10),
  },

  addButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

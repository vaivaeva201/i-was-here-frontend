import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Href, usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Tab = {
  key: string;
  route: Href;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
};

const MAP_TAB: Tab = { key: 'map', route: '/MainPage', icon: 'map-outline', activeIcon: 'map' };
const FEED_TAB: Tab = { key: 'feed', route: '/feed-page', icon: 'home-outline', activeIcon: 'home' };

const ACTIVE = '#FFFFFF';
const INACTIVE = 'rgba(255,255,255,0.5)';

type Props = {
  onAddPress?: () => void;
};

export default function BottomNavBar({ onAddPress }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const renderTab = (tab: Tab) => {
    const active = pathname === tab.route;
    return (
      <Pressable
        key={tab.key}
        style={styles.item}
        onPress={() => router.push(tab.route)}
        accessibilityRole="button"
        accessibilityLabel={tab.key}
        accessibilityState={{ selected: active }}
      >
        <Ionicons
          name={active ? tab.activeIcon : tab.icon}
          size={26}
          color={active ? ACTIVE : INACTIVE}
        />
      </Pressable>
    );
  };

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom - 14 , 6) }]}>
      {renderTab(MAP_TAB)}

      <View style={styles.item}>
        <LinearGradient
          colors={['#8663FC', '#61D2E9']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 0.5, y: 0 }}
          style={styles.addGradient}
        >
          <Pressable
            style={styles.addButton}
            onPress={onAddPress ?? (() => router.push('/sign-in'))}
            accessibilityRole="button"
            accessibilityLabel="Add post"
          >
            <Ionicons name="add" size={40} color="white" />
          </Pressable>
        </LinearGradient>
      </View>

      {renderTab(FEED_TAB)}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 6,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 0,
  },
  addGradient: {
    width: 68,
    height: 68,
    borderRadius: 34,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButton: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from 'react-native';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';


import { login } from '../lib/api';

const { width, height } = Dimensions.get('window');
const wp = (percent: number) => (width * percent) / 100;
const hp = (percent: number) => (height * percent) / 100;

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [fontsLoaded] = useFonts({
    InriaSerifBold: require('../assets/Fonts/Inria_Serif/InriaSerif-Bold.ttf'),
    Tienne: require('../assets/Fonts/Tienne/Tienne-Regular.ttf'),
    TienneBold: require('../assets/Fonts/Tienne/Tienne-Bold.ttf'),
  });

  if (!fontsLoaded) return null;

  const handleSignIn = async () => {
    if (!username || !password) {
      Alert.alert("Missing fields", "Please enter both username and password");
      return;
    }

    setLoading(true);

    const result = await login(username, password);

    setLoading(false);

    if (!result.ok) {
      Alert.alert("Login failed", result.data.message || "Invalid credentials");
      return;
    }

    try {
      await AsyncStorage.setItem("accessToken", result.data.accessToken);
      await AsyncStorage.setItem("refreshToken", result.data.refreshToken);
    } catch (err) {
      console.error("Error saving tokens", err);
    }

    Alert.alert("Success", "Logged in successfully!");
    router.push("/MainPage"); 
  };

  const handleRegister = () => router.push('../sign-up');

  const handleGuest = async () => {
    router.replace("/MainPage");
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.main}>
        <ImageBackground
          style={styles.container}
          source={require('../assets/images/background-login.jpg')}
          resizeMode="cover"
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            automaticallyAdjustKeyboardInsets={true}
          >
            <Image
              source={require('../assets/images/logo-iwh.png')}
              style={styles.logo}
            />

            <View style={styles.secondScreen}>
              <Text style={styles.title}>i was here</Text>

              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Username"
                    placeholderTextColor="#C0BDC7"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.textInputPassword}
                    placeholder="Password"
                    placeholderTextColor="#C0BDC7"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Pressable
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(prev => !prev)}
                  >
                    <Ionicons
                      name={showPassword ? 'eye' : 'eye-off'}
                      size={20}
                      color="#C0BDC7"
                    />
                  </Pressable>
                </View>

                <Pressable
                  style={styles.buttonSignIn}
                  onPress={handleSignIn}
                  disabled={loading}
                >
                  <Text style={styles.buttonTextSignIn}>
                    {loading ? "Signing in..." : "Sign in"}
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.buttonRegister}
                  onPress={handleRegister}
                >
                  <Text style={styles.buttonTextRegister}>Register</Text>
                </Pressable>

                <Pressable
                  style={styles.buttonguest}
                   onPress={handleGuest}
                >
                   <Text style={styles.buttonTextGuest}>Explore as a Guest</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </ImageBackground>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  main: { 
    flex: 1, 
    backgroundColor: '#000' 
  },

  container: { flex: 1 },

  scrollContent: { 
    flexGrow: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: hp(4), 
    marginBottom: hp(10) 
  },

  logo: { 
    width: wp(40), 
    aspectRatio: 1, 
    resizeMode: 'contain', 
    marginBottom: hp(3.5) 
  },

  secondScreen: { 
    width: wp(92.5), 
    maxWidth: 400, 
    backgroundColor: 'white', 
    borderRadius: 50, 
    borderWidth: 1, 
    borderColor: '#C7BBBB', 
    alignItems: 'center', 
    paddingVertical: hp(4), 
    paddingHorizontal: wp(8), 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.25, 
    shadowRadius: 6, 
    elevation: 6 
  },

  title: { 
    fontSize: hp(5), 
    fontFamily: 'InriaSerifBold', 
    opacity: 0.63, 
    marginBottom: hp(3) 
  },

  formContainer: { 
    width: '100%', 
    alignItems: 'center' 
  },

  inputContainer: { 
    width: '100%', 
    marginBottom: hp(2.5), 
    backgroundColor: 'white', 
    borderRadius: 12, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.25, 
    shadowRadius: 4, 
    elevation: 3 
  },

  textInput: { 
    width: '100%', 
    height: hp(5.5), 
    borderWidth: 1, 
    borderColor: '#262628', 
    borderRadius: 12, 
    paddingHorizontal: 10, 
    fontSize: hp(2), 
    fontFamily: 'Tienne', 
    color: '#7A748C' 
  },

  passwordContainer: { 
    width: '100%', 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: hp(2.5), 
    borderRadius: 12, 
    backgroundColor: 'white', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.25, 
    shadowRadius: 4, 
    elevation: 3 
  },

  textInputPassword: { 
    flex: 1, 
    height: hp(5.5), 
    borderWidth: 1, 
    borderColor: '#262628', 
    borderRadius: 12, 
    paddingHorizontal: 10, 
    fontSize: hp(2), 
    fontFamily: 'Tienne', 
    color: '#7A748C' 
  },

  eyeButton: { 
    position: 'absolute', 
    right: 10, 
    padding: 5 
  },

  buttonSignIn: { 
    width: '100%', 
    height: hp(6), 
    backgroundColor: '#000', 
    borderRadius: hp(3), 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: hp(3), 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4, 
    elevation: 4 
  },

  buttonTextSignIn: { 
    color: 'white', 
    fontSize: hp(2.5), 
    fontFamily: 'TienneBold' 
  },

  buttonRegister: {
    width: wp(40), 
    height: hp(5), 
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: '#262628', 
    borderRadius: hp(3), 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: hp(2), 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.25, 
    shadowRadius: 4, 
    elevation: 4 
  },

  buttonTextRegister: { 
    color: '#262628', 
    fontSize: hp(1.8), 
    fontFamily: 'Tienne' 
  },

  buttonguest: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp(3), 
    marginBottom: hp(-2.0),
  },

  buttonTextGuest: {
    color: '#71A0EF', 
    fontSize: hp(1.9), 
    fontFamily: 'Tienne',
    textDecorationLine: 'underline',
  }
});

export default Login;

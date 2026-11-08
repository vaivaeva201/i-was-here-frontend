import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  ImageBackground,
  Dimensions,
  Alert,
} from 'react-native';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import AntDesign from '@expo/vector-icons/AntDesign';

import { apiPost, ENDPOINTS } from '../lib/api';

const { width, height } = Dimensions.get('window');
const wp = (percent: number) => (width * percent) / 100;
const hp = (percent: number) => (height * percent) / 100;

const SignUp: React.FC = () => {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  const COLORS = {
  textMuted: "#999999",
  error: "#E74C3C",
  warning: "#F39C12",
  secondary: "#61D2E9",
  success: "#2ECC71",
};

const getPasswordStrength = () => {
  if (!password) {
    return { level: 0, text: "", color: COLORS.textMuted };
  }

  let strength = 0;

  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  const levels = [
    { level: 1, text: "Weak", color: COLORS.error },
    { level: 2, text: "Fair", color: COLORS.warning },
    { level: 3, text: "Good", color: COLORS.secondary },
    { level: 4, text: "Strong", color: COLORS.success },
  ];

  return levels[strength - 1] || {
    level: 0,
    text: "",
    color: COLORS.textMuted,
  };
};

const passwordStrength = getPasswordStrength();

  const [fontsLoaded] = useFonts({
    InriaSerifBold: require('../assets/Fonts/Inria_Serif/InriaSerif-Bold.ttf'),
    Tienne: require('../assets/Fonts/Tienne/Tienne-Regular.ttf'),
    TienneBold: require('../assets/Fonts/Tienne/Tienne-Bold.ttf'),
  });

  if (!fontsLoaded) return null;

  const handleRegister = async () => {
    if (!agree) {
      Alert.alert("Agreement Required", "Please agree to the Terms & Conditions.");
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      Alert.alert('Email is required');
      return;
    } else if (!emailRegex.test(email)) {
      Alert.alert(
        "Invalid Email",
        'Please enter a valid email address');
      return;
    }

    if (!username || !nickname || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      Alert.alert(
        "Invalid Password",
        "Password must be at least 8 characters, include 1 uppercase letter and 1 number."
      );
      return;
    }

    setLoading(true);

    const body = {
      username,
      nickname,
      email,
      password,
    };

    try {
      const { ok, data } = await apiPost(ENDPOINTS.REGISTER, body);

      if (!ok) {
        Alert.alert("Registration Failed", data.message || "Unknown error");
      } else {
        Alert.alert("Success", `User registered: ${data.user.username}`);
        router.push('../MainPage');
      }
    } catch (err) {
      Alert.alert("Error", "Cannot reach backend server.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = () => router.push('../sign-in');
  const handleTermsPress = () =>
    Alert.alert("Terms & Conditions", "“By registering you agree to our Terms of Service (placeholder).");


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
          <Pressable
            style={{ position: 'absolute', top: hp(6), left: wp(5), zIndex: 10 }}
            onPress={handleSignIn}
          >
            <AntDesign name="left" size={hp(4)} color="white" />
          </Pressable>

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

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Nickname"
                    placeholderTextColor="#C0BDC7"
                    value={nickname}
                    onChangeText={setNickname}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Email"
                    placeholderTextColor="#C0BDC7"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType='email-address'
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
                  />
                  <Pressable
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye" : "eye-off"}
                      size={20}
                      color="#C0BDC7"
                    />
                  </Pressable>
                </View>

                {password.length > 0 && (
                  <View style={styles.passwordStrengthContainer}>
                    <View style={styles.passwordStrengthBar}>
                      {[1, 2, 3, 4].map((level) => (
                        <View
                          key={level}
                          style={[
                          styles.passwordStrengthSegment,
                         {
                            backgroundColor:
                            passwordStrength.level >= level
                            ? passwordStrength.color
                            : "#E0E0E0",
                          },
                        ]}
                      />
                    ))}
                    </View>

                  <Text style={{ color: passwordStrength.color, fontSize: hp(1.6) }}>
                    {passwordStrength.text}
                  </Text>
                  </View>
                )}

                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.textInputPassword}
                    placeholder="Confirm Password"
                    placeholderTextColor="#C0BDC7"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <Pressable
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons
                      name={showConfirmPassword ? "eye" : "eye-off"}
                      size={20}
                      color="#C0BDC7"
                    />
                  </Pressable>
                </View>

                <View style={styles.row}>
                  <Pressable
                    onPress={() => setAgree(!agree)}
                    style={[styles.checkbox, agree && styles.checkboxChecked]}
                  >
                    {agree && <Ionicons name="checkmark" size={14} color="white" />}
                  </Pressable>
                  <Text style={styles.agreeText}>Agree with</Text>
                  <Pressable onPress={handleTermsPress}>
                    <Text style={styles.terms}> Terms & Conditions</Text>
                  </Pressable>
                </View>

                <Pressable
                  style={styles.buttonRegister}
                  onPress={handleRegister}
                  disabled={loading}
                >
                  <Text style={styles.buttonTextRegister}>
                    {loading ? "Registering..." : "Register"}
                  </Text>
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

  container: { 
    flex: 1 
  },
  scrollContent: { 
    flexGrow: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: hp(4), 
    marginBottom: hp(60) 
  },

  logo: { 
    width: wp(35), 
    aspectRatio: 1, 
    resizeMode: 'contain', 
    marginBottom: hp(1) 
  },

  secondScreen: { 
    width: wp(95), 
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

  buttonRegister: { 
    width: '100%', 
    height: hp(6), 
    backgroundColor: '#000',
    borderRadius: hp(3), 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: hp(4), 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.25, 
    shadowRadius: 4, 
    elevation: 4 
  },

  buttonTextRegister: {
    color: 'white', 
    fontSize: hp(2.5), 
    fontFamily: 'TienneBold' 
  },

  row: { 
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: hp(0.25) 
  },

  checkbox: { 
    width: 20, 
    height: 20, 
    borderRadius: 5, 
    borderWidth: 1, 
    borderColor: '#000', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: hp(1), 
    backgroundColor: 'white' 
  },

  checkboxChecked: { 
    backgroundColor: '#000'
  },

  agreeText: { 
    fontSize: hp(1.5), 
    color: '#000', 
    fontFamily: 'Tienne' 
  },

  terms: { 
    color: '#71A0EF', 
    fontSize: hp(1.5), 
    fontFamily: 'Tienne', 
    textDecorationLine: 'underline'
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
  },

  passwordStrengthContainer: {
  width: "85%",
  marginTop: hp(-1.5),
  marginBottom: hp(1),
},

passwordStrengthBar: {
  flexDirection: "row",
  gap: 5,
  height: 5,
  marginBottom: hp(0.8),
},

passwordStrengthSegment: {
  flex: 1,
  borderRadius: 5,
},
});

export default SignUp;

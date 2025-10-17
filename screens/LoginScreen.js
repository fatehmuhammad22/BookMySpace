import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const SERVER_IP = "http://192.168.100.9:5000";

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${SERVER_IP}/login`, {
        email,
        password
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      console.log("Login Response:", response.data);

      if (response.data.success) {
        await AsyncStorage.setItem('userEmail', email);
        await AsyncStorage.setItem('userName', response.data.user.full_name);
        await AsyncStorage.setItem('authToken', response.data.token || 'dummy_token'); 

        navigation.navigate("Dashboard", { 
          email: email,
          name: response.data.user.full_name 
        });
      } else {
        Alert.alert('Error', response.data.message || 'Login failed');
      }
    } catch (error) {
      console.log("Login error:", error.response?.data || error.message);
      
      let errorMessage = 'Something went wrong. Please try again.';
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Invalid email or password';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* App Name */}
      <Text style={styles.appName}>BookMySpace</Text>
      <Text style={styles.appSubtitle}>Login to your account</Text>

      {/* Login Card */}
      <View style={styles.card}>
        <Text style={styles.welcomeText}>Welcome Back</Text>
        <Text style={styles.description}>Enter your credentials to access your account</Text>

        {/* Email Input */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="name@example.com"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Password Input */}
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder="********"
            placeholderTextColor="#999"
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgotPassword}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        {/* Sign In Button */}
        <TouchableOpacity 
          style={styles.signInButton} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.signInText}>Sign In</Text>
          )}
        </TouchableOpacity>

        {/* Sign Up Link */}
        <Text style={styles.signUpText}>
          Don't have an account?{' '}
          <Text 
            style={styles.signUpLink} 
            onPress={() => navigation.navigate('Signup')}
          >
            Sign up
          </Text>
        </Text>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3FAF2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'green',
    includeFontPadding: false,  
    textAlignVertical: 'center', 
  },
  appSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  card: {
    backgroundColor: '#fff',
    width: '90%',
    padding: 20,
    borderRadius: 10,
    elevation: 3,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
    includeFontPadding: false,
    textAlignVertical: 'center',
    lineHeight: 20, // Explicit line height
  },
  label: {
    fontSize: 14,
    alignSelf: 'flex-start',
    marginTop: 10,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    height: 45,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginTop: 5,
    backgroundColor: '#F9F9F9',
    color: '#000000',
  },
  passwordContainer: {
    width: '100%',
    alignItems: 'center',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    color: 'blue',
    marginTop: 5,
    fontSize: 12,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  signInButton: {
    width: '100%',
    backgroundColor: 'green',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 15,
  },
  signInText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  signUpText: {
    fontSize: 14,
    marginTop: 10,
    color: '#555',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  signUpLink: {
    color: 'blue',
    fontWeight: 'bold',
  },
});

export default LoginScreen;

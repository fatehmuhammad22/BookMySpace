import React, { useState } from 'react';
import { View, Text, Alert, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import axios from "axios";

const SignUpScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [teamName, setTeamName] = useState('');
  const [sport, setSport] = useState('Cricket');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const sports = ['Cricket', 'Football'];

  const handleSignup = async () => {
    if (!fullName || !email || !phoneNumber || !teamName || !password || !confirmPassword) {
        Alert.alert("Error", "All fields are required");
        return;
    }

    if (password !== confirmPassword) {
        Alert.alert("Error", "Passwords do not match");
        return;
    }

    try {
        const response = await axios.post("http://192.168.100.9:5000/signup", {
            full_name: fullName,
            email,
            phone_number: phoneNumber,
            team_name: teamName,
            sport: sport,
            password,
        });

        Alert.alert("Success", response.data.message, [
          { text: "OK", onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error) {
        Alert.alert("Error", error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* App Name */}
      <Text style={styles.appName}>BookMySpace</Text>
      <Text style={styles.appSubtitle}>Create your account</Text>

      {/* Sign Up Card */}
      <View style={styles.card}>
        <Text style={styles.signUpText}>Sign Up</Text>
        <Text style={styles.description}>
          Join BookMySpace to start booking grounds and challenging teams
        </Text>

        {/* Full Name Input */}
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="John Doe"
          placeholderTextColor="#999"
          value={fullName}
          onChangeText={setFullName}
        />

        {/* Email Input */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="name@example.com"
          placeholderTextColor="#999"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        {/* Phone Number Input */}
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="+923001234567"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />

        {/* Team Name Input */}
        <Text style={styles.label}>Team Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Thunder Strikers"
          placeholderTextColor="#999"
          value={teamName}
          onChangeText={setTeamName}
        />

        {/* Sport Selection */}
        <Text style={styles.label}>Sport</Text>
        <View style={styles.sportContainer}>
          {sports.map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.sportButton,
                sport === item && styles.selectedSportButton
              ]}
              onPress={() => setSport(item)}
            >
              <Text style={[
                styles.sportText,
                sport === item && styles.selectedSportText
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Password Input */}
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="********"
          placeholderTextColor="#999"
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
        />

        {/* Confirm Password Input */}
        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          placeholder="********"
          placeholderTextColor="#999"
          secureTextEntry={true}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        {/* Create Account Button */}
        <TouchableOpacity style={styles.createAccountButton} onPress={handleSignup}>
          <Text style={styles.createAccountText}>Create Account</Text>
        </TouchableOpacity>

        {/* Sign In Link */}
        <Text style={styles.signInText}>
          Already have an account?{' '}
          <Text style={styles.signInLink} onPress={() => navigation.navigate('Login')}>
            Sign in
          </Text>
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F3FAF2',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
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
  signUpText: {
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
  sportContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 5,
  },
  sportButton: {
    width: '48%',
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  selectedSportButton: {
    backgroundColor: 'green',
    borderColor: 'green',
  },
  sportText: {
    color: '#333',
  },
  selectedSportText: {
    color: 'white',
    fontWeight: 'bold',
  },
  createAccountButton: {
    width: '100%',
    backgroundColor: 'green',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 15,
  },
  createAccountText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  signInText: {
    fontSize: 14,
    marginTop: 10,
    color: '#555',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  signInLink: {
    color: 'blue',
    fontWeight: 'bold',
  },
});

export default SignUpScreen;
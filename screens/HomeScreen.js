import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

const ClockIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#28a745" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M12 6V12L16 14" stroke="#28a745" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const UsersIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="#28a745" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="#28a745" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="#28a745" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M16 3.13C16.8604 3.3503 17.623 3.8507 18.1676 4.55231C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="#28a745" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const StarIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#28a745" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const CalendarIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="#28a745" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M16 2V6" stroke="#28a745" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M8 2V6" stroke="#28a745" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M3 10H21" stroke="#28a745" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const HomeScreen = ({ navigation }) => {
  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>BookMySpace</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.login}>Login</Text>
        </TouchableOpacity>
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>Book Indoor Grounds</Text>
        <Text style={styles.heroSubtitle}>Find and book the best indoor cricket and football grounds</Text>
      </View>

      {/* Main Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Play Without Hassle</Text>
        <Text style={styles.cardSubtitle}>
          Book grounds, challenge teams, and track your performance
        </Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.navigate('Signup')}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>

      {/* Features */}
      <View style={styles.featuresContainer}>
        <View style={styles.features}>
          <FeatureCard 
            icon={<ClockIcon />} 
            title="Real-time Availability" 
            subtitle="Check ground availability instantly" 
          />
          <FeatureCard 
            icon={<UsersIcon />} 
            title="Challenge Teams" 
            subtitle="Send and accept match requests" 
          />
          <FeatureCard 
            icon={<StarIcon />} 
            title="Rating System" 
            subtitle="Rate players and teams" 
          />
          <FeatureCard 
            icon={<CalendarIcon />} 
            title="Easy Booking" 
            subtitle="Book your preferred time slots" 
          />
        </View>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>© 2025 BookMySpace. All rights reserved.</Text>
    </ScrollView>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, subtitle }) => {
  return (
    <View style={styles.featureCard}>
      <View style={styles.iconContainer}>
        {icon}
      </View>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureSubtitle}>{subtitle}</Text>
    </View>
  );
};

  
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    paddingBottom: 30,
  },
  iconContainer: {
    width: 40,
    height: 40,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: 20,
    paddingTop: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  logo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#28a745',
    includeFontPadding: false,
  },
  login: {
    fontSize: 16,
    color: '#28a745',
    fontWeight: '500',
    includeFontPadding: false,
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 25,
    marginTop: 30,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 28,
    includeFontPadding: false,
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    lineHeight: 22,
    paddingHorizontal: 10,
    includeFontPadding: false,
  },
  card: {
    backgroundColor: '#e8f5e9',
    width: width - 40,
    padding: 25,
    borderRadius: 12,
    marginVertical: 20,
    alignSelf: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 24,
    includeFontPadding: false,
  },
  cardSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    color: '#555',
    marginBottom: 15,
    lineHeight: 22,
    includeFontPadding: false,
  },
  button: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    includeFontPadding: false,
  },
  featuresContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: width * 0.43,
    backgroundColor: '#f8f9fa',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    minHeight: 160,
  },
  featureIcon: {
    width: 40,
    height: 40,
    marginBottom: 12,
    // Removed tintColor to show original icon colors
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    textAlign: 'center',
    lineHeight: 20,
    includeFontPadding: false,
  },
  featureSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    color: '#666',
    lineHeight: 18,
    paddingHorizontal: 5,
    includeFontPadding: false,
  },
  footer: {
    marginTop: 30,
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    includeFontPadding: false,
  },
});

export default HomeScreen;
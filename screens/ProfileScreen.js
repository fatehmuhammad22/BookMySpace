import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SERVER_IP = "http://192.168.100.9:5000";

const TabBar = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const userName = route.params?.name || "Guest";
    const userEmail = route.params?.email;
    const userSport = route.params.sport;
    
    return (
        <View style={styles.tabBar}>
            <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate("Dashboard", { name: userName , email: userEmail })}>
                <Image source={require("../assets/icons/home.png")} style={styles.tabIcon} />
                <Text style={styles.tabItemText}>Home</Text>
                
            </TouchableOpacity>

            <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate("Grounds", { name: userName , email: userEmail })}>
                <Image source={require("../assets/icons/searchb.png")} style={styles.tabIcon} />
                <Text style={styles.tabItemText}>Grounds</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate("Teams", { name: userName , email: userEmail, sport: userSport })}>
                <Image source={require("../assets/icons/team.png")} style={styles.tabIcon} />
                <Text style={styles.tabItemText}>Teams</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate("Teams", { name: userName , email: userEmail })}>
                            <Image source={require("../assets/icons/trophy.png")} style={styles.tabIcon} />
                            <Text style={styles.tabItemText}>Matches</Text>
                        </TouchableOpacity>

            <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate("Profile", { name: userName , email: userEmail })}>
                <Image source={require("../assets/icons/user.png")} style={[styles.tabIcon, styles.activeTabIcon]} />
                <Text style={[styles.tabItemText, styles.activeTabText]}>Profile</Text>
                <View style={styles.activeIndicator} />
            </TouchableOpacity>

            
        </View>
    );
};

const ProfileScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    team_name: '',
    sport: 'Not specified',
    location: 'Not specified'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [newMember, setNewMember] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const getEmail = async () => {
      try {
        const email = route.params?.email || await AsyncStorage.getItem('userEmail');
        if (!email) throw new Error('Please login to view profile');
        setUserEmail(email);
        fetchProfileData(email);
      } catch (err) {
        console.error('Error getting email:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    getEmail();
  }, [route.params?.email]);

  const fetchProfileData = async (email) => {
    try {
      setLoading(true);
      setError(null);
      
      const captainRes = await axios.get(`${SERVER_IP}/captain/${email}`);
      if (!captainRes.data) throw new Error('Invalid profile data');
      
      const profileData = {
        ...captainRes.data,
        sport: captainRes.data.sport || 'Not specified',
        location: 'Karachi'
      };
  
      if (captainRes.data.team_name) {
        try {
          const teamRes = await axios.get(`${SERVER_IP}/team/${captainRes.data.team_name}`);
          if (teamRes.data) {
            profileData.sport = teamRes.data.sport || profileData.sport;
            profileData.location = teamRes.data.location || 'Not specified';
          }
        } catch (teamError) {
          console.log('Team info not found, using captain data');
        }
      }
  
      if (captainRes.data.team_name) {
        try {
          const membersRes = await axios.get(`${SERVER_IP}/team-members/${captainRes.data.team_name}`);
          setTeamMembers(membersRes.data || []);
        } catch (membersError) {
          console.log('No team members found');
          setTeamMembers([]);
        }
      }
  
      setProfile(profileData);
    } catch (error) {
      console.error('Profile fetch error:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      
      if (!profile.full_name?.trim()) {
        throw new Error('Full name is required');
      }
      if (!profile.phone_number?.trim()) {
        throw new Error('Phone number is required');
      }
  
      const updateData = {
        full_name: profile.full_name.trim(),
        phone_number: profile.phone_number.trim()
      };
  
      console.log('Attempting to update captain with:', updateData);
  
      const captainResponse = await axios.put(
        `${SERVER_IP}/captain/${profile.email}`,
        updateData,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      );
  
      console.log('Captain update response:', captainResponse.data); 
  
      if (profile.team_name?.trim()) {
        const teamUpdateData = {
          sport: profile.sport?.trim() || 'Not specified',
          location: profile.location?.trim() || 'Not specified'
        };
  
        console.log('Attempting to update team with:', teamUpdateData);
  
        try {
          const teamResponse = await axios.put(
            `${SERVER_IP}/team/${profile.team_name}`,
            teamUpdateData,
            {
              headers: {
                'Content-Type': 'application/json'
              },
              timeout: 5000
            }
          );
          console.log('Team update response:', teamResponse.data);
        } catch (teamError) {
          if (teamError.response?.status === 404) {
            console.log('Team not found, creating new team');
            const createResponse = await axios.post(
              `${SERVER_IP}/team`,
              {
                team_name: profile.team_name.trim(),
                captain_email: profile.email.trim(),
                ...teamUpdateData
              },
              {
                headers: {
                  'Content-Type': 'application/json'
                },
                timeout: 5000
              }
            );
            console.log('Team create response:', createResponse.data);
          } else {
            throw teamError;
          }
        }
      }
  
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
      fetchProfileData(profile.email); 
    } catch (error) {
      console.error('Update error details:', {
        message: error.message,
        response: error.response?.data,
        config: error.config
      });
  
      let errorMessage = 'Failed to update profile. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }
  
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMember.trim() || !profile.team_name) {
      Alert.alert('Error', 'Please enter a member name');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${SERVER_IP}/team-members`, {
        team_name: profile.team_name,
        member_name: newMember.trim()
      });
      
      if (response.data.success) {
        setTeamMembers([...teamMembers, { member_name: newMember.trim() }]);
        setNewMember('');
        Alert.alert('Success', 'Team member added successfully');
      } else {
        throw new Error(response.data.message || 'Failed to add member');
      }
    } catch (error) {
      console.error('Add member error:', error);
      Alert.alert('Error', error.response?.data?.message || error.message || 'Failed to add team member');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await AsyncStorage.removeItem('userEmail');
      await AsyncStorage.removeItem('authToken');
      navigation.replace('Login');
    } catch (error) {
      console.error('Sign out error:', error);
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const renderEditableField = (label, value, fieldName, editable = true) => {
    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {isEditing && editable ? (
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={(text) => setProfile({...profile, [fieldName]: text})}
          />
        ) : (
          <Text style={styles.fieldValue}>{value}</Text>
        )}
      </View>
    );
  };

  if (loading && !profile.email) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={50} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => fetchProfileData(userEmail)}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
        {error.includes('not found') && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.secondaryButtonText}>Complete Registration</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              onPress={() => isEditing ? handleUpdateProfile() : setIsEditing(true)}
              disabled={loading}
              style={styles.editButton}
            >
              <Text style={styles.editButtonText}>
                {isEditing ? (loading ? 'Saving...' : 'Save') : 'Edit'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleSignOut}
              style={styles.signOutButton}
            >
              <Icon name="logout" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Icon name="account-circle" size={80} color="#3B82F6" />
            <Text style={styles.profileName}>{profile.full_name}</Text>
            <Text style={styles.profileRole}>Team Captain</Text>
          </View>
          
          <View style={[styles.section,styles.sectionBorder]}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            {renderEditableField('Full Name', profile.full_name, 'full_name')}
            {renderEditableField('Email', profile.email, 'email', false)}
            {renderEditableField('Phone', profile.phone_number, 'phone_number')}
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Team Information</Text>
            {renderEditableField('Team Name', profile.team_name, 'team_name', false)}
            {renderEditableField('Sport', profile.sport, 'sport')}
            {renderEditableField('Location', profile.location, 'location')}
          </View>
        </View>
      </ScrollView>
      <TabBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingBottom: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    marginTop: 12,
    backgroundColor: '#6B7280',
    padding: 12,
    borderRadius: 8,
  },
  secondaryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  editButton: {
    padding: 8,
  },
  editButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '500',
  },
  signOutButton: {
    padding: 8,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 8,
    includeFontPadding: false,
    textAlignVertical: 'center'
  },
  profileRole: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    includeFontPadding: false,
        textAlignVertical: 'center'
  },
  section: {
    marginBottom: 24,
    paddingBottom: 16,
    
  },
  sectionBorder:{
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    includeFontPadding: false,
    textAlignVertical: 'center',
    marginBottom: 8,
  },
  fieldContainer: {
    marginBottom: 0,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    marginBottom: -8,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  fieldValue: {
    fontSize: 16,
    color: '#111827',
    paddingVertical: 8,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  memberName: {
    fontSize: 16,
    color: '#111827',
  },
  noMembersText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
  addMemberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  memberInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    height: 60,
    justifyContent: "space-around",
    alignItems: "center",
},
tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
},
tabIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
    tintColor: "#888",
},
activeTabIcon: {
    tintColor: "#28a745",
},
tabItemText: {
    fontSize: 12,
    marginTop: 4,
    color: "#888",
    includeFontPadding: false,
    textAlignVertical: 'center'
},
activeTabText: {
    color: "#28a745",
    fontWeight: "bold",
},
activeIndicator: {
    position: "absolute",
    bottom: 0,
    width: "50%",
    height: 3,
    backgroundColor: "#28a745",
    borderRadius: 1.5,
},
});

export default ProfileScreen;
import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Image, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Svg, { Path } from "react-native-svg";

const ClockIcon = () => (
  <Svg width={30} height={30} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" 
      stroke="#28a745" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <Path 
      d="M12 6V12L16 14" 
      stroke="#28a745" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </Svg>
);

const UsersIcon = () => (
  <Svg width={30} height={30} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" 
      stroke="#28a745" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <Path 
      d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" 
      stroke="#28a745" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <Path 
      d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" 
      stroke="#28a745" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <Path 
      d="M16 3.13C16.8604 3.3503 17.623 3.8507 18.1676 4.55231C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" 
      stroke="#28a745" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </Svg>
);

const TabBar = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const userName = route.params?.name || "Guest";
  const userEmail = route.params?.email;
  const userSport = route.params.sport;

  return (
    <View style={styles.tabBar}>
      <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate("Dashboard", { name: userName, email: userEmail })}>
        <Image source={require("../assets/icons/home.png")} style={[styles.tabIcon, styles.activeTabIcon]} />
        <Text style={[styles.tabItemText, styles.activeTabText]}>Home</Text>
        <View style={styles.activeIndicator} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate("Grounds", { name: userName, email: userEmail })}>
        <Image source={require("../assets/icons/searchb.png")} style={styles.tabIcon} />
        <Text style={styles.tabItemText}>Grounds</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate("Teams", { name: userName, email: userEmail, sport: userSport})}>
        <Image source={require("../assets/icons/team.png")} style={styles.tabIcon} />
        <Text style={styles.tabItemText}>Teams</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate("Matches", { name: userName, email: userEmail })}>
        <Image source={require("../assets/icons/trophy.png")} style={styles.tabIcon} />
        <Text style={styles.tabItemText}>Matches</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate("Profile", { name: userName, email: userEmail, sport: userSport })}>
        <Image source={require("../assets/icons/user.png")} style={styles.tabIcon} />
        <Text style={styles.tabItemText}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("Upcoming Bookings");
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [matchRequests, setMatchRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [token, setToken] = useState("");
  const navigation = useNavigation();
  const route = useRoute();
  const userName = route.params?.name || "Guest";
  const SERVER_IP = "http://192.168.100.9:5000";
  const userSport = route.params.sport;

  useEffect(() => {
    const getUserData = async () => {
      try {
        const email = await AsyncStorage.getItem('userEmail');
        const authToken = await AsyncStorage.getItem('authToken');
        if (email) setUserEmail(email);
        if (authToken) setToken(authToken);
      } catch (err) {
        console.error("Error getting user data:", err);
        setError("Failed to load user data");
      }
    };
    getUserData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!userEmail) return;

      try {
        setLoading(true);
        
        const bookingsResponse = await axios.get(`${SERVER_IP}/api/bookings/upcoming/${userEmail}`);
        setUpcomingBookings(bookingsResponse.data);
        
        const challengesResponse = await axios.get(`${SERVER_IP}/api/challenges/received/${userEmail}`);
        console.log("Received challenges:", challengesResponse.data);
        
        const receivedChallenges = challengesResponse.data?.challenges || challengesResponse.data || [];
        setMatchRequests(receivedChallenges);
        
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
        setUpcomingBookings([]);
        setMatchRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userEmail]);

  const handleAcceptChallenge = async (challengeId) => {
    try {
      setLoading(true);
      const response = await axios.put(
        `${SERVER_IP}/api/challenges/${challengeId}/accept`,
        { email: userEmail },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        setMatchRequests(prev => prev.filter(challenge => challenge.id !== challengeId));
        Alert.alert('Success', response.data.message || 'Challenge accepted successfully!');
        
        const bookingsResponse = await axios.get(
          `${SERVER_IP}/api/bookings/upcoming/${userEmail}`
        );
        setUpcomingBookings(bookingsResponse.data);
      }
    } catch (error) {
      console.error('Error accepting challenge:', error);
      Alert.alert(
        'Error', 
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to accept challenge'
      );
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeclineChallenge = async (challengeId) => {
    try {
      setLoading(true);
      const response = await axios.put(
        `${SERVER_IP}/api/challenges/${challengeId}/decline`,
        { email: userEmail },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        setMatchRequests(prev => prev.filter(challenge => challenge.id !== challengeId));
        Alert.alert('Success', response.data.message || 'Challenge rejected successfully!');
      }
    } catch (error) {
      console.error('Error rejecting challenge:', error);
      Alert.alert(
        'Error', 
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to reject challenge'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDisplayDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatDisplayTime = (timeString) => {
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.logo}>BookMySpace</Text>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title}>Welcome, {userName}!</Text>
        <Text style={styles.subtitle}>Book your next game or challenge a team</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => navigation.navigate("Grounds", { name: userName, email: userEmail })}
          >
            <View style={styles.iconContainerGreen}>
              <ClockIcon />
            </View>
            <Text style={styles.buttonText}>Find Grounds</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.button} 
            onPress={() => navigation.navigate("Teams", { name: userName, email: userEmail, sport: userSport})}
          >
            <View style={styles.iconContainerBlue}>
              <UsersIcon />
            </View>
            <Text style={styles.buttonText}>Challenge Teams</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, { backgroundColor: activeTab === "Upcoming Bookings" ? "#28a745" : "#E0E0E0" }]}
            onPress={() => setActiveTab("Upcoming Bookings")}
          >
            <Text style={[styles.tabText, { color: activeTab === "Upcoming Bookings" ? "#fff" : "#444" }]}>
              Upcoming Bookings
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, { backgroundColor: activeTab === "Match Requests" ? "#28a745" : "#E0E0E0" }]}
            onPress={() => setActiveTab("Match Requests")}
          >
            <Text style={[styles.tabText, { color: activeTab === "Match Requests" ? "#fff" : "#444" }]}>
              Match Requests
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );

  const renderBookingItem = ({ item }) => (
    <View style={[styles.card, styles.contentPadding]}>
      <Text style={styles.cardTitle}>{item.ground_name || "Unknown Ground"}</Text>
      <Text style={styles.cardDetails}>
        {formatDisplayDate(item.booking_date)} • {formatDisplayTime(item.start_time)} - {formatDisplayTime(item.end_time)}
      </Text>
      <View style={styles.badgeRow}>
        <Text style={[styles.badge, { backgroundColor: item.sport === "Cricket" ? "#28a745" : "#007bff" }]}>
          {item.sport || "Sport"}
        </Text>
        <Text style={[styles.badge, { 
          backgroundColor: item.status === "Confirmed" ? "#007bff" : 
                          item.status === "Cancelled" ? "#dc3545" : "#ffc107" 
        }]}>
          {item.status || "Pending"}
        </Text>
      </View>
    </View>
  );

  const renderMatchRequestItem = ({ item }) => (
    <View style={[styles.card, styles.contentPadding]}>
      <Text style={styles.cardTitle}>Challenge from {item.challenger_name || item.challenger_email}</Text>
      <Text style={styles.cardDetails}>
        {formatDisplayDate(item.challenge_date)} • {formatDisplayTime(item.start_time)}
      </Text>
      <Text style={styles.cardDetails}>Ground: {item.ground_name || "Unknown"}</Text>
      <Text style={[styles.badge, { backgroundColor: item.sport === "Cricket" ? "#28a745" : "#007bff" }]}>
        {item.sport || "Sport"}
      </Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={styles.acceptButton}
          onPress={() => handleAcceptChallenge(item.id)}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.declineButton}
          onPress={() => handleDeclineChallenge(item.id)}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && !error) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#28a745" />
        <Text>Loading your bookings...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={50} color="#dc3545" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => navigation.replace("Dashboard")}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <FlatList
        data={activeTab === "Upcoming Bookings" ? upcomingBookings : matchRequests}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={[styles.container, { paddingBottom: 60 }]}
        renderItem={activeTab === "Upcoming Bookings" ? renderBookingItem : renderMatchRequestItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon 
              name={activeTab === "Upcoming Bookings" ? "calendar-remove" : "account-group"} 
              size={50} 
              color="#6c757d" 
            />
            <Text style={styles.emptyText}>
              {activeTab === "Upcoming Bookings" 
                ? "No upcoming bookings found" 
                : "No match requests found"}
            </Text>
            {activeTab === "Upcoming Bookings" && (
              <TouchableOpacity 
                style={styles.findGroundsButton}
                onPress={() => navigation.navigate("Grounds", { name: userName, email: userEmail })}
              >
                <Text style={styles.findGroundsButtonText}>Find Grounds to Book</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
      <TabBar />
    </View>
  );
};

    const styles = StyleSheet.create({
        container: { flexGrow: 1, backgroundColor: "#f4f4f4" },
        header: { padding: 20, backgroundColor: "#fff", elevation: 4 },
        logo: { 
            fontSize: 22, 
            fontWeight: "bold", 
            color: "#28a745",
            includeFontPadding: false,
            textAlignVertical: 'center'
        },
        contentContainer: { padding: 20 },
        contentPadding: { marginHorizontal: 20 },
        title: { 
            fontSize: 24, 
            fontWeight: "bold", 
            marginBottom: 5,
            includeFontPadding: false,
            textAlignVertical: 'center'
        },
        subtitle: { 
            fontSize: 16, 
            color: "gray", 
            marginBottom: 15,
            includeFontPadding: false,
            textAlignVertical: 'center'
        },
        buttonContainer: { 
            flexDirection: "row", 
            justifyContent: "space-between", 
            marginBottom: 20 
        },
        button: {
            width: "48%",
            backgroundColor: "#fff",
            borderRadius: 10,
            alignItems: "center",
            paddingVertical: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 4,
        },
        iconContainerGreen: {
            backgroundColor: "#E6F9E6",
            borderRadius: 50,
            padding: 15,
            marginBottom: 10,
            justifyContent: 'center',
            alignItems: 'center'
        },
        iconContainerBlue: {
            backgroundColor: "#E6EEFF",
            borderRadius: 50,
            padding: 15,
            marginBottom: 10,
            justifyContent: 'center',
            alignItems: 'center'
        },
        buttonText: {
            fontSize: 16,
            fontWeight: "bold",
            color: "#000",
            includeFontPadding: false,
            textAlignVertical: 'center'
        },
        tabContainer: {
            flexDirection: "row",
            marginBottom: 10,
            borderRadius: 8,
            backgroundColor: "#E0E0E0",
            padding: 2,
        },
        tab: {
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 8,
            borderRadius: 6,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: -2,
        },
        tabText: {
            fontSize: 16,
            fontWeight: "600",
            includeFontPadding: false,
            textAlignVertical: 'center'
        },
        card: { 
            padding: 15, 
            backgroundColor: "#fff", 
            marginVertical: 5, 
            borderRadius: 10, 
            elevation: 2 
        },
        cardTitle: { 
            fontSize: 18, 
            fontWeight: "bold", 
            marginBottom: 5,
            includeFontPadding: false,
            textAlignVertical: 'center'
        },
        cardDetails: { 
            fontSize: 14, 
            color: "gray", 
            marginBottom: 10,
            includeFontPadding: false,
            textAlignVertical: 'center'
        },
        badgeRow: { 
            flexDirection: "row", 
            justifyContent: "space-between" 
        },
        badge: {
            paddingVertical: 5,
            paddingHorizontal: 10,
            borderRadius: 5,
            color: "white",
            fontSize: 12,
            fontWeight: "bold",
            includeFontPadding: false,
            textAlignVertical: 'center'
        },
        buttonRow: { 
            flexDirection: "row", 
            justifyContent: "space-between", 
            marginTop: 10 
        },
        acceptButton: {
            backgroundColor: "#28a745",
            padding: 10,
            borderRadius: 5,
            flex: 1,
            alignItems: "center",
            marginRight: 5,
        },
        declineButton: {
            backgroundColor: "#dc3545",
            padding: 10,
            borderRadius: 5,
            flex: 1,
            alignItems: "center",
            marginLeft: 5,
        },
        mainContainer: {
            flex: 1,
            backgroundColor: "#f4f4f4",
        },
        loadingContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
        },
        errorContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
        },
        errorText: {
            fontSize: 18,
            color: "#dc3545",
            marginVertical: 20,
            textAlign: "center",
            includeFontPadding: false,
            textAlignVertical: 'center'
        },
        retryButton: {
            backgroundColor: "#28a745",
            padding: 15,
            borderRadius: 8,
            marginTop: 20,
        },
        retryButtonText: {
            color: "#fff",
            fontWeight: "bold",
            fontSize: 16,
            includeFontPadding: false,
            textAlignVertical: 'center'
        },
        emptyContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 40,
        },
        emptyText: {
            fontSize: 18,
            color: "#6c757d",
            marginVertical: 20,
            textAlign: "center",
            includeFontPadding: false,
            textAlignVertical: 'center'
        },
        findGroundsButton: {
            backgroundColor: "#28a745",
            padding: 15,
            borderRadius: 8,
            marginTop: 10,
        },
        findGroundsButtonText: {
            color: "#fff",
            fontWeight: "bold",
            fontSize: 16,
            includeFontPadding: false,
            textAlignVertical: 'center'
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

    export default Dashboard;
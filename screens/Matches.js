import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Image, ActivityIndicator } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import moment from "moment";

const TabBar = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const userName = route.params?.name || "Guest";
  const userEmail = route.params?.email;
  
  return (
    <View style={styles.tabBar}>
      <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate("Dashboard", { name: userName, email: userEmail })}>
        <Image source={require("../assets/icons/home.png")} style={styles.tabIcon} />
        <Text style={styles.tabItemText}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate("Grounds", { name: userName, email: userEmail })}>
        <Image source={require("../assets/icons/searchb.png")} style={styles.tabIcon} />
        <Text style={styles.tabItemText}>Grounds</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate("Teams", { name: userName, email: userEmail })}>
        <Image source={require("../assets/icons/team.png")} style={styles.tabIcon} />
        <Text style={styles.tabItemText}>Teams</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate("Matches", { name: userName, email: userEmail })}>
        <Image source={require("../assets/icons/trophy.png")} style={[styles.tabIcon, styles.activeTabIcon]} />
        <Text style={[styles.tabItemText, styles.activeTabText]}>Matches</Text>
        <View style={styles.activeIndicator} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate("Profile", { name: userName, email: userEmail })}>
        <Image source={require("../assets/icons/user.png")} style={styles.tabIcon} />
        <Text style={styles.tabItemText}>Profile</Text>
      </TouchableOpacity>
    </View>
  )
}

const Matches = ({ navigation }) => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const route = useRoute();
  const userEmail = route.params?.email;
  const userName = route.params?.name || "Guest";

  const fetchChallenges = () => {
    setLoading(true);
    axios.get(`http://192.168.100.9:5000/api/challenges/${userEmail}`)
      .then((response) => {
        const sortedChallenges = response.data.sort((a, b) => {
          return new Date(b.challenge_date) - new Date(a.challenge_date);
        });
        setChallenges(sortedChallenges);
        setLoading(false);
        setRefreshing(false);
      })
      .catch((error) => {
        console.error("Error fetching challenges:", error);
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchChallenges();
  };

  const handleAcceptChallenge = (challengeId) => {
    axios.put(`http://192.168.100.59:5000/api/challenges/${challengeId}/accept`, { email: userEmail })
      .then(() => {
        fetchChallenges();
      })
      .catch(error => {
        console.error("Error accepting challenge:", error);
      });
  };

  const handleDeclineChallenge = (challengeId) => {
    axios.put(`http://192.168.100.59:5000/api/challenges/${challengeId}/decline`, { email: userEmail })
      .then(() => {
        fetchChallenges();
      })
      .catch(error => {
        console.error("Error declining challenge:", error);
      });
  };

  const renderChallengeItem = ({ item }) => {
    const formattedDate = moment(item.challenge_date).format("MMM D, YYYY");
    const startTime = moment(item.start_time, "HH:mm:ss").format("h:mm A");
    const endTime = moment(item.end_time, "HH:mm:ss").format("h:mm A");
    
    const isChallenger = item.challenger_email === userEmail;
    const isPending = item.status === 'Pending';
    const isAccepted = item.status === 'Accepted';

    return (
      <View style={styles.challengeCard}>
        <View style={styles.challengeHeader}>
          <Text style={styles.challengeSport}>{item.sport}</Text>
          <Text style={[
            styles.challengeStatus,
            isPending && styles.statusPending,
            isAccepted && styles.statusAccepted,
            item.status === 'Rejected' && styles.statusRejected
          ]}>
            {item.status}
          </Text>
        </View>
        
        <Text style={styles.challengeGround}>{item.ground_name}</Text>
        
        <View style={styles.challengeTeams}>
          <Text style={styles.teamLabel}>
            {isChallenger ? "You challenged" : "Challenged by"}:
          </Text>
          <Text style={styles.teamName}>
            {isChallenger ? item.opponent_team : item.challenger_team}
          </Text>
        </View>
        
        <View style={styles.challengeTimeContainer}>
          <Icon name="calendar" size={16} color="#666" />
          <Text style={styles.challengeTimeText}>{formattedDate}</Text>
        </View>
        
        <View style={styles.challengeTimeContainer}>
          <Icon name="clock" size={16} color="#666" />
          <Text style={styles.challengeTimeText}>{startTime} - {endTime}</Text>
        </View>
        
        {isPending && !isChallenger && (
          <View style={styles.challengeActions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleAcceptChallenge(item.id)}
            >
              <Text style={styles.actionButtonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.declineButton]}
              onPress={() => handleDeclineChallenge(item.id)}
            >
              <Text style={styles.actionButtonText}>Decline</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Challenges</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
      ) : (
        <FlatList
          data={challenges}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderChallengeItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No challenges found</Text>
              <TouchableOpacity 
                style={styles.bookButton}
                onPress={() => navigation.navigate("Teams", { name: userName, email: userEmail })}
              >
                <Text style={styles.bookButtonText}>Challenge a Team</Text>
              </TouchableOpacity>
            </View>
          }
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
      <TabBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    includeFontPadding: false,
    textAlignVertical: 'center'
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 80,
  },
  challengeCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  challengeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  challengeSport: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007bff",
  },
  challengeStatus: {
    fontSize: 14,
    fontWeight: "500",
    textTransform: 'capitalize',
  },
  statusPending: {
    color: "#ffc107",
  },
  statusAccepted: {
    color: "#28a745",
  },
  statusRejected: {
    color: "#dc3545",
  },
  challengeGround: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  challengeTeams: {
    marginBottom: 10,
  },
  teamLabel: {
    fontSize: 14,
    color: "#666",
  },
  teamName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 4,
  },
  challengeTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  challengeTimeText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  challengeActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  acceptButton: {
    backgroundColor: "#28a745",
  },
  declineButton: {
    backgroundColor: "#dc3545",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  bookButton: {
    backgroundColor: "#007bff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  bookButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
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

export default Matches;
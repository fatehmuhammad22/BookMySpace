import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Image, ActivityIndicator } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";

const TabBar = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const userName = route.params?.name || "Guest";
  const userEmail = route.params?.email;
  const userSport = route.params.sport;
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

      <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate("Teams", { name: userName, email: userEmail, sport: userSport })}>
        <Image source={require("../assets/icons/team.png")} style={[styles.tabIcon, styles.activeTabIcon]} />
        <Text style={[styles.tabItemText, styles.activeTabText]}>Teams</Text>
        <View style={styles.activeIndicator} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate("Matches", { name: userName, email: userEmail })}>
        <Image source={require("../assets/icons/trophy.png")} style={styles.tabIcon} />
        <Text style={styles.tabItemText}>Matches</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate("Profile", { name: userName, email: userEmail })}>
        <Image source={require("../assets/icons/user.png")} style={styles.tabIcon} />
        <Text style={styles.tabItemText}>Profile</Text>
      </TouchableOpacity>
    </View>
  )
}

const Teams = ({ navigation }) => {
  const [captains, setCaptains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState("All Sports");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [searchQuery, setSearchQuery] = useState("");
  const route = useRoute();
  const currentUserEmail = route.params?.email;
  const userName = route.params?.name || "Guest";
  const userEmail = route.params?.email;
  const userSport = route.params?.sport;

  useEffect(() => {
    axios.get("http://192.168.100.9:5000/captains")
      .then((response) => {
        const filteredCaptains = response.data.filter(captain => captain.email !== currentUserEmail);
        setCaptains(filteredCaptains);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching captains:", error);
        setLoading(false);
      });
  }, []);

  const filteredCaptains = captains.filter(captain => {
    const matchesSport = selectedSport === "All Sports" || captain.sport === selectedSport;
    const matchesLocation = selectedLocation === "All Locations" ||
      (captain.location && captain.location.includes(selectedLocation));
    const matchesSearch = captain.team_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      captain.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSport && matchesLocation && matchesSearch;
  });

  const handleChallenge = (captainEmail) => {
    console.log("Challenging captain with email:", captainEmail);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Challenge Captains</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search captains..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filtersContainer}>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>{selectedSport}</Text>
          <Icon name="chevron-down" size={20} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>{selectedLocation}</Text>
          <Icon name="chevron-down" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <FlatList
          data={filteredCaptains}
          keyExtractor={(item) => item.email}
          renderItem={({ item }) => (
            <View style={styles.teamCard}>
              <View style={styles.teamInfo}>
              <View style={styles.profileIconContainer}>
                  <Icon 
                    name="account-circle" 
                    size={60} 
                    color={item.sport === "Cricket" ? "#28a745" : "#007bff"} 
                  />
                </View>
                <View style={styles.teamDetails}>
                  <Text style={styles.teamName}>{item.full_name}</Text>
                  <Text style={styles.teamSubtitle}>Team: {item.team_name}</Text>
                  <View style={styles.detailsRow}>
                    <View style={[styles.sportBadge, { backgroundColor: item.sport === "Cricket" ? "#28a745" : "#007bff" }]}>
                      <Text style={styles.sportText}>{item.sport}</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.challengeButton}
                  onPress={() => handleChallenge(item.email)}
                >
                  <Text style={styles.challengeButtonText} onPress={() => navigation.navigate("ChallengeTeam", {
                    team: {
                      team_name: item.team_name,
                      captain_email: item.email, 
                      sport: item.sport,
                    },
                    userEmail: userEmail
                  })}>Challenge</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 60 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No captains found</Text>
            </View>
          }
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    includeFontPadding: false,
    textAlignVertical: 'center'
  },
  searchContainer: {
    padding: 20,
  },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: "#000",
  },
  filtersContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 10,
  },
  filterButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
  },
  filterButtonText: {
    fontSize: 16,
    color: "#000",
  },
  teamCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 10,
    padding: 15,
  },
  teamInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoPlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: "#e0e0e0",
    borderRadius: 30,
    marginRight: 15,
  },
  teamDetails: {
    flex: 1,
  },
  teamName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  teamSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  sportBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10,
  },
  sportText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  contactText: {
    color: "#666",
    fontSize: 12,
    marginLeft: 5,
  },
  challengeButton: {
    backgroundColor: "#007bff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  challengeButtonText: {
    color: "#fff",
    fontWeight: "bold",
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
    fontSize: 16,
    color: "#666",
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
  profileIconContainer: {
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 60,
  },
});

export default Teams;
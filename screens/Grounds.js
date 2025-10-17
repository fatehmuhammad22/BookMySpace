import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Image, ActivityIndicator } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";

const TabBar = () => {
  const route = useRoute();
  const userName = route.params?.name || "Guest";
  const userEmail = route.params?.email;
  const userSport = route.params.sport;
  const navigation = useNavigation();
  return (
    <View style={styles.tabBar}>
      <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate("Dashboard", { name: userName, email: userEmail })}>
        <Image source={require("../assets/icons/home.png")} style={styles.tabIcon} />
        <Text style={styles.tabItemText}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate("Grounds", { name: userName, email: userEmail })}>
        <Image source={require("../assets/icons/searchb.png")} style={[styles.tabIcon, styles.activeTabIcon]} />
        <Text style={[styles.tabItemText, styles.activeTabText]}>Grounds</Text>
        <View style={styles.activeIndicator} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate("Teams", { name: userName, email: userEmail, sport: userSport })}>
        <Image source={require("../assets/icons/team.png")} style={styles.tabIcon} />
        <Text style={styles.tabItemText}>Teams</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate("Teams", { name: userName, email: userEmail })}>
        <Image source={require("../assets/icons/trophy.png")} style={styles.tabIcon} />
        <Text style={styles.tabItemText}>Matches</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate("Profile", { name: userName, email: userEmail })}>
        <Image source={require("../assets/icons/user.png")} style={styles.tabIcon} />
        <Text style={styles.tabItemText}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const Grounds = ({ navigation }) => {
  const [grounds, setGrounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const route = useRoute();
  const userName = route.params?.name || "Guest";
  const userEmail = route.params?.email;

  const groundImages = {
    "Cricket Arena": require("../assets/icons/cricket-ground1.jpg"),
    "Cricket Arena 2": require("../assets/icons/cricket-ground2.jpg"),
    "Football Zone": require("../assets/icons/football-ground1.jpg"),
    "Football Zone 2": require("../assets/icons/football-ground2.jpg"),
  };

  useEffect(() => {
    fetch("http://192.168.100.9:5000/grounds")
      .then((response) => response.json())
      .then((data) => {
        const groundsWithLocalImages = data.map(ground => ({
          ...ground,
          localImage: groundImages[ground.name] || require("../assets/icons/cricket-ground1.jpg") // fallback image
        }));
        setGrounds(groundsWithLocalImages);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching grounds:", error);
        setLoading(false);
      });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find Grounds</Text>
        <TouchableOpacity>
          <Icon name="filter" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput style={styles.searchInput} placeholder="Search grounds..." placeholderTextColor="#666" />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#28a745" />
      ) : (
        <FlatList
          data={grounds}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.groundCard}>
              <View style={styles.imageContainer}>
                <Image source={item.localImage} style={styles.groundImage} />
                {item.available && (
                  <View style={styles.availableBadge}>
                    <Text style={styles.availableText}>Available Now</Text>
                  </View>
                )}
              </View>
              <View style={styles.groundInfo}>
                <View style={styles.groundHeader}>
                  <Text style={styles.groundName}>{item.name}</Text>
                  <TouchableOpacity 
                    style={styles.bookButton} 
                    onPress={() => navigation.navigate('GroundDetails', { ground: item, userEmail: userEmail })}
                  >
                    <Text style={styles.bookButtonText}>Book</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.location}>{item.location}</Text>
                <View style={styles.detailsRow}>
                  <View
                    style={[styles.sportBadge, { backgroundColor: item.sport === "Cricket" ? "#28a745" : "#007bff" }]}
                  >
                    <Text style={styles.sportText}>{item.sport}</Text>
                  </View>
                  <View style={styles.ratingContainer}>
                    <Text style={styles.starIcon}>⭐</Text>
                    <Text style={styles.rating}>
                      {item.rating} ({item.reviews} reviews)
                    </Text>
                  </View>
                </View>
                <Text style={styles.price}>Rs. {item.price}/hour</Text>
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 60 }}
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
  groundCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
  },
  groundImage: {
    width: "100%",
    height: 200,
  },
  availableBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#28a745",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  availableText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  groundInfo: {
    padding: 15,
  },
  groundHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  groundName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  bookButton: {
    backgroundColor: "#28a745",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bookButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  location: {
    color: "#666",
    marginBottom: 10,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
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
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  starIcon: {
    marginRight: 4,
  },
  rating: {
    color: "#666",
  },
  price: {
    color: "#28a745",
    fontSize: 16,
    fontWeight: "bold",
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

export default Grounds;
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Alert,
  ActivityIndicator,
  Modal,
  Pressable
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';

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

      <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate("Teams", { name: userName, email: userEmail , sport: userSport})}>
        <Image source={require("../assets/icons/team.png")} style={[styles.tabIcon, styles.activeTabIcon]}  />
        <Text style={[styles.tabItemText, styles.activeTabText]}>Teams</Text>
        <View style={styles.activeIndicator} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate("Matches", { name: userName, email: userEmail })}>
        <Image source={require("../assets/icons/trophy.png")} style={styles.tabIcon}/>
        <Text style={styles.tabItemText}>Matches</Text>
        
      </TouchableOpacity>

      <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate("Profile", { name: userName, email: userEmail })}>
        <Image source={require("../assets/icons/user.png")} style={styles.tabIcon} />
        <Text style={styles.tabItemText}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const ChallengeTeam = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { team, userEmail } = route.params;
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedGround, setSelectedGround] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [availableGrounds, setAvailableGrounds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showGroundsModal, setShowGroundsModal] = useState(false);
  const SERVER_IP = "http://192.168.100.9:5000";
  const sport = route.params?.sport;

  const timeSlots = [
    { start: '10:00:00', end: '12:00:00', display: '10:00 AM - 12:00 PM' },
    { start: '12:00:00', end: '14:00:00', display: '12:00 PM - 2:00 PM' },
    { start: '14:00:00', end: '16:00:00', display: '2:00 PM - 4:00 PM' },
    { start: '16:00:00', end: '18:00:00', display: '4:00 PM - 6:00 PM' },
    { start: '18:00:00', end: '20:00:00', display: '6:00 PM - 8:00 PM' },
    { start: '20:00:00', end: '22:00:00', display: '8:00 PM - 10:00 PM' }
  ];

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const fetchAvailableGrounds = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${SERVER_IP}/grounds?sport=${team.sport}`);
        setAvailableGrounds(response.data);
      } catch (error) {
        console.error('Error fetching grounds:', error);
        Alert.alert('Error', 'Failed to load available grounds');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableGrounds();
  }, [team.sport]);

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!selectedGround) return;
      
      try {
        setLoading(true);
        const dateStr = formatDate(selectedDate);
        const response = await axios.get(
          `${SERVER_IP}/api/bookings/ground/${selectedGround.id}/${dateStr}`
        );
        setAvailableSlots(response.data || []);
      } catch (error) {
        console.error('Error fetching slots:', error);
        setAvailableSlots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableSlots();
  }, [selectedDate, selectedGround]);

  const isSlotAvailable = (slot) => {
    return !availableSlots.some(
      booked => 
        (booked.start_time < slot.end && booked.end_time > slot.start) ||
        (booked.start_time < slot.end && booked.end_time > slot.start) ||
        (booked.start_time >= slot.start && booked.end_time <= slot.end)
    );
  };

  const renderCalendarDays = () => {  
  const days = [];
  const year = 2025;
  const month = 5; // June (0-indexed)
  const daysInMonth = 30; // June has 30 days
  const firstDay = new Date(year, month, 1).getDay(); // 6 (Saturday)

  for (let i = 0; i < firstDay; i++) {
    days.push(<Text key={`empty-${i}`} style={styles.calendarDayEmpty}></Text>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === month;
    days.push(
      <TouchableOpacity 
        key={`day-${day}`} 
        style={[styles.calendarDay, isSelected && styles.calendarDaySelected]}
        onPress={() => setSelectedDate(new Date(year, month, day))} 
      >
        <Text style={[styles.calendarDayText, isSelected && styles.calendarDayTextSelected]}>{day}</Text>
      </TouchableOpacity>
    );
  }

  return days;
};


  const handleSendChallenge = async () => {
    if (!team?.captain_email) {
      Alert.alert('Error', 'Team information is incomplete');
      return;
    }
    
    if (!selectedSlot || !selectedGround) {
      Alert.alert('Error', 'Please select a date, time slot and ground');
      return;
    }
  
    try {
      setLoading(true);
      const challengeData = {
        challenger_email: userEmail,
        opponent_email: team.captain_email, 
        ground_id: selectedGround.id,
        challenge_date: formatDate(selectedDate),
        start_time: selectedSlot.start,
        end_time: selectedSlot.end,
        sport: team.sport,
        status: 'Pending'
      };
  
      console.log('Sending:', challengeData); 
      
      const response = await axios.post(`${SERVER_IP}/api/challenges`, challengeData);
      
      if (response.data.success) {
        Alert.alert('Success', 'Challenge sent successfully!');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      Alert.alert(
        'Error', 
        error.response?.data?.message || 'Failed to send challenge'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Challenge {team.team_name}</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        <View style={styles.teamInfo}>
          <View style={styles.teamHeader}>
            <View style={styles.teamLogo} />
            <Text style={styles.teamName}>{team.team_name}</Text>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          
          <View style={styles.calendarContainer}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity>
                <Icon name="chevron-left" size={24} color="#16A34A" />
              </TouchableOpacity>
              <Text style={styles.calendarMonth}>June 2025</Text>
              <TouchableOpacity>
                <Icon name="chevron-right" size={24} color="#16A34A" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.calendarWeekDays}>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <Text key={day} style={styles.calendarWeekDay}>{day}</Text>
              ))}
            </View>
            
            <View style={styles.calendarGrid}>
              {renderCalendarDays()}
            </View>
          </View>
          
          <Text style={styles.sectionTitle}>Select Ground</Text>
          <TouchableOpacity 
            style={styles.groundSelector}
            onPress={() => setShowGroundsModal(true)}
          >
            <Text style={selectedGround ? styles.groundSelectorText : styles.groundSelectorPlaceholder}>
              {selectedGround ? selectedGround.name : 'Select a ground'}
            </Text>
            <Icon name="chevron-down" size={20} color="#6B7280" />
          </TouchableOpacity>

          {selectedGround && (
            <>
              <Text style={styles.sectionTitle}>Available Time Slots</Text>
              <View style={styles.timeSlotsContainer}>
                {timeSlots.map((slot, index) => {
                  const isAvailable = isSlotAvailable(slot);
                  return (
                    <TouchableOpacity 
                      key={index}
                      style={[
                        styles.timeSlot,
                        selectedSlot?.display === slot.display && styles.timeSlotSelected,
                        !isAvailable && styles.timeSlotBooked
                      ]}
                      onPress={() => isAvailable && setSelectedSlot(slot)}
                      disabled={!isAvailable}
                    >
                      <Text style={[
                        styles.timeSlotText,
                        selectedSlot?.display === slot.display && styles.timeSlotTextSelected,
                        !isAvailable && styles.timeSlotTextBooked
                      ]}>
                        {slot.display}
                        {!isAvailable && ' (Booked)'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          <TouchableOpacity 
            style={styles.challengeButton}
            onPress={handleSendChallenge}
            disabled={loading || !selectedSlot || !selectedGround}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.challengeButtonText}>Send Challenge</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={showGroundsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowGroundsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Ground</Text>
            {loading ? (
              <ActivityIndicator size="large" color="#16A34A" />
            ) : (
              <ScrollView>
                {availableGrounds.map(ground => (
                  <Pressable
                    key={ground.id}
                    style={({ pressed }) => [
                      styles.groundModalItem,
                      pressed && styles.groundModalItemPressed,
                      selectedGround?.id === ground.id && styles.selectedGroundModalItem
                    ]}
                    onPress={() => {
                      setSelectedGround(ground);
                      setShowGroundsModal(false);
                    }}
                  >
                    <Image source={{ uri: ground.image }} style={styles.groundModalImage} />
                    <View style={styles.groundModalInfo}>
                      <Text style={styles.groundModalName}>{ground.name}</Text>
                      <Text style={styles.groundModalLocation}>{ground.location}</Text>
                      <Text style={styles.groundModalPrice}>Rs. {ground.price}/hour</Text>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            )}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowGroundsModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      <TabBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
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
  teamInfo: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e0e0e0',
    marginRight: 15,
  },
  teamName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  contentContainer: {
    padding: 20
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12
  },
  calendarContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  calendarMonth: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827'
  },
  calendarWeekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8
  },
  calendarWeekDay: {
    width: 32,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280'
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  calendarDay: {
    width: '14.28%',
    height: 32,
    justifyContent: 'center',
    alignItems: 'center'
  },
  calendarDaySelected: {
    backgroundColor: '#16A34A',
    borderRadius: 16
  },
  calendarDayText: {
    fontSize: 14,
    color: '#111827'
  },
  calendarDayTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  calendarDayEmpty: {
    width: '14.28%',
    height: 32
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8
  },
  timeSlot: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB'
  },
  timeSlotSelected: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4'
  },
  timeSlotBooked: {
    backgroundColor: '#FEE2E2',
    borderColor: '#DC2626'
  },
  timeSlotText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center'
  },
  timeSlotTextSelected: {
    color: '#16A34A',
    fontWeight: '500'
  },
  timeSlotTextBooked: {
    color: '#DC2626'
  },
  groundSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20
  },
  groundSelectorText: {
    fontSize: 16,
    color: '#111827'
  },
  groundSelectorPlaceholder: {
    fontSize: 16,
    color: '#6B7280'
  },
  challengeButton: {
    marginTop: 20,
    backgroundColor: '#16A34A',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  challengeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 10,
    maxHeight: '80%',
    padding: 20
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#111827'
  },
  groundModalItem: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  groundModalItemPressed: {
    backgroundColor: '#F3F4F6'
  },
  selectedGroundModalItem: {
    backgroundColor: '#F0FDF4'
  },
  groundModalImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15
  },
  groundModalInfo: {
    flex: 1,
    justifyContent: 'center'
  },
  groundModalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827'
  },
  groundModalLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginVertical: 2
  },
  groundModalPrice: {
    fontSize: 14,
    color: '#16A34A',
    fontWeight: '600'
  },
  modalCloseButton: {
    marginTop: 15,
    backgroundColor: '#16A34A',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  modalCloseButtonText: {
    color: '#fff',
    fontWeight: '600'
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
  }
});

export default ChallengeTeam;
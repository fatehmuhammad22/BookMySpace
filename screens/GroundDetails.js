import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Alert,
  ActivityIndicator 
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

const GroundDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [activeTab, setActiveTab] = useState('About');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const SERVER_IP = "http://192.168.100.9:5000";

  const groundImages = {
    'Cricket Arena': require("../assets/icons/cricket-ground1.jpg"),
    'Cricket Arena 2': require("../assets/icons/cricket-ground2.jpg"),
    'Football Zone': require("../assets/icons/football-ground1.jpg"),
    'Football Zone 2': require("../assets/icons/football-ground2.jpg"),
  };

  const { ground: groundParam, userEmail } = route.params || {};
  
  const ground = groundParam ? {
    ...groundParam,
    localImage: groundImages[groundParam.name] || require("../assets/icons/cricket-ground1.jpg")
  } : {
    id: 1,
    name: 'Cricket Arena',
    location: 'Gulshan-e-Iqbal, Karachi',
    sport: 'Cricket',
    duration: '2 hours/slot',
    maxPlayers: 22,
    price: 2500,
    rating: 4.8,
    reviews: 120,
    description: 'A state-of-the-art indoor cricket facility with professional-grade pitches, floodlights, and amenities. Perfect for practice sessions and competitive matches.',
    availableNow: true,
    localImage: require("../assets/icons/cricket-ground1.jpg")
  };

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
    const fetchBookedSlots = async () => {
      try {
        const dateStr = formatDate(selectedDate);
        console.log('Fetching slots for:', `${SERVER_IP}/api/bookings/ground/${ground.id}/${dateStr}`);
        
        const response = await axios.get(
          `${SERVER_IP}/api/bookings/ground/${ground.id}/${dateStr}`,
          {
            timeout: 5000,
            headers: {
              'Accept': 'application/json'
            }
          }
        );
        
        setBookedSlots(response.data || []);
      } catch (error) {
        console.error('API Error:', {
          url: error.config?.url,
          status: error.response?.status,
          data: error.response?.data
        });
        
        Alert.alert(
          'Error', 
          error.response?.status === 404 
            ? 'Booking service unavailable' 
            : 'Failed to load available slots'
        );
        setBookedSlots([]);
      }
    };

    fetchBookedSlots();
  }, [selectedDate, ground.id]);

  const handleBookNow = async () => {
    if (!selectedSlot) {
      Alert.alert('Error', 'Please select a time slot');
      return;
    }

    if (!userEmail) {
      Alert.alert('Error', 'User email is missing. Please login again.');
      return;
    }
  
    try {
      setLoading(true);
      const bookingData = {
        captain_email: userEmail,
        ground_id: ground.id,
        booking_date: formatDate(selectedDate),
        start_time: selectedSlot.start,
        end_time: selectedSlot.end,
        sport: ground.sport,
        status: 'Confirmed'
      };

      console.log("Sending booking data:", bookingData);
      
      const response = await axios.post(
        `${SERVER_IP}/api/bookings`,
        bookingData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("Booking response:", response.data);
      
      if (response.data && response.data.success) {
        Alert.alert('Success', 'Booking created successfully!');
        navigation.goBack();
      } else {
        throw new Error(response.data?.message || 'Booking failed');
      }
    } catch (error) {
      console.error('Booking error:', {
        message: error.message,
        response: error.response?.data,
        request: error.config?.data
      });
      
      let errorMessage = 'Failed to create booking. Please try again.';
      if (error.response?.data?.error?.sqlMessage) {
        errorMessage = 'System error. Please contact support.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isSlotBooked = (slot) => {
    return bookedSlots.some(
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


  const renderTabContent = () => {
    switch (activeTab) {
      case 'About':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.descriptionText}>A state-of-the-art indoor with professional-grade pitches, floodlights, and amenities. Perfect for practice sessions and competitive matches.</Text>
          </View>
        );
      case 'Book':
        return (
          <View style={styles.tabContent}>
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
            
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Available Time Slots</Text>
            <View style={styles.timeSlotsContainer}>
              {timeSlots.map((slot, index) => {
                const isBooked = isSlotBooked(slot);
                return (
                  <TouchableOpacity 
                    key={index}
                    style={[
                      styles.timeSlot,
                      selectedSlot?.display === slot.display && styles.timeSlotSelected,
                      isBooked && styles.timeSlotBooked
                    ]}
                    onPress={() => !isBooked && setSelectedSlot(slot)}
                    disabled={isBooked}
                  >
                    <Text style={[
                      styles.timeSlotText,
                      selectedSlot?.display === slot.display && styles.timeSlotTextSelected,
                      isBooked && styles.timeSlotTextBooked
                    ]}>
                      {slot.display}
                      {isBooked && ' (Booked)'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            
            <View style={styles.pricingSection}>
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>Ground Fee (2 hours)</Text>
                <Text style={styles.pricingValue}>Rs. {ground.price}</Text>
              </View>
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>Service Fee</Text>
                <Text style={styles.pricingValue}>Rs. 200</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.pricingRow}>
                <Text style={[styles.pricingLabel, { fontWeight: '600' }]}>Total</Text>
                <Text style={[styles.pricingValue, { fontWeight: '600' }]}>Rs. {ground.price + 200}</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.bookButton}
              onPress={handleBookNow}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.bookButtonText}>Book Now</Text>
              )}
            </TouchableOpacity>
          </View>
        );
      case 'Reviews':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.descriptionText}>Reviews will be shown here</Text>
          </View>
        );
      default:
        return null;
    }
  };

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
      
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        <Image source={ground.localImage} style={styles.headerImage} />
        
        <View style={styles.groundInfo}>
          <Text style={styles.groundName}>{ground.name}</Text>
          <View style={styles.locationRow}>
            <Icon name="map-marker" size={16} color="#6B7280" />
            <Text style={styles.locationText}>{ground.location}</Text>
          </View>
          
          <View style={styles.tagsRow}>
            <View style={styles.sportTag}>
              <Text style={styles.sportTagText}>{ground.sport}</Text>
            </View>
            <View style={styles.infoTag}>
              <Icon name="clock-outline" size={14} color="#6B7280" />
              <Text style={styles.infoTagText}>{ground.duration}</Text>
            </View>
            <View style={styles.infoTag}>
              <Icon name="account-group-outline" size={14} color="#6B7280" />
              <Text style={styles.infoTagText}>Max {ground.maxPlayers} players</Text>
            </View>
          </View>
          
          <View style={styles.priceAvailabilityRow}>
            <Text style={styles.priceText}>Rs. {ground.price}/hour</Text>
            <View style={styles.ratingBadge}>
              <Icon name="star" size={14} color="#F59E0B" />
              <Text style={styles.ratingText}>{ground.rating} ({ground.reviews})</Text>
            </View>
            {ground.availableNow && (
              <View style={styles.availableBadge}>
                <Text style={styles.availableText}>Available Now</Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'About' && styles.activeTab]}
            onPress={() => setActiveTab('About')}
          >
            <Text style={[styles.tabText, activeTab === 'About' && styles.activeTabText]}>About</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'Book' && styles.activeTab]}
            onPress={() => setActiveTab('Book')}
          >
            <Text style={[styles.tabText, activeTab === 'Book' && styles.activeTabText]}>Book</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'Reviews' && styles.activeTab]}
            onPress={() => setActiveTab('Reviews')}
          >
            <Text style={[styles.tabText, activeTab === 'Reviews' && styles.activeTabText]}>Reviews</Text>
          </TouchableOpacity>
        </View>
        
        {renderTabContent()}
      </ScrollView>
      
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
  headerImage: {
    width: '100%',
    height: 220,
    resizeMode: 'cover'
  },
  groundInfo: {
    padding: 20
  },
  groundName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8
  },
  sportTag: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20
  },
  sportTagText: {
    color: '#065F46',
    fontSize: 12,
    fontWeight: '500'
  },
  infoTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#F3F4F6'
  },
  infoTagText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4
  },
  priceAvailabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#16A34A'
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20
  },
  ratingText: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4
  },
  availableBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20
  },
  availableText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '500'
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#E5E7EB'
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center'
  },
  activeTab: {
    borderBottomWidth: 2,
    borderColor: '#16A34A'
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280'
  },
  activeTabText: {
    color: '#16A34A',
    fontWeight: '600'
  },
  tabContent: {
    padding: 20
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12
  },
  descriptionText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20
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
  pricingSection: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB'
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  pricingLabel: {
    fontSize: 14,
    color: '#6B7280'
  },
  pricingValue: {
    fontSize: 14,
    color: '#111827'
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8
  },
  bookButton: {
    marginTop: 24,
    backgroundColor: '#16A34A',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
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

export default GroundDetails;
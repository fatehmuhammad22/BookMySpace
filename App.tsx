import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignupScreen';
import Dashboard from './screens/Dashboard';
import Teams from './screens/Teams';
import Grounds from './screens/Grounds';
import ProfileScreen from './screens/ProfileScreen';
import GroundDetails from './screens/GroundDetails';
import ChallengeTeam from './screens/ChallengeTeam';
import Matches from './screens/Matches';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name='Signup' component={SignUpScreen} />
        <Stack.Screen name='Dashboard' component={Dashboard} />
        <Stack.Screen name='Teams' component={Teams} />
        <Stack.Screen name='Grounds' component={Grounds} />
        <Stack.Screen name='Profile' component={ProfileScreen} />
        <Stack.Screen name='GroundDetails' component={GroundDetails} />
        <Stack.Screen name='ChallengeTeam' component={ChallengeTeam} />
        <Stack.Screen name='Matches' component={Matches} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

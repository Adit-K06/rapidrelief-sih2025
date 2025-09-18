import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from 'expo-status-bar';
import LandingPage from "./screens/LandingScreen";
import ChatScreen from "./screens/ChatScreen";
import DroneTrackingScreen from "./screens/DroneTrackingScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <>
      <StatusBar style="light" backgroundColor="#1a1d23" translucent={false} />
      <NavigationContainer
        theme={{
          dark: true,
          colors: {
            primary: '#3b82f6',
            background: '#1a1d23',
            card: '#2d3748',
            text: '#ffffff',
            border: 'rgba(255, 255, 255, 0.1)',
            notification: '#3b82f6',
          },
        }}
      >
        <Stack.Navigator
          initialRouteName="LandingPage"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#1a1d23',
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(255, 255, 255, 0.1)',
            },
            headerTintColor: '#ffffff',
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 18,
            },
            headerBackTitleVisible: false,
            gestureEnabled: true,
            cardStyle: { backgroundColor: '#1a1d23' },
          }}
        >
          <Stack.Screen
            name="LandingPage"
            component={LandingPage}
            options={{ 
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="ChatScreen"
            component={ChatScreen}
            options={{ 
              headerShown: false,
              gestureEnabled: false, // Prevent swiping back from chat
            }}
          />
          <Stack.Screen
            name="DroneTracking"
            component={DroneTrackingScreen}
            options={{ 
              headerShown: false,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList, MainTabParamList } from '../types';
import { COLORS, TAB_BAR_HEIGHT, MINI_PLAYER_HEIGHT } from '../constants';

// Screens
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import LibraryScreen from '../screens/LibraryScreen';
import PlayerScreen from '../screens/PlayerScreen';
import QueueScreen from '../screens/QueueScreen';

// Components
import MiniPlayer from '../components/MiniPlayer';
import { usePlayerStore } from '../store';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Custom dark theme
const DarkTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.primary,
    background: COLORS.background,
    card: COLORS.backgroundSecondary,
    text: COLORS.textPrimary,
    border: COLORS.border,
    notification: COLORS.primary,
  },
};

// Tab icon component
const TabIcon = ({ 
  name, 
  focused 
}: { 
  name: keyof typeof Ionicons.glyphMap; 
  focused: boolean;
}) => (
  <Ionicons
    name={name}
    size={24}
    color={focused ? COLORS.primary : COLORS.textSecondary}
  />
);

// Main tab navigator
const MainTabs: React.FC = () => {
  const currentSong = usePlayerStore((state) => state.currentSong);

  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: COLORS.backgroundSecondary,
            borderTopColor: COLORS.border,
            height: TAB_BAR_HEIGHT,
            paddingBottom: Platform.OS === 'ios' ? 20 : 8,
            paddingTop: 8,
          },
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textSecondary,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="Search"
          component={SearchScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon name={focused ? 'search' : 'search-outline'} focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="Library"
          component={LibraryScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon name={focused ? 'library' : 'library-outline'} focused={focused} />
            ),
          }}
        />
      </Tab.Navigator>
      
      {/* Mini Player - shown when a song is playing */}
      {currentSong && (
        <View style={styles.miniPlayerContainer}>
          <MiniPlayer />
        </View>
      )}
    </View>
  );
};

// Root stack navigator
const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer theme={DarkTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_bottom',
          contentStyle: {
            backgroundColor: COLORS.background,
          },
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen
          name="Player"
          component={PlayerScreen}
          options={{
            animation: 'slide_from_bottom',
            gestureEnabled: true,
            gestureDirection: 'vertical',
          }}
        />
        <Stack.Screen
          name="Queue"
          component={QueueScreen}
          options={{
            animation: 'slide_from_right',
            presentation: 'modal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  miniPlayerContainer: {
    position: 'absolute',
    bottom: TAB_BAR_HEIGHT,
    left: 0,
    right: 0,
    height: MINI_PLAYER_HEIGHT,
  },
});

export default AppNavigator;

import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList, MainTabParamList } from '../types';
import { TAB_BAR_HEIGHT, MINI_PLAYER_HEIGHT } from '../constants';
import { useThemeStore, getThemeColors, LIGHT_COLORS, DARK_COLORS } from '../store/themeStore';

// Screens
import HomeScreen from '../screens/HomeScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import PlaylistsScreen from '../screens/PlaylistsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SearchScreen from '../screens/SearchScreen';
import PlayerScreen from '../screens/PlayerScreen';
import QueueScreen from '../screens/QueueScreen';

// Components
import MiniPlayer from '../components/MiniPlayer';
import { usePlayerStore } from '../store/playerStore';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Light theme
const LightTheme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: LIGHT_COLORS.primary,
    background: LIGHT_COLORS.background,
    card: LIGHT_COLORS.background,
    text: LIGHT_COLORS.textPrimary,
    border: LIGHT_COLORS.border,
    notification: LIGHT_COLORS.primary,
  },
};

// Dark theme
const AppDarkTheme = {
  ...DarkTheme,
  dark: true,
  colors: {
    ...DarkTheme.colors,
    primary: DARK_COLORS.primary,
    background: DARK_COLORS.background,
    card: DARK_COLORS.background,
    text: DARK_COLORS.textPrimary,
    border: DARK_COLORS.border,
    notification: DARK_COLORS.primary,
  },
};

// Main tab navigator
const MainTabs: React.FC = () => {
  const currentSong = usePlayerStore((state) => state.currentSong);
  const { isDarkMode } = useThemeStore();
  const COLORS = getThemeColors(isDarkMode);

  return (
    <View style={[styles.container, { backgroundColor: COLORS.background }]}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: COLORS.background,
            borderTopColor: COLORS.border,
            height: TAB_BAR_HEIGHT,
            paddingBottom: Platform.OS === 'ios' ? 20 : 8,
            paddingTop: 8,
            elevation: 0,
            shadowOpacity: 0,
            borderTopWidth: 1,
          },
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textSecondary,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '500',
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={24}
                color={focused ? COLORS.primary : COLORS.textSecondary}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Favorites"
          component={FavoritesScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name={focused ? 'heart' : 'heart-outline'}
                size={24}
                color={focused ? COLORS.primary : COLORS.textSecondary}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Playlists"
          component={PlaylistsScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name={focused ? 'list' : 'list-outline'}
                size={24}
                color={focused ? COLORS.primary : COLORS.textSecondary}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name={focused ? 'settings' : 'settings-outline'}
                size={24}
                color={focused ? COLORS.primary : COLORS.textSecondary}
              />
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
  const { isDarkMode } = useThemeStore();
  const COLORS = getThemeColors(isDarkMode);
  
  return (
    <NavigationContainer theme={isDarkMode ? AppDarkTheme : LightTheme}>
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
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{
            animation: 'slide_from_right',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  miniPlayerContainer: {
    position: 'absolute',
    bottom: TAB_BAR_HEIGHT,
    left: 0,
    right: 0,
    height: MINI_PLAYER_HEIGHT,
    zIndex: 100,
  },
});

export default AppNavigator;

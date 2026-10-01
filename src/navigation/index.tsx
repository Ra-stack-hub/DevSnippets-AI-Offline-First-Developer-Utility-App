import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { Home, Heart, Folder, Settings } from 'lucide-react-native';

import HomeScreen from '../screens/HomeScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import FileManagerScreen from '../screens/FileManagerScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SnippetDetailsScreen from '../screens/SnippetDetailsScreen';
import CreateEditSnippetScreen from '../screens/CreateEditSnippetScreen';
import { BottomTabParamList, RootStackParamList } from './types';

const Tab = createBottomTabNavigator<BottomTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#3b82f6', // Tailwind blue-500
        tabBarInactiveTintColor: '#9ca3af', // Tailwind gray-400
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#f3f4f6', // Tailwind gray-100
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Heart color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="FileManager"
        component={FileManagerScreen}
        options={{
          title: 'Files',
          tabBarIcon: ({ color, size }) => <Folder color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={BottomTabs} />
        <Stack.Screen name="SnippetDetails" component={SnippetDetailsScreen} />
        <Stack.Screen name="CreateEditSnippet" component={CreateEditSnippetScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

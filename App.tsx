import './global.css';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SQLiteProvider } from 'expo-sqlite';
import AppNavigator from './src/navigation';
import { initDb } from './src/database';

export default function App() {
  return (
    <SafeAreaProvider>
      <SQLiteProvider databaseName="devsnippets.db" onInit={initDb} useSuspense>
        <AppNavigator />
      </SQLiteProvider>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

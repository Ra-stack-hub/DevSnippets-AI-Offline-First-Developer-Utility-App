import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Save, Key } from 'lucide-react-native';

export default function SettingsScreen() {
  const [apiKey, setApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const storedKey = await SecureStore.getItemAsync('GEMINI_API_KEY');
      if (storedKey) setApiKey(storedKey);
    } catch (error) {
      console.error('Failed to load API key');
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      await SecureStore.setItemAsync('GEMINI_API_KEY', apiKey.trim());
      Alert.alert('Success', 'API Key saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save API key');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-zinc-900 px-4 py-6">
      <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</Text>
      
      <View className="bg-white dark:bg-zinc-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-zinc-700 mb-6">
        <View className="flex-row items-center mb-4">
          <Key size={20} color="#3b82f6" />
          <Text className="text-lg font-bold text-gray-900 dark:text-white ml-2">AI Configuration</Text>
        </View>
        
        <Text className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Enter your Gemini API key to enable AI explanations and suggestions for your snippets. Your key is stored securely on your device.
        </Text>
        
        <TextInput
          className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-base mb-4"
          placeholder="AIzaSy..."
          placeholderTextColor="#9ca3af"
          value={apiKey}
          onChangeText={setApiKey}
          secureTextEntry
          autoCapitalize="none"
        />
        
        <TouchableOpacity 
          onPress={saveSettings}
          disabled={isSaving}
          className="bg-blue-600 rounded-xl py-3 flex-row justify-center items-center"
        >
          <Save size={20} color="white" />
          <Text className="text-white font-bold ml-2">Save API Key</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

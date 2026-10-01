import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Edit3, Heart, Share2, Trash2, Cpu } from 'lucide-react-native';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import { atomOneDark } from 'react-native-syntax-highlighter'; 
import { getSnippetById, toggleFavorite, deleteSnippet } from '../database';
import { Snippet } from '../types';
import { RootStackParamList } from '../navigation/types';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { explainSnippet } from '../services/ai';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SnippetDetails'>;
type RouteProps = RouteProp<RootStackParamList, 'SnippetDetails'>;

export default function SnippetDetailsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { snippetId } = route.params;

  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);

  const loadSnippet = async () => {
    try {
      const data = await getSnippetById(snippetId);
      if (data) setSnippet(data);
    } catch (error) {
      console.error(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSnippet();
    }, [snippetId])
  );

  const handleToggleFavorite = async () => {
    if (!snippet) return;
    await toggleFavorite(snippet.id, !snippet.isFavorite);
    loadSnippet();
  };

  const handleDelete = () => {
    Alert.alert('Delete Snippet', 'Are you sure you want to delete this snippet?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          await deleteSnippet(snippetId);
          navigation.goBack();
        }
      }
    ]);
  };

  const handleExport = async () => {
    if (!snippet) return;
    
    try {
      const filename = `${snippet.title.replace(/\\s+/g, '_')}.${snippet.language === 'javascript' ? 'js' : snippet.language === 'typescript' ? 'ts' : 'txt'}`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(fileUri, snippet.code);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Export Saved', `Saved to ${fileUri}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export snippet');
    }
  };

  const handleExplainAI = async () => {
    if (!snippet) return;
    setIsExplaining(true);
    setExplanation(null);
    try {
      const result = await explainSnippet(snippet);
      setExplanation(result);
    } catch (error: any) {
      Alert.alert('AI Error', error.message);
    } finally {
      setIsExplaining(false);
    }
  };

  if (!snippet) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-zinc-900 justify-center items-center">
        <Text className="text-gray-500">Loading...</Text>
      </View>
    );
  }

  const tags = snippet.tags ? snippet.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

  return (
    <View className="flex-1 bg-gray-50 dark:bg-zinc-900">
      <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 pt-12">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <View className="flex-row">
          <TouchableOpacity onPress={handleExport} className="p-2">
            <Share2 size={22} color="#4b5563" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleToggleFavorite} className="p-2">
            <Heart size={22} color={snippet.isFavorite ? "#ef4444" : "#4b5563"} fill={snippet.isFavorite ? "#ef4444" : "transparent"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('CreateEditSnippet', { snippetId })} className="p-2">
            <Edit3 size={22} color="#4b5563" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} className="p-2 -mr-2">
            <Trash2 size={22} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {snippet.title}
        </Text>
        
        <View className="flex-row items-center mb-4">
          <Text className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md">
            {snippet.language}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 ml-3">
            {new Date(snippet.createdAt).toLocaleString()}
          </Text>
        </View>

        {tags.length > 0 && (
          <View className="flex-row flex-wrap mb-4">
            {tags.map((tag, index) => (
              <View key={index} className="bg-gray-200 dark:bg-zinc-700 px-2.5 py-1 rounded-full mr-2 mb-2">
                <Text className="text-xs text-gray-700 dark:text-gray-300 font-medium">#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        <View className="bg-zinc-900 rounded-xl overflow-hidden mb-6 shadow-sm">
          <SyntaxHighlighter 
            language={snippet.language || 'javascript'} 
            style={atomOneDark}
            customStyle={{ padding: 16, margin: 0, borderRadius: 12 }}
            fontSize={14}
            highlighter="prism"
          >
            {snippet.code}
          </SyntaxHighlighter>
        </View>

        <TouchableOpacity 
          onPress={handleExplainAI}
          disabled={isExplaining}
          className={`flex-row items-center justify-center py-4 rounded-xl shadow-sm mb-6 ${isExplaining ? 'bg-purple-400' : 'bg-purple-600'}`}
        >
          {isExplaining ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Cpu size={20} color="white" />
              <Text className="text-white font-bold text-lg ml-2">Ask AI to Explain</Text>
            </>
          )}
        </TouchableOpacity>

        {explanation && (
          <View className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 p-4 rounded-xl mb-8">
            <Text className="text-lg font-bold text-purple-900 dark:text-purple-300 mb-2">AI Explanation</Text>
            <Text className="text-base text-gray-800 dark:text-gray-300 leading-6">{explanation}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

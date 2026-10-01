import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TextInput } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Search } from 'lucide-react-native';
import { getSnippets, toggleFavorite } from '../database';
import { Snippet } from '../types';
import { SnippetCard } from '../components/SnippetCard';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

export default function FavoritesScreen() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation<NavigationProp>();

  const loadSnippets = async () => {
    try {
      const data = await getSnippets();
      setSnippets(data.filter(s => s.isFavorite));
    } catch (error) {
      console.error('Failed to load snippets', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSnippets();
    }, [])
  );

  const handleToggleFavorite = async (snippet: Snippet) => {
    await toggleFavorite(snippet.id, !snippet.isFavorite);
    loadSnippets();
  };

  const filteredSnippets = snippets.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.tags.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.language.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View className="flex-1 bg-gray-50 dark:bg-zinc-900">
      <View className="px-4 py-3 bg-white dark:bg-zinc-900 shadow-sm z-10 border-b border-gray-100 dark:border-zinc-800">
        <View className="flex-row items-center bg-gray-100 dark:bg-zinc-800 rounded-xl px-3 py-2">
          <Search size={20} color="#9ca3af" />
          <TextInput 
            className="flex-1 ml-2 text-gray-900 dark:text-white text-base h-10"
            placeholder="Search favorites..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredSnippets}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <SnippetCard 
            snippet={item} 
            onPress={(snippet) => navigation.navigate('SnippetDetails', { snippetId: snippet.id })}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center mt-20">
            <Text className="text-gray-500 dark:text-gray-400 text-lg text-center px-6">
              {searchQuery ? "No favorites found" : "You haven't favorited any snippets yet."}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

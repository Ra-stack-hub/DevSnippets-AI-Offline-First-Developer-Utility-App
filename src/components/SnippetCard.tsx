import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Heart, Code2 } from 'lucide-react-native';
import { Snippet } from '../types';

interface SnippetCardProps {
  snippet: Snippet;
  onPress: (snippet: Snippet) => void;
  onToggleFavorite: (snippet: Snippet) => void;
}

export function SnippetCard({ snippet, onPress, onToggleFavorite }: SnippetCardProps) {
  const tags = snippet.tags ? snippet.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={() => onPress(snippet)}
      className="bg-white dark:bg-zinc-800 rounded-2xl p-4 mb-4 shadow-sm border border-gray-100 dark:border-zinc-700"
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-row items-center flex-1">
          <View className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-xl mr-3">
            <Code2 size={20} color="#3b82f6" />
          </View>
          <View className="flex-1 pr-2">
            <Text className="text-lg font-bold text-gray-900 dark:text-white" numberOfLines={1}>
              {snippet.title}
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {snippet.language} • {new Date(snippet.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity 
          onPress={() => onToggleFavorite(snippet)}
          className="p-2 -mr-2 -mt-2"
        >
          <Heart 
            size={22} 
            color={snippet.isFavorite ? "#ef4444" : "#9ca3af"} 
            fill={snippet.isFavorite ? "#ef4444" : "transparent"} 
          />
        </TouchableOpacity>
      </View>

      {tags.length > 0 && (
        <View className="flex-row flex-wrap mt-2">
          {tags.map((tag, index) => (
            <View key={index} className="bg-gray-100 dark:bg-zinc-700 px-2.5 py-1 rounded-full mr-2 mb-2">
              <Text className="text-xs text-gray-600 dark:text-gray-300 font-medium">#{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

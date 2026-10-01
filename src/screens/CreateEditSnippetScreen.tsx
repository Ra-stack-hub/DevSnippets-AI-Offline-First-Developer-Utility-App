import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Save, ArrowLeft } from 'lucide-react-native';
import { getSnippetById, insertSnippet, updateSnippet } from '../database';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateEditSnippet'>;
type RouteProps = RouteProp<RootStackParamList, 'CreateEditSnippet'>;

export default function CreateEditSnippetScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const snippetId = route.params?.snippetId;

  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [tags, setTags] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (snippetId) {
      loadSnippet(snippetId);
    }
  }, [snippetId]);

  const loadSnippet = async (id: string) => {
    try {
      const snippet = await getSnippetById(id);
      if (snippet) {
        setTitle(snippet.title);
        setCode(snippet.code);
        setLanguage(snippet.language);
        setTags(snippet.tags);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load snippet');
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !code.trim()) {
      Alert.alert('Validation Error', 'Title and code are required');
      return;
    }

    setIsSaving(true);
    try {
      if (snippetId) {
        await updateSnippet(snippetId, { title, code, language, tags });
        navigation.goBack();
      } else {
        const newId = await insertSnippet({
          title,
          code,
          language,
          tags,
          isFavorite: false,
        });
        navigation.replace('SnippetDetails', { snippetId: newId });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save snippet');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-gray-50 dark:bg-zinc-900" 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 pt-12">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900 dark:text-white">
          {snippetId ? 'Edit Snippet' : 'New Snippet'}
        </Text>
        <TouchableOpacity onPress={handleSave} disabled={isSaving} className="p-2 -mr-2 flex-row items-center">
          <Save size={20} color="#3b82f6" />
          <Text className="ml-1 text-blue-500 font-semibold text-base">Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 ml-1">Title</Text>
          <TextInput
            className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-base"
            placeholder="e.g. Fetch Data Hook"
            placeholderTextColor="#9ca3af"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 ml-1">Language</Text>
          <TextInput
            className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-base"
            placeholder="e.g. javascript, python, typescript"
            placeholderTextColor="#9ca3af"
            value={language}
            onChangeText={setLanguage}
            autoCapitalize="none"
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 ml-1">Tags (comma separated)</Text>
          <TextInput
            className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-base"
            placeholder="e.g. react, hook, api"
            placeholderTextColor="#9ca3af"
            value={tags}
            onChangeText={setTags}
            autoCapitalize="none"
          />
        </View>

        <View className="mb-8 flex-1">
          <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 ml-1">Code Snippet</Text>
          <TextInput
            className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-4 text-gray-900 dark:text-white font-mono text-sm min-h-[300px]"
            placeholder="// Write or paste your code here..."
            placeholderTextColor="#9ca3af"
            value={code}
            onChangeText={setCode}
            multiline
            textAlignVertical="top"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

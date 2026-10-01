import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { FileCode, Trash2, Share2 } from 'lucide-react-native';

interface FileItem {
  name: string;
  uri: string;
  size: number;
  modificationTime: number;
}

export default function FileManagerScreen() {
  const [files, setFiles] = useState<FileItem[]>([]);

  const loadFiles = async () => {
    try {
      const dirUri = FileSystem.documentDirectory;
      if (!dirUri) return;
      const fileNames = await FileSystem.readDirectoryAsync(dirUri);
      
      const fileDataPromises = fileNames
        .filter(name => !name.startsWith('SQLite')) // Ignore DB files
        .map(async (name) => {
          const uri = `${dirUri}${name}`;
          const info = await FileSystem.getInfoAsync(uri);
          return {
            name,
            uri,
            size: info.exists ? info.size : 0,
            modificationTime: info.exists ? info.modificationTime : 0,
          };
        });

      const fileData = await Promise.all(fileDataPromises);
      setFiles(fileData.sort((a, b) => b.modificationTime - a.modificationTime));
    } catch (error) {
      console.error('Failed to load files', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFiles();
    }, [])
  );

  const handleShare = async (uri: string) => {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri);
    } else {
      Alert.alert('Sharing not available', 'Cannot share this file.');
    }
  };

  const handleDelete = (uri: string, name: string) => {
    Alert.alert('Delete File', `Are you sure you want to delete ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          await FileSystem.deleteAsync(uri);
          loadFiles();
        }
      }
    ]);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-zinc-900">
      <View className="px-4 py-4 bg-white dark:bg-zinc-900 shadow-sm border-b border-gray-100 dark:border-zinc-800">
        <Text className="text-xl font-bold text-gray-900 dark:text-white">Exported Files</Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Snippets you have exported
        </Text>
      </View>

      <FlatList
        data={files}
        keyExtractor={item => item.name}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View className="flex-row items-center justify-between bg-white dark:bg-zinc-800 p-4 rounded-xl mb-3 shadow-sm border border-gray-100 dark:border-zinc-700">
            <View className="flex-row items-center flex-1">
              <View className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
                <FileCode size={24} color="#3b82f6" />
              </View>
              <View className="flex-1 pr-2">
                <Text className="text-base font-semibold text-gray-900 dark:text-white" numberOfLines={1}>
                  {item.name}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formatSize(item.size)} • {new Date(item.modificationTime * 1000).toLocaleString()}
                </Text>
              </View>
            </View>
            <View className="flex-row">
              <TouchableOpacity onPress={() => handleShare(item.uri)} className="p-2">
                <Share2 size={20} color="#4b5563" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.uri, item.name)} className="p-2">
                <Trash2 size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center mt-20">
            <Text className="text-gray-500 dark:text-gray-400 text-lg">No exported files yet.</Text>
          </View>
        )}
      />
    </View>
  );
}

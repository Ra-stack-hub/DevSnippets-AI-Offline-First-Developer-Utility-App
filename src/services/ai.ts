import * as SecureStore from 'expo-secure-store';
import { Snippet } from '../types';

export const explainSnippet = async (snippet: Snippet): Promise<string> => {
  const apiKey = await SecureStore.getItemAsync('GEMINI_API_KEY');
  
  if (!apiKey) {
    throw new Error('API Key not found. Please set it in the Settings tab.');
  }

  const prompt = `Explain the following ${snippet.language} code snippet step by step in a clear, concise manner for a developer. Here is the code:\n\n${snippet.code}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to fetch AI explanation');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error: any) {
    throw new Error(error.message || 'An error occurred while calling the AI API');
  }
};

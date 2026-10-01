import { NavigatorScreenParams } from '@react-navigation/native';

export type BottomTabParamList = {
  Home: undefined;
  Favorites: undefined;
  FileManager: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Main: NavigatorScreenParams<BottomTabParamList>;
  SnippetDetails: { snippetId: string };
  CreateEditSnippet: { snippetId?: string };
};

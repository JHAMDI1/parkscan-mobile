import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { TabNavigator } from './src/navigation/TabNavigator';
import { initDB } from './src/db/database';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from './src/constants/theme';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LoginScreen } from './src/screens/LoginScreen';

const RootNavigator = () => {
  const { worker, loading } = useAuth();
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    async function setupDb() {
      try {
        await initDB();
        setDbReady(true);
      } catch (error) {
        console.error("Erreur d'initialisation de la base de données:", error);
      }
    }
    setupDb();
  }, []);

  if (!dbReady || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ color: COLORS.text, marginTop: 10 }}>تهيئة النظام...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      {worker ? <TabNavigator /> : <LoginScreen />}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

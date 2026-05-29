import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Camera, ListChecks, History } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CaptureScreen } from '../screens/CaptureScreen';
import { DraftListScreen } from '../screens/DraftListScreen';
import { ProcessScreen } from '../screens/ProcessScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { COLORS } from '../constants/theme';

const Tab = createMaterialTopTabNavigator();
const Stack = createNativeStackNavigator();

const commonHeaderOptions = {
  headerStyle: { backgroundColor: COLORS.surface },
  headerTintColor: COLORS.text,
  headerTitleAlign: 'center',
};

// Stack for Capture
function CaptureStack() {
  return (
    <Stack.Navigator screenOptions={commonHeaderOptions}>
      <Stack.Screen name="CaptureScreen" component={CaptureScreen} options={{ title: 'الكاميرا' }} />
    </Stack.Navigator>
  );
}

// Stack for History
function HistoryStack() {
  return (
    <Stack.Navigator screenOptions={commonHeaderOptions}>
      <Stack.Screen name="HistoryScreen" component={HistoryScreen} options={{ title: 'السجل' }} />
    </Stack.Navigator>
  );
}

// Stack for the Drafts flow (List -> Detail)
function DraftsStack() {
  return (
    <Stack.Navigator screenOptions={commonHeaderOptions}>
      <Stack.Screen 
        name="DraftList" 
        component={DraftListScreen} 
        options={{ title: 'المسودات (Brouillons)' }} 
      />
      <Stack.Screen 
        name="Process" 
        component={ProcessScreen} 
        options={{ title: 'معالجة (Traitement)', presentation: 'modal' }} 
      />
    </Stack.Navigator>
  );
}

export const TabNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      tabBarPosition="bottom"
      screenOptions={{
        tabBarStyle: { 
          backgroundColor: COLORS.surface, 
          borderTopWidth: 0, 
          paddingBottom: Math.max(insets.bottom, 8), 
          paddingTop: 8, 
          height: 60 + Math.max(insets.bottom, 0), 
          elevation: 10, 
          shadowColor: '#000', 
          shadowOpacity: 0.1, 
          shadowRadius: 10 
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSubdued,
        tabBarShowIcon: true,
        tabBarIndicatorStyle: { top: 0, height: 3, backgroundColor: 'transparent' }, // hide standard indicator or move it to top
        tabBarLabelStyle: { fontSize: 10, marginTop: 2, fontWeight: 'bold' }
      }}
    >
      <Tab.Screen 
        name="Capture" 
        component={CaptureStack} 
        options={{
          tabBarLabel: 'الكاميرا',
          tabBarIcon: ({ color }) => <Camera size={22} color={color} />
        }}
      />
      <Tab.Screen 
        name="Drafts" 
        component={DraftsStack} 
        options={{
          tabBarLabel: 'معالجة',
          tabBarIcon: ({ color }) => <ListChecks size={22} color={color} />
        }}
      />
      <Tab.Screen 
        name="History" 
        component={HistoryStack} 
        options={{
          tabBarLabel: 'السجل',
          tabBarIcon: ({ color }) => <History size={22} color={color} />
        }}
      />
    </Tab.Navigator>
  );
};

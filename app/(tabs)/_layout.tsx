import { Feather, FontAwesome5, Foundation } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{  
        tabBarActiveTintColor: '#6C63FF', // Un color morado para la pestaña activa
        tabBarInactiveTintColor: 'gray',
        headerShown: false, 
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          paddingBottom: 5,
          height: 60,
        },
      }}>
      <Tabs.Screen
        name="index" // Este es el archivo index.tsx
        options={{
          title: 'Hoy',
          headerShown: false, // Opcional: para ocultar el título de arriba
          tabBarIcon: ({ color }) => <Foundation name="home" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add" // Este es el archivo add.tsx
        options={{
          title: 'Agregar',
          headerShown: false,
          tabBarIcon: ({ color }) => <Feather name="plus-square" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress" // Este es el archivo progress.tsx
        options={{
          title: 'Progreso',
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome5 name="chart-line" size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        // Apunta al archivo `app/(tabs)/explore.tsx`
        name="Explorar"
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color }) => <FontAwesome5 name="compass" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
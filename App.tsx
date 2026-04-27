import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar, Alert } from 'react-native';

import LoginScreen from './src/screens/LoginScreen';
import LobbyScreen from './src/screens/LobbyScreen';
import GameScreen from './src/screens/GameScreen';

const Stack = createNativeStackNavigator();

let socket: WebSocket | null = null;

export const getWS = () => socket;

const App = () => {
  const [connected, setConnected] = useState(false);
  const reconnectTimer = useRef<any>(null);

  const connectWS = () => {
    console.log("🔌 Conectando WS...");

    socket = new WebSocket('ws://3.149.3.168:5000');

    socket.onopen = () => {
      console.log('✅ WebSocket conectado correctamente');
      setConnected(true);
    };

    socket.onerror = (error) => {
      console.log('❌ WebSocket error:', error);
      setConnected(false);
    };

    socket.onclose = () => {
      console.log('⚠️ WebSocket cerrado');
      setConnected(false);

      reconnectTimer.current = setTimeout(() => {
        connectWS();
      }, 2000);
    };
  };

  useEffect(() => {
    connectWS();

    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (socket) socket.close();
    };
  }, []);

  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f1e" />
      <Stack.Navigator initialRouteName="Login">

        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }} 
        />

        <Stack.Screen 
          name="Lobby" 
          component={LobbyScreen} 
          options={{ title: 'Salas de Juego' }} 
        />

        <Stack.Screen 
          name="Game" 
          component={GameScreen} 
          options={({ route }) => ({
            title: `Sala: ${route.params?.roomId || 'Conectando...'}`,
          })}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
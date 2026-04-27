import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';

export default function LobbyScreen({ route, navigation }: any) {
  const { player } = route.params || { player: 'Jugador' };

  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // ✅ CREAR SALA NUEVA
  const createRoom = () => {
    if (isCreating) return;

    setIsCreating(true);

    navigation.navigate('Game', {
      player,
      roomId: null // El servidor creará la sala
    });

    setIsCreating(false);
  };

  // ✅ UNIRSE A SALA
  const joinRoom = () => {
    const code = roomCode.trim().toUpperCase();

    if (!code || code.length < 3) {
      Alert.alert('Error', 'Ingresa un código válido');
      return;
    }

    if (isJoining) return;

    setIsJoining(true);

    navigation.navigate('Game', {
      player,
      roomId: code
    });

    setIsJoining(false);
  };

  // ✅ VOLVER AL MENÚ PRINCIPAL (Login)
  const goBackToLogin = () => {
    navigation.navigate('Login'); // Cambia 'Login' si tu pantalla se llama diferente
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎲 Dado Triple</Text>
      <Text style={styles.welcome}>Hola, {player}</Text>

      <View style={styles.card}>

        <TouchableOpacity
          style={styles.createButton}
          onPress={createRoom}
          disabled={isCreating}
        >
          {isCreating ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.createText}>Crear Sala Nueva</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.or}>— O —</Text>

        <Text style={styles.label}>Unirse con código</Text>

        <TextInput
          style={styles.input}
          placeholder="Ej: 839201"
          placeholderTextColor="#888"
          value={roomCode}
          onChangeText={setRoomCode}
          autoCapitalize="characters"
          maxLength={10}
        />

        <TouchableOpacity
          style={styles.joinButton}
          onPress={joinRoom}
          disabled={isJoining}
        >
          {isJoining ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.joinText}>UNIRSE A LA SALA</Text>
          )}
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },

  title: {
    fontSize: 36,
    color: '#fff',
    fontWeight: 'bold'
  },

  welcome: {
    color: '#00d4ff',
    fontSize: 20,
    marginBottom: 40
  },

  card: {
    backgroundColor: '#1c1c2e',
    padding: 30,
    borderRadius: 20,
    width: '90%',
    alignItems: 'center'
  },

  createButton: {
    backgroundColor: '#00d4ff',
    padding: 18,
    borderRadius: 15,
    width: '100%',
    alignItems: 'center',
    marginBottom: 25
  },

  createText: {
    color: '#000',
    fontSize: 19,
    fontWeight: 'bold'
  },

  or: {
    color: '#666',
    marginVertical: 15
  },

  label: {
    color: '#ccc',
    alignSelf: 'flex-start',
    marginBottom: 10
  },

  input: {
    backgroundColor: '#2a2a3e',
    width: '100%',
    padding: 15,
    borderRadius: 12,
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20
  },

  joinButton: {
    backgroundColor: '#6c5ce7',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center'
  },

  joinText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },

  // Nuevo botón para volver
  backButton: {
    marginTop: 40,
    padding: 12,
  },

  backText: {
    color: '#888',
    fontSize: 16,
    textDecorationLine: 'underline',
  }
});
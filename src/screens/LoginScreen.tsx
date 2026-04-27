import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

export default function LoginScreen({ navigation }: any) {
  const [name, setName] = useState('');

  const handleEnter = () => {
    const trimmedName = name.trim();

    if (trimmedName === '') {
      Alert.alert('Error', 'Por favor ingresa tu nombre');
      return;
    }

    if (trimmedName.length < 3) {
      Alert.alert('Error', 'El nombre debe tener al menos 3 caracteres');
      return;
    }

    // Navegar al Lobby con el nombre del jugador
    navigation.navigate('Lobby', { player: trimmedName });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.container}>
        <Text style={styles.title}>🎲 Dado Triple</Text>
        <Text style={styles.subtitle}>Multiplayer en Tiempo Real</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Nombre del Jugador</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            maxLength={20}
            returnKeyType="go"
            onSubmitEditing={handleEnter}
          />

          <TouchableOpacity style={styles.button} onPress={handleEnter}>
            <Text style={styles.buttonText}>ENTRAR A LA SALA</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#00d4ff',
    fontSize: 18,
    marginBottom: 60,
  },
  card: {
    backgroundColor: '#1c1c2e',
    padding: 35,
    borderRadius: 20,
    width: '85%',
    alignItems: 'center',
  },
  label: {
    color: '#ccc',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  input: {
    backgroundColor: '#2a2a3e',
    color: '#fff',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    fontSize: 18,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#6c5ce7',
    padding: 18,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
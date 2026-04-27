import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function RankingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏆 Ranking Global</Text>
      <Text style={styles.subtitle}>Próximamente: ranking por sala</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1e1e2f', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 32, color: '#ffd700', fontWeight: 'bold' },
  subtitle: { color: '#aaa', marginTop: 20, fontSize: 18 },
});
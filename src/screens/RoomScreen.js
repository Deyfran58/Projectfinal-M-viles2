import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useState } from "react";

export default function RoomScreen({ navigation }) {
  const [status, setStatus] = useState("Selecciona un modo");

  const connectToServer = (mode) => {
    setStatus("Conectando...");

const ws = new WebSocket("ws://3.144.240.34:3000");

    ws.onopen = () => {
      console.log("Conectado al servidor");
      setStatus("Esperando jugador...");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "init") {
        console.log("Soy jugador", data.playerId);
      }

      if (data.type === "start") {
        navigation.navigate("Game", {
          socket: ws,
          playerId: data.playerId,
          mode: mode, 
        });
      }

      if (data.type === "full") {
        setStatus("Sala llena");
      }
    };

    ws.onerror = (err) => {
      console.log("Error:", err);
      setStatus("Error de conexión");
    };
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎮 Sala de Juego</Text>

      <Text style={{ color: "#fff", marginBottom: 20 }}>{status}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => connectToServer("duo")}
      >
        <Text style={styles.text}>1 vs 1</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => connectToServer("team2")}
      >
        <Text style={styles.text}>2 vs 2</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => connectToServer("team3")}
      >
        <Text style={styles.text}>3 vs 3</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1e1e2f",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    color: "#fff",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#ffd700",
    padding: 15,
    marginVertical: 10,
    width: "80%",
    borderRadius: 10,
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontWeight: "bold",
  },
});
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Vibration,
  ScrollView,
  Easing,
  Dimensions,
} from "react-native";
import { getWS } from "../../App";
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export default function GameScreen({ route }: any) {
  const { player, roomId: incomingRoomId } = route.params || {
    player: "Jugador",
    roomId: null,
  };

  const navigation = useNavigation<any>();

  const MAX_ROUNDS = 5;

  const [roomId, setRoomId] = useState<string | null>(incomingRoomId || null);
  const [dice, setDice] = useState([1, 1, 1]);
  const [history, setHistory] = useState<any[]>([]);
  const [players, setPlayers] = useState<string[]>([]);
  const [scores, setScores] = useState<any>({});
  const [round, setRound] = useState(1);
  const [gameOver, setGameOver] = useState(false);

  // Animaciones de dados
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rollAnim = useRef(new Animated.Value(0)).current;

  // Confeti con efecto de explosión (22 partículas)
  const confettiAnims = useRef(
    Array.from({ length: 22 }, () => ({
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0.3),
    }))
  ).current;

  const confettiEmojis = ['🎉', '🎊', '✨', '🪅', '🎈', '🌟', '🥳', '🔥'];

  // Efecto de EXPLOSIÓN
  useEffect(() => {
    if (!gameOver) return;

    const launchExplosion = () => {
      confettiAnims.forEach((anim, index) => {
        const angle = (index / confettiAnims.length) * Math.PI * 2; // distribución circular
        const distance = 180 + Math.random() * 140; // distancia de explosión

        const targetX = Math.cos(angle) * distance;
        const targetY = Math.sin(angle) * distance - 80; // un poco hacia arriba primero

        const delay = index * 12;

        Animated.parallel([
          // Movimiento explosivo
          Animated.timing(anim.translateX, {
            toValue: targetX,
            duration: 1400 + Math.random() * 600,
            easing: Easing.out(Easing.cubic),
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(anim.translateY, {
            toValue: targetY,
            duration: 1300 + Math.random() * 700,
            easing: Easing.out(Easing.quad),
            delay,
            useNativeDriver: true,
          }),
          // Rotación
          Animated.timing(anim.rotate, {
            toValue: Math.random() > 0.5 ? 840 : -840,
            duration: 1600,
            easing: Easing.linear,
            delay,
            useNativeDriver: true,
          }),
          // Opacidad
          Animated.sequence([
            Animated.timing(anim.opacity, { toValue: 1, duration: 180, delay, useNativeDriver: true }),
            Animated.timing(anim.opacity, { toValue: 0, duration: 1100, delay: 900, useNativeDriver: true }),
          ]),
          // Escalado (explota y luego se encoge)
          Animated.sequence([
            Animated.timing(anim.scale, { toValue: 1.25, duration: 300, delay, useNativeDriver: true }),
            Animated.timing(anim.scale, { toValue: 0.7, duration: 900, delay: 400, useNativeDriver: true }),
          ]),
        ]).start();
      });
    };

    // Primera explosión
    launchExplosion();

    // Repetir explosión cada 2.4 segundos
    const interval = setInterval(launchExplosion, 2400);

    return () => clearInterval(interval);
  }, [gameOver]);

  useEffect(() => {
    const ws = getWS();
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    const handleMessage = (e: any) => {
      try {
        const data = JSON.parse(e.data);

        if (data.action === "room_created") {
          setRoomId(data.roomId);
          ws.send(JSON.stringify({ action: "join_room", player, roomId: data.roomId }));
        }

        if (data.action === "room_update") {
          setPlayers(data.players);
        }

        if (data.action === "roll") {
          setDice(data.dice);

          Animated.parallel([
            Animated.sequence([
              Animated.timing(scaleAnim, { toValue: 1.35, duration: 80, useNativeDriver: true }),
              Animated.timing(scaleAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
            ]),
            Animated.timing(rollAnim, { toValue: 1, duration: 450, easing: Easing.ease, useNativeDriver: true }),
          ]).start(() => rollAnim.setValue(0));

          setHistory((prev) => [{ ...data, timestamp: new Date().toLocaleTimeString() }, ...prev]);
          setScores((prev: any) => ({
            ...prev,
            [data.player]: (prev[data.player] || 0) + data.points,
          }));
        }
      } catch (err) {
        console.log(err);
      }
    };

    ws.addEventListener("message", handleMessage);

    if (!incomingRoomId) {
      ws.send(JSON.stringify({ action: "create_room", player }));
    } else {
      ws.send(JSON.stringify({ action: "join_room", player, roomId: incomingRoomId }));
    }

    return () => ws.removeEventListener("message", handleMessage);
  }, []);

  // avanzar rondas
  useEffect(() => {
    if (history.length > 0 && players.length > 0) {
      const totalTurns = history.filter((x) => x.dice).length;
      const currentRound = Math.floor(totalTurns / players.length) + 1;

      if (currentRound <= MAX_ROUNDS) setRound(currentRound);
      if (currentRound > MAX_ROUNDS) setGameOver(true);
    }
  }, [history, players]);

  const calculate = (d: number[]) => {
    const s = [...d].sort((a, b) => a - b);
    if (s[0] === s[2]) return { points: 100, result: "🔥 TRIPLE" };
    if (s[0] + 1 === s[1] && s[1] + 1 === s[2]) return { points: 70, result: "⚡ ESCALERA" };
    if (s[0] === s[1] || s[1] === s[2]) return { points: 40, result: "👥 PAREJA" };
    return { points: d[0] + d[1] + d[2], result: "➕ NORMAL" };
  };

  const rollDice = () => {
    if (gameOver || !roomId) return;

    Vibration.vibrate(150);

    Animated.sequence([
      Animated.timing(rollAnim, { toValue: 3, duration: 280, useNativeDriver: true }),
      Animated.timing(rollAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start();

    const newDice = [
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
    ];

    const calc = calculate(newDice);

    const payload = {
      action: "roll",
      player,
      roomId,
      dice: newDice,
      points: calc.points,
      result: calc.result,
    };

    const ws = getWS();
    ws?.send(JSON.stringify(payload));
  };

  const getWinner = () => {
    let winner = "";
    let max = -1;
    Object.keys(scores).forEach((p) => {
      if (scores[p] > max) {
        max = scores[p];
        winner = p;
      }
    });
    return winner;
  };

  const renderDots = (num: number) => {
    const dot = <View style={styles.dot} />;
    const layouts: any = {
      1: [[null, null, null], [null, dot, null], [null, null, null]],
      2: [[dot, null, null], [null, null, null], [null, null, dot]],
      3: [[dot, null, null], [null, dot, null], [null, null, dot]],
      4: [[dot, null, dot], [null, null, null], [dot, null, dot]],
      5: [[dot, null, dot], [null, dot, null], [dot, null, dot]],
      6: [[dot, null, dot], [dot, null, dot], [dot, null, dot]],
    };

    return layouts[num].map((row: any, i: number) => (
      <View key={i} style={styles.row}>
        {row.map((cell: any, j: number) => (
          <View key={j} style={styles.cell}>{cell}</View>
        ))}
      </View>
    ));
  };

  // ====================== PANTALLA DE FIN DE JUEGO ======================
  if (gameOver) {
    const winner = getWinner();

    return (
      <View style={styles.container}>
        <Text style={styles.win}>🏆 GANADOR 🏆</Text>
        <Text style={styles.playerWin}>{winner}</Text>
        <Text style={styles.scoreWin}>{scores[winner] || 0} pts</Text>

        {/* Confeti con Efecto de EXPLOSIÓN */}
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          {confettiAnims.map((anim, index) => (
            <Animated.Text
              key={index}
              style={{
                position: 'absolute',
                left: width / 2 - 15,
                top: height / 2 - 120,
                fontSize: 28 + (index % 6) * 4,
                opacity: anim.opacity,
                transform: [
                  { translateX: anim.translateX },
                  { translateY: anim.translateY },
                  { 
                    rotate: anim.rotate.interpolate({
                      inputRange: [-840, 840],
                      outputRange: ['-840deg', '840deg'],
                    }) 
                  },
                  { scale: anim.scale },
                ],
              }}
            >
              {confettiEmojis[index % confettiEmojis.length]}
            </Animated.Text>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.rollButton, { backgroundColor: "#e74c3c", marginTop: 140 }]}
          onPress={() => {
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          }}
        >
          <Text style={styles.rollText}>SALIR DEL JUEGO</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ====================== PANTALLA NORMAL DEL JUEGO ======================
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎲 Dado Triple Online</Text>
      <Text style={styles.room}>Sala: {roomId}</Text>
      <Text style={styles.round}>Ronda {round}/{MAX_ROUNDS}</Text>

      <Text style={styles.players}>
        {players.length} Jugadores: {players.join(" • ")}
      </Text>

      <Animated.View
        style={[
          styles.diceContainer,
          {
            transform: [
              { scale: scaleAnim },
              { rotate: rollAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) },
            ],
          },
        ]}
      >
        {dice.map((d, i) => (
          <View key={i} style={styles.dice}>
            {renderDots(d)}
          </View>
        ))}
      </Animated.View>

      <TouchableOpacity style={styles.rollButton} onPress={rollDice}>
        <Text style={styles.rollText}>LANZAR DADOS 🎲</Text>
      </TouchableOpacity>

      <View style={styles.scoreBox}>
        {Object.keys(scores).map((p, i) => (
          <Text key={i} style={styles.score}>
            {p}: {scores[p]} pts
          </Text>
        ))}
      </View>

      <ScrollView style={styles.history}>
        {history.map((item, i) => (
          <Text key={i} style={styles.historyText}>
            {item.player}: {item.dice.join("-")} {item.result} (+{item.points})
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f1e",
    padding: 20,
  },

  title: {
    color: "#ffd700",
    fontSize: 26,
    textAlign: "center",
    fontWeight: "bold",
    marginTop: 30,
  },

  room: {
    color: "#00d4ff",
    textAlign: "center",
    marginTop: 10,
  },

  round: {
    color: "#fff",
    textAlign: "center",
    marginTop: 8,
    fontSize: 18,
  },

  players: {
    color: "#fff",
    textAlign: "center",
    marginTop: 10,
  },

  diceContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 35,
  },

  dice: {
    width: 80,
    height: 80,
    backgroundColor: "#fff",
    borderRadius: 15,
    marginHorizontal: 10,
    justifyContent: "space-between",
    padding: 8,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  cell: {
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#000",
  },

  rollButton: {
    backgroundColor: "#6c5ce7",
    padding: 18,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 30,
  },

  rollText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  scoreBox: {
    marginTop: 25,
  },

  score: {
    color: "#00ffcc",
    fontSize: 17,
    marginVertical: 3,
  },

  history: {
    marginTop: 20,
    backgroundColor: "#1c1c2e",
    borderRadius: 15,
    padding: 15,
    flex: 1,
  },

  historyText: {
    color: "#ddd",
    marginBottom: 8,
  },

  win: {
    fontSize: 32,
    color: "#ffd700",
    textAlign: "center",
    marginTop: 120,
    fontWeight: "bold",
  },

  playerWin: {
    fontSize: 35,
    color: "#fff",
    textAlign: "center",
    marginTop: 20,
  },

  scoreWin: {
    fontSize: 24,
    color: "#00ffcc",
    textAlign: "center",
    marginTop: 10,
  },
});
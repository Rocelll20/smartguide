import { useEffect, useRef, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Speech from "expo-speech";
import * as Haptics from "expo-haptics";

const API_BASE_URL = "https://smartguide-sj1d.onrender.com";
const DEMO_USER_ID = "11111111-1111-1111-1111-111111111111";

export default function App() {
  const [isGuiding, setIsGuiding] = useState(false);
  const [latestObstacle, setLatestObstacle] = useState(null);
  const [latestFall, setLatestFall] = useState(null);
  const [statusMessage, setStatusMessage] = useState("Guide is stopped.");
  const [lastAlertId, setLastAlertId] = useState(null);
  const intervalRef = useRef(null);

  const speakAndVibrate = async (message, severity) => {
    try {
      if (severity === "danger") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else if (severity === "warning") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Speech.stop();
      Speech.speak(message, {
        language: "en-US",
        rate: 0.9,
        pitch: 1.0,
      });
    } catch (error) {
      console.log("Alert error:", error);
    }
  };

  const fetchLatestAlert = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/alerts/latest?blind_user_id=${DEMO_USER_ID}`
      );

      const data = await response.json();

      if (data.latest_obstacle) {
        setLatestObstacle(data.latest_obstacle);

        const obstacle = data.latest_obstacle;

        if (obstacle.id !== lastAlertId) {
          setLastAlertId(obstacle.id);

          const distance = Number(obstacle.distance_cm).toFixed(0);
          let spokenMessage = "Obstacle detected ahead.";

          if (obstacle.severity === "danger") {
            spokenMessage = `Danger. Obstacle very near. Distance ${distance} centimeters. Stop or move carefully.`;
          } else if (obstacle.severity === "warning") {
            spokenMessage = `Warning. Obstacle ahead. Distance ${distance} centimeters.`;
          } else {
            spokenMessage = `Caution. Obstacle detected. Distance ${distance} centimeters.`;
          }

          setStatusMessage(spokenMessage);
          await speakAndVibrate(spokenMessage, obstacle.severity);
        }
      }

      if (data.latest_fall) {
        setLatestFall(data.latest_fall);
      }
    } catch (error) {
      console.log("Fetch alert error:", error);
      setStatusMessage("Cannot connect to SmartGuide backend.");
    }
  };

  const startGuide = () => {
    setIsGuiding(true);
    setStatusMessage("Guide started. Listening for obstacle alerts.");
    Speech.speak("SmartGuide started. Listening for obstacle alerts.");
  };

  const stopGuide = () => {
    setIsGuiding(false);
    setStatusMessage("Guide stopped.");
    Speech.stop();
    Speech.speak("SmartGuide stopped.");
  };

  const simulateFall = async () => {
    try {
      setStatusMessage("Sending fall alert.");

      const response = await fetch(`${API_BASE_URL}/mobile/fall`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blind_user_id: DEMO_USER_ID,
          latitude: 8.485,
          longitude: 124.65,
          message: "Demo fall alert from SmartGuide mobile app.",
        }),
      });

      if (response.ok) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Speech.speak("Emergency fall alert sent.");
        Alert.alert("Fall Alert Sent", "The staff dashboard can now see this alert.");
        setStatusMessage("Fall alert sent successfully.");
      } else {
        setStatusMessage("Failed to send fall alert.");
      }
    } catch (error) {
      console.log("Fall alert error:", error);
      setStatusMessage("Cannot send fall alert. Check backend connection.");
    }
  };

  useEffect(() => {
    if (isGuiding) {
      fetchLatestAlert();

      intervalRef.current = setInterval(() => {
        fetchLatestAlert();
      }, 2000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isGuiding, lastAlertId]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>SmartGuide</Text>
        <Text style={styles.subtitle}>Blind User Mobile App</Text>

        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Current Status</Text>
          <Text style={styles.statusText}>{statusMessage}</Text>
        </View>

        <TouchableOpacity
          style={[styles.button, styles.startButton]}
          onPress={startGuide}
        >
          <Text style={styles.buttonText}>Start Guide</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.stopButton]}
          onPress={stopGuide}
        >
          <Text style={styles.buttonText}>Stop Guide</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.checkButton]}
          onPress={fetchLatestAlert}
        >
          <Text style={styles.buttonText}>Check Latest Alert</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.emergencyButton]}
          onPress={simulateFall}
        >
          <Text style={styles.buttonText}>Simulate Fall Alert</Text>
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Latest Obstacle Alert</Text>
          {latestObstacle ? (
            <>
              <Text style={styles.infoText}>
                Severity: {latestObstacle.severity}
              </Text>
              <Text style={styles.infoText}>
                Distance: {latestObstacle.distance_cm} cm
              </Text>
              <Text style={styles.infoText}>
                Message: {latestObstacle.message}
              </Text>
            </>
          ) : (
            <Text style={styles.infoText}>No obstacle alert yet.</Text>
          )}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Latest Fall Alert</Text>
          {latestFall ? (
            <>
              <Text style={styles.infoText}>Status: {latestFall.status}</Text>
              <Text style={styles.infoText}>
                Message: {latestFall.message}
              </Text>
            </>
          ) : (
            <Text style={styles.infoText}>No fall alert yet.</Text>
          )}
        </View>

        <Text style={styles.note}>
          Demo note: This app polls the backend every 2 seconds while guide mode is active.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101828",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 38,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginTop: 20,
  },
  subtitle: {
    fontSize: 18,
    color: "#D0D5DD",
    textAlign: "center",
    marginBottom: 24,
  },
  statusCard: {
    backgroundColor: "#1D2939",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  statusLabel: {
    fontSize: 16,
    color: "#98A2B3",
    marginBottom: 8,
  },
  statusText: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
  },
  button: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 14,
  },
  startButton: {
    backgroundColor: "#12B76A",
  },
  stopButton: {
    backgroundColor: "#667085",
  },
  checkButton: {
    backgroundColor: "#2E90FA",
  },
  emergencyButton: {
    backgroundColor: "#F04438",
  },
  buttonText: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  infoCard: {
    backgroundColor: "#1D2939",
    padding: 18,
    borderRadius: 16,
    marginTop: 12,
  },
  sectionTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  infoText: {
    color: "#D0D5DD",
    fontSize: 16,
    marginBottom: 6,
  },
  note: {
    color: "#98A2B3",
    fontSize: 14,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 40,
  },
});
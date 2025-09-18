import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  StatusBar,
  SafeAreaView,
  Dimensions 
} from "react-native";
import { BACKEND_URL } from "../config";

const { width, height } = Dimensions.get('window');

export default function LandingPage({ navigation }) {
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);

  const joinRoom = async () => {
    if (!username.trim() || !roomCode.trim()) {
      Alert.alert("Error", "Please enter both username and room code");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/check_room/${roomCode.trim()}`);
      if (res.status === 404) {
        Alert.alert("Error", "Room does not exist");
        setLoading(false);
        return;
      }
      navigation.navigate("ChatScreen", { 
        username: username.trim(), 
        roomCode: roomCode.trim() 
      });
    } catch (err) {
      Alert.alert("Connection Error", "Failed to connect to server. Please check your internet connection.");
      setLoading(false);
    }
  };

  const createRoom = async () => {
    if (!username.trim()) {
      Alert.alert("Error", "Please enter your username");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/create_room`, { method: "POST" });
      const data = await res.json();
      Alert.alert("Room Created", `Share this code with your team: ${data.code}`, [
        { 
          text: "OK", 
          onPress: () => navigation.navigate("ChatScreen", { 
            username: username.trim(), 
            roomCode: data.code 
          }) 
        }
      ]);
    } catch (err) {
      Alert.alert("Error", "Failed to create room. Please try again.");
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1d23" />
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.title}>RapidRelief</Text>
            <Text style={styles.subtitle}>Communication and drone tracking system</Text>
            <View style={styles.statusIndicator}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>System Online</Text>
            </View>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your call sign"
                placeholderTextColor="#64748b"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Room Code</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter mission code"
                placeholderTextColor="#64748b"
                value={roomCode}
                onChangeText={setRoomCode}
                autoCapitalize="characters"
                autoCorrect={false}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.joinButton]} 
                onPress={joinRoom}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Join Mission</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.button, styles.createButton]} 
                onPress={createRoom}
                disabled={loading}
              >
                <Text style={[styles.buttonText, styles.createButtonText]}>Create New Mission</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Secure • Encrypted • Real-time</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a1d23',
  },
  container: {
    flex: 1,
    backgroundColor: '#1a1d23',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24, // Add vertical padding
  },
  header: {
    alignItems: 'center',
    marginTop: height * 0.05, // Reduced from 0.1
    marginBottom: 20, // Add bottom margin
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
    marginRight: 8,
  },
  statusText: {
    color: '#22c55e',
    fontSize: 12,
    fontWeight: '500',
  },
  formContainer: {
    marginVertical: 20, // Add vertical margin
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 32,
    gap: 16,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinButton: {
    backgroundColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  createButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  createButtonText: {
    color: '#e2e8f0',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20, // Add top margin
    marginBottom: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
});
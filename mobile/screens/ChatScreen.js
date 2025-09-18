import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { WS_URL } from "../config";

export default function ChatScreen({ route, navigation }) {
  // Add safety check for route params
  const { username, roomCode } = route?.params || {};
  
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineMembers, setOnlineMembers] = useState(1);
  const flatListRef = useRef(null);

  // If no params, navigate back to landing
  useEffect(() => {
    if (!username || !roomCode) {
      Alert.alert("Error", "Missing user information", [
        { text: "OK", onPress: () => navigation.navigate("LandingPage") }
      ]);
      return;
    }
  }, [username, roomCode, navigation]);

  useEffect(() => {
    // Don't create WebSocket if we don't have required params
    if (!username || !roomCode) {
      return;
    }

    const ws = new WebSocket(`${WS_URL}/ws/${roomCode}/${username}`);
    
    ws.onopen = () => {
      console.log("✅ WebSocket connected");
      setIsConnected(true);
    };
    
    ws.onmessage = (event) => {
      if (event.data === "NO ROOM EXISTS") {
        Alert.alert("Mission Error", "Mission room does not exist", [
          { text: "OK", onPress: () => navigation.navigate("LandingPage") },
        ]);
        ws.close();
        return;
      }
      
      try {
        // Try to parse as JSON first (for system messages)
        const data = JSON.parse(event.data);
        if (data.type === 'members_update') {
          setOnlineMembers(data.count);
          return;
        }
      } catch {
        // Not JSON, treat as regular message
        const messageData = event.data;
        setMessages((prev) => [
          ...prev,
          { 
            id: Date.now().toString() + Math.random(), 
            text: messageData,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isOwn: messageData.includes(`${username}:`)
          },
        ]);
      }
    };
    
    ws.onerror = (e) => {
      console.log("❌ WebSocket error:", e.message);
      setIsConnected(false);
    };
    
    ws.onclose = () => {
      console.log("⚠️ WebSocket closed");
      setIsConnected(false);
    };
    
    setSocket(ws);

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [username, roomCode, navigation]);

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const sendMessage = () => {
    if (socket && message.trim() && isConnected) {
      socket.send(message.trim());
      setMessage("");
    }
  };

  const renderMessage = ({ item }) => {
    // Extract username and message content
    const parts = item.text.split(':');
    const messageUsername = parts[0];
    const messageContent = parts.slice(1).join(':').trim();
    
    return (
      <View style={[
        styles.messageContainer,
        item.isOwn ? styles.ownMessage : styles.otherMessage
      ]}>
        {!item.isOwn && (
          <Text style={styles.messageUsername}>{messageUsername}</Text>
        )}
        <Text style={[
          styles.messageText,
          item.isOwn ? styles.ownMessageText : styles.otherMessageText
        ]}>
          {messageContent}
        </Text>
        <Text style={[
          styles.messageTime,
          item.isOwn ? styles.ownMessageTime : styles.otherMessageTime
        ]}>
          {item.timestamp}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#1a1d23" 
        translucent={Platform.OS === 'android'}
      />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.teamName}>Team {roomCode || 'Unknown'}</Text>
              <View style={styles.statusRow}>
                <View style={styles.connectionStatus}>
                  <View style={[
                    styles.connectionDot,
                    { backgroundColor: isConnected ? '#22c55e' : '#ef4444' }
                  ]} />
                  <Text style={styles.statusText}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </Text>
                </View>
                <Text style={styles.membersText}>{onlineMembers} Members Online</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.droneButton}
              onPress={() => navigation.navigate("DroneTracking", { username, roomCode })}
            >
              <Text style={styles.droneButtonText}>Drone Tracking</Text>
            </TouchableOpacity>
          </View>
        </View>

        <KeyboardAvoidingView
          style={styles.chatContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          {/* Messages List */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          />

          {/* Message Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.messageInput}
                value={message}
                onChangeText={setMessage}
                placeholder="Type a message..."
                placeholderTextColor="#64748b"
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!message.trim() || !isConnected) && styles.sendButtonDisabled
                ]}
                onPress={sendMessage}
                disabled={!message.trim() || !isConnected}
              >
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a1d23',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#1a1d23',
  },
  header: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: Platform.OS === 'ios' ? 8 : 0, // Add margin for iOS
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#64748b',
  },
  membersText: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '500',
  },
  droneButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  droneButtonText: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#3b82f6',
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  messageUsername: {
    fontSize: 12,
    fontWeight: '600',
    color: '#22c55e',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#ffffff',
  },
  otherMessageText: {
    color: '#e2e8f0',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  ownMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#64748b',
  },
  inputContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  messageInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#ffffff',
    maxHeight: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sendButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
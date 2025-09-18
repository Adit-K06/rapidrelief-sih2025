import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  Platform
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

const BHUBANESWAR_COORDS = {
  lat: 20.2961,
  lng: 85.8245
};

const TARGET_COORDS = {
  lat: 20.3501,  
  lng: 85.8668
};

export default function DroneTrackingScreen({ route, navigation }) {
  const { username, roomCode } = route?.params || {};
  const [droneStatus, setDroneStatus] = useState('Approaching Target');
  const [batteryLevel, setBatteryLevel] = useState(87);
  const [altitude, setAltitude] = useState(120);
  const [speed, setSpeed] = useState(15);
  const [coordinates, setCoordinates] = useState({
    lat: 20.2961,
    lng: 85.8245
  });
  const [isRecording, setIsRecording] = useState(false);
  const [missionTime, setMissionTime] = useState(0);
  const [droneMessages, setDroneMessages] = useState(() => {
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return [
      { id: 1, time: currentTime, message: 'Drone deployed successfully', type: 'success' },
      { id: 2, time: currentTime, message: 'Approaching target coordinates', type: 'info' },
      { id: 3, time: currentTime, message: 'Target area reached. Initiating surveillance', type: 'success' },
    ];
  });

  useEffect(() => {
    let flightPhase = 'approach'; 
    let hoverTime = 0;
    
    const interval = setInterval(() => {
      setMissionTime(prev => prev + 1);
      
      setCoordinates(prev => {
        const newCoords = { ...prev };
        
        switch(flightPhase) {
          case 'approach':
            const latDiff = TARGET_COORDS.lat - prev.lat;
            const lngDiff = TARGET_COORDS.lng - prev.lng;
            
            newCoords.lat += (latDiff * 0.02) + (Math.random() - 0.5) * 0.0001;
            newCoords.lng += (lngDiff * 0.02) + (Math.random() - 0.5) * 0.0001;
            
            if (Math.abs(latDiff) < 0.001 && Math.abs(lngDiff) < 0.001) {
              flightPhase = 'hover';
              addDroneMessage('Target area reached. Starting surveillance.', 'success');
              setDroneStatus('Surveillance Mode');
            }
            break;
            
          case 'hover':
            const radius = 0.0005;
            const angle = (hoverTime * Math.PI) / 180;
            
            newCoords.lat = TARGET_COORDS.lat + radius * Math.cos(angle);
            newCoords.lng = TARGET_COORDS.lng + radius * Math.sin(angle);
            
            hoverTime += 2;
            
            if (hoverTime > 360) {
              flightPhase = 'return';
              addDroneMessage('Surveillance complete. Returning to base.', 'info');
              setDroneStatus('Returning to Base');
            }
            break;
            
          case 'return':
            const returnLatDiff = BHUBANESWAR_COORDS.lat - prev.lat;
            const returnLngDiff = BHUBANESWAR_COORDS.lng - prev.lng;
            
            newCoords.lat += (returnLatDiff * 0.02) + (Math.random() - 0.5) * 0.0001;
            newCoords.lng += (returnLngDiff * 0.02) + (Math.random() - 0.5) * 0.0001;
            break;
        }

        if (Math.random() > 0.8) {
          setBatteryLevel(prev => Math.max(20, prev - 0.5));
          setAltitude(prev => {
            const target = flightPhase === 'hover' ? 100 : 120;
            return prev + (target - prev) * 0.1 + (Math.random() - 0.5) * 5;
          });
          setSpeed(prev => {
            const target = flightPhase === 'hover' ? 5 : 15;
            return prev + (target - prev) * 0.1 + (Math.random() - 0.5) * 2;
          });
        }

        return newCoords;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const addDroneMessage = (message, type = 'info') => {
    const newMessage = {
      id: Date.now(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      message,
      type
    };
    setDroneMessages(prev => [...prev, newMessage]);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    addDroneMessage(
      isRecording ? 'Recording stopped' : 'Recording started',
      isRecording ? 'warning' : 'success'
    );
  };

  const returnToBase = () => {
    Alert.alert(
      "Return to Base",
      "Are you sure you want to recall the drone?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Confirm", 
          onPress: () => {
            setDroneStatus('Returning to Base');
            addDroneMessage('Drone recall initiated - returning to base', 'warning');
          }
        }
      ]
    );
  };

  const emergencyLanding = () => {
    Alert.alert(
      "Emergency Landing",
      "This will initiate immediate emergency landing. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "EMERGENCY LAND", 
          style: "destructive",
          onPress: () => {
            setDroneStatus('Emergency Landing');
            addDroneMessage('EMERGENCY LANDING INITIATED', 'error');
          }
        }
      ]
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
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Drone Control</Text>
          <View style={styles.missionTimer}>
            <Text style={styles.timerText}>{formatTime(missionTime)}</Text>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          
          {/* Status Cards */}
          <View style={styles.statusGrid}>
            <View style={styles.statusCard}>
              <Text style={styles.statusLabel}>Status</Text>
              <Text style={styles.statusValue}>{droneStatus}</Text>
              <View style={[styles.statusIndicator, 
                droneStatus.includes('Emergency') ? styles.errorIndicator :
                droneStatus.includes('Returning') ? styles.warningIndicator : 
                styles.successIndicator
              ]} />
            </View>
            
            <View style={styles.statusCard}>
              <Text style={styles.statusLabel}>Battery</Text>
              <Text style={styles.statusValue}>{batteryLevel.toFixed(0)}%</Text>
              <View style={[styles.batteryBar, { width: `${batteryLevel}%` }]} />
            </View>
          </View>

          <View style={styles.statusGrid}>
            <View style={styles.statusCard}>
              <Text style={styles.statusLabel}>Altitude</Text>
              <Text style={styles.statusValue}>{altitude.toFixed(0)}m</Text>
            </View>
            
            <View style={styles.statusCard}>
              <Text style={styles.statusLabel}>Speed</Text>
              <Text style={styles.statusValue}>{speed.toFixed(1)} m/s</Text>
            </View>
          </View>

          {/* Map Placeholder */}
          <View style={styles.mapContainer}>
            <Text style={styles.mapTitle}>Live Location</Text>
            <View style={styles.mapWrapper}>
              <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={{
                  latitude: 20.2961,
                  longitude: 85.8245,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
                region={{
                  latitude: coordinates.lat,
                  longitude: coordinates.lng,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: coordinates.lat,
                    longitude: coordinates.lng
                  }}
                  title="Drone Location"
                  description={`Alt: ${altitude.toFixed(0)}m • Speed: ${speed.toFixed(1)}m/s`}
                />
              </MapView>
            </View>
            <View style={styles.locationBox}>
              <View style={styles.coordinatesContainer}>
                <Text style={styles.coordinateLabel}>Latitude</Text>
                <Text style={styles.coordinateValue}>
                  {coordinates.lat.toFixed(4)}°N
                </Text>
              </View>
              <View style={styles.coordinatesContainer}>
                <Text style={styles.coordinateLabel}>Longitude</Text>
                <Text style={styles.coordinateValue}>
                  {coordinates.lng.toFixed(4)}°E
                </Text>
              </View>
            </View>
          </View>

          {/* Control Buttons */}
          <View style={styles.controlsContainer}>
            <TouchableOpacity 
              style={[styles.controlButton, styles.recordButton, isRecording && styles.recordingActive]}
              onPress={toggleRecording}
            >
              <Text style={styles.controlButtonText}>
                {isRecording ? '⏹ Stop Recording' : '⏺ Start Recording'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.controlButton, styles.returnButton]}
              onPress={returnToBase}
            >
              <Text style={styles.controlButtonText}>🏠 Return to Base</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.controlButton, styles.emergencyButton]}
              onPress={emergencyLanding}
            >
              <Text style={styles.controlButtonText}>🚨 Emergency Land</Text>
            </TouchableOpacity>
          </View>

          {/* Activity Log */}
          <View style={styles.logContainer}>
            <Text style={styles.logTitle}>Activity Log</Text>
            {droneMessages.map((msg) => (
              <View key={msg.id} style={styles.logItem}>
                <Text style={styles.logTime}>{msg.time}</Text>
                <Text style={[
                  styles.logMessage,
                  msg.type === 'success' && styles.successText,
                  msg.type === 'warning' && styles.warningText,
                  msg.type === 'error' && styles.errorText,
                ]}>{msg.message}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
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
    paddingTop: Platform.OS === 'ios' ? 8 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: Platform.OS === 'android' ? 8 : 0, 
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  missionTimer: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  timerText: {
    color: '#22c55e',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  statusGrid: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 8,
  },
  statusCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  statusLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statusValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  successIndicator: {
    backgroundColor: '#22c55e',
  },
  warningIndicator: {
    backgroundColor: '#f59e0b',
  },
  errorIndicator: {
    backgroundColor: '#ef4444',
  },
  batteryBar: {
    height: 4,
    backgroundColor: '#22c55e',
    borderRadius: 2,
    marginTop: 8,
  },
  mapContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  mapTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  mapWrapper: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  locationBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  coordinatesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  coordinateLabel: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  coordinateValue: {
    color: '#22c55e',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  controlsContainer: {
    gap: 12,
    marginVertical: 16,
  },
  controlButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  recordButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: '#3b82f6',
  },
  recordingActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: '#ef4444',
  },
  returnButton: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: '#f59e0b',
  },
  emergencyButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: '#ef4444',
  },
  controlButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  logContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  logTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  logItem: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  logTime: {
    color: '#64748b',
    fontSize: 12,
    width: 60,
    marginRight: 12,
  },
  logMessage: { 
    color: '#e2e8f0',
    fontSize: 14,
    flex: 1,
  },
  successText: {
    color: '#22c55e',
  },
  warningText: {
    color: '#f59e0b',
  },
  errorText: {
    color: '#ef4444',
  },
});
# RapidRelief Drone Tracking System

## Overview
RapidRelief is a real-time drone tracking and control system designed for disaster response scenarios. The application provides a comprehensive interface for monitoring and controlling drones deployed in disaster-affected areas, with a specific focus on operations in Odisha, India.

## Features

### 1. Real-Time Tracking
- Live GPS tracking with precise latitude and longitude
- Interactive map interface powered by Google Maps
- Dynamic route visualization
- Automatic mission phase transitions (Approach → Hover → Return)

### 2. Telemetry Monitoring
- Battery level monitoring with visual indicators
- Altitude tracking in meters
- Real-time speed monitoring in m/s
- Mission timer with elapsed time display

### 3. Flight Control
- **Recording Control**: Start/Stop mission recording
- **Return to Base**: Automated return function with confirmation
- **Emergency Landing**: Quick access emergency protocols
- **Mission Status**: Real-time status updates with color-coded indicators

### 4. Activity Logging
- Chronological mission events log
- Color-coded message types:
  - 🟢 Success (Green)
  - 🟡 Warning (Yellow)
  - 🔴 Error (Red)
- Timestamp for each event

## Technical Stack

### Frontend
- React Native
- react-native-maps with Google Maps integration
- React Navigation for screen management
- Custom UI components with dark theme

### Maps Integration
- Google Maps API
- Real-time coordinate updates
- Custom markers for drone position
- Dynamic region focusing

## Installation

1. **Prerequisites**
```bash
# Install Node.js (v16 or higher)
# Install Expo CLI
npm install -g expo-cli
```

2. **Project Setup**
```bash
# Clone the repository
git clone https://github.com/your-repo/RapidRelief.git

# Navigate to project directory
cd RapidRelief/mobile

# Install dependencies
npm install
```

3. **Environment Setup**
- Create a `.env` file in the project root
- Add your Google Maps API key:
```
GOOGLE_MAPS_API_KEY=your_api_key_here
```

4. **Running the App**
```bash
# Start the Expo development server
npx expo start
```

## Usage Guide

### Mission Control
1. Launch the application
2. View real-time drone position on the map
3. Monitor telemetry data:
   - Battery status
   - Altitude
   - Speed
   - Mission duration

### Emergency Procedures
1. **Return to Base**
   - Press "Return to Base" button
   - Confirm action in dialog
   - Monitor return trajectory

2. **Emergency Landing**
   - Press "Emergency Land" button
   - Confirm emergency action
   - Monitor descent

## Performance Considerations
- Optimized for 60fps performance
- Efficient re-rendering with React hooks
- Minimal battery impact for extended operations

## Security Features
- Confirmation dialogs for critical actions
- Secure API communication
- Protected drone control commands

## Known Limitations
- Requires stable internet connection
- Google Maps dependency for mapping
- Battery consumption during extended tracking

## Future Enhancements
- [ ] Multi-drone tracking support
- [ ] Weather integration
- [ ] Mission recording playback
- [ ] Offline mode capabilities
- [ ] Advanced analytics dashboard

## Acknowledgments
- Google Maps Platform
- React Native Community
- Expo Development Team

## Video of the application:
https://github.com/user-attachments/assets/a208a611-e50f-4ede-8629-bc9b97256743

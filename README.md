# SmartGuide

## Project Description

SmartGuide is a prototype IoT-assisted guide stick system designed to help blind users detect nearby obstacles and notify staff through a web-based monitoring dashboard.

The system uses an ESP32 microcontroller connected to an ultrasonic sensor to detect obstacles in front of the guide stick. When an obstacle is detected within the defined distance range, the ESP32 sends the distance data to a FastAPI backend deployed on Render. The backend stores the event in a Supabase PostgreSQL database. A React staff dashboard deployed on Vercel displays blind user information, obstacle alerts, fall alerts, and last known location. A React Native Expo mobile app provides audio and vibration feedback for the blind user.

This project was developed as a final PIT project for IT323 - Application Development and Emerging Technologies at USTP-CDO, Misamis Oriental, Philippines.

SmartGuide is not intended to be a production-ready assistive device. It is a functional academic prototype that demonstrates application development, backend integration, database usage, web deployment, mobile app development, and IoT integration.

---

## Features

### IoT Guide Stick

- ESP32-based IoT device
- Ultrasonic sensor for obstacle distance detection
- Sends obstacle distance data to the backend
- Uses WiFi/mobile hotspot for internet connection
- Classifies obstacle distance into severity levels:
  - Danger: 50 cm and below
  - Warning: 51 cm to 100 cm
  - Caution: 101 cm to 150 cm
  - Safe: above 150 cm

### Blind User Mobile App

- Simple interface for blind users
- Start Guide button
- Stop Guide button
- Check Latest Alert button
- Audio warning using text-to-speech
- Phone vibration/haptic feedback
- Simulated fall alert button for prototype demonstration

### Staff Web Dashboard

- Dummy staff login
- Dashboard summary cards
- Total blind users count
- Active users count
- Recent obstacle alerts
- Fall alerts
- Blind user details
- Last known location section
- Google Maps embedded view/link
- Auto-refreshes dashboard data

### Backend and Database

- FastAPI backend API
- Supabase PostgreSQL database
- Stores blind user records
- Stores obstacle events
- Stores fall events
- Stores location updates
- Provides dashboard data to the web application
- Receives IoT obstacle events from ESP32

---

## Technology Stack

### Hardware / IoT

- ESP32 Development Board
- Ultrasonic Sensor
- Mini Breadboard
- Jumper Wires
- Powerbank
- Guide Stick

### Staff Web Application

- React.js
- Vite
- CSS
- Vercel

### Mobile Application

- React Native
- Expo
- Expo Speech
- Expo Haptics

### Backend

- Python
- FastAPI
- Render

### Database

- Supabase PostgreSQL

### Development Tools

- Visual Studio Code
- Arduino IDE
- GitHub
- Git
- Draw.io for diagrams

---

## System Architecture

SmartGuide follows a simple IoT-to-cloud architecture.

```text
ESP32 + Ultrasonic Sensor
        ↓
FastAPI Backend on Render
        ↓
Supabase PostgreSQL Database
        ↓
React Staff Dashboard on Vercel
```

Mobile app flow:

```text
React Native Mobile App
        ↓
FastAPI Backend on Render
        ↓
Supabase PostgreSQL Database
        ↓
Staff Dashboard
```

The ESP32 detects obstacles using the ultrasonic sensor. If an obstacle is near, the ESP32 sends the distance value to the FastAPI backend. The backend stores the event in Supabase. The staff dashboard fetches the latest data from the backend and displays it to staff users.

The mobile app checks the backend for the latest obstacle alert. When a new alert is detected, the mobile app gives audio feedback and haptic/vibration feedback to the blind user.

---

## System Architecture Diagram

PUT SYSTEM ARCHITECTURE DIAGRAM HERE.

Recommended diagram contents:

```text
ESP32 + Ultrasonic Sensor
Mobile App - React Native Expo
FastAPI Backend - Render
Supabase PostgreSQL Database
Staff Web Dashboard - React/Vercel
```

Recommended arrows:

```text
ESP32 → FastAPI Backend: obstacle distance alert
Mobile App → FastAPI Backend: fall alert / location update
FastAPI Backend → Supabase: save users, alerts, and locations
Staff Dashboard → FastAPI Backend: fetch dashboard data
FastAPI Backend → Staff Dashboard: return users, alerts, and locations
```

---

## Obstacle Detection Flowchart

PUT OBSTACLE DETECTION FLOWCHART HERE.

Recommended flow:

```text
Start
↓
ESP32 reads ultrasonic distance
↓
Obstacle within 150 cm?
↓ Yes
Classify severity
↓
Send POST request to FastAPI backend
↓
Backend saves event to Supabase
↓
Mobile app gives audio/vibration alert
↓
Staff dashboard displays alert
↓
End
```

If no obstacle is detected, the ESP32 continues reading the distance.

---

## Fall Alert Flowchart

PUT FALL ALERT FLOWCHART HERE.

Recommended flow:

```text
Start
↓
Blind user opens mobile app
↓
User taps Simulate Fall Alert
↓
Mobile app sends fall alert to backend
↓
Backend saves fall event to Supabase
↓
Staff dashboard displays emergency alert
↓
End
```

Note: In this prototype, fall detection is simulated through a button in the mobile app. Real automatic fall detection using phone motion sensors can be added in a future version.

---

## Installation & Setup

### Backend Setup

1. Go to the backend folder.

```bash
cd backend
```

2. Create a virtual environment.

```bash
python -m venv .venv
```

3. Activate the virtual environment on Windows PowerShell.

```bash
.venv\Scripts\Activate.ps1
```

4. Install dependencies.

```bash
pip install -r requirements.txt
```

5. Create a `.env` file inside the `backend` folder.

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_or_secret_key
```

6. Run the backend locally.

```bash
uvicorn main:app --reload
```

7. Open the local API documentation.

```text
http://127.0.0.1:8000/docs
```

---

### Staff Dashboard Setup

1. Go to the staff web app folder.

```bash
cd web-staff
```

2. Install dependencies.

```bash
npm install
```

3. Run the development server.

```bash
npm run dev
```

4. Open the local Vite URL shown in the terminal.

---

### Mobile App Setup

1. Go to the mobile app folder.

```bash
cd mobile-blind
```

2. Install dependencies.

```bash
npm install
```

3. Start Expo.

```bash
npx expo start
```

4. Open the app using Expo Go or install the APK if available.

---

### ESP32 Firmware Setup

1. Open Arduino IDE.
2. Install ESP32 board support.
3. Open the SmartGuide ESP32 firmware file.
4. Replace the WiFi SSID and password with the demo hotspot details.
5. Make sure the backend URL points to the deployed Render backend.

```cpp
const char* WIFI_SSID = "PUT_YOUR_WIFI_NAME_HERE";
const char* WIFI_PASSWORD = "PUT_YOUR_WIFI_PASSWORD_HERE";

const char* BACKEND_URL = "https://smartguide-sj1d.onrender.com/iot/obstacle";
```

6. Upload the firmware to the ESP32.
7. Open Serial Monitor at `115200` baud rate.
8. Confirm that the ESP32 connects to WiFi and receives backend response code `200`.

---

## Deployment Links

### Staff Dashboard

```text
https://smartguide-staff.vercel.app/
```

### Backend API

```text
https://smartguide-sj1d.onrender.com
```

### Backend API Documentation

```text
https://smartguide-sj1d.onrender.com/docs
```

### Mobile APK

PUT APK DOWNLOAD LINK HERE IF AVAILABLE.

If APK is not available, write:

```text
The mobile app prototype can be tested using Expo Go.
```

---

## Test Account

```text
Email: admin@smartguide.local
Password: admin123
```

---

## Team Members and Roles

- KHEANNE S. MIGUEL - Project Member / Documentation / Presenter
- CLAIRE D. CABASAG - Project Member / Frontend / UI Support
- ROCEL MAE SAGUING - Project Member / Mobile App / Testing Support
- RYN RAGURO - Project Member / IoT Hardware / Backend Testing Support

Note: Roles may be adjusted based on the actual contribution of each member.

---

## Known Limitations

- SmartGuide is a prototype and not a production-ready assistive device.
- The ESP32 does not have a GPS module.
- Location tracking is not automatic live GPS tracking in the current prototype.
- The dashboard currently displays the last stored location from the database.
- The mobile app currently uses a simulated fall alert button.
- Real automatic fall detection using phone motion sensors is not yet implemented.
- The mobile app uses polling instead of real-time WebSocket communication.
- The dummy login is frontend-only and is not secure for production use.
- The IoT hardware is attached temporarily for demonstration purposes.
- The ultrasonic sensor may be affected by object angle, surface type, and distance.
- The ESP32 requires internet connection through WiFi or phone hotspot.
- Render free hosting may take time to wake up on the first request.
- The prototype requires stable internet connection for ESP32, backend, database, dashboard, and mobile app integration.

---

## Screenshots

PUT SCREENSHOTS HERE.

Recommended screenshots:

1. Staff login page
2. Staff dashboard summary cards
3. Blind users table
4. Recent obstacle alerts table
5. Fall alerts table
6. Last known location/map panel
7. Mobile app home screen
8. Mobile app obstacle alert screen
9. Mobile app fall alert confirmation
10. FastAPI `/docs` page
11. Supabase `obstacle_events` table
12. Supabase `fall_events` table
13. ESP32 Serial Monitor showing distance and backend response code `200`
14. Actual SmartGuide stick hardware setup

---

## Demonstration Guide

During the demonstration, the presenter should show the following:

1. Open the deployed staff dashboard.
2. Login using the test account.
3. Show the dashboard cards, blind users table, obstacle alerts, fall alerts, and location section.
4. Turn on the phone hotspot.
5. Power the ESP32 using the powerbank.
6. Place an object or hand in front of the ultrasonic sensor.
7. Show that the ESP32 sends the obstacle data.
8. Show the new obstacle event in the dashboard and/or Supabase.
9. Open the mobile app and tap Start Guide.
10. Trigger another obstacle event.
11. Show audio and vibration feedback from the mobile app.
12. Tap Simulate Fall Alert.
13. Show the fall alert in the staff dashboard.

---

## Proof of Integration

SmartGuide proves IoT integration through the following flow:

```text
Ultrasonic Sensor detects obstacle
↓
ESP32 reads distance
↓
ESP32 sends HTTP POST request to FastAPI backend
↓
FastAPI backend stores event in Supabase PostgreSQL
↓
Staff dashboard fetches and displays the new event
↓
Mobile app checks backend and gives audio/vibration feedback
```

The integration can be verified using:

- ESP32 Serial Monitor showing distance readings
- ESP32 Serial Monitor showing backend response code `200`
- Supabase `obstacle_events` table showing new records
- Staff dashboard showing updated obstacle alerts
- Mobile app giving audio and vibration feedback

---

## Project Status

SmartGuide is functional for prototype demonstration.

Completed:

- ESP32 ultrasonic obstacle detection
- Backend API deployment
- Supabase database integration
- Staff dashboard deployment
- Mobile app prototype
- Simulated fall alert
- Basic location display
- GitHub repository
- README documentation

Future Improvements:

- Real automatic fall detection using phone accelerometer and gyroscope
- Real-time GPS tracking from the mobile phone
- User authentication with secure backend sessions
- WebSocket-based real-time dashboard updates
- Better hardware casing
- More accurate obstacle detection using additional sensors
- Offline or low-connectivity fallback system
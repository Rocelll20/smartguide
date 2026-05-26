#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>

#define TRIG_PIN 5
#define ECHO_PIN 18

// FINAL DEMO WIFI SETTINGS
// Put your phone hotspot name and password here before uploading.
// Do not push your real password to GitHub.
const char* WIFI_SSID = "smartguide";
const char* WIFI_PASSWORD = "123456789";

// Render backend URL
const char* BACKEND_URL = "https://smartguide-sj1d.onrender.com/iot/obstacle";

String DEVICE_CODE = "SG-STICK-001";

long duration;
float distanceCm;

unsigned long lastSendTime = 0;
const unsigned long sendCooldown = 3000; // Send at most once every 3 seconds

float readDistanceCm() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);

  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  duration = pulseIn(ECHO_PIN, HIGH, 30000);

  if (duration == 0) {
    return -1;
  }

  return duration * 0.0343 / 2;
}

String getSeverity(float distance) {
  if (distance <= 50) {
    return "danger";
  } else if (distance <= 100) {
    return "warning";
  } else if (distance <= 150) {
    return "caution";
  } else {
    return "safe";
  }
}

void sendObstacleEvent(float distance) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected. Cannot send event.");
    return;
  }

  WiFiClientSecure client;
  client.setInsecure(); // Demo mode for HTTPS Render connection

  HTTPClient http;
  http.begin(client, BACKEND_URL);
  http.addHeader("Content-Type", "application/json");

  String jsonBody = "{";
  jsonBody += "\"device_code\":\"" + DEVICE_CODE + "\",";
  jsonBody += "\"distance_cm\":" + String(distance, 2);
  jsonBody += "}";

  Serial.print("Sending to backend: ");
  Serial.println(jsonBody);

  int httpResponseCode = http.POST(jsonBody);

  Serial.print("Backend response code: ");
  Serial.println(httpResponseCode);

  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.print("Backend response: ");
    Serial.println(response);
  } else {
    Serial.print("Error sending POST: ");
    Serial.println(http.errorToString(httpResponseCode));
  }

  http.end();
}

void setup() {
  Serial.begin(115200);

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  Serial.println("SmartGuide ESP32 IoT Final Demo");
  Serial.println("Connecting to phone hotspot...");

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("WiFi connected!");
  Serial.print("ESP32 IP address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  distanceCm = readDistanceCm();

  if (distanceCm == -1) {
    Serial.println("No echo detected.");
  } else {
    String severity = getSeverity(distanceCm);

    Serial.print("Distance: ");
    Serial.print(distanceCm);
    Serial.print(" cm | Severity: ");
    Serial.println(severity);

    if (distanceCm <= 150) {
      unsigned long currentTime = millis();

      if (currentTime - lastSendTime >= sendCooldown) {
        sendObstacleEvent(distanceCm);
        lastSendTime = currentTime;
      } else {
        Serial.println("Cooldown active. Not sending yet.");
      }
    } else {
      Serial.println("Safe distance. Not sending to backend.");
    }
  }

  Serial.println("----------------------");
  delay(500);
}
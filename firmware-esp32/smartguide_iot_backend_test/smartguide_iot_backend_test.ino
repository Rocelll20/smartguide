#include <WiFi.h>
#include <HTTPClient.h>

#define TRIG_PIN 5
#define ECHO_PIN 18

// Put your Converge 2.4GHz WiFi name and password here.
// Do not send your password in chat.
const char* WIFI_SSID = "Converge_2CHV";
const char* WIFI_PASSWORD = "743625UY";

// Your laptop IP from ipconfig:
String BACKEND_URL = "https://smartguide-sj1d.onrender.com/iot/obstacle";

String DEVICE_CODE = "SG-STICK-001";

long duration;
float distanceCm;

unsigned long lastSendTime = 0;
const unsigned long sendCooldown = 3000; // send at most once every 3 seconds

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

  HTTPClient http;
  http.begin(BACKEND_URL);
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

  Serial.println("SmartGuide ESP32 IoT Backend Test");

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.print("Connecting to WiFi");

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
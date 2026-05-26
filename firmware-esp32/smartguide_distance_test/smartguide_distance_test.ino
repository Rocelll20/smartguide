#define TRIG_PIN 5
#define ECHO_PIN 18

long duration;
float distanceCm;

void setup() {
  Serial.begin(115200);

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  Serial.println("SmartGuide Ultrasonic Sensor Test");
  Serial.println("Reading distance...");
}

void loop() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);

  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  duration = pulseIn(ECHO_PIN, HIGH, 30000);

  if (duration == 0) {
    Serial.println("No echo detected. Check wiring or object distance.");
  } else {
    distanceCm = duration * 0.0343 / 2;

    Serial.print("Distance: ");
    Serial.print(distanceCm);
    Serial.println(" cm");

    if (distanceCm <= 50) {
      Serial.println("DANGER: Obstacle very near!");
    } else if (distanceCm <= 100) {
      Serial.println("WARNING: Obstacle ahead!");
    } else if (distanceCm <= 150) {
      Serial.println("CAUTION: Obstacle detected.");
    } else {
      Serial.println("SAFE: No nearby obstacle.");
    }
  }

  Serial.println("----------------------");
  delay(500);
}
#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <time.h>
#include "secrets.h"

#define TIME_ZONE -3

#define umidadeMax 305
#define umidadeMin 615
#define sensor A0
#define bomba D0

//String resultado;
float resultado = 0;
boolean irrigado = false;
unsigned long lastMillis = 0;
unsigned long previousMillis = 0;
const long interval = 5000;

#define AWS_IOT_PUBLISH_TOPIC  "nodemcu/pub"
#define AWS_IOT_SUBSCRIBE_TOPIC "nodemcu/sub"

WiFiClientSecure net;

BearSSL::X509List cert(cacert);
BearSSL::X509List client_crt(client_cert);
BearSSL::PrivateKey key(privkey);

PubSubClient client(net);

time_t now;
time_t nowish = 1510592825;

void NTPConnect(void)
{
  Serial.print("Setting time using SNTP");
  configTime(TIME_ZONE * 3600, 0 * 3600, "pool.ntp.org", "time.nist.gov");
  now = time(nullptr);
  while (now < nowish)
  {
    delay(500);
    Serial.print(".");
    now = time(nullptr);
  }
  Serial.println("done!");
  struct tm timeinfo;
  gmtime_r(&now, &timeinfo);
  Serial.print("Current time: ");
  Serial.print(asctime(&timeinfo));
}

void messageReceived(char *topic, byte *payload, unsigned int length)
{
  Serial.print("Received [");
  Serial.print(topic);
  Serial.print("]: ");
  for (int i = 0; i < length; i++)
  {
    Serial.print((char)payload[i]);
  }
  Serial.println();
}

void connectAWS()
{
  delay(3000);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
 
  Serial.println(String("Attempting to connect to SSID: ") + String(WIFI_SSID));
 
  while (WiFi.status() != WL_CONNECTED)
  {
    Serial.print(".");
    delay(1000);
  }
 
  NTPConnect();
 
  net.setTrustAnchors(&cert);
  net.setClientRSACert(&client_crt, &key);
 
  client.setServer(MQTT_HOST, 8883);
  client.setCallback(messageReceived);
 
 
  Serial.println("Connecting to AWS IOT");
 
  while (!client.connect(THINGNAME))
  {
    Serial.print(".");
    delay(1000);
  }
 
  if (!client.connected()) {
    Serial.println("AWS IoT Timeout!");
    return;
  }
  // Subscribe to a topic
  client.subscribe(AWS_IOT_SUBSCRIBE_TOPIC);
 
  Serial.println("AWS IoT Connected!");
}

void publishMessage()
{
  StaticJsonDocument<200> doc;
  //doc["tempo"] = millis();
  doc["umidade"] = resultado;
  doc["irrigar"] = irrigado;
  char jsonBuffer[512];
  serializeJson(doc, jsonBuffer); // print to client
 
  client.publish(AWS_IOT_PUBLISH_TOPIC, jsonBuffer);
}

void setup()
{
  pinMode(bomba, OUTPUT);
  Serial.begin(115200);
  connectAWS();
}

void loop()
{
  //resultado = lerSensor();
  resultado = leituraSensor();
  irrigado = irrigar(resultado);
  Serial.println("Valores do sensor: " + String(resultado) + "|" + String(irrigado));
 
  now = time(nullptr);
 
  if (!client.connected())
  {
    connectAWS();
  }
  else
  {
    client.loop();
    if (millis() - lastMillis > 5000)
    {
      lastMillis = millis();
      publishMessage();
    }
  }
}

float leituraSensor() {
  delay(5000);
  return float(analogRead(sensor));
}

String lerSensor() {
  float result;
  float valor = float(analogRead(sensor));  // Read the analog value form sensor
  delay(1000);
  if(valor > umidadeMax && valor < umidadeMin) {
    result = (valor - umidadeMin)/(umidadeMax - umidadeMin) * 100;
    return String(valor) + " | " + String(result) + "%";
  } else if(valor <= umidadeMax) {
    return String(valor) + " | " + "100.00%";
  } else if(valor >= umidadeMin) {
    return String(valor) + " | " + "0.00%";
  }
  return "Erro de leitura!";
}

bool irrigar(int resultado) {
  if(resultado <= umidadeMax) {
    digitalWrite(bomba, LOW);
    return false;
  } else if(resultado >= umidadeMin) {
    digitalWrite(bomba, HIGH);
    delay(2000);
    digitalWrite(bomba, LOW);
    return true;
  }
  return false;
}

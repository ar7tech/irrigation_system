#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include "secrets.h"

// Topicos utilizados para comunicacao do protocolo MQTT.
#define AWS_IOT_PUBLISH_TOPIC  "nodemcu/pub"
#define AWS_IOT_SUBSCRIBE_TOPIC "nodemcu/sub"

// Definicao dos pinos do sensor e atuador.
#define sensor A0
#define atuador D7

// Definicao dos valores minimos e maximos de leitura do sensor, media efetuada com dois sensores da mesma marca e modelo.
#define umidadeMax 305
#define umidadeMin 615

// Variaveis de configuracao do usuario oriundos do DynamoDB.
bool irrigate = false;
int thresholdMin = 0;
int thresholdMax = 100;

// Variaveis de execucao do NodeMCU.
float resultado = 0;
boolean irrigando = false;
unsigned long lastMillis = 0;
unsigned long previousMillis = 0;

WiFiClientSecure net;

BearSSL::X509List cert(cacert);
BearSSL::X509List client_crt(client_cert);
BearSSL::PrivateKey key(privkey);

PubSubClient client(net);

void messageReceived(char *topic, byte *payload, unsigned int length)
{
  Serial.print("Received [");
  Serial.print(topic);
  Serial.print("]: ");

  char buffer[length];
  for (int i = 0; i < length; i++)
  {
    buffer[i] = (char)payload[i];
  }

  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, buffer);

  if (error)
  {
    Serial.print("Error parsing JSON: ");
    Serial.println(error.c_str());
    return;
  }

  irrigate = doc[0];
  thresholdMin = doc[1];
  thresholdMax = doc[2];

  Serial.print("irrigate: " + String(irrigate));
  Serial.print(" thresholdMin: " + String(thresholdMin));
  Serial.print(" thresholdMax: " + String(thresholdMax));
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
  
  // Se inscreve em um topico.
  client.subscribe(AWS_IOT_SUBSCRIBE_TOPIC);
 
  Serial.println("AWS IoT Connected!");
}

void publishMessage()
{
  StaticJsonDocument<200> doc;
  doc["umidade"] = resultado;
  doc["irrigando"] = irrigando;
  char jsonBuffer[512];
  serializeJson(doc, jsonBuffer);

  // Publica em um topico.
  client.publish(AWS_IOT_PUBLISH_TOPIC, jsonBuffer);
}

float lerSensor() {
  float result = 0.00;
  float valor = float(analogRead(sensor));  // Read the analog value form sensor
  delay(3000);
  
  if(valor > umidadeMax && valor < umidadeMin) {
    result = (valor - umidadeMin)/(umidadeMax - umidadeMin) * 100;
    return result;
  } else if(valor <= umidadeMax) {
    return float(100);
  } else if(valor >= umidadeMin) {
    return float(0);
  }
  
  return result;
}

bool acionarAtuador(float valor) {
  if (irrigate) {
    if(valor <= thresholdMin) { 
      digitalWrite(atuador, HIGH);
      delay(2000);
      digitalWrite(atuador, LOW);
      return true;
    }
  }

  digitalWrite(atuador, LOW);
  return false;
}

void setup()
{
  pinMode(atuador, OUTPUT);
  Serial.begin(115200);
  connectAWS();
}

void loop()
{
  resultado = lerSensor();
  irrigando = acionarAtuador(resultado);
  
  Serial.println("Umidade | irrigar: " + String(resultado) + " | " + String(irrigando));
  Serial.println("Limite min | max: " + String(thresholdMin) + " | " + String(thresholdMax));
  Serial.println();
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

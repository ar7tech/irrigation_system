#include <pgmspace.h>

#define SECRET

const char WIFI_SSID[] = "SSDI_WIFI";
const char WIFI_PASSWORD[] = "SENHA_WIFI";

#define THINGNAME "NodeMCU"

int8_t TIME_ZONE = -3; //NYC(USA): -5 UTC

const char MQTT_HOST[] = "ENDPOINT_DO_IOT_CORE";

// Root CA1 cert (contents from *.perm)
static const char cacert[] PROGMEM = R"EOF(
-----BEGIN CERTIFICATE-----
DADOS_CERTIFICADO_IOT_CORE
-----END CERTIFICATE-----
)EOF";

// Device certificate (contents from XXXXXXXX-certificate.pem.crt)
static const char client_cert[] PROGMEM = R"KEY(
-----BEGIN CERTIFICATE-----
DADOS_CERTIFICADO_IOT_CORE
-----END CERTIFICATE-----

)KEY";

// Private Key (contents from  XXXXXXXX-private.pem.key)
static const char privkey[] PROGMEM = R"KEY(
-----BEGIN RSA PRIVATE KEY-----
DADOS_CERTIFICADO_IOT_CORE
-----END RSA PRIVATE KEY-----

)KEY";
# Sistema de Irrigação Autônoma

Este projeto tem como objetivo a utilização de uma plataforma de internet das coisas como o NodeMCU, para automatizar a irrigação de plantas e hortas.

Para este projeto serão necessários os seguintes itens:
- NodeMCU ESP8266 ou similar.
- Sensor de umidade de solo.
- Bomba de água 12v.
- Relé 5v.
- Protoboard.
- Jumpers.
- Fonte de alimentação 9v ou 12v.

Além dos componentes (Hardware), também é necessário ter uma conta na AWS para utilização dos seguintes serviços de nuvem.
- IoT Core (Broker MQTT).
- S3 (Serviço de armazenamento de objetos).
- EC2 (Serviço de computação em nuvem).
- DynamoDB (Serviço de banco de dados NoSQL).

O projeto foi estruturado com a utilização do VITE para o front-end e NodeJS para o backend.
Dentro da pasta "aws" se encontram todos os códigos necessários para utilização dos serviços "S3" e "EC2".
- Na pasta "ec2" os arquivos "aws.js", "iot_comm.js" e "server.js" podem necessitar de uma atenção maior pois contém informações de configurações especificas que necessitem ser alteradas.
- Na pasta "s3/irrigation_system/src" no arquivo "server.tsx" você deve incluir o endpoint da API (instância no serviço EC2).

Para comunicação com a plataforma NodeMCU, é necessário primeiramente configurar o serviço IoT Core da AWS, o mesmo irá gerar as chaves e certificados necessários para inclusão no código e gravação no dispositivo.
- Em posse das chaves e certificados do serviço IoT Core, os mesmos devem ser incluídos no arquivo "nodemcu/secrets.h" como também a informação do endpoint do serviço IoT Core.
- Configurar regra no serviço para se comunicar com o DynamoDB e permiter a inclusão de dados na tabela.

Para comunicação com banco de dados é necessário criar uma nova tabela com o nome desejado, o mesmo deve estar configurado no arquivo "aws/ec2/iot_comm.js", onde a mesma deverá conter obrigatóriamente as seguintes chaves:
- Partition key:  "id", tipo: "string".
- Sort key: "itemType", tipo: "string".

Deve-se também configurar as politicas/permissões de cada serviço para que aja comunicação entre si, caso seja necessário ou não seja possível a utilização de um dos serviços da AWS, deverá ser implementada configurações de comunicação especificas não previstas nesse documento.

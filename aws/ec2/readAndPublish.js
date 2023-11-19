import { dynamoDB, iotData } from "./aws.js"

// Nome da tabela no DynamoDB
const tableName = 'nodemcu';

// Parâmetros para a operação GetItem no DynamoDB
const params = {
    TableName: tableName,
    Key: {
        "id": "1",
        "itemType": "config"
    },
};

// Ler o item específico do DynamoDB
dynamoDB.get(params, (err, data) => {
    if (err) {
        console.error('Erro ao ler do DynamoDB:', err);
    } else {
        // Extrair os dados do item
        const itemData = data.Item || {};

        // Tópico do AWS IoT Core
        const topic = 'nodemcu/sub';

        // Publicar o resultado no IoT Core
        const iotParams = {
            topic: topic,
            qos: 1,
            payload: JSON.stringify(itemData)
        };

        iotData.publish(iotParams, (publishErr, publishData) => {
            if (publishErr) {
                console.error('Erro ao publicar no IoT Core:', publishErr);
            } else {
                console.log('Mensagem publicada no IoT Core com sucesso:', publishData);
            }
        });
    }
});

import { dynamoDB, iotData } from "./aws.js"

// Nome da tabela no DynamoDB
const tableName = 'nodemcu';

export async function sendConfig(req, res) {
    // Parâmetros para a operação GetItem no DynamoDB
    const params = {
        TableName: tableName,
        Key: {
            "id": "1",
            "itemType": "config"
        },
    }

    try {
        // Ler o item específico do DynamoDB
        dynamoDB.get(params, (err, data) => {
            if (err) {
                console.error('Erro ao ler do DynamoDB:', err);
            } else {
                // Extrair apenas os atributos desejados do item
                const { irrigate, thresholdMin, thresholdMax } = data.Item || {};

                // Criar um array com os valores dos atributos
                const valuesArray = [irrigate, thresholdMin, thresholdMax];

                // Tópico do AWS IoT Core
                const topic = 'nodemcu/sub';

                // Publicar o resultado no IoT Core
                const iotParams = {
                    topic: topic,
                    qos: 1,
                    payload: JSON.stringify(valuesArray)
                };

                iotData.publish(iotParams, (publishErr, publishData) => {
                    if (publishErr) {
                        console.error('Erro ao publicar no IoT Core:', publishErr);
                    } else {
                        console.log('Mensagem publicada no IoT Core com sucesso:', publishData);
                    }
                });
            }
        })
        res.json({ message: "Busca efetuada com sucesso!" })
        res.status(200)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Erro ao buscar item no banco de dados" })
    }
}

export async function updateConf(req, res) {
    const params = {
        TableName: tableName,
        Key: {
            "id": "1",
            "itemType": "config"
        },
        UpdateExpression: "SET irrigate = :newIrrigate, thresholdMin = :newThresholdMin, thresholdMax = :newThresholdMax",
        ExpressionAttributeValues: {
            ":newIrrigate": req.body.irrigate,
            ":newThresholdMin": req.body.thresholdMin,
            ":newThresholdMax": req.body.thresholdMax,
        },
        ReturnValues: "ALL_NEW"
    }

    try {
        const data = await dynamoDB.update(params).promise()
        res.json(data.Item)
      } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Erro ao atualizar item no banco de dados" })
      }
}
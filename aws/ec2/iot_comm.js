import { dynamoDB, iotData } from "./aws.js"

const tableName = 'nodemcu';

export async function config(req, res) {
    const params = {
        TableName: tableName,
        Key: {
            "id": "1",
            "itemType": "config"
        },
    }

    try {
        const data = await dynamoDB.get(params).promise()
        res.json(data.Item)
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

export async function sendConfig(req, res) {
    const params = {
        TableName: tableName,
        Key: {
            "id": "1",
            "itemType": "config"
        },
    }

    try {
        dynamoDB.get(params, (err, data) => {
            if (err) {
                console.error('Erro ao ler do DynamoDB:', err);
            } else {
                const { irrigate, thresholdMin, thresholdMax } = data.Item || {};

                const valuesArray = [irrigate, thresholdMin, thresholdMax];

                const topic = 'nodemcu/sub';

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

export async function reading(req, res) {
    const params = {
        TableName: tableName,
        ProjectionExpression: "id, dados",
    }

    try {
        const data = await dynamoDB.scan(params).promise();

        data.Items.sort((a, b) => a.id - b.id);

        const ultimosDados = data.Items
            .slice(-3)
            .map(item => item.dados);

        res.json(ultimosDados);
      } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Erro ao buscar item no banco de dados" })
      }
}
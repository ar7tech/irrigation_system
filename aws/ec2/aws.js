import aws from "aws-sdk"

aws.config.update({
    accessKeyId: "YOUR_ACCESS_KEY",
    secretAccessKey: "YOUR_SECRET_KEY",
    region: 'us-east-1'
});

export const dynamoDB = new aws.DynamoDB.DocumentClient();

export const iotData = new aws.IotData({ endpoint: 'ENDPOINT_DO_IOT_CORE' });
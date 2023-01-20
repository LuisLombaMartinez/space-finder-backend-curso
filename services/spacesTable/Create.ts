import { DynamoDB } from "aws-sdk";
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { v4 } from "uuid";

const dbClient = new DynamoDB.DocumentClient();

async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {

    const result: APIGatewayProxyResult = {
        statusCode: 200,
        body: 'Hello from DynamoDB'
    }

    const intem = typeof event.body == 'object'? event.body: JSON.parse(event.body);
    intem.spaceId = v4();

    // const intem = {
    //     spaceId: v4()
    // }

    try {
        await dbClient.put({
            TableName: 'SpacesTable',
            Item: intem
        }).promise()
    } catch (error: any) {
        result.body = error.message
    }
    result.body = JSON.stringify(`Created item with id: ${intem.spaceId}`);

    return result;
}

export { handler }
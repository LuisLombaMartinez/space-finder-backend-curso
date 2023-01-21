import { DynamoDB } from "aws-sdk";
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { MissingFieldError, validateAsSpaceEntry } from "../shared/InputValidator";
import { generateRandomId, getEventBody } from "../shared/Utils";

const TABLE_NAME = process.env.TABLE_NAME;
const dbClient = new DynamoDB.DocumentClient();

async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {

    const result: APIGatewayProxyResult = {
        statusCode: 200,
        body: 'Hello from DynamoDB'
    }

    try {
        const intem = getEventBody(event);
        intem.spaceId = generateRandomId();
        validateAsSpaceEntry(intem)
        await dbClient.put({
            TableName: TABLE_NAME!,
            Item: intem
        }).promise()
        result.body = JSON.stringify(`Created item with id: ${intem.spaceId}`);
    } catch (error: any) {
        if (error instanceof MissingFieldError) {
            result.statusCode = 403;
        } else {
            result.statusCode = 500;
        }

        result.body = error.message
    }
    return result;
}

export { handler }
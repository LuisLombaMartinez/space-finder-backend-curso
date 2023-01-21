import { APIGatewayProxyEvent } from "aws-lambda";
import { handler } from "../../services/SpacesTable/Delete";

const event: APIGatewayProxyEvent = {
    queryStringParameters: {
        spaceId: "6c5e831d-80b9-410c-89a1-4e47cb5ff5da"
    }
} as any;

const result = handler(event, {} as any).then((apiResult) => {
    const items = JSON.parse(apiResult.body);
    console.log(123)
});
import { APIGatewayProxyEvent } from "aws-lambda";
import { handler } from "../../services/SpacesTable/Read";

const event: APIGatewayProxyEvent = {
    queryStringParameters: {
        // spaceId: "27ec7a05-6e03-4d38-8e5a-4954673143a1"
        location: "London"
    }
} as any;

const result = handler(event, {} as any).then((apiResult) => {
    const items = JSON.parse(apiResult.body);
    console.log(123)
});
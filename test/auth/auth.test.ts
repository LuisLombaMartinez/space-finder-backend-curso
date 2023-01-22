import { AuthService } from "./AuthService";
import { config } from "./config";
import * as AWS from 'aws-sdk';

AWS.config.region = config.REGION;

async function callStuff() {
    const authService = new AuthService();

    const user = authService.login(config.TEST_USER_NAME, config.TEST_USER_PASSWORD);

    await authService.getAWSTemporaryCreds(await user);

    const someCreds = AWS.config.credentials;
    const buckets = await getBuckets();
    const a = 5;
}

async function getBuckets() {
    let buckets;
    try {
        buckets = await new AWS.S3().listBuckets().promise();
    } catch (error) {
        buckets = undefined;
    }
    return buckets;
}

callStuff();

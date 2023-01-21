import { CfnOutput } from "aws-cdk-lib";
import { CognitoUserPoolsAuthorizer, RestApi } from "aws-cdk-lib/aws-apigateway";
import { UserPool, UserPoolClient, CfnUserPoolGroup } from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";



export class AuthorizerWrapper {
    private userPoolName: string;
    private userPoolClientName: string;
    private authorizerName: string;

    private scope: Construct;
    private api: RestApi;

    private userPool: UserPool;
    private userPoolClient: UserPoolClient;
    public authorizer: CognitoUserPoolsAuthorizer;

    constructor(scope: Construct, api: RestApi, userPoolName: string, userPoorlClientName: string, authorizerName: string) {
        this.userPoolName = userPoolName;
        this.userPoolClientName = userPoorlClientName;
        this.authorizerName = authorizerName;
        this.scope = scope;
        this.api = api;
        this.initialize();
    }

    private initialize() {
        this.createUserPool();
        this.addUserPoolClient();
        this.createAuthorizer();
        this.createAdminGroup();
    }

    private createUserPool(){
        this.userPool = new UserPool(this.scope, this.userPoolName, {
            userPoolName: this.userPoolName,
            selfSignUpEnabled: true,
            signInAliases: {
                username: true,
                email: true
            }
        });
        new CfnOutput(this.scope, 'UserPoolId', {
            value: this.userPool.userPoolId
        })
    }

    private addUserPoolClient(){
        this.userPoolClient = this.userPool.addClient(this.userPoolClientName, {
            userPoolClientName: this.userPoolClientName,
            authFlows: {
                adminUserPassword: true,
                custom: true,
                userPassword: true,
                userSrp: true
            },
            generateSecret: false
        })
        new CfnOutput(this.scope, 'UserPoolClientId', {
            value: this.userPoolClient.userPoolClientId
        });
    }

    private createAuthorizer() {
        this.authorizer = new CognitoUserPoolsAuthorizer(this.scope, this.authorizerName, {
            cognitoUserPools: [this.userPool],
            authorizerName: this.authorizerName,
            identitySource: 'method.request.header.Authorization'
        });
        this.authorizer._attachToApi(this.api);
    }

    private createAdminGroup() {
        new CfnUserPoolGroup(this.scope, 'admin', {
            groupName: 'admin',
            userPoolId: this.userPool.userPoolId
        })
    }
}
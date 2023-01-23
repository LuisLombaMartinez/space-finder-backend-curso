import { CfnOutput } from "aws-cdk-lib";
import { CognitoUserPoolsAuthorizer, RestApi } from "aws-cdk-lib/aws-apigateway";
import { UserPool, UserPoolClient, CfnUserPoolGroup } from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";
import { IdentityPoolWrapper } from "./IdentityPoolWrapper";


export class AuthorizerWrapper {
    private userPoolName: string;
    private userPoolClientName: string;
    private authorizerName: string;
    private identityPoolName: string;

    private scope: Construct;
    private api: RestApi;
    private bucketArn: string;

    private userPool: UserPool;
    private userPoolClient: UserPoolClient;
    public authorizer: CognitoUserPoolsAuthorizer;

    private identityPoolWrapper: IdentityPoolWrapper;

    constructor(scope: Construct, api: RestApi, bucketArn: string, userPoolName: string, userPoorlClientName: string, authorizerName: string, identityPoolName: string) {
        this.scope = scope;
        this.api = api;
        this.bucketArn = bucketArn;
        this.userPoolName = userPoolName;
        this.userPoolClientName = userPoorlClientName;
        this.authorizerName = authorizerName;
        this.identityPoolName = identityPoolName;
        this.initialize();
    }

    private initialize() {
        this.createUserPool();
        this.addUserPoolClient();
        this.createAuthorizer();
        this.initializeIdentityPoolWrapper();
        this.createAdminGroup(); // needs initializeIdentityPoolWrapper to be executed first
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
            userPoolId: this.userPool.userPoolId,
            roleArn: this.identityPoolWrapper.adminRole.roleArn
        })
    }

    private initializeIdentityPoolWrapper(){
        this.identityPoolWrapper = new IdentityPoolWrapper(
            this.scope,
            this.userPool,
            this.userPoolClient,
            this.bucketArn,
            this.identityPoolName
        )
    }
}
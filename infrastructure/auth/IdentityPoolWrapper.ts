import { CfnOutput } from "aws-cdk-lib";
import { UserPool, UserPoolClient, CfnIdentityPool, CfnIdentityPoolRoleAttachment } from "aws-cdk-lib/aws-cognito";
import { Effect, FederatedPrincipal, PolicyStatement, Role } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";


export class IdentityPoolWrapper {

    private identityPoolName: string;

    private scope: Construct;
    private userPool: UserPool;
    private userPoolClient: UserPoolClient;
    private bucketArn: string;

    private identityPool: CfnIdentityPool;
    private authenticatedRole: Role;
    private unAuthenticatedRole: Role;
    public adminRole: Role;

    constructor(scope: Construct, userPool: UserPool, userPoolClient: UserPoolClient, bucketArn: string, identityPoolName: string) {
        this.userPool = userPool;
        this.scope = scope;
        this.bucketArn = bucketArn;
        this.userPoolClient = userPoolClient;
        this.identityPoolName = identityPoolName;
        this.initialize();
    }

    private initialize() {
        this.initializeIdentityPool();
        this.initializeRoles();
        this.attachRoles();
    }

    private initializeIdentityPool() {
        this.identityPool = new CfnIdentityPool(this.scope, this.identityPoolName, {
            allowUnauthenticatedIdentities: true,
            cognitoIdentityProviders: [{
                clientId: this.userPoolClient.userPoolClientId,
                providerName: this.userPool.userPoolProviderName
            }]
        });
        new CfnOutput(this.scope, 'IdentityPoolId', {
            value: this.identityPool.ref
        });
    }

    private initializeRoles() {
        this.authenticatedRole = new Role(this.scope, 'CognitoAuthenticatedRole', {
            assumedBy: new FederatedPrincipal('cognito-identity.amazonaws.com', {
                StringEquals: {
                    'cognito-identity.amazonaws.com:aud': this.identityPool.ref
                },
                'ForAnyValue:StringLike': {
                    'cognito-identity.amazonaws.com:amr': 'authenticated'
                }
            },
                'sts:AssumeRoleWithWebIdentity'
            )
        });
        this.unAuthenticatedRole = new Role(this.scope, 'CognitoUnAuthenticatedRole', {
            assumedBy: new FederatedPrincipal('cognito-identity.amazonaws.com', {
                StringEquals: {
                    'cognito-identity.amazonaws.com:aud': this.identityPool.ref
                },
                'ForAnyValue:StringLike': {
                    'cognito-identity.amazonaws.com:amr': 'unauthenticated'
                }
            },
                'sts:AssumeRoleWithWebIdentity'
            )
        });
        this.adminRole = new Role(this.scope, 'CognitoAdminRole', {
            assumedBy: new FederatedPrincipal('cognito-identity.amazonaws.com', {
                StringEquals: {
                    'cognito-identity.amazonaws.com:aud': this.identityPool.ref
                },
                'ForAnyValue:StringLike': {
                    'cognito-identity.amazonaws.com:amr': 'authenticated'
                }
            },
                'sts:AssumeRoleWithWebIdentity'
            )
        });
        this.adminRole.addToPolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                's3:PutObject',
                's3:PutObjectAcl'
            ],
            resources: [this.bucketArn]
        }))
    }

    private attachRoles() {
        new CfnIdentityPoolRoleAttachment(this.scope, 'RolesAttachment', {
            identityPoolId: this.identityPool.ref,
            roles: {
                'authenticated': this.authenticatedRole.roleArn,
                'unauthenticated': this.unAuthenticatedRole.roleArn
            },
            roleMappings: {
                adminMapping: {
                    type: 'Token',
                    ambiguousRoleResolution: 'AuthenticatedRole',
                    identityProvider: `${this.userPool.userPoolProviderName}:${this.userPoolClient.userPoolClientId}`
                }
            }
        })
    }
}
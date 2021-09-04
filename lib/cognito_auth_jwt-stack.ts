import { Stack, App, RemovalPolicy } from '@aws-cdk/core';
import { LambdaIntegration, RestApi , Cors, CognitoUserPoolsAuthorizer, AuthorizationType} from '@aws-cdk/aws-apigateway';
import { AttributeType, Table } from '@aws-cdk/aws-dynamodb';
import { Runtime, Code, Function } from '@aws-cdk/aws-lambda';
import { Role, ServicePrincipal, ManagedPolicy, PolicyStatement } from '@aws-cdk/aws-iam';
import { UserPool, VerificationEmailStyle} from '@aws-cdk/aws-cognito';

export class CognitoAuthJwtStack extends Stack {
  constructor(scope: App, id: string, ) {
    super(scope, id);

    //Create DynamoDB table
    const dynamoTable = new Table(this, "DynamoDBTable",{
      partitionKey: {
        name: 'accountid',
        type: AttributeType.STRING
      },
      sortKey: {
        name: 'vendorid',
        type: AttributeType.STRING
      },
      tableName: 'cognito_auth_jwt',
      removalPolicy: RemovalPolicy.DESTROY
    });

    //Setup IAM security for Lambda
    const lambda_service_role = new Role(this, "IamRole",{
        assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
        roleName: "cognito_auth_jwt"
    });

    lambda_service_role.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole"));
    
    lambda_service_role.addToPolicy(new PolicyStatement({
      resources: [dynamoTable.tableArn],
      actions: ['dynamodb:PutItem', 'dynamodb:GetItem'],
    }));

    //Create 2 Lambda function. One for read and one for writing
    const lambda_post_order = new Function(this, "PostLambdaFunction",{
      runtime: Runtime.PYTHON_3_7,
      handler: "lambda_handler.lambda_handler",
      code: Code.fromAsset("resources/cognito_auth_jwt_post"),
      functionName: "cognito_auth_jwt_post",
      role: lambda_service_role,
      environment: {
        'TABLENAME': dynamoTable.tableName
      }
    });

    const lambda_get_order = new Function(this, "GetLambdaFunction",{
      runtime: Runtime.PYTHON_3_7,
      handler: "lambda_handler.lambda_handler",
      code: Code.fromAsset("resources/cognito_auth_jwt_get"),
      functionName: "cognito_auth_jwt_get",
      role: lambda_service_role,
      environment: {
        'TABLENAME': dynamoTable.tableName
      }
    });

    //Create cognito user pool
    const userpool = new UserPool(this, 'UserPool', {
      removalPolicy: RemovalPolicy.DESTROY, 
      userPoolName: 'cognito_auth_jwt',
      signInAliases: {
        username: true,
        email: true
      },  
      autoVerify: { email: true },
      selfSignUpEnabled: true,
      userVerification: {
        emailSubject: 'Verify your email for our awesome app!',
        emailBody: 'Thanks for signing up to our awesome app! Your verification code is {####}',
        emailStyle: VerificationEmailStyle.CODE,
        smsMessage: 'Thanks for signing up to our awesome app! Your verification code is {####}',
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true
      },
    });

    //Create client app
    const client = userpool.addClient('customer-app-client',{
      authFlows: {
        userPassword: true
      },
      generateSecret: false
    });
    
    const clientId = client.userPoolClientId;

    //Create REST Api and integrate the Lambda functions
    var api = new RestApi(this, "OrderApi",{
        restApiName: "cognito_auth_jwt",
        defaultCorsPreflightOptions: {
          allowOrigins: Cors.ALL_ORIGINS,
          allowMethods: Cors.ALL_METHODS},
        
    });

    var lambda_post_integration = new LambdaIntegration(lambda_post_order, {
      requestTemplates: {
            ["application/json"]: "{ \"statusCode\": \"200\" }"
        }
    });

    var lambda_get_integration = new LambdaIntegration(lambda_get_order);

    const auth = new CognitoUserPoolsAuthorizer(this, 'CognitoAuthoriser', {
      cognitoUserPools: [userpool]
    });

    var apiresource = api.root.addResource("order");

    apiresource.addMethod("POST", lambda_post_integration,{
      authorizationType: AuthorizationType.COGNITO,
      authorizer: auth
    });

    apiresource.addMethod("GET", lambda_get_integration);
  }
}

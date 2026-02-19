import { CfnOutput, Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Cors, LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { AttributeType, BillingMode, ProjectionType, Table } from "aws-cdk-lib/aws-dynamodb";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class ApiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    /**
     * DynamoDB Tables
     */

    const userTable = new Table(this, "UserTable", {
      partitionKey: { name: "id", type: AttributeType.NUMBER },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    const receivedQuestsTable = new Table(this, "ReceivedQuestsTable", {
      partitionKey: { name: "userId", type: AttributeType.NUMBER },
      sortKey: { name: "id", type: AttributeType.NUMBER },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    const sentQuestsTable = new Table(this, "SentQuestsTable", {
      partitionKey: { name: "userId", type: AttributeType.NUMBER },
      sortKey: { name: "id", type: AttributeType.NUMBER },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    const contractsTable = new Table(this, "ContractsTable", {
      tableName: "Contracts",
      partitionKey: { name: "type", type: AttributeType.NUMBER },
      sortKey: { name: "startedAt", type: AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    const contractActionsTable = new Table(this, "ContractActionsTable", {
      tableName: "ContractAction",
      partitionKey: { name: "key", type: AttributeType.STRING },
      sortKey: { name: "timestamp", type: AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    /**
     * Secondary Indexes
     */

    contractsTable.addGlobalSecondaryIndex({
      indexName: "UserIdEndedAtIndex",
      partitionKey: { name: "userId", type: AttributeType.NUMBER },
      sortKey: { name: "endedAt", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    contractsTable.addGlobalSecondaryIndex({
      indexName: "TypeEndedAtIndex",
      partitionKey: { name: "type", type: AttributeType.NUMBER },
      sortKey: { name: "endedAt", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    contractsTable.addGlobalSecondaryIndex({
      indexName: "UserIdTypeEndedAtIndex",
      partitionKey: { name: "userId_type", type: AttributeType.STRING },
      sortKey: { name: "endedAt", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    /**
     * Lambda Functions
     */

    const postUserSlotsLambda = new NodejsFunction(this, "PostUserSlotsLambda", {
      entry: "src/handlers/postUserSlots.ts",
      handler: "handler",
      runtime: Runtime.NODEJS_22_X,
      timeout: Duration.minutes(1),
      environment: {
        USER_TABLE: userTable.tableName,
      },
    });

    const postUserAvailabilityLambda = new NodejsFunction(this, "PostUserAvailabilityLambda", {
      entry: "src/handlers/postUserAvailability.ts",
      handler: "handler",
      runtime: Runtime.NODEJS_22_X,
      timeout: Duration.minutes(1),
      environment: {
        CONTRACT_TABLE: contractsTable.tableName,
        CONTRACT_ACTION_TABLE: contractActionsTable.tableName,
        USER_TABLE: userTable.tableName,
      },
    });

    const postUserRatesLambda = new NodejsFunction(this, "PostUserRatesLambda", {
      entry: "src/handlers/postUserRates.ts",
      handler: "handler",
      runtime: Runtime.NODEJS_22_X,
      timeout: Duration.minutes(1),
      environment: {
        CONTRACT_TABLE: contractsTable.tableName,
        CONTRACT_ACTION_TABLE: contractActionsTable.tableName,
        USER_TABLE: userTable.tableName,
      },
    });

    const postUserQuestsLambda = new NodejsFunction(this, "PostUserQuestsLambda", {
      entry: "src/handlers/postUserQuests.ts",
      handler: "handler",
      runtime: Runtime.NODEJS_22_X,
      timeout: Duration.minutes(1),
      environment: {
        USER_TABLE: userTable.tableName,
        CONTRACT_TABLE: contractsTable.tableName,
        RECEIVED_QUESTS_TABLE: receivedQuestsTable.tableName,
        SENT_QUESTS_TABLE: sentQuestsTable.tableName,
      },
    });

    const getUserQuestsLambda = new NodejsFunction(this, "GetUserQuestsLambda", {
      entry: "src/handlers/getUserQuests.ts",
      handler: "handler",
      runtime: Runtime.NODEJS_22_X,
      timeout: Duration.minutes(1),
      environment: {
        USER_TABLE: userTable.tableName,
        RECEIVED_QUESTS_TABLE: receivedQuestsTable.tableName,
        SENT_QUESTS_TABLE: sentQuestsTable.tableName,
      },
    });

    const getUsersLambda = new NodejsFunction(this, "GetUsersLambda", {
      entry: "src/handlers/getUsers.ts",
      handler: "handler",
      runtime: Runtime.NODEJS_22_X,
      timeout: Duration.minutes(1),
      environment: {
        USER_TABLE: userTable.tableName,
      },
    });

    /**
     * Permissions
     */

    userTable.grantReadData(getUsersLambda);
    userTable.grantReadData(getUserQuestsLambda);
    userTable.grantReadData(postUserQuestsLambda);
    userTable.grantReadWriteData(postUserSlotsLambda);
    userTable.grantReadWriteData(postUserRatesLambda);
    userTable.grantReadWriteData(postUserAvailabilityLambda);

    contractsTable.grantReadData(postUserQuestsLambda);
    contractsTable.grantReadWriteData(postUserAvailabilityLambda);
    contractsTable.grantReadWriteData(postUserRatesLambda);

    contractActionsTable.grantReadWriteData(postUserRatesLambda);
    contractActionsTable.grantReadWriteData(postUserAvailabilityLambda);

    receivedQuestsTable.grantReadData(getUserQuestsLambda);
    receivedQuestsTable.grantReadWriteData(postUserQuestsLambda);

    sentQuestsTable.grantReadData(getUserQuestsLambda);
    sentQuestsTable.grantReadWriteData(postUserQuestsLambda);

    /**
     * API Gayteway
     */

    const api = new RestApi(this, "RestAPI", {
      restApiName: "RestAPI",
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
      },
    });

    //Paths
    const pathUsers = api.root.addResource("users");
    const pathUser = pathUsers.addResource("{id}");
    const pathQuests = pathUser.addResource("quests");
    const pathSlots = pathUser.addResource("slots");
    const pathRates = pathUser.addResource("rates");
    const pathAvailable = pathUser.addResource("available");
    const getQuests = pathQuests.addResource("{type}");

    //Integrations
    const getUsersIntegration = new LambdaIntegration(getUsersLambda);
    const postSlotsIntegration = new LambdaIntegration(postUserSlotsLambda);
    const postRatesIntegration = new LambdaIntegration(postUserRatesLambda);
    const postAvaiabilityIntegration = new LambdaIntegration(postUserAvailabilityLambda);
    const postQuestsIntegration = new LambdaIntegration(postUserQuestsLambda);
    const getQuestsIntegration = new LambdaIntegration(getUserQuestsLambda);

    //Create HTTP Methods
    pathUsers.addMethod("GET", getUsersIntegration);
    getQuests.addMethod("GET", getQuestsIntegration);
    pathQuests.addMethod("POST", postQuestsIntegration);
    pathSlots.addMethod("POST", postSlotsIntegration);
    pathRates.addMethod("POST", postRatesIntegration);
    pathAvailable.addMethod("POST", postAvaiabilityIntegration);

    /**
     * Outputs
     */

    new CfnOutput(this, "UserTableOutput", {
      exportName: "UserTableName",
      value: userTable.tableName,
    });
    new CfnOutput(this, "ReceivedQuestsTableOutput", {
      exportName: "ReceivedQuestsTableName",
      value: receivedQuestsTable.tableName,
    });
    new CfnOutput(this, "SentQuestsTableOutput", {
      exportName: "SentQuestsTableName",
      value: sentQuestsTable.tableName,
    });
  }
}

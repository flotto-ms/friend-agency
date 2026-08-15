import { CfnOutput, Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Cors, LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { AttributeType, BillingMode, ProjectionType, Table } from "aws-cdk-lib/aws-dynamodb";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class ApiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    /**
     * S3 Storage
     */

    const configBucket = new Bucket(this, "ConfigBucket");

    /**
     * DynamoDB Tables
     */

    const userTable = new Table(this, "UserTable", {
      partitionKey: { name: "id", type: AttributeType.NUMBER },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    const authTable = new Table(this, "AuthTable", {
      tableName: "Auth",
      partitionKey: { name: "userId", type: AttributeType.NUMBER },
      timeToLiveAttribute: "ttl",
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

    const contractTable = new Table(this, "ContractTable", {
      tableName: "Contract",
      partitionKey: { name: "key", type: AttributeType.STRING },
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
    receivedQuestsTable.addGlobalSecondaryIndex({
      indexName: "UserIdCreatedAtIndex",
      partitionKey: { name: "userId", type: AttributeType.NUMBER },
      sortKey: { name: "createdAt", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    receivedQuestsTable.addGlobalSecondaryIndex({
      indexName: "InitiatorIdCreatedAtIndex",
      partitionKey: { name: "initiatorId", type: AttributeType.NUMBER },
      sortKey: { name: "createdAt", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    sentQuestsTable.addGlobalSecondaryIndex({
      indexName: "UserIdExpiresAtIndex",
      partitionKey: { name: "userId", type: AttributeType.NUMBER },
      sortKey: { name: "expiresAt", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    sentQuestsTable.addGlobalSecondaryIndex({
      indexName: "SentToExpiresAtIndex",
      partitionKey: { name: "sentTo", type: AttributeType.NUMBER },
      sortKey: { name: "expiresAt", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    userTable.addGlobalSecondaryIndex({
      indexName: "AccessIndex",
      partitionKey: { name: "access", type: AttributeType.STRING },
      sortKey: { name: "userId", type: AttributeType.NUMBER },
      projectionType: ProjectionType.ALL,
    });

    contractTable.addGlobalSecondaryIndex({
      indexName: "EndedAtUserIdIndex",
      partitionKey: { name: "endedAt", type: AttributeType.STRING },
      sortKey: { name: "userId", type: AttributeType.NUMBER },
      projectionType: ProjectionType.ALL,
    });

    contractTable.addGlobalSecondaryIndex({
      indexName: "UserIdTypeIndex",
      partitionKey: { name: "userId", type: AttributeType.NUMBER },
      sortKey: { name: "type", type: AttributeType.NUMBER },
      projectionType: ProjectionType.ALL,
    });

    /**
     * Lambda Functions
     */

    const authLamber = new NodejsFunction(this, "AuthLambda", {
      entry: "src/handlers/authUser.ts",
      handler: "handler",
      runtime: Runtime.NODEJS_22_X,
      timeout: Duration.minutes(1),
      environment: {
        AUTH_TABLE: authTable.tableName,
        USER_TABLE: userTable.tableName,
        CONFIG_BUCKET: configBucket.bucketName,
      },
    });

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
        CONTRACT_TABLE: contractTable.tableName,
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
        CONTRACT_TABLE: contractTable.tableName,
        CONTRACT_ACTION_TABLE: contractActionsTable.tableName,
        USER_TABLE: userTable.tableName,
      },
    });

    const userGroupsLambda = new NodejsFunction(this, "UserGroupsLambda", {
      entry: "src/handlers/userGroups/index.ts",
      handler: "handler",
      runtime: Runtime.NODEJS_22_X,
      timeout: Duration.minutes(1),
      environment: {
        USER_TABLE: userTable.tableName,
        CONFIG_BUCKET: configBucket.bucketName,
      },
    });

    const userRatesLambda = new NodejsFunction(this, "UserRatesLambda", {
      entry: "src/handlers/userRates/index.ts",
      handler: "handler",
      runtime: Runtime.NODEJS_22_X,
      timeout: Duration.minutes(1),
      environment: {
        USER_TABLE: userTable.tableName,
        CONTRACT_TABLE: contractTable.tableName,
        CONFIG_BUCKET: configBucket.bucketName,
      },
    });

    const postUserQuestsLambda = new NodejsFunction(this, "PostUserQuestsLambda", {
      entry: "src/handlers/postUserQuests.ts",
      handler: "handler",
      runtime: Runtime.NODEJS_22_X,
      timeout: Duration.minutes(1),
      environment: {
        USER_TABLE: userTable.tableName,
        CONTRACT_TABLE: contractTable.tableName,
        RECEIVED_QUESTS_TABLE: receivedQuestsTable.tableName,
        SENT_QUESTS_TABLE: sentQuestsTable.tableName,
      },
    });

    const postQuestsLambda = new NodejsFunction(this, "PostQuestsLambda", {
      entry: "src/handlers/postQuests.ts",
      handler: "handler",
      runtime: Runtime.NODEJS_22_X,
      timeout: Duration.minutes(15),
      environment: {
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
        CONFIG_BUCKET: configBucket.bucketName,
      },
    });

    const getUsersLambda = new NodejsFunction(this, "GetUsersLambda", {
      entry: "src/handlers/getUsers.ts",
      handler: "handler",
      runtime: Runtime.NODEJS_22_X,
      timeout: Duration.minutes(1),
      environment: {
        USER_TABLE: userTable.tableName,
        CONFIG_BUCKET: configBucket.bucketName,
      },
    });

    const getContractsLambda = new NodejsFunction(this, "GetContractsLambda", {
      entry: "src/handlers/getContracts.ts",
      handler: "handler",
      runtime: Runtime.NODEJS_22_X,
      timeout: Duration.minutes(1),
      environment: {
        CONTRACT_TABLE: contractTable.tableName,
      },
    });

    /**
     * Permissions
     */
    authTable.grantReadWriteData(authLamber);

    userTable.grantReadData(getUsersLambda);
    userTable.grantReadData(getUserQuestsLambda);
    userTable.grantReadData(postUserQuestsLambda);
    userTable.grantReadWriteData(authLamber);
    userTable.grantReadWriteData(postUserSlotsLambda);
    userTable.grantReadWriteData(postUserRatesLambda);
    userTable.grantReadWriteData(userGroupsLambda);
    userTable.grantReadWriteData(userRatesLambda);
    userTable.grantReadWriteData(postUserAvailabilityLambda);

    contractTable.grantReadData(postUserQuestsLambda);
    contractTable.grantReadData(getContractsLambda);
    contractTable.grantReadWriteData(postUserAvailabilityLambda);
    contractTable.grantReadWriteData(postUserRatesLambda);
    contractTable.grantReadWriteData(userRatesLambda);

    contractActionsTable.grantReadWriteData(postUserRatesLambda);
    contractActionsTable.grantReadWriteData(postUserAvailabilityLambda);

    receivedQuestsTable.grantReadData(getUserQuestsLambda);
    receivedQuestsTable.grantReadWriteData(postQuestsLambda);
    receivedQuestsTable.grantReadWriteData(postUserQuestsLambda);

    sentQuestsTable.grantReadData(getUserQuestsLambda);
    sentQuestsTable.grantReadWriteData(postQuestsLambda);
    sentQuestsTable.grantReadWriteData(postUserQuestsLambda);

    configBucket.grantReadWrite(authLamber);
    configBucket.grantReadWrite(getUsersLambda);
    configBucket.grantReadWrite(getUserQuestsLambda);
    configBucket.grantReadWrite(userGroupsLambda);
    configBucket.grantReadWrite(userRatesLambda);

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
    const pathAuth = api.root.addResource("auth");
    const pathContracts = api.root.addResource("contracts");
    const pathUsers = api.root.addResource("users");
    const pathUser = pathUsers.addResource("{id}");
    const pathUserContracts = pathUser.addResource("contracts");
    const pathUserQuests = pathUser.addResource("quests");
    const pathSlots = pathUser.addResource("slots");
    const pathRates = pathUser.addResource("rates");
    const pathRate = pathRates.addResource("{rate}");
    const pathGroups = pathUser.addResource("groups");
    const pathGroup = pathGroups.addResource("{group}");
    const pathAvailable = pathUser.addResource("available");
    const getQuests = pathUserQuests.addResource("{type}");
    const pathQuests = api.root.addResource("quests");

    //Integrations
    const authIntegration = new LambdaIntegration(authLamber);
    const getContractsIntegration = new LambdaIntegration(getContractsLambda);
    const getUsersIntegration = new LambdaIntegration(getUsersLambda);
    const postSlotsIntegration = new LambdaIntegration(postUserSlotsLambda);
    const postRatesIntegration = new LambdaIntegration(postUserRatesLambda);
    const userRatesIntegration = new LambdaIntegration(userRatesLambda);
    const userGroupsntegration = new LambdaIntegration(userGroupsLambda);
    const postAvaiabilityIntegration = new LambdaIntegration(postUserAvailabilityLambda);
    const postUserQuestsIntegration = new LambdaIntegration(postUserQuestsLambda);
    const getUserQuestsIntegration = new LambdaIntegration(getUserQuestsLambda);
    const postQuestsIntegratoion = new LambdaIntegration(postQuestsLambda);

    //Create HTTP Methods
    pathAuth.addMethod("GET", authIntegration);
    pathAuth.addMethod("POST", authIntegration);
    pathContracts.addMethod("GET", getContractsIntegration);
    pathUser.addMethod("GET", getUsersIntegration);
    pathUsers.addMethod("GET", getUsersIntegration);
    getQuests.addMethod("GET", getUserQuestsIntegration);
    pathUserContracts.addMethod("GET", getContractsIntegration);
    pathUserQuests.addMethod("POST", postUserQuestsIntegration);
    pathSlots.addMethod("POST", postSlotsIntegration);

    //User Rates
    pathRates.addMethod("GET", userRatesIntegration);
    pathRates.addMethod("POST", userRatesIntegration);
    pathRate.addMethod("GET", userRatesIntegration);
    pathRate.addMethod("PUT", userRatesIntegration);
    pathRate.addMethod("DELETE", userRatesIntegration);

    //User Groups
    pathGroups.addMethod("GET", userGroupsntegration);
    pathGroups.addMethod("PUT", userGroupsntegration);
    pathGroup.addMethod("GET", userGroupsntegration);
    pathGroup.addMethod("POST", userGroupsntegration);
    pathGroup.addMethod("DELETE", userGroupsntegration);

    pathAvailable.addMethod("POST", postAvaiabilityIntegration);
    pathQuests.addMethod("POST", postQuestsIntegratoion);

    /**
     * Outputs
     */

    new CfnOutput(this, "AuthTableOutput", {
      exportName: "AuthTableName",
      value: authTable.tableName,
    });
    new CfnOutput(this, "UserTableOutput", {
      exportName: "UserTableName",
      value: userTable.tableName,
    });
    new CfnOutput(this, "ContractTableOutput", {
      exportName: "ContractTableName",
      value: contractTable.tableName,
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

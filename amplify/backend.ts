import * as iam from "aws-cdk-lib/aws-iam"
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { StreamViewType } from "aws-cdk-lib/aws-dynamodb";
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { preTokenGeneration } from './auth/pre-token-generation/resource';
import { teamgetAccounts } from './functions/teamgetAccounts/resource';
import { teamgetEntitlement } from './functions/teamgetEntitlement/resource';
import { teamgetIdCGroups } from './functions/teamgetIdCGroups/resource';
import { teamgetLogs } from './functions/teamgetLogs/resource';
import { teamgetMgmtAccountDetails } from './functions/teamgetMgmtAccountDetails/resource';
import { teamgetOU } from './functions/teamgetOU/resource';
import { teamgetOUs } from './functions/teamgetOUs/resource';
import { teamgetPermissions } from './functions/teamgetPermissions/resource';
import { teamGetPermissionSets } from './functions/teamGetPermissionSets/resource';
import { teamgetUserPolicy } from './functions/teamgetUserPolicy/resource';
import { teamgetUsers } from './functions/teamgetUsers/resource';
import { teamListGroups } from './functions/teamListGroups/resource';
import { teamNotifications } from './functions/teamNotifications/resource';
import { teamPublishOUs } from './functions/teamPublishOUs/resource';
import { teamqueryLogs } from './functions/teamqueryLogs/resource';
import { teamStatus } from './functions/teamStatus/resource';
import { createSnsNotificationTopic } from './custom/sns/resource';
import { createStepFunctions } from './custom/stepfunctions/resource';
import { createLambdaTeamRouter } from './custom/functions/teamRouter/resource';

const backend = defineBackend({
  auth,
  data,
  preTokenGeneration,
  teamgetAccounts,
  teamgetEntitlement,
  teamgetIdCGroups,
  teamgetLogs,
  teamgetMgmtAccountDetails,
  teamgetOU,
  teamgetOUs,
  teamgetPermissions,
  teamGetPermissionSets,
  teamgetUserPolicy,
  teamgetUsers,
  teamListGroups,
  teamNotifications,
  teamPublishOUs,
  teamqueryLogs,
  teamStatus,
});

const { cfnResources } = backend.data.resources;

cfnResources.amplifyDynamoDbTables["Requests"].streamSpecification = {
  streamViewType: StreamViewType.NEW_AND_OLD_IMAGES,

};

cfnResources.amplifyDynamoDbTables["Sessions"].timeToLiveAttribute = {
  attributeName: "expireAt",
  enabled: true,
};

cfnResources.amplifyDynamoDbTables["Sessions"].streamSpecification = {
  streamViewType: StreamViewType.NEW_AND_OLD_IMAGES,
};

const userPool = backend.auth.resources.userPool;
const preTokenGenerationLambda = backend.preTokenGeneration.resources.lambda;
const teamgetAccountsLambda = backend.teamgetAccounts.resources.lambda
const teamgetEntitlementLambda = backend.teamgetEntitlement.resources.lambda
const teamgetIdCGroupsLambda = backend.teamgetIdCGroups.resources.lambda
const teamgetLogsLambda = backend.teamgetLogs.resources.lambda
const teamgetMgmtAccountDetailsLambda = backend.teamgetMgmtAccountDetails.resources.lambda
const teamgetOULambda = backend.teamgetOU.resources.lambda
const teamgetOUsLambda = backend.teamgetOUs.resources.lambda
const teamgetPermissionsLambda = backend.teamgetPermissions.resources.lambda
const teamGetPermissionSetsLambda = backend.teamGetPermissionSets.resources.lambda
const teamgetUserPolicyLambda = backend.teamgetUserPolicy.resources.lambda
const teamgetUsersLambda = backend.teamgetUsers.resources.lambda
const teamListGroupsLambda = backend.teamListGroups.resources.lambda
const teamPublishOUsLambda = backend.teamPublishOUs.resources.lambda
const teamqueryLogsLambda = backend.teamqueryLogs.resources.lambda
const teamStatusLambda = backend.teamStatus.resources.lambda
const teamNotificationsLambda = backend.teamNotifications.resources.lambda

const teamPreTokenGenerationHandlerPolicyStatement = new iam.PolicyStatement({
  actions: [
    "identitystore:GetUserId",
    "identitystore:GetGroupId",
    "identitystore:ListGroupMembershipsForMember",
    "identitystore:ListInstances",
    "identitystore:ListGroups",
    "sso:ListInstances",
    "dynamodb:GetItem",
    "dynamodb:Query",
    "dynamodb:Scan"
  ],
  resources: ["*"],
})

const organizationsPolicyStatement = new iam.PolicyStatement({
  actions: [
    "organizations:Describe*",
    "organizations:List*",
  ],
  resources: ["*"],
})

const teamgetIdCGroupsPolicyStatement = new iam.PolicyStatement({
  actions: [
    "identitystore:ListGroups",
    "sso:ListInstances",
  ],
  resources: ["*"],
})

const teamgetLogsPolicyStatement = new iam.PolicyStatement({
  actions: [
    "cloudtrail:DescribeQuery",
    "cloudtrail:StartQuery",
    "cloudtrail:GetQueryResults"
  ],
  resources: ["*"],
})

const SSOPolicyStatement = new iam.PolicyStatement({
  actions: [
    "sso:DescribePermissionSet",
    "sso:ListPermissionSets",
    "sso:ListInstances",
    "sso:ListTagsForResource",
    "sso:ListPermissionSetsProvisionedToAccount",
    "organizations:DescribeOrganization",
    "dynamodb:GetItem",
    "dynamodb:Query",
    "dynamodb:Scan"
  ],
  resources: ["*"],
})

const teamgetUsersPolicyStatement = new iam.PolicyStatement({
  actions: [
    "identitystore:ListUsers",
    "sso:ListInstances"
  ],
  resources: ["*"],
})

const teamListGroupsPolicyStatement = new iam.PolicyStatement({
  actions: [
    "identitystore:ListGroupMemberships",
    "sso:ListInstances"
  ],
  resources: ["*"],
})

const teamqueryLogsPolicyStatement = new iam.PolicyStatement({
  actions: [
    "identitystore:ListGroupMemberships",
    "sso:ListInstances",
    "cloudtrail:DescribeQuery",
    "cloudtrail:StartQuery",
    "cloudtrail:GetQueryResults"
  ],
  resources: ["*"],
})

const teamNotificationsPolicyStatement = new iam.PolicyStatement({
  actions: [
    "ses:SendEmail",
    "ses:SendRawEmail",
    "sns:Publish"
  ],
  resources: ["*"],
})

preTokenGenerationLambda.addPermission('AllowCognitoInvokePreTokenGeneration', {
  principal: new iam.ServicePrincipal('cognito-idp.amazonaws.com'),
  sourceArn: userPool.userPoolArn,
});

preTokenGenerationLambda.addToRolePolicy(teamPreTokenGenerationHandlerPolicyStatement)
teamgetAccountsLambda.addToRolePolicy(organizationsPolicyStatement)
teamgetEntitlementLambda.addToRolePolicy(organizationsPolicyStatement)
teamgetIdCGroupsLambda.addToRolePolicy(teamgetIdCGroupsPolicyStatement)
teamgetLogsLambda.addToRolePolicy(teamgetLogsPolicyStatement)
teamgetMgmtAccountDetailsLambda.addToRolePolicy(SSOPolicyStatement)
teamgetOULambda.addToRolePolicy(organizationsPolicyStatement)
teamgetOUsLambda.addToRolePolicy(organizationsPolicyStatement)
teamgetPermissionsLambda.addToRolePolicy(SSOPolicyStatement)
teamGetPermissionSetsLambda.addToRolePolicy(SSOPolicyStatement)
teamgetUserPolicyLambda.addToRolePolicy(SSOPolicyStatement)
teamgetUsersLambda.addToRolePolicy(teamgetUsersPolicyStatement)
teamListGroupsLambda.addToRolePolicy(teamListGroupsPolicyStatement)
teamPublishOUsLambda.addToRolePolicy(organizationsPolicyStatement)
teamqueryLogsLambda.addToRolePolicy(teamqueryLogsPolicyStatement)
teamNotificationsLambda.addToRolePolicy(teamNotificationsPolicyStatement)

backend.auth.resources.cfnResources.cfnUserPool.lambdaConfig = {
  preTokenGeneration: backend.preTokenGeneration.resources.lambda.functionArn,
};

backend.teamStatus.addEnvironment('API_TEAM_GRAPHQLAPIENDPOINTOUTPUT', backend.data.graphqlUrl);
backend.teamgetLogs.addEnvironment('API_TEAM_GRAPHQLAPIENDPOINTOUTPUT', backend.data.graphqlUrl);
backend.teamqueryLogs.addEnvironment('API_TEAM_GRAPHQLAPIENDPOINTOUTPUT', backend.data.graphqlUrl);
backend.teamgetUserPolicy.addEnvironment('POLICY_TABLE_NAME', backend.data.resources.tables['Eligibility'].tableName);

backend.data.resources.graphqlApi.grantQuery(teamStatusLambda)
backend.data.resources.graphqlApi.grantMutation(teamStatusLambda)

teamgetLogsLambda.addEventSource(new DynamoEventSource(backend.data.resources.tables['Sessions'], {
  startingPosition: lambda.StartingPosition.LATEST,
  batchSize: 10,
  retryAttempts: 3,
}));

backend.data.resources.tables['Settings'].grantReadData(teamNotificationsLambda);
backend.data.resources.tables['Sessions'].grantStreamRead(teamgetLogsLambda);
backend.data.resources.tables['Sessions'].grantWriteData(teamgetLogsLambda);
backend.data.resources.graphqlApi.grantMutation(teamgetLogsLambda);

// Get the environment name
const env = backend.stack.node.tryGetContext('env') || 'dev';
const customResourceStack = backend.createStack('CustomResources');

const snsNotificationTopic = createSnsNotificationTopic(customResourceStack);

// Create Step Functions with Lambda ARNs
const stepFunctions = createStepFunctions(
  customResourceStack,
  env,
  teamStatusLambda.functionArn,
  teamNotificationsLambda.functionArn
);

createLambdaTeamRouter(customResourceStack,
  env,
  backend.data.resources.tables,
  backend.auth.resources.userPool.userPoolId,
  stepFunctions.grantStateMachine.stateMachineArn,
  stepFunctions.revokeStateMachine.stateMachineArn,
  stepFunctions.rejectStateMachine.stateMachineArn,
  stepFunctions.scheduleStateMachine.stateMachineArn,
  stepFunctions.approvalStateMachine.stateMachineArn,
  snsNotificationTopic.topicArn,
  process.env.IDC_LOGIN_URL!,
  teamStatusLambda.functionArn,
  teamNotificationsLambda.functionArn,
  backend.data.graphqlUrl
);
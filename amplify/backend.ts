import * as iam from "aws-cdk-lib/aws-iam"
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
import { teamRouter } from './functions/teamRouter/resource';
import { teamStatus } from './functions/teamStatus/resource';
import { createSnsNotificationTopic } from './custom/sns/resource';
import { createStepFunctions } from './custom/stepfunctions/resource';

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
  teamRouter,
  teamStatus,
});

const userPool = backend.auth.resources.userPool;
const table = backend.data.resources.tables['Settings'];
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
const teamRouterLambda = backend.teamRouter.resources.lambda

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
    "organizations:DescribeOrganization"
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
    "sso:ListInstances"
  ],
  resources: ["*"],
})

const teamRouterPolicyStatement = new iam.PolicyStatement({
  actions: [
    "identitystore:ListUsers",
    "identitystore:GetUserId",
    "sso:ListInstances",
    "sso:DescribePermissionSet",
    "identitystore:ListGroupMembershipsForMember",
    "identitystore:ListGroupMemberships",
    "identitystore:DescribeUser",
    "organizations:Describe*",
    "organizations:List*"
  ],
  resources: ["*"],
})

preTokenGenerationLambda.addPermission('AllowCognitoInvokePreTokenGeneration', {
  principal: new iam.ServicePrincipal('cognito-idp.amazonaws.com'),
  sourceArn: userPool.userPoolArn,
});

//backend.teamgetAccounts.addEnvironment('ACCOUNT_ID', '123456')

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
teamRouterLambda.addToRolePolicy(teamRouterPolicyStatement)

backend.auth.resources.cfnResources.cfnUserPool.lambdaConfig = {
  preTokenGeneration: backend.preTokenGeneration.resources.lambda.functionArn,
};

// Get the environment name
const env = backend.stack.node.tryGetContext('env') || 'dev';
const customResourceStack = backend.createStack('CustomResources');

createSnsNotificationTopic(customResourceStack, env);

// Create Step Functions with Lambda ARNs
createStepFunctions(
  customResourceStack,
  env,
  backend.teamStatus.resources.lambda.functionArn,
  backend.teamNotifications.resources.lambda.functionArn
);
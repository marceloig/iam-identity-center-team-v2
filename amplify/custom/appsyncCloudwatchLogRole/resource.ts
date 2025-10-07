import { defineBackend } from '@aws-amplify/backend';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Stack } from 'aws-cdk-lib';

export function createAppsyncCloudwatchLogRole(stack: Stack, env: string) {
  const role = new iam.Role(stack, 'AppsyncCloudWatchRole', {
    roleName: `AppsyncCloudWatchRole-${env}`,
    assumedBy: new iam.ServicePrincipal('appsync.amazonaws.com'),
  });

  new iam.Policy(stack, 'AppsyncCloudWatchpolicy', {
    policyName: 'appsync-cloudwatch-policy',
    roles: [role],
    statements: [
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'logs:CreateLogGroup',
          'logs:CreateLogStream',
          'logs:PutLogEvents'
        ],
        resources: [`arn:aws:logs:${stack.region}:${stack.account}:log-group:/aws/appsync/apis/*`]
      })
    ]
  });

  return role;
}
import { Trigger } from 'aws-cdk-lib/triggers';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Stack } from 'aws-cdk-lib';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

export function createTrigger(stack: Stack, userPoolId: string) {
  const triggerFunction = new NodejsFunction(stack, 'IntegrationHandler', {
    runtime: Runtime.NODEJS_22_X,
    handler: 'handler',
    entry: './amplify/custom/triggers/integration/handler.ts',
    environment: {
      USER_POOL_ID: userPoolId,
      CALLBACK_URL: process.env.CALLBACK_URL || '',
    },
  });

  triggerFunction.addToRolePolicy(new PolicyStatement({
    actions: ['cognito-idp:*'],
    resources: [`arn:aws:cognito-idp:${stack.region}:${stack.account}:userpool/${userPoolId}`],
  }));

  new Trigger(stack, 'IntegrationTrigger', {
    handler: triggerFunction,
    executeAfter: [stack],

  });

  return triggerFunction;
}

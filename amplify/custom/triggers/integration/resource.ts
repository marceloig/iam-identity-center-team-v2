import { CustomResource, CfnOutput, Stack, Duration } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Provider } from 'aws-cdk-lib/custom-resources';

export function createTrigger(stack: Stack, userPoolId: string) {
  const triggerFunction = new NodejsFunction(stack, 'IntegrationHandler', {
    runtime: Runtime.NODEJS_22_X,
    handler: 'handler',
    entry: './amplify/custom/triggers/integration/handler.ts',
    timeout: Duration.minutes(5),
    environment: {
      USER_POOL_ID: userPoolId,
      CALLBACK_URL: process.env.CALLBACK_URL || '',
      SAML_METADATA_URL: process.env.SAML_METADATA_URL || '',
    },
  });

  triggerFunction.addToRolePolicy(new PolicyStatement({
    actions: ['cognito-idp:*'],
    resources: [`arn:aws:cognito-idp:${stack.region}:${stack.account}:userpool/${userPoolId}`],
  }));

  triggerFunction.addToRolePolicy(new PolicyStatement({
    actions: ['amplify:ListApps', 'amplify:ListDomainAssociations'],
    resources: [`arn:aws:amplify:${stack.region}:${stack.account}:apps/*`],
  }));

  const provider = new Provider(stack, 'IntegrationProvider', {
    onEventHandler: triggerFunction,
  });

  const customResource = new CustomResource(stack, 'IntegrationTrigger', {
    serviceToken: provider.serviceToken,
  });

  new CfnOutput(stack, 'applicationStartURL', {
    value: customResource.getAttString('applicationStartURL'),
    description: 'IAM Identity Center Application Start URL',
  });

  new CfnOutput(stack, 'applicationACSURL', {
    value: customResource.getAttString('applicationACSURL'),
    description: 'IAM Identity Center Application ACS URL',
  });

  new CfnOutput(stack, 'applicationSAMLAudience', {
    value: customResource.getAttString('applicationSAMLAudience'),
    description: 'IAM Identity Center Application SAML Audience',
  });

  return triggerFunction;
}

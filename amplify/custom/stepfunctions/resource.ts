import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { Stack, Duration } from 'aws-cdk-lib';
import * as stepfunctions from 'aws-cdk-lib/aws-stepfunctions';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as kms from 'aws-cdk-lib/aws-kms';
import { Fn } from 'aws-cdk-lib';

const aslDir = path.dirname(fileURLToPath(import.meta.url));

export function createStepFunctions(stack: Stack, env: string, teamStatusArn: string, teamNotificationsArn: string) {
  // KMS Key for Log Group
  const logGroupKey = new kms.Key(stack, 'LogGroupKey', {
    description: 'TEAM Stepfunction CloudwatchLog Key',
    enableKeyRotation: true,
    pendingWindow: Duration.days(20),
    policy: new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          principals: [new iam.AccountRootPrincipal()],
          actions: ['kms:*'],
          resources: ['*']
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          principals: [new iam.ServicePrincipal(`logs.${stack.region}.amazonaws.com`)],
          actions: [
            'kms:Encrypt*',
            'kms:Decrypt*',
            'kms:ReEncrypt*',
            'kms:GenerateDataKey*',
            'kms:Describe*'
          ],
          resources: ['*'],
          conditions: {
            ArnEquals: {
              'kms:EncryptionContext:aws:logs:arn': `arn:${stack.partition}:logs:${stack.region}:${stack.account}:log-group:/aws/stepfunction/team-step-function/${env}`
            }
          }
        })
      ]
    })
  });

  // Log Group
  const logGroup = new logs.LogGroup(stack, 'TEAMStateMachineLogGroup', {
    logGroupName: `/aws/stepfunction/team-step-function/${env}`,
    encryptionKey: logGroupKey,
    retention: logs.RetentionDays.TWO_WEEKS
  });

  // IAM Roles
  const grantRole = new iam.Role(stack, 'TEAMGrantSMRole', {
    assumedBy: new iam.ServicePrincipal('states.amazonaws.com'),
    inlinePolicies: {
      TEAMStepFunctionRolePolicy1: new iam.PolicyDocument({
        statements: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              'logs:CreateLogDelivery',
              'logs:GetLogDelivery',
              'logs:UpdateLogDelivery',
              'logs:DeleteLogDelivery',
              'logs:ListLogDeliveries',
              'logs:PutResourcePolicy',
              'logs:DescribeResourcePolicies',
              'logs:DescribeLogGroups'
            ],
            resources: ['*']
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              'events:PutTargets',
              'events:PutRule',
              'events:DescribeRule'
            ],
            resources: [`arn:${stack.partition}:events:${stack.region}:${stack.account}:rule/StepFunctionsGetEventsForStepFunctionsExecutionRule`]
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['lambda:InvokeFunction'],
            resources: [teamNotificationsArn]
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['sso:CreateAccountAssignment'],
            resources: ['*']
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['dynamodb:UpdateItem'],
            resources: [`arn:${stack.partition}:dynamodb:${stack.region}:${stack.account}:table/requests*`]
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              'iam:Get*',
              'iam:List*',
              'iam:CreateRole',
              'iam:DeleteRole',
              'iam:DetachRolePolicy',
              'iam:AttachRolePolicy',
              'iam:PutRolePolicy'
            ],
            resources: ['*']
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['lambda:InvokeFunction'],
            resources: [teamStatusArn]
          })
        ]
      })
    }
  });

  const revokeRole = new iam.Role(stack, 'TEAMRevokeSMRole', {
    assumedBy: new iam.ServicePrincipal('states.amazonaws.com'),
    inlinePolicies: {
      TEAMStepFunctionRolePolicy1: new iam.PolicyDocument({
        statements: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              'logs:CreateLogDelivery',
              'logs:GetLogDelivery',
              'logs:UpdateLogDelivery',
              'logs:DeleteLogDelivery',
              'logs:ListLogDeliveries',
              'logs:PutResourcePolicy',
              'logs:DescribeResourcePolicies',
              'logs:DescribeLogGroups'
            ],
            resources: ['*']
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['ses:SendEmail'],
            resources: ['*']
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['sns:Publish'],
            resources: [Fn.importValue('NotificationTopicArn')]
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['lambda:InvokeFunction'],
            resources: [teamNotificationsArn]
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['sso:DeleteAccountAssignment'],
            resources: ['*']
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['dynamodb:UpdateItem', 'dynamodb:GetItem'],
            resources: [`arn:${stack.partition}:dynamodb:${stack.region}:${stack.account}:table/requests*`]
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              'iam:Get*',
              'iam:List*',
              'iam:CreateRole',
              'iam:DeleteRole',
              'iam:DetachRolePolicy'
            ],
            resources: ['*']
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['lambda:InvokeFunction'],
            resources: [teamStatusArn]
          })
        ]
      })
    }
  });

  const scheduleRole = new iam.Role(stack, 'TEAMScheduleSMRole', {
    assumedBy: new iam.ServicePrincipal('states.amazonaws.com'),
    inlinePolicies: {
      TEAMStepFunctionRolePolicy1: new iam.PolicyDocument({
        statements: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              'logs:CreateLogDelivery',
              'logs:GetLogDelivery',
              'logs:UpdateLogDelivery',
              'logs:DeleteLogDelivery',
              'logs:ListLogDeliveries',
              'logs:PutResourcePolicy',
              'logs:DescribeResourcePolicies',
              'logs:DescribeLogGroups'
            ],
            resources: ['*']
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              'events:PutTargets',
              'events:PutRule',
              'events:DescribeRule'
            ],
            resources: [`arn:${stack.partition}:events:${stack.region}:${stack.account}:rule/StepFunctionsGetEventsForStepFunctionsExecutionRule`]
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['ses:SendEmail'],
            resources: ['*']
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['sns:Publish'],
            resources: [Fn.importValue('NotificationTopicArn')]
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['lambda:InvokeFunction'],
            resources: [teamNotificationsArn, teamStatusArn]
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['dynamodb:UpdateItem', 'dynamodb:GetItem'],
            resources: [`arn:${stack.partition}:dynamodb:${stack.region}:${stack.account}:table/requests*`]
          })
        ]
      })
    }
  });

  const approveRole = new iam.Role(stack, 'TEAMApproveSMRole', {
    assumedBy: new iam.ServicePrincipal('states.amazonaws.com'),
    inlinePolicies: {
      TEAMStepFunctionRolePolicy1: new iam.PolicyDocument({
        statements: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              'logs:CreateLogDelivery',
              'logs:GetLogDelivery',
              'logs:UpdateLogDelivery',
              'logs:DeleteLogDelivery',
              'logs:ListLogDeliveries',
              'logs:PutResourcePolicy',
              'logs:DescribeResourcePolicies',
              'logs:DescribeLogGroups'
            ],
            resources: ['*']
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['ses:SendEmail'],
            resources: ['*']
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['sns:Publish'],
            resources: [Fn.importValue('NotificationTopicArn')]
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['lambda:InvokeFunction'],
            resources: [teamNotificationsArn, teamStatusArn]
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['dynamodb:UpdateItem', 'dynamodb:GetItem'],
            resources: [`arn:${stack.partition}:dynamodb:${stack.region}:${stack.account}:table/requests*`]
          })
        ]
      })
    }
  });

  const rejectRole = new iam.Role(stack, 'TEAMRejectSMRole', {
    assumedBy: new iam.ServicePrincipal('states.amazonaws.com'),
    inlinePolicies: {
      TEAMStepFunctionRolePolicy1: new iam.PolicyDocument({
        statements: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              'logs:CreateLogDelivery',
              'logs:GetLogDelivery',
              'logs:UpdateLogDelivery',
              'logs:DeleteLogDelivery',
              'logs:ListLogDeliveries',
              'logs:PutResourcePolicy',
              'logs:DescribeResourcePolicies',
              'logs:DescribeLogGroups'
            ],
            resources: ['*']
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['ses:SendEmail'],
            resources: ['*']
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['sns:Publish'],
            resources: [Fn.importValue('NotificationTopicArn')]
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['lambda:InvokeFunction'],
            resources: [teamNotificationsArn, teamStatusArn]
          })
        ]
      })
    }
  });

  // State Machines with full definitions
  const grantStateMachine = new stepfunctions.StateMachine(stack, 'GrantStateMachine', {
    role: grantRole,
    definitionBody: stepfunctions.DefinitionBody.fromFile(path.join(aslDir, "grantStateMachine.json")),
    logs: {
      destination: logGroup,
      level: stepfunctions.LogLevel.ALL,
    },
    tracingEnabled: true,
  });

  const revokeStateMachine = new stepfunctions.StateMachine(stack, 'RevokeStateMachine', {
    role: revokeRole,
    definitionBody: stepfunctions.DefinitionBody.fromFile(path.join(aslDir, "revokeStateMachine.json")),
    logs: {
      destination: logGroup,
      level: stepfunctions.LogLevel.ALL,
    },
    tracingEnabled: true,
  });

  revokeStateMachine.grantStartExecution(grantRole);

  grantStateMachine.grantStartExecution(scheduleRole);

  // Schedule State Machine
  const scheduleStateMachine = new stepfunctions.StateMachine(stack, 'ScheduleStateMachine', {
    role: scheduleRole,
    definitionBody: stepfunctions.DefinitionBody.fromFile(path.join(aslDir, "scheduleStateMachine.json")),
    logs: {
      destination: logGroup,
      level: stepfunctions.LogLevel.ALL,
    },
    tracingEnabled: true,
  });

  // Approval State Machine
  const approvalStateMachine = new stepfunctions.StateMachine(stack, 'ApprovalStateMachine', {
    role: approveRole,
    definitionBody: stepfunctions.DefinitionBody.fromFile(path.join(aslDir, "approvalStateMachine.json")),
    logs: {
      destination: logGroup,
      level: stepfunctions.LogLevel.ALL,
    },
    tracingEnabled: true,
  });

  // Reject State Machine
  const rejectStateMachine = new stepfunctions.StateMachine(stack, 'RejectStateMachine', {
    role: rejectRole,
    definitionBody: stepfunctions.DefinitionBody.fromFile(path.join(aslDir, "rejectStateMachine.json")),
    logs: {
      destination: logGroup,
      level: stepfunctions.LogLevel.ALL,
    },
  });

  return {
    grantStateMachine,
    revokeStateMachine,
    scheduleStateMachine,
    approvalStateMachine,
    rejectStateMachine,
    logGroup
  };
}
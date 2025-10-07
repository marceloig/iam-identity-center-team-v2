import { Stack, Duration, CfnOutput } from 'aws-cdk-lib';
import * as stepfunctions from 'aws-cdk-lib/aws-stepfunctions';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as kms from 'aws-cdk-lib/aws-kms';
import { Fn } from 'aws-cdk-lib';

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
  const grantStateMachine = new stepfunctions.CfnStateMachine(stack, 'GrantStateMachine', {
    stateMachineName: `TEAM-Grant-SM-${env}`,
    roleArn: grantRole.roleArn,
    definition: {
      Comment: 'Temporary Elevated Access Management - Grant state machine',
      StartAt: 'Grant Permission',
      States: {
        'Grant Permission': {
          Type: 'Task',
          Resource: 'arn:aws:states:::aws-sdk:ssoadmin:createAccountAssignment',
          Parameters: {
            'InstanceArn.$': '$.instanceARN',
            'PermissionSetArn.$': '$.roleId',
            'PrincipalId.$': '$.userId',
            'PrincipalType': 'USER',
            'TargetId.$': '$.accountId',
            'TargetType': 'AWS_ACCOUNT'
          },
          ResultPath: '$.grant',
          Retry: [{
            ErrorEquals: ['SsoAdmin.ThrottlingException', 'ThrottlingException', 'ServiceUnavailable', 'InternalServerError'],
            IntervalSeconds: 3,
            BackoffRate: 2,
            MaxAttempts: 5
          }],
          Catch: [{
            ErrorEquals: ['States.ALL'],
            Next: 'Update Request Status - in progress',
            ResultPath: '$.statusError'
          }],
          Next: 'Update Request Status - in progress'
        },
        'Update Request Status - in progress': {
          Type: 'Task',
          Resource: 'arn:aws:states:::lambda:invoke',
          Parameters: {
            'FunctionName.$': '$.fn_teamstatus_arn',
            'Payload.$': '$'
          },
          ResultPath: '$.lastTaskResult',
          Retry: [{
            BackoffRate: 2,
            ErrorEquals: ['Lambda.ServiceException', 'Lambda.AWSLambdaException', 'Lambda.SdkClientException', 'Lambda.TooManyRequestsException'],
            IntervalSeconds: 2,
            MaxAttempts: 6
          }],
          Next: 'DynamoDB UpdateStartTime'
        },
        'DynamoDB UpdateStartTime': {
          Type: 'Task',
          Resource: 'arn:aws:states:::dynamodb:updateItem',
          Parameters: {
            ExpressionAttributeValues: {
              ':time': {
                'S.$': '$$.State.EnteredTime'
              }
            },
            Key: {
              id: {
                'S.$': '$.id'
              }
            },
            'TableName.$': '$.requests_table',
            UpdateExpression: 'SET startTime = :time'
          },
          ResultPath: '$.lastTaskResult',
          Next: 'Grant Error?'
        },
        'Grant Error?': {
          Type: 'Choice',
          Choices: [{
            Variable: '$.statusError',
            IsPresent: true,
            Next: 'Notify Error'
          }],
          Default: 'Notify Started'
        },
        'Notify Error': {
          Type: 'Task',
          Resource: 'arn:aws:states:::lambda:invoke',
          Parameters: {
            'FunctionName.$': '$.fn_teamnotifications_arn',
            'Payload.$': '$'
          },
          ResultPath: '$.lastTaskResult',
          Retry: [{
            BackoffRate: 2,
            ErrorEquals: ['Lambda.ServiceException', 'Lambda.AWSLambdaException', 'Lambda.SdkClientException', 'Lambda.TooManyRequestsException'],
            IntervalSeconds: 2,
            MaxAttempts: 6
          }],
          End: true
        },
        'Notify Started': {
          Type: 'Task',
          Resource: 'arn:aws:states:::lambda:invoke',
          Parameters: {
            'FunctionName.$': '$.fn_teamnotifications_arn',
            'Payload.$': '$'
          },
          ResultPath: '$.lastTaskResult',
          Retry: [{
            BackoffRate: 2,
            ErrorEquals: ['Lambda.ServiceException', 'Lambda.AWSLambdaException', 'Lambda.SdkClientException', 'Lambda.TooManyRequestsException'],
            IntervalSeconds: 2,
            MaxAttempts: 6
          }],
          Catch: [{
            ErrorEquals: ['States.ALL'],
            Next: 'Wait',
            ResultPath: '$.error'
          }],
          Next: 'Wait'
        },
        'Wait': {
          Type: 'Wait',
          'SecondsPath': '$.duration',
          Next: 'Revoke Permission'
        },
        'Revoke Permission': {
          Type: 'Task',
          Resource: 'arn:aws:states:::states:startExecution',
          Parameters: {
            'Input.$': '$',
            'StateMachineArn.$': '$.revoke_sm'
          },
          End: true
        }
      }
    },
    loggingConfiguration: {
      destinations: [{
        cloudWatchLogsLogGroup: {
          logGroupArn: logGroup.logGroupArn
        }
      }],
      includeExecutionData: true,
      level: 'ALL'
    },
    tracingConfiguration: {
      enabled: true
    }
  });

  const revokeStateMachine = new stepfunctions.CfnStateMachine(stack, 'RevokeStateMachine', {
    stateMachineName: `TEAM-Revoke-SM-${env}`,
    roleArn: revokeRole.roleArn,
    definition: {
      Comment: 'Temporary Elevated Access Management - Revoke state machine',
      StartAt: 'DynamoDB GetStatus',
      States: {
        'DynamoDB GetStatus': {
          Type: 'Task',
          Resource: 'arn:aws:states:::dynamodb:getItem',
          Parameters: {
            Key: {
              id: {
                'S.$': '$.id'
              }
            },
            'TableName.$': '$.requests_table'
          },
          ResultPath: '$.data',
          Next: 'Revoked?'
        },
        'Revoked?': {
          Type: 'Choice',
          Choices: [{
            And: [{
              Variable: '$.data.Item.status.S ',
              StringEquals: 'revoked'
            }, {
              Variable: '$.result',
              IsPresent: true
            }],
            Next: 'Pass'
          }],
          Default: 'Revoke Permission'
        },
        'Revoke Permission': {
          Type: 'Task',
          Resource: 'arn:aws:states:::aws-sdk:ssoadmin:deleteAccountAssignment',
          Parameters: {
            'InstanceArn.$': '$.instanceARN',
            'PermissionSetArn.$': '$.roleId',
            'PrincipalId.$': '$.userId',
            'PrincipalType': 'USER',
            'TargetId.$': '$.accountId',
            'TargetType': 'AWS_ACCOUNT'
          },
          ResultPath: '$.revoke',
          Retry: [{
            ErrorEquals: ['SsoAdmin.ThrottlingException', 'ThrottlingException', 'ServiceUnavailable', 'InternalServerError'],
            IntervalSeconds: 3,
            BackoffRate: 2,
            MaxAttempts: 5
          }],
          Catch: [{
            ErrorEquals: ['States.ALL'],
            Next: 'Update Request Status',
            ResultPath: '$.statusError'
          }],
          Next: 'Notify Requester Session Ended'
        },
        'Notify Requester Session Ended': {
          Type: 'Task',
          Resource: 'arn:aws:states:::lambda:invoke',
          Parameters: {
            'FunctionName.$': '$.fn_teamnotifications_arn',
            'Payload.$': '$'
          },
          ResultPath: '$.lastTaskResult',
          Retry: [{
            BackoffRate: 2,
            ErrorEquals: ['Lambda.ServiceException', 'Lambda.AWSLambdaException', 'Lambda.SdkClientException', 'Lambda.TooManyRequestsException'],
            IntervalSeconds: 2,
            MaxAttempts: 6
          }],
          Catch: [{
            ErrorEquals: ['States.ALL'],
            Next: 'Revoked || Ended ?',
            ResultPath: '$.error'
          }],
          Next: 'Revoked || Ended ?'
        },
        'Revoked || Ended ?': {
          Type: 'Choice',
          Choices: [{
            Variable: '$.data.Item.status.S',
            StringEquals: 'revoked',
            Next: 'DynamoDB Update EndTime'
          }],
          Default: 'Update Request Status'
        },
        'Update Request Status': {
          Type: 'Task',
          Resource: 'arn:aws:states:::lambda:invoke',
          Parameters: {
            'FunctionName.$': '$.fn_teamstatus_arn',
            'Payload.$': '$'
          },
          ResultPath: '$.lastTaskResult',
          Retry: [{
            BackoffRate: 2,
            ErrorEquals: ['Lambda.ServiceException', 'Lambda.AWSLambdaException', 'Lambda.SdkClientException', 'Lambda.TooManyRequestsException'],
            IntervalSeconds: 2,
            MaxAttempts: 6
          }],
          Next: 'Revoke Error?'
        },
        'Revoke Error?': {
          Type: 'Choice',
          Choices: [{
            Variable: '$.statusError',
            IsPresent: true,
            Next: 'Notify Error'
          }],
          Default: 'DynamoDB Update EndTime'
        },
        'Notify Error': {
          Type: 'Task',
          Resource: 'arn:aws:states:::lambda:invoke',
          Parameters: {
            'FunctionName.$': '$.fn_teamnotifications_arn',
            'Payload.$': '$'
          },
          ResultPath: '$.lastTaskResult',
          Retry: [{
            BackoffRate: 2,
            ErrorEquals: ['Lambda.ServiceException', 'Lambda.AWSLambdaException', 'Lambda.SdkClientException', 'Lambda.TooManyRequestsException'],
            IntervalSeconds: 2,
            MaxAttempts: 6
          }],
          End: true
        },
        'DynamoDB Update EndTime': {
          Type: 'Task',
          Resource: 'arn:aws:states:::dynamodb:updateItem',
          Parameters: {
            ExpressionAttributeValues: {
              ':time': {
                'S.$': '$$.State.EnteredTime'
              }
            },
            Key: {
              id: {
                'S.$': '$.id'
              }
            },
            'TableName.$': '$.requests_table',
            UpdateExpression: 'SET endTime = :time'
          },
          End: true
        },
        'Pass': {
          Type: 'Pass',
          End: true
        }
      }
    },
    loggingConfiguration: {
      destinations: [{
        cloudWatchLogsLogGroup: {
          logGroupArn: logGroup.logGroupArn
        }
      }],
      includeExecutionData: true,
      level: 'ALL'
    },
    tracingConfiguration: {
      enabled: true
    }
  });

  // Add states:StartExecution permission to grant role for revoke state machine
  grantRole.addToPolicy(new iam.PolicyStatement({
    effect: iam.Effect.ALLOW,
    actions: ['states:StartExecution'],
    resources: [revokeStateMachine.attrArn]
  }));

  // Add states:StartExecution permission to schedule role for grant state machine
  scheduleRole.addToPolicy(new iam.PolicyStatement({
    effect: iam.Effect.ALLOW,
    actions: ['states:StartExecution'],
    resources: [grantStateMachine.attrArn]
  }));

  // Schedule State Machine
  const scheduleStateMachine = new stepfunctions.CfnStateMachine(stack, 'ScheduleStateMachine', {
    stateMachineName: `TEAM-Schedule-SM-${env}`,
    roleArn: scheduleRole.roleArn,
    definition: {
      Comment: 'Temporary Elevated Access Management - Schedule state machine',
      StartAt: 'Update Request Status - scheduled',
      States: {
        'Update Request Status - scheduled': {
          Type: 'Task',
          Resource: 'arn:aws:states:::lambda:invoke',
          Parameters: {
            'FunctionName.$': '$.fn_teamstatus_arn',
            'Payload.$': '$'
          },
          ResultPath: '$.lastTaskResult',
          Retry: [{
            BackoffRate: 2,
            ErrorEquals: ['Lambda.ServiceException', 'Lambda.AWSLambdaException', 'Lambda.SdkClientException', 'Lambda.TooManyRequestsException'],
            IntervalSeconds: 2,
            MaxAttempts: 6
          }],
          Next: 'Notify Requester Scheduled'
        },
        'Notify Requester Scheduled': {
          Type: 'Task',
          Resource: 'arn:aws:states:::lambda:invoke',
          Parameters: {
            'FunctionName.$': '$.fn_teamnotifications_arn',
            'Payload.$': '$'
          },
          ResultPath: '$.lastTaskResult',
          Retry: [{
            BackoffRate: 2,
            ErrorEquals: ['Lambda.ServiceException', 'Lambda.AWSLambdaException', 'Lambda.SdkClientException', 'Lambda.TooManyRequestsException'],
            IntervalSeconds: 2,
            MaxAttempts: 6
          }],
          Catch: [{
            ErrorEquals: ['States.ALL'],
            Next: 'Schedule',
            ResultPath: '$.error'
          }],
          Next: 'Schedule'
        },
        'Schedule': {
          Type: 'Wait',
          'TimestampPath': '$.startTime',
          Next: 'DynamoDB GetStatus'
        },
        'DynamoDB GetStatus': {
          Type: 'Task',
          Resource: 'arn:aws:states:::dynamodb:getItem',
          Parameters: {
            Key: {
              id: {
                'S.$': '$.id'
              }
            },
            'TableName.$': '$.requests_table'
          },
          ResultPath: '$.result',
          Next: 'Scheduled?'
        },
        'Scheduled?': {
          Type: 'Choice',
          Choices: [{
            Variable: '$.result.Item.status.S',
            StringEquals: 'scheduled',
            Next: 'Grant Permission'
          }],
          Default: 'Pass'
        },
        'Grant Permission': {
          Type: 'Task',
          Resource: 'arn:aws:states:::states:startExecution',
          Parameters: {
            'Input.$': '$',
            'StateMachineArn.$': '$.grant_sm'
          },
          End: true
        },
        'Pass': {
          Type: 'Pass',
          End: true
        }
      }
    },
    loggingConfiguration: {
      destinations: [{
        cloudWatchLogsLogGroup: {
          logGroupArn: logGroup.logGroupArn
        }
      }],
      includeExecutionData: true,
      level: 'ALL'
    },
    tracingConfiguration: {
      enabled: true
    }
  });

  // Approval State Machine
  const approvalStateMachine = new stepfunctions.CfnStateMachine(stack, 'ApprovalStateMachine', {
    stateMachineName: `TEAM-Approval-SM-${env}`,
    roleArn: approveRole.roleArn,
    definition: {
      Comment: 'Temporary Elevated Access Management - Approval state machine',
      StartAt: 'Notify Approvers Pending',
      States: {
        'Notify Approvers Pending': {
          Type: 'Task',
          Resource: 'arn:aws:states:::lambda:invoke',
          Parameters: {
            'FunctionName.$': '$.fn_teamnotifications_arn',
            'Payload.$': '$'
          },
          ResultPath: '$.lastTaskResult',
          Catch: [{
            ErrorEquals: ['States.ALL'],
            Next: 'Wait',
            ResultPath: '$.error'
          }],
          Next: 'Wait'
        },
        'Wait': {
          Type: 'Wait',
          'SecondsPath': '$.expire',
          Next: 'DynamoDB GetStatus'
        },
        'DynamoDB GetStatus': {
          Type: 'Task',
          Resource: 'arn:aws:states:::dynamodb:getItem',
          Parameters: {
            Key: {
              id: {
                'S.$': '$.id'
              }
            },
            'TableName.$': '$.requests_table'
          },
          ResultPath: '$.result',
          Next: 'Pending?'
        },
        'Pending?': {
          Type: 'Choice',
          Choices: [{
            Variable: '$.result.Item.status.S',
            StringEquals: 'pending',
            Next: 'Update Request Status'
          }],
          Default: 'Pass'
        },
        'Update Request Status': {
          Type: 'Task',
          Resource: 'arn:aws:states:::lambda:invoke',
          Parameters: {
            'FunctionName.$': '$.fn_teamstatus_arn',
            'Payload.$': '$'
          },
          ResultPath: '$.Payload',
          Retry: [{
            BackoffRate: 2,
            ErrorEquals: ['Lambda.ServiceException', 'Lambda.AWSLambdaException', 'Lambda.SdkClientException', 'Lambda.TooManyRequestsException'],
            IntervalSeconds: 2,
            MaxAttempts: 6
          }],
          Next: 'Notify Requester Expired'
        },
        'Notify Requester Expired': {
          Type: 'Task',
          Resource: 'arn:aws:states:::lambda:invoke',
          Parameters: {
            'FunctionName.$': '$.fn_teamnotifications_arn',
            'Payload.$': '$'
          },
          ResultPath: '$.lastTaskResult',
          Catch: [{
            ErrorEquals: ['States.ALL'],
            Next: 'Pass',
            ResultPath: '$.error'
          }],
          End: true
        },
        'Pass': {
          Type: 'Pass',
          End: true
        }
      }
    },
    loggingConfiguration: {
      destinations: [{
        cloudWatchLogsLogGroup: {
          logGroupArn: logGroup.logGroupArn
        }
      }],
      includeExecutionData: true,
      level: 'ALL'
    },
    tracingConfiguration: {
      enabled: true
    }
  });

  // Reject State Machine
  const rejectStateMachine = new stepfunctions.CfnStateMachine(stack, 'RejectStateMachine', {
    stateMachineName: `TEAM-Reject-SM-${env}`,
    roleArn: rejectRole.roleArn,
    definition: {
      Comment: 'Temporary Elevated Access Management - Reject state machine',
      StartAt: 'Status?',
      States: {
        'Status?': {
          Type: 'Choice',
          Choices: [{
            Variable: '$.status',
            StringEquals: 'cancelled',
            Next: 'Notify Requester Cancelled'
          }, {
            Variable: '$.status',
            StringEquals: 'rejected',
            Next: 'Notify Requester Rejected'
          }]
        },
        'Notify Requester Cancelled': {
          Type: 'Task',
          Resource: 'arn:aws:states:::lambda:invoke',
          Parameters: {
            'FunctionName.$': '$.fn_teamnotifications_arn',
            'Payload.$': '$'
          },
          ResultPath: '$.lastTaskResult',
          Retry: [{
            BackoffRate: 2,
            ErrorEquals: ['Lambda.ServiceException', 'Lambda.AWSLambdaException', 'Lambda.SdkClientException', 'Lambda.TooManyRequestsException'],
            IntervalSeconds: 2,
            MaxAttempts: 6
          }],
          Catch: [{
            ErrorEquals: ['States.ALL'],
            Next: 'Success',
            ResultPath: '$.error'
          }],
          Next: 'Success'
        },
        'Notify Requester Rejected': {
          Type: 'Task',
          Resource: 'arn:aws:states:::lambda:invoke',
          Parameters: {
            'FunctionName.$': '$.fn_teamnotifications_arn',
            'Payload.$': '$'
          },
          ResultPath: '$.lastTaskResult',
          Retry: [{
            BackoffRate: 2,
            ErrorEquals: ['Lambda.ServiceException', 'Lambda.AWSLambdaException', 'Lambda.SdkClientException', 'Lambda.TooManyRequestsException'],
            IntervalSeconds: 2,
            MaxAttempts: 6
          }],
          Catch: [{
            ErrorEquals: ['States.ALL'],
            Next: 'Success',
            ResultPath: '$.error'
          }],
          Next: 'Success'
        },
        'Success': {
          Type: 'Succeed'
        }
      }
    },
    loggingConfiguration: {
      destinations: [{
        cloudWatchLogsLogGroup: {
          logGroupArn: logGroup.logGroupArn
        }
      }],
      includeExecutionData: true,
      level: 'ALL'
    },
    tracingConfiguration: {
      enabled: true
    }
  });

  // Outputs
  new CfnOutput(stack, 'GrantSMOutput', {
    description: 'TEAM Grant StateMachine',
    value: grantStateMachine.ref
  });

  new CfnOutput(stack, 'RevokeSMOutput', {
    description: 'TEAM Revoke StateMachine',
    value: revokeStateMachine.ref
  });

  new CfnOutput(stack, 'RejectSMOutput', {
    description: 'TEAM Reject StateMachine',
    value: rejectStateMachine.ref
  });

  new CfnOutput(stack, 'ScheduleSMOutput', {
    description: 'TEAM Schedule StateMachine',
    value: scheduleStateMachine.ref
  });

  new CfnOutput(stack, 'ApprovalSMOutput', {
    description: 'TEAM Approval StateMachine',
    value: approvalStateMachine.ref
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
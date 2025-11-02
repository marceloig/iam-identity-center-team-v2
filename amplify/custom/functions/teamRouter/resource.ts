import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { DockerImage, Duration } from "aws-cdk-lib";
import { Stack } from 'aws-cdk-lib';
import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import * as iam from "aws-cdk-lib/aws-iam"
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import * as lambda from 'aws-cdk-lib/aws-lambda';

const functionDir = path.dirname(fileURLToPath(import.meta.url));

export function createLambdaTeamRouter(stack: Stack,
    env: string,
    tables: Record<string, ITable>,
    userPoolId: string,
    grantStateMachineName: string,
    revokeStateMachineName: string,
    rejectStateMachineName: string,
    scheduleStateMachineName: string,
    approvalStateMachineName: string,
    notificationTopicArn: string,
    ssoLoginUrl: string,
    fnTeamStatusArn: string,
    fnTeamNotificationsArn: string,
    graphqlUrl: string,
) {
    const teamRouter = new Function(stack, "teamRouter", {
        handler: "src/index.handler",
        runtime: Runtime.PYTHON_3_13, // or any other python version
        timeout: Duration.seconds(20), //  default is 3 seconds
        environment: {
            POLICY_TABLE_NAME: tables['Eligibility'].tableName,
            SETTINGS_TABLE_NAME: tables['Settings'].tableName,
            APPROVER_TABLE_NAME: tables['Approvers'].tableName,
            REQUESTS_TABLE_NAME: tables['Requests'].tableName,
            AUTH_TEAM06DBB7FC_USERPOOLID: userPoolId,
            GRANT_SM: grantStateMachineName,
            REVOKE_SM: revokeStateMachineName,
            REJECT_SM: rejectStateMachineName,
            SCHEDULE_SM: scheduleStateMachineName,
            APPROVAL_SM: approvalStateMachineName,
            NOTIFICATION_TOPIC_ARN: notificationTopicArn,
            SSO_LOGIN_URL: ssoLoginUrl,
            FN_TEAMSTATUS_ARN: fnTeamStatusArn,
            FN_TEAMNOTIFICATIONS_ARN: fnTeamNotificationsArn,
            API_TEAM_GRAPHQLAPIENDPOINTOUTPUT: graphqlUrl,
        },
        code: Code.fromAsset(functionDir, {
            bundling: {
                image: DockerImage.fromRegistry("dummy"), // replace with desired image from AWS ECR Public Gallery
                local: {
                    tryBundle(outputDir: string) {
                        execSync(
                            `python3 -m pip install -r ${path.join(functionDir, "requirements.txt")} -t ${path.join(outputDir)} --platform manylinux2014_x86_64 --only-binary=:all:`
                        );
                        execSync(`cp -r ${functionDir}/* ${path.join(outputDir)}`);
                        return true;
                    },
                },
            },
        }),
    })

    tables['Requests'].grantStreamRead(teamRouter);
    tables['Eligibility'].grantReadData(teamRouter);
    tables['Approvers'].grantReadData(teamRouter);
    tables['Settings'].grantReadData(teamRouter);

    teamRouter.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        "identitystore:ListUsers",
        "identitystore:GetUserId",
        "sso:ListInstances",
        "sso:DescribePermissionSet",
        "identitystore:ListGroupMembershipsForMember",
        "identitystore:ListGroupMemberships",
        "identitystore:DescribeUser",
        "organizations:Describe*",
        "organizations:List*",
        "cognito-idp:ListUsers",
        "appsync:GraphQL",
        "states:StartExecution"
      ],
      resources: ["*"],
    }));
    
    teamRouter.addEventSource(new DynamoEventSource(tables['Requests'], {
      startingPosition: lambda.StartingPosition.LATEST,
      batchSize: 10,
      retryAttempts: 3,
    }));

    return teamRouter;
}
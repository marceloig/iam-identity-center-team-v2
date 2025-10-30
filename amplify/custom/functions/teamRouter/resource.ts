import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { DockerImage, Duration } from "aws-cdk-lib";
import { Stack } from 'aws-cdk-lib';
import { ITable } from 'aws-cdk-lib/aws-dynamodb';

const functionDir = path.dirname(fileURLToPath(import.meta.url));

export function createLambdaTeamRouter(stack: Stack, env: string, tables: Record<string, ITable>) {
    const lambda = new Function(stack, "teamRouter", {
        handler: "src/index.handler",
        runtime: Runtime.PYTHON_3_13, // or any other python version
        timeout: Duration.seconds(20), //  default is 3 seconds
        environment: {
            POLICY_TABLE_NAME: tables['Eligibility'].tableName,
            SETTINGS_TABLE_NAME: tables['Settings'].tableName,
            APPROVER_TABLE_NAME: tables['Approvers'].tableName,
            REQUESTS_TABLE_NAME: tables['Requests'].tableName,
            AUTH_TEAM06DBB7FC_USERPOOLID: ``,
            GRANT_SM: ``,
            REVOKE_SM: ``,
            REJECT_SM: ``,
            SCHEDULE_SM: ``,
            APPROVAL_SM: ``,
            NOTIFICATION_TOPIC_ARN: ``,
            SSO_LOGIN_URL: ``,
            FN_TEAMSTATUS_ARN: ``,
            FN_TEAMNOTIFICATIONS_ARN: ``,
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

    tables['Requests'].grantStreamRead(lambda);
    tables['Eligibility'].grantReadData(lambda);
    tables['Settings'].grantReadData(lambda);
    tables['Approvers'].grantReadData(lambda);

    return lambda;
}
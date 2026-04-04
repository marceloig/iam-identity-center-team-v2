import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { defineFunction } from "@aws-amplify/backend";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { Duration } from "aws-cdk-lib";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

const functionDir = path.dirname(fileURLToPath(import.meta.url));

export const teamgetLogs = defineFunction(
    (scope) =>
        new NodejsFunction(scope, "teamgetLogs", {
            entry: path.join(functionDir, "src", "index.js"),
            handler: "handler",
            runtime: Runtime.NODEJS_22_X,
            timeout: Duration.seconds(20),
            environment: {
                REGION: process.env.REGION!,
                CW_LOG_GROUP_NAME: process.env.CW_LOG_GROUP_NAME!,
                API_TEAM_GRAPHQLAPIENDPOINTOUTPUT: "localhost",
            },
        }),{
            resourceGroupName: "data"
        }
);
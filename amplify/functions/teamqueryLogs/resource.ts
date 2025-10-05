import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { defineFunction } from "@aws-amplify/backend";
import { Duration } from "aws-cdk-lib";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

const functionDir = path.dirname(fileURLToPath(import.meta.url));

export const teamqueryLogs = defineFunction(
    (scope) =>
        new NodejsFunction(scope, "teamqueryLogs", {
            entry: path.join(functionDir, "src", "index.js"),
            handler: "handler",
            runtime: Runtime.NODEJS_22_X,
            timeout: Duration.seconds(20),
        }),
);
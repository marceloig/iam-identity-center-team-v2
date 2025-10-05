import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { defineFunction } from "@aws-amplify/backend";
import { Duration } from "aws-cdk-lib";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";

const functionDir = path.dirname(fileURLToPath(import.meta.url));

export const teamGetPermissionSets = defineFunction(
    (scope) =>
        new Function(scope, "teamGetPermissionSets", {
            handler: "src/index.handler",
            runtime: Runtime.PYTHON_3_13, // or any other python version
            timeout: Duration.seconds(20), //  default is 3 seconds
            code: Code.fromAsset(functionDir, {
                bundling: {
                    image: Runtime.PYTHON_3_13.bundlingImage,
                    command: [
                        'bash', '-c',
                        'pip install -r requirements.txt -t /asset-output && cp -au . /asset-output'
                    ],
                },
            }),
        }),
);
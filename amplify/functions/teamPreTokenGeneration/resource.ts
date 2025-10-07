import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { defineFunction } from "@aws-amplify/backend";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { DockerImage, Duration } from "aws-cdk-lib";

const functionDir = path.dirname(fileURLToPath(import.meta.url));

export const teamPreTokenGenerationHandler = defineFunction(
  (scope) =>
    new Function(scope, "teamPreTokenGeneration", {
      handler: "src/index.handler",
      runtime: Runtime.PYTHON_3_13, // or any other python version
      timeout: Duration.seconds(20), //  default is 3 seconds
      environment: {
        TEAM_ADMIN_GROUP: "TeamAdmins",
        TEAM_AUDITOR_GROUP: "TeamMembers",
        SETTINGS_TABLE_NAME: "replace-with-your-settings-table-name",
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
    }),
);
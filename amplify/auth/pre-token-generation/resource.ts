import { defineFunction, secret } from '@aws-amplify/backend';
import * as iam from "aws-cdk-lib/aws-iam"

export const preTokenGeneration = defineFunction({
  name: 'pre-token-generation',
  environment: {
    TEAM_ADMIN_GROUP: secret('TEAM_ADMIN_GROUP'),
    TEAM_AUDITOR_GROUP: secret('TEAM_AUDITOR_GROUP'),
    SETTINGS_TABLE_NAME: secret('SETTINGS_TABLE_NAME'), // Will be set in backend.ts
  },
  resourceGroupName: 'auth',
});
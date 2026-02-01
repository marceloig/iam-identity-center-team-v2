import { defineFunction } from '@aws-amplify/backend';

export const preTokenGeneration = defineFunction({
  name: 'pre-token-generation',
  environment: {
    TEAM_ADMIN_GROUP: process.env.TEAM_ADMIN_GROUP || '',
    TEAM_AUDITOR_GROUP: process.env.TEAM_AUDITOR_GROUP || '',
    SSM_SETTINGS_TABLE_NAME: '', // Will be set by execution backend.ts
  },
  resourceGroupName: 'auth',
});
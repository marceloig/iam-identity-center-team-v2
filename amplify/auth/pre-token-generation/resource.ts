import { defineFunction } from '@aws-amplify/backend';

export const preTokenGeneration = defineFunction({
  name: 'pre-token-generation',
  environment: {
    TEAM_ADMIN_GROUP: process.env.TEAM_ADMIN_GROUP || '',
    TEAM_AUDITOR_GROUP: process.env.TEAM_AUDITOR_GROUP || '',
    SETTINGS_TABLE_NAME: process.env.SETTINGS_TABLE_NAME || '', // Will be set in backend.ts
  },
  resourceGroupName: 'auth',
});
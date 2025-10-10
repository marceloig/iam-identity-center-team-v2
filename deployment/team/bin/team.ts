#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { TeamStack } from '../lib/team-stack';

const app = new cdk.App();

new TeamStack(app, 'TeamStack', {
  login: process.env.IDC_LOGIN_URL || '',
  cloudTrailAuditLogs: process.env.CLOUDTRAIL_AUDIT_LOGS || 'read_write',
  teamAdminGroup: process.env.TEAM_ADMIN_GROUP || '',
  teamAuditGroup: process.env.TEAM_AUDIT_GROUP || '',
  teamAccount: process.env.TEAM_ACCOUNT || '',
  customAmplifyDomain: process.env.CUSTOM_AMPLIFY_DOMAIN || '',
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
  customRepositorySecretName: process.env.SECRET_NAME || ''
});
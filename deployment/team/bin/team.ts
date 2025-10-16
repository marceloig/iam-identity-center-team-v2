#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { TeamStack } from '../lib/team-stack';

const app = new cdk.App();
app.node.setContext('login', process.env.IDC_LOGIN_URL);
app.node.setContext('cloudTrailAuditLogs', process.env.CLOUDTRAIL_AUDIT_LOGS);
app.node.setContext('teamAdminGroup', process.env.TEAM_ADMIN_GROUP);
app.node.setContext('teamAuditGroup', process.env.TEAM_AUDIT_GROUP );
app.node.setContext('teamAccount', process.env.TEAM_ACCOUNT);
app.node.setContext('customAmplifyDomain', process.env.CUSTOM_AMPLIFY_DOMAIN);
app.node.setContext('customRepositorySecretName', process.env.SECRET_NAME);

new TeamStack(app, 'TeamStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION }
});
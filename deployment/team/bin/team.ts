#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { TeamStack } from '../lib/team-stack';

const app = new cdk.App();
app.node.setContext('login', process.env.IDC_LOGIN_URL);
app.node.setContext('cwLogGroupName', process.env.CW_LOG_GROUP_NAME);
app.node.setContext('teamAdminGroup', process.env.TEAM_ADMIN_GROUP);
app.node.setContext('teamAuditorGroup', process.env.TEAM_AUDITOR_GROUP );
app.node.setContext('teamAccount', process.env.TEAM_ACCOUNT);
app.node.setContext('customAmplifyDomain', process.env.CUSTOM_AMPLIFY_DOMAIN || "");
app.node.setContext('customRepositorySecretName', process.env.SECRET_NAME || "");
app.node.setContext('samlMetadataUrl', process.env.SAML_METADATA_URL || "");
app.node.setContext('teamTags', process.env.TAGS);

new TeamStack(app, 'TeamStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION }
});
import * as cdk from 'aws-cdk-lib';
import * as amplify from 'aws-cdk-lib/aws-amplify';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface TeamStackProps extends cdk.StackProps {
  login: string;
  cloudTrailAuditLogs: string;
  teamAdminGroup: string;
  teamAuditGroup: string;
  teamTags?: string;
  teamAccount: string;
  customAmplifyDomain?: string;
  customRepository?: true | false;
  customRepositorySecretName?: string;
}

export class TeamStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: TeamStackProps) {
    super(scope, id, props);

    // Amplify Service Role
    const amplifyRole = new iam.Role(this, 'AmplifyRole', {
      assumedBy: new iam.CompositePrincipal(
        new iam.ServicePrincipal('amplify.amazonaws.com')
      ).withConditions({
        StringEquals: {
          'aws:SourceAccount': this.account
        }
      }),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')
      ]
    });

    // Amplify App
    const amplifyApp = new amplify.CfnApp(this, 'AmplifyApp', {
      name: 'TEAM-IDC-APP',
      repository: `{{resolve:secretsmanager:${props.customRepositorySecretName}:SecretString:url}}`,
      accessToken: `{{resolve:secretsmanager:${props.customRepositorySecretName}:SecretString:AccessToken}}`,
      description: 'Temporary Elevated Access Management Application',
      customRules: [
        {
          source: '/<*>',
          status: '404',
          target: '/index.html'
        },
        {
          source: '</^[^.]+$|\\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|ttf|map|json)$)([^.]+$)/>',
          status: '200',
          target: '/index.html'
        }
      ],
      environmentVariables: [
        { name: 'AMPLIFY_DESTRUCTIVE_UPDATES', value: 'true' },
        { name: '_LIVE_UPDATES', value: '[{"name":"Node.js version","pkg":"node","type":"nvm","version":"22.17"}]' }
      ],
      buildSpec: `
      version: 1
      backend:
        phases:
          build:
            commands:
              - rm -rf node_modules package-lock.json
              - npm install
              - npx ampx pipeline-deploy --branch $AWS_BRANCH --app-id $AWS_APP_ID
      frontend:
        phases:
          preBuild:
            commands:
              - npm install
          build:
            commands:
              - npm run build
        artifacts:
          baseDirectory: build
          files:
            - '**/*'
        cache:
          paths:
            - node_modules/**/*`,
      tags: [{ key: 'Name', value: 'TEAM' }],
      iamServiceRole: amplifyRole.roleArn
    });

    // Amplify Branch
    const amplifyBranch = new amplify.CfnBranch(this, 'AmplifyBranch', {
      appId: amplifyApp.attrAppId,
      branchName: 'main',
      enableAutoBuild: true,
      environmentVariables: [
        { name: 'SSO_LOGIN', value: props.login },
        { name: 'TEAM_ACCOUNT', value: props.teamAccount },
        { name: 'CLOUDTRAIL_AUDIT_LOGS', value: props.cloudTrailAuditLogs },
        { name: 'TEAM_ADMIN_GROUP', value: props.teamAdminGroup },
        { name: 'TEAM_AUDITOR_GROUP', value: props.teamAuditGroup },
        { name: 'TAGS', value: props.teamTags || '' },
        { name: 'AMPLIFY_CUSTOM_DOMAIN', value: props.customAmplifyDomain || '' },
      ],
      tags: [{ key: 'Branch', value: 'main' }]
    });

    // Lambda Role for Amplify Build Trigger
    const amplifyLambdaRole = new iam.Role(this, 'AmplifyLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      inlinePolicies: {
        AmplifyLambdaPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              sid: 'AllowLogging',
              effect: iam.Effect.ALLOW,
              actions: [
                'logs:CreateLogGroup',
                'logs:CreateLogStream',
                'logs:PutLogEvents'
              ],
              resources: ['*']
            }),
            new iam.PolicyStatement({
              sid: 'startBuild',
              effect: iam.Effect.ALLOW,
              actions: ['amplify:StartJob'],
              resources: ['*']
            })
          ]
        })
      }
    });

    // Output
    new cdk.CfnOutput(this, 'DefaultDomain', {
      value: amplifyApp.attrDefaultDomain
    });
  }
}
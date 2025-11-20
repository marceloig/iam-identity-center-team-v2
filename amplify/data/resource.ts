import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { teamgetAccounts } from '../functions/teamgetAccounts/resource.js';
import { teamgetIdCGroups } from '../functions/teamgetIdCGroups/resource.js';
import { teamgetMgmtAccountDetails } from '../functions/teamgetMgmtAccountDetails/resource.js';
import { teamgetOUs } from '../functions/teamgetOUs/resource.js';
import { teamgetOU } from '../functions/teamgetOU/resource.js';
import { teamgetPermissions } from '../functions/teamgetPermissions/resource.js';
import { teamgetUsers } from '../functions/teamgetUsers/resource.js';
import { teamqueryLogs } from '../functions/teamqueryLogs/resource.js';
import { teamgetUserPolicy } from '../functions/teamgetUserPolicy/resource.js';
import { teamListGroups } from '../functions/teamListGroups/resource.js';

const schema = a.schema({
  // Main models
  Requests: a
    .model({
      id: a.id().required(),
      email: a.string(),
      accountId: a.string().required().authorization((allow) => [
        allow.group('Auditors').to(['read']),
        allow.owner().to(['read', 'create']),
        //allow.ownerDefinedIn('approver_ids').to(['read']),
        allow.authenticated().to(['read', 'update']),
      ]),
      accountName: a.string().required(),
      role: a.string().required(),
      roleId: a.string().required(),
      startTime: a.datetime().required(),
      duration: a.string().required(),
      justification: a.string(),
      status: a.string(),
      comment: a.string().authorization((allow) => [
        allow.group('Auditors').to(['read']),
        allow.owner().to(['read']),
        //allow.ownerDefinedIn('approver_ids').to(['read']),
        allow.authenticated().to(['read', 'update']),
      ]),
      username: a.string().authorization((allow) => [
        allow.group('Auditors').to(['read']),
        allow.owner().to(['read']),
        //allow.ownerDefinedIn('approver_ids').to(['update', 'read']),
        allow.authenticated().to(['create', 'read', 'update']),
      ]),
      approver: a.string(),
      approverId: a.string().authorization((allow) => [
        allow.group('Auditors').to(['read']),
        allow.owner().to(['read']),
        //allow.ownerDefinedIn('approver_ids').to(['read']),
        allow.authenticated().to(['read', 'update']),
      ]),
      approvers: a.string().array().authorization((allow) => [
        allow.group('Auditors').to(['read']),
        allow.owner().to(['read']),
        //allow.ownerDefinedIn('approver_ids').to(['update', 'read']),
        allow.authenticated().to(['read', 'update']),
      ]),
      approver_ids: a.string().array().authorization((allow) => [
        allow.group('Auditors').to(['read']),
        allow.owner().to(['read']),
        allow.authenticated().to(['read', 'update']),
      ]),
      revoker: a.string().authorization((allow) => [
        allow.group('Auditors').to(['read']),
        allow.owner().to(['read']),
        //allow.ownerDefinedIn('approver_ids').to(['read']),
        allow.authenticated().to(['read', 'update']),
      ]),
      revokerId: a.string().authorization((allow) => [
        allow.group('Auditors').to(['read']),
        allow.owner().to(['update', 'read']),
        //allow.ownerDefinedIn('approver_ids').to(['update', 'read']),
        allow.authenticated().to(['read', 'update']),
      ]),
      endTime: a.datetime(),
      ticketNo: a.string(),
      revokeComment: a.string(),
      session_duration: a.string().authorization((allow) => [
        allow.group('Auditors').to(['read']),
        allow.owner().to(['update', 'read']),
        //allow.ownerDefinedIn('approver_ids').to(['update', 'read']),
        allow.authenticated().to(['read', 'update']),
      ]),
    })
    .secondaryIndexes((index) => [
      index('email').sortKeys(['status']).queryField('RequestsByEmailAndStatus').name('byEmailAndStatus'),
      index('approverId').sortKeys(['status']).queryField('RequestsByApproverAndStatus').name('byApproverAndStatus'),
    ])
    .authorization((allow) => [
      allow.group('Auditors').to(['read']),
      allow.owner().to(['create', 'read']),
      allow.authenticated(),
    ]),

  Sessions: a
    .model({
      id: a.id().required(),
      startTime: a.string(),
      endTime: a.string(),
      username: a.string(),
      accountId: a.string(),
      role: a.string(),
      approver_ids: a.string().array(),
      queryId: a.string(),
      expireAt: a.timestamp(),
    })
    .authorization((allow) => [
      allow.group('Auditors'),
      allow.owner(),
      allow.ownerDefinedIn('username'),
      //allow.ownerDefinedIn('approver_ids'),
      allow.authenticated().to(['read', 'update']),
    ]),

  Approvers: a
    .model({
      id: a.id().required(),
      name: a.string(),
      type: a.string(),
      approvers: a.string().array(),
      groupIds: a.string().array(),
      ticketNo: a.string(),
      modifiedBy: a.string(),
    })
    .authorization((allow) => [
      allow.group('Admin'),
      //allow.group('api/admin', 'oidc'),
      allow.authenticated().to(['read', 'update']),
    ]),

  Settings: a
    .model({
      duration: a.string(),
      expiry: a.string(),
      comments: a.boolean(),
      ticketNo: a.boolean(),
      approval: a.boolean(),
      modifiedBy: a.string(),
      sesNotificationsEnabled: a.boolean(),
      snsNotificationsEnabled: a.boolean(),
      slackNotificationsEnabled: a.boolean(),
      slackAuditNotificationsChannel: a.string(),
      sesSourceEmail: a.string(),
      sesSourceArn: a.string(),
      slackToken: a.string(),
      teamAdminGroup: a.string(),
      teamAuditorGroup: a.string(),
    })
    .authorization((allow) => [
      allow.group('Admin'),
      //allow.group('api/admin', 'oidc'),
      allow.authenticated().to(['read']),
    ]),

  Eligibility: a
    .model({
      id: a.id().required(),
      name: a.string(),
      type: a.string(),
      accounts: a.ref('Accounts').array(),
      ous: a.ref('data').array(),
      permissions: a.ref('data').array(),
      ticketNo: a.string(),
      approvalRequired: a.boolean(),
      duration: a.string(),
      modifiedBy: a.string(),
    })
    .authorization((allow) => [
      allow.group('Admin'),
      //allow.group('api/admin', 'oidc'),
      allow.authenticated().to(['read', 'update']),
    ]),

  // Custom types
  data: a.customType({
    name: a.string(),
    id: a.string(),
  }),

  Accounts: a.customType({
    name: a.string().required(),
    id: a.string().required(),
  }),

  Entitlement: a.customType({
    accounts: a.ref('data').array(),
    permissions: a.ref('data').array(),
    approvalRequired: a.boolean(),
    duration: a.string(),
  }),

  IdCGroups: a.customType({
    GroupId: a.string().required(),
    DisplayName: a.string().required(),
  }),

  Users: a.customType({
    UserName: a.string().required(),
    UserId: a.string().required(),
  }),

  Logs: a.customType({
    eventName: a.string(),
    eventSource: a.string(),
    eventID: a.string(),
    eventTime: a.string(),
  }),

  OU: a.customType({
    Id: a.string().required(),
  }),

  Groups: a.customType({
    groups: a.string().array(),
    userId: a.string(),
    groupIds: a.string().array(),
  }),

  Members: a.customType({
    members: a.string().array(),
  }),

  Permissions: a.customType({
    Name: a.string().required(),
    Arn: a.string().required(),
    Duration: a.string(),
  }),

  MgmtPs: a.customType({
    permissions: a.string().array(),
  }),

  Policy: a.customType({
    id: a.string().required(),
    policy: a.ref('Entitlement').array(),
    username: a.string().required(),
  }),

  OUs: a.customType({
    ous: a.json(),
  }),

  Permission: a.customType({
    id: a.string().required(),
    permissions: a.ref('Permissions').array(),
  }),

  // Custom queries
  getAccounts: a
    .query()
    .returns(a.ref('Accounts').array())
    .handler(a.handler.function(teamgetAccounts))
    .authorization((allow) => [allow.authenticated()]),

  getOUs: a
    .query()
    .returns(a.string())
    .handler(a.handler.function(teamgetOUs))
    .authorization((allow) => [allow.authenticated()]),

  getOU: a
    .query()
    .arguments({ id: a.string() })
    .returns(a.ref('OU'))
    .handler(a.handler.function(teamgetOU))
    .authorization((allow) => [allow.authenticated()]),

  getPermissions: a
    .query()
    .returns(a.ref('Permission'))
    .handler(a.handler.function(teamgetPermissions))
    .authorization((allow) => [allow.authenticated()]),

  getMgmtPermissions: a
    .query()
    .returns(a.ref('MgmtPs'))
    .handler(a.handler.function(teamgetMgmtAccountDetails))
    .authorization((allow) => [allow.authenticated()]),

  getIdCGroups: a
    .query()
    .returns(a.ref('IdCGroups').array())
    .handler(a.handler.function(teamgetIdCGroups))
    .authorization((allow) => [allow.authenticated()]),

  getUsers: a
    .query()
    .returns(a.ref('Users').array())
    .handler(a.handler.function(teamgetUsers))
    .authorization((allow) => [allow.authenticated()]),

  getLogs: a
    .query()
    .arguments({ queryId: a.string()})
    .returns(a.ref('Logs').array())
    .handler(a.handler.function(teamqueryLogs))
    .authorization((allow) => [allow.authenticated()]),

  getUserPolicy: a
    .query()
    .arguments({ userId: a.string(), groupIds: a.string().array() })
    .returns(a.ref('Policy'))
    .handler(a.handler.function(teamgetUserPolicy))
    .authorization((allow) => [allow.authenticated()]),

  listGroups: a
    .query()
    .arguments({ groupIds: a.string().array() })
    .returns(a.ref('Members'))
    .handler(a.handler.function(teamListGroups))
    .authorization((allow) => [allow.authenticated()]),

  // Custom mutations
  // publishPolicy: a
  //   .mutation()
  //   .arguments({
  //     result: a.json(),
  //   })
  //   .returns(a.ref('Policy'))
  //   .authorization((allow) => [
  //     allow.authenticated(),
  //   ]),

  // publishOUs: a
  //   .mutation()
  //   .arguments({
  //     result: a.json(),
  //   })
  //   .returns(a.ref('OUs'))
  //   .authorization((allow) => [
  //     allow.authenticated(),
  //   ]).handler(a.handler.function(teamPublishOUs)),

  // publishPermissions: a
  //   .mutation()
  //   .arguments({
  //     result: a.json(),
  //   })
  //   .returns(a.ref('Permission'))
  //   .authorization((allow) => [
  //     allow.authenticated(),
  //   ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
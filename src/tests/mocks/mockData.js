export const mockRequests = [
  {
    id: '1',
    email: 'user@example.com',
    accountId: '123456789012',
    accountName: 'Test Account',
    role: 'AdminRole',
    roleId: 'role-123',
    startTime: '2024-01-01T10:00:00Z',
    duration: '4',
    justification: 'Testing purposes',
    status: 'pending',
    comment: '',
    username: 'testuser',
    approver: 'approver@example.com',
    approverId: 'approver-id',
    ticketNo: 'TICKET-123',
    createdAt: '2024-01-01T09:00:00Z',
    updatedAt: '2024-01-01T09:00:00Z',
  },
  {
    id: '2',
    email: 'user@example.com',
    accountId: '123456789013',
    accountName: 'Test Account 2',
    role: 'DeveloperRole',
    roleId: 'role-456',
    startTime: '2024-01-02T10:00:00Z',
    duration: '2',
    justification: 'Development work',
    status: 'approved',
    comment: 'Approved for development',
    username: 'testuser',
    approver: 'approver@example.com',
    approverId: 'approver-id',
    ticketNo: 'TICKET-124',
    createdAt: '2024-01-02T09:00:00Z',
    updatedAt: '2024-01-02T10:00:00Z',
  },
];

export const mockSessions = [
  {
    id: 'session-1',
    startTime: '2024-01-01T10:00:00Z',
    endTime: '2024-01-01T14:00:00Z',
    username: 'testuser',
    accountId: '123456789012',
    role: 'AdminRole',
    approver_ids: ['approver-id'],
    queryId: 'query-123',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
];

export const mockApprovers = [
  {
    id: 'approver-1',
    name: 'Account Approvers',
    type: 'Account',
    approvers: ['approver@example.com'],
    groupIds: ['group-1', 'group-2'],
    ticketNo: true,
    modifiedBy: 'admin@example.com',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

export const mockSettings = {
  id: 'settings',
  duration: '8',
  expiry: '24',
  comments: true,
  ticketNo: true,
  approval: true,
  modifiedBy: 'admin@example.com',
  sesNotificationsEnabled: true,
  snsNotificationsEnabled: false,
  slackNotificationsEnabled: true,
  slackAuditNotificationsChannel: '#audit',
  sesSourceEmail: 'noreply@example.com',
  teamAdminGroup: 'admin-group',
  teamAuditorGroup: 'auditor-group',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

export const mockEligibility = [
  {
    id: 'eligibility-1',
    name: 'Developer Access',
    type: 'Group',
    accounts: [
      { name: 'Dev Account', id: '123456789012' },
      { name: 'Test Account', id: '123456789013' },
    ],
    ous: [{ name: 'Development', id: 'ou-123' }],
    permissions: [
      { name: 'DeveloperAccess', id: 'ps-123' },
      { name: 'ReadOnlyAccess', id: 'ps-124' },
    ],
    ticketNo: true,
    approvalRequired: true,
    duration: 8,
    modifiedBy: 'admin@example.com',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

export const mockAccounts = [
  { name: 'Dev Account', id: '123456789012' },
  { name: 'Test Account', id: '123456789013' },
  { name: 'Prod Account', id: '123456789014' },
];

export const mockPermissions = {
  id: 'permissions',
  permissions: [
    { Name: 'AdministratorAccess', Arn: 'arn:aws:iam::aws:policy/AdministratorAccess', Duration: 'PT12H' },
    { Name: 'DeveloperAccess', Arn: 'arn:aws:iam::aws:policy/PowerUserAccess', Duration: 'PT8H' },
    { Name: 'ReadOnlyAccess', Arn: 'arn:aws:iam::aws:policy/ReadOnlyAccess', Duration: 'PT4H' },
  ],
};

export const mockUserPolicy = {
  id: 'policy-1',
  policy: [
    {
      accounts: mockAccounts,
      permissions: mockPermissions.permissions,
      approvalRequired: true,
      duration: 8,
    },
  ],
  username: 'testuser',
};

export const mockOUs = ['ou-123', 'ou-456', 'ou-789'];

export const mockIdCGroups = [
  { GroupId: 'group-1', DisplayName: 'Developers' },
  { GroupId: 'group-2', DisplayName: 'Admins' },
  { GroupId: 'group-3', DisplayName: 'Auditors' },
];

export const mockUsers = [
  { UserName: 'user1@example.com', UserId: 'user-1' },
  { UserName: 'user2@example.com', UserId: 'user-2' },
  { UserName: 'user3@example.com', UserId: 'user-3' },
];

export const mockLogs = [
  {
    eventName: 'CreateAccountAssignment',
    eventSource: 'sso.amazonaws.com',
    eventID: 'event-1',
    eventTime: '2024-01-01T10:00:00Z',
  },
  {
    eventName: 'DeleteAccountAssignment',
    eventSource: 'sso.amazonaws.com',
    eventID: 'event-2',
    eventTime: '2024-01-01T14:00:00Z',
  },
];

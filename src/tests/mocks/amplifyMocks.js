import { vi } from 'vitest';

export const mockAuthSession = {
  tokens: {
    idToken: {
      payload: {
        'cognito:groups': ['admin', 'user'],
        userId: 'test-user-id',
        groupIds: 'group-1,group-2',
        groups: 'Admin,Users',
      },
    },
  },
};

export const mockUserAttributes = {
  email: 'test@example.com',
  sub: 'test-user-id',
  email_verified: true,
};

export const mockCurrentUser = {
  username: 'testuser',
  userId: 'test-user-id',
};

export const mockGraphQLResponse = (data) => ({
  data,
});

export const mockGraphQLError = (message) => ({
  errors: [{ message }],
});

export const createMockClient = (responses = {}) => ({
  graphql: vi.fn(({ query }) => {
    const queryName = query.definitions[0]?.name?.value;
    if (responses[queryName]) {
      return Promise.resolve(mockGraphQLResponse(responses[queryName]));
    }
    return Promise.resolve(mockGraphQLResponse({}));
  }),
});

export const mockAmplifyAuth = {
  signInWithRedirect: vi.fn(),
  fetchAuthSession: vi.fn(() => Promise.resolve(mockAuthSession)),
  fetchUserAttributes: vi.fn(() => Promise.resolve(mockUserAttributes)),
  getCurrentUser: vi.fn(() => Promise.resolve(mockCurrentUser)),
};

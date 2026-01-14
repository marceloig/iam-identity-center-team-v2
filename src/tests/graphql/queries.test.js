import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateClient } from 'aws-amplify/api';
import * as queries from '../../graphql/queries';
import { mockRequests, mockSessions, mockApprovers, mockSettings } from '../mocks/mockData';

vi.mock('aws-amplify/api');

describe('GraphQL Queries', () => {
  let mockClient;

  beforeEach(() => {
    mockClient = {
      graphql: vi.fn(),
    };
    generateClient.mockReturnValue(mockClient);
  });

  describe('getRequests', () => {
    it('should query request by id', async () => {
      const mockResponse = {
        data: {
          getRequests: mockRequests[0],
        },
      };

      mockClient.graphql.mockResolvedValue(mockResponse);

      const client = generateClient();
      const result = await client.graphql({
        query: queries.getRequests,
        variables: { id: '1' },
      });

      expect(result.data.getRequests).toEqual(mockRequests[0]);
      expect(mockClient.graphql).toHaveBeenCalledWith({
        query: queries.getRequests,
        variables: { id: '1' },
      });
    });
  });

  describe('listRequests', () => {
    it('should list all requests', async () => {
      const mockResponse = {
        data: {
          listRequests: {
            items: mockRequests,
            nextToken: null,
          },
        },
      };

      mockClient.graphql.mockResolvedValue(mockResponse);

      const client = generateClient();
      const result = await client.graphql({
        query: queries.listRequests,
      });

      expect(result.data.listRequests.items).toEqual(mockRequests);
      expect(result.data.listRequests.items).toHaveLength(2);
    });

    it('should handle pagination with nextToken', async () => {
      const mockResponse = {
        data: {
          listRequests: {
            items: [mockRequests[0]],
            nextToken: 'next-token-123',
          },
        },
      };

      mockClient.graphql.mockResolvedValue(mockResponse);

      const client = generateClient();
      const result = await client.graphql({
        query: queries.listRequests,
        variables: { limit: 1 },
      });

      expect(result.data.listRequests.nextToken).toBe('next-token-123');
    });
  });

  describe('requestByEmailAndStatus', () => {
    it('should query requests by email and status', async () => {
      const mockResponse = {
        data: {
          requestByEmailAndStatus: {
            items: [mockRequests[0]],
            nextToken: null,
          },
        },
      };

      mockClient.graphql.mockResolvedValue(mockResponse);

      const client = generateClient();
      const result = await client.graphql({
        query: queries.requestByEmailAndStatus,
        variables: {
          email: 'user@example.com',
          status: { eq: 'pending' },
        },
      });

      expect(result.data.requestByEmailAndStatus.items).toHaveLength(1);
      expect(result.data.requestByEmailAndStatus.items[0].status).toBe('pending');
    });
  });

  describe('getSessions', () => {
    it('should query session by id', async () => {
      const mockResponse = {
        data: {
          getSessions: mockSessions[0],
        },
      };

      mockClient.graphql.mockResolvedValue(mockResponse);

      const client = generateClient();
      const result = await client.graphql({
        query: queries.getSessions,
        variables: { id: 'session-1' },
      });

      expect(result.data.getSessions).toEqual(mockSessions[0]);
    });
  });

  describe('getApprovers', () => {
    it('should query approvers by id', async () => {
      const mockResponse = {
        data: {
          getApprovers: mockApprovers[0],
        },
      };

      mockClient.graphql.mockResolvedValue(mockResponse);

      const client = generateClient();
      const result = await client.graphql({
        query: queries.getApprovers,
        variables: { id: 'approver-1' },
      });

      expect(result.data.getApprovers).toEqual(mockApprovers[0]);
      expect(result.data.getApprovers.type).toBe('Account');
    });
  });

  describe('getSettings', () => {
    it('should query settings', async () => {
      const mockResponse = {
        data: {
          getSettings: mockSettings,
        },
      };

      mockClient.graphql.mockResolvedValue(mockResponse);

      const client = generateClient();
      const result = await client.graphql({
        query: queries.getSettings,
        variables: { id: 'settings' },
      });

      expect(result.data.getSettings).toEqual(mockSettings);
      expect(result.data.getSettings.duration).toBe('8');
    });
  });

  describe('getUserPolicy', () => {
    it('should query user policy with userId and groupIds', async () => {
      const mockResponse = {
        data: {
          getUserPolicy: {
            id: 'policy-1',
            policy: {
              accounts: [{ name: 'Test Account', id: '123456789012' }],
              permissions: ['permission-1'],
              approvalRequired: true,
              duration: 8,
            },
            username: 'testuser',
          },
        },
      };

      mockClient.graphql.mockResolvedValue(mockResponse);

      const client = generateClient();
      const result = await client.graphql({
        query: queries.getUserPolicy,
        variables: {
          userId: 'user-1',
          groupIds: ['group-1', 'group-2'],
        },
      });

      expect(result.data.getUserPolicy.username).toBe('testuser');
      expect(result.data.getUserPolicy.policy.approvalRequired).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle query errors', async () => {
      const mockError = new Error('GraphQL Error');
      mockClient.graphql.mockRejectedValue(mockError);

      const client = generateClient();

      await expect(
        client.graphql({
          query: queries.getRequests,
          variables: { id: 'invalid-id' },
        })
      ).rejects.toThrow('GraphQL Error');
    });

    it('should handle network errors', async () => {
      mockClient.graphql.mockRejectedValue(new Error('Network error'));

      const client = generateClient();

      await expect(
        client.graphql({
          query: queries.listRequests,
        })
      ).rejects.toThrow('Network error');
    });
  });
});

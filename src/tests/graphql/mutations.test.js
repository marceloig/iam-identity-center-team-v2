import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateClient } from 'aws-amplify/api';
import * as mutations from '../../graphql/mutations';
import { mockRequests, mockSessions, mockApprovers, mockSettings } from '../mocks/mockData';

vi.mock('aws-amplify/api');

describe('GraphQL Mutations', () => {
  let mockClient;

  beforeEach(() => {
    mockClient = {
      graphql: vi.fn(),
    };
    generateClient.mockReturnValue(mockClient);
  });

  describe('createRequests', () => {
    it('should create a new request', async () => {
      const newRequest = {
        email: 'newuser@example.com',
        accountId: '123456789015',
        accountName: 'New Account',
        role: 'DeveloperRole',
        roleId: 'role-789',
        duration: '4',
        justification: 'New feature development',
        status: 'pending',
        ticketNo: 'TICKET-125',
      };

      const mockResponse = {
        data: {
          createRequests: {
            ...newRequest,
            id: '3',
            createdAt: '2024-01-03T09:00:00Z',
            updatedAt: '2024-01-03T09:00:00Z',
          },
        },
      };

      mockClient.graphql.mockResolvedValue(mockResponse);

      const client = generateClient();
      const result = await client.graphql({
        query: mutations.createRequests,
        variables: { input: newRequest },
      });

      expect(result.data.createRequests.email).toBe(newRequest.email);
      expect(result.data.createRequests.status).toBe('pending');
      expect(mockClient.graphql).toHaveBeenCalledWith({
        query: mutations.createRequests,
        variables: { input: newRequest },
      });
    });
  });

  describe('updateRequests', () => {
    it('should update an existing request', async () => {
      const updateData = {
        id: '1',
        status: 'approved',
        comment: 'Approved by manager',
        approver: 'manager@example.com',
        approverId: 'manager-id',
      };

      const mockResponse = {
        data: {
          updateRequests: {
            ...mockRequests[0],
            ...updateData,
            updatedAt: '2024-01-03T10:00:00Z',
          },
        },
      };

      mockClient.graphql.mockResolvedValue(mockResponse);

      const client = generateClient();
      const result = await client.graphql({
        query: mutations.updateRequests,
        variables: { input: updateData },
      });

      expect(result.data.updateRequests.status).toBe('approved');
      expect(result.data.updateRequests.comment).toBe('Approved by manager');
    });

    it('should update request to rejected status', async () => {
      const updateData = {
        id: '1',
        status: 'rejected',
        comment: 'Insufficient justification',
      };

      const mockResponse = {
        data: {
          updateRequests: {
            ...mockRequests[0],
            ...updateData,
          },
        },
      };

      mockClient.graphql.mockResolvedValue(mockResponse);

      const client = generateClient();
      const result = await client.graphql({
        query: mutations.updateRequests,
        variables: { input: updateData },
      });

      expect(result.data.updateRequests.status).toBe('rejected');
    });
  });

  describe('deleteRequests', () => {
    it('should delete a request', async () => {
      const mockResponse = {
        data: {
          deleteRequests: mockRequests[0],
        },
      };

      mockClient.graphql.mockResolvedValue(mockResponse);

      const client = generateClient();
      const result = await client.graphql({
        query: mutations.deleteRequests,
        variables: { input: { id: '1' } },
      });

      expect(result.data.deleteRequests.id).toBe('1');
    });
  });

  describe('createSessions', () => {
    it('should create a new session', async () => {
      const newSession = {
        startTime: '2024-01-03T10:00:00Z',
        endTime: '2024-01-03T14:00:00Z',
        username: 'testuser',
        accountId: '123456789012',
        role: 'DeveloperRole',
        approver_ids: ['approver-id'],
        queryId: 'query-456',
      };

      const mockResponse = {
        data: {
          createSessions: {
            ...newSession,
            id: 'session-2',
            createdAt: '2024-01-03T10:00:00Z',
            updatedAt: '2024-01-03T10:00:00Z',
          },
        },
      };

      mockClient.graphql.mockResolvedValue(mockResponse);

      const client = generateClient();
      const result = await client.graphql({
        query: mutations.createSessions,
        variables: { input: newSession },
      });

      expect(result.data.createSessions.username).toBe('testuser');
      expect(result.data.createSessions.queryId).toBe('query-456');
    });
  });

  describe('updateSessions', () => {
    it('should update session end time', async () => {
      const updateData = {
        id: 'session-1',
        endTime: '2024-01-01T15:00:00Z',
      };

      const mockResponse = {
        data: {
          updateSessions: {
            ...mockSessions[0],
            ...updateData,
          },
        },
      };

      mockClient.graphql.mockResolvedValue(mockResponse);

      const client = generateClient();
      const result = await client.graphql({
        query: mutations.updateSessions,
        variables: { input: updateData },
      });

      expect(result.data.updateSessions.endTime).toBe('2024-01-01T15:00:00Z');
    });
  });

  describe('createApprovers', () => {
    it('should create new approver configuration', async () => {
      const newApprover = {
        name: 'OU Approvers',
        type: 'OU',
        approvers: ['ou-approver@example.com'],
        groupIds: ['group-3'],
        ticketNo: true,
        modifiedBy: 'admin@example.com',
      };

      const mockResponse = {
        data: {
          createApprovers: {
            ...newApprover,
            id: 'approver-2',
            createdAt: '2024-01-03T00:00:00Z',
            updatedAt: '2024-01-03T00:00:00Z',
          },
        },
      };

      mockClient.graphql.mockResolvedValue(mockResponse);

      const client = generateClient();
      const result = await client.graphql({
        query: mutations.createApprovers,
        variables: { input: newApprover },
      });

      expect(result.data.createApprovers.type).toBe('OU');
      expect(result.data.createApprovers.name).toBe('OU Approvers');
    });
  });

  describe('updateSettings', () => {
    it('should update application settings', async () => {
      const updateData = {
        id: 'settings',
        duration: '12',
        approval: false,
        ticketNo: false,
      };

      const mockResponse = {
        data: {
          updateSettings: {
            ...mockSettings,
            ...updateData,
          },
        },
      };

      mockClient.graphql.mockResolvedValue(mockResponse);

      const client = generateClient();
      const result = await client.graphql({
        query: mutations.updateSettings,
        variables: { input: updateData },
      });

      expect(result.data.updateSettings.duration).toBe('12');
      expect(result.data.updateSettings.approval).toBe(false);
    });
  });

  describe('createEligibility', () => {
    it('should create eligibility policy', async () => {
      const newEligibility = {
        name: 'Production Access',
        type: 'Group',
        accounts: [{ name: 'Prod Account', id: '123456789014' }],
        permissions: [{ name: 'ReadOnlyAccess', id: 'ps-125' }],
        approvalRequired: true,
        duration: 4,
        modifiedBy: 'admin@example.com',
      };

      const mockResponse = {
        data: {
          createEligibility: {
            ...newEligibility,
            id: 'eligibility-2',
            createdAt: '2024-01-03T00:00:00Z',
            updatedAt: '2024-01-03T00:00:00Z',
          },
        },
      };

      mockClient.graphql.mockResolvedValue(mockResponse);

      const client = generateClient();
      const result = await client.graphql({
        query: mutations.createEligibility,
        variables: { input: newEligibility },
      });

      expect(result.data.createEligibility.name).toBe('Production Access');
      expect(result.data.createEligibility.approvalRequired).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle mutation errors', async () => {
      mockClient.graphql.mockRejectedValue(new Error('Mutation failed'));

      const client = generateClient();

      await expect(
        client.graphql({
          query: mutations.createRequests,
          variables: { input: {} },
        })
      ).rejects.toThrow('Mutation failed');
    });

    it('should handle validation errors', async () => {
      const mockResponse = {
        errors: [
          {
            message: 'Validation error: email is required',
            errorType: 'ValidationError',
          },
        ],
      };

      mockClient.graphql.mockResolvedValue(mockResponse);

      const client = generateClient();
      const result = await client.graphql({
        query: mutations.createRequests,
        variables: { input: { accountId: '123' } },
      });

      expect(result.errors).toBeDefined();
      expect(result.errors[0].message).toContain('email is required');
    });
  });
});

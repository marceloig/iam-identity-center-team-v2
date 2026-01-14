import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateClient } from 'aws-amplify/api';
import * as RequestService from '../../components/Shared/RequestService';
import {
  mockRequests,
  mockSessions,
  mockApprovers,
  mockSettings,
  mockEligibility,
  mockAccounts,
  mockPermissions,
  mockOUs,
  mockIdCGroups,
  mockUsers,
  mockLogs,
} from '../mocks/mockData';

vi.mock('aws-amplify/api');

describe('RequestService', () => {
  let mockClient;

  beforeEach(() => {
    mockClient = {
      queries: {
        getAccounts: vi.fn(),
        getPermissions: vi.fn(),
        getMgmtPermissions: vi.fn(),
        getOUs: vi.fn(),
        getOU: vi.fn(),
        listGroups: vi.fn(),
        getIdCGroups: vi.fn(),
        getUsers: vi.fn(),
        getLogs: vi.fn(),
        getUserPolicy: vi.fn(),
      },
      models: {
        Requests: {
          RequestsByEmailAndStatus: vi.fn(),
          list: vi.fn(),
          get: vi.fn(),
          create: vi.fn(),
          update: vi.fn(),
          delete: vi.fn(),
        },
        Sessions: {
          get: vi.fn(),
          create: vi.fn(),
          delete: vi.fn(),
        },
        Approvers: {
          list: vi.fn(),
          get: vi.fn(),
          create: vi.fn(),
          update: vi.fn(),
          delete: vi.fn(),
        },
        Eligibility: {
          list: vi.fn(),
          get: vi.fn(),
          create: vi.fn(),
          update: vi.fn(),
          delete: vi.fn(),
        },
        Settings: {
          get: vi.fn(),
          create: vi.fn(),
          update: vi.fn(),
        },
      },
    };
    generateClient.mockReturnValue(mockClient);
  });

  describe('fetchAccounts', () => {
    it('should fetch accounts successfully', async () => {
      mockClient.queries.getAccounts.mockResolvedValue({ data: mockAccounts });

      const result = await RequestService.fetchAccounts();

      expect(result).toEqual(mockAccounts);
      expect(mockClient.queries.getAccounts).toHaveBeenCalled();
    });

    it('should handle errors when fetching accounts', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockClient.queries.getAccounts.mockRejectedValue(new Error('Fetch failed'));

      const result = await RequestService.fetchAccounts();

      expect(result).toBeUndefined();
      expect(consoleErrorSpy).toHaveBeenCalledWith('error fetching accounts', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });

  describe('fetchPermissions', () => {
    it('should fetch permissions successfully', async () => {
      mockClient.queries.getPermissions.mockResolvedValue({ data: mockPermissions });

      const result = await RequestService.fetchPermissions();

      expect(result).toEqual(mockPermissions);
      expect(mockClient.queries.getPermissions).toHaveBeenCalled();
    });
  });

  describe('getMgmtAccountPs', () => {
    it('should fetch management account permissions', async () => {
      const mgmtPermissions = { permissions: ['ps-mgmt-1'] };
      mockClient.queries.getMgmtPermissions.mockResolvedValue({ data: mgmtPermissions });

      const result = await RequestService.getMgmtAccountPs();

      expect(result).toEqual(mgmtPermissions);
      expect(mockClient.queries.getMgmtPermissions).toHaveBeenCalled();
    });
  });

  describe('getUserRequests', () => {
    it('should fetch user requests with pagination', async () => {
      mockClient.models.Requests.RequestsByEmailAndStatus
        .mockResolvedValueOnce({
          data: [mockRequests[0]],
          nextToken: 'token-1',
        })
        .mockResolvedValueOnce({
          data: [mockRequests[1]],
          nextToken: null,
        });

      const result = await RequestService.getUserRequests('user@example.com');

      expect(result).toHaveLength(2);
      expect(result).toEqual(mockRequests);
      expect(mockClient.models.Requests.RequestsByEmailAndStatus).toHaveBeenCalledTimes(2);
    });

    it('should handle errors when fetching user requests', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockClient.models.Requests.RequestsByEmailAndStatus.mockRejectedValue(
        new Error('Fetch failed')
      );

      const result = await RequestService.getUserRequests('user@example.com');

      expect(result).toEqual({ error: expect.any(Error) });
      consoleErrorSpy.mockRestore();
    });
  });

  describe('fetchOUs', () => {
    it('should fetch organizational units', async () => {
      mockClient.queries.getOUs.mockResolvedValue({ data: mockOUs });

      const result = await RequestService.fetchOUs();

      expect(result).toEqual(mockOUs);
      expect(mockClient.queries.getOUs).toHaveBeenCalled();
    });
  });

  describe('fetchOU', () => {
    it('should fetch specific organizational unit', async () => {
      const mockOU = { Id: 'ou-123' };
      mockClient.queries.getOU.mockResolvedValue({ data: mockOU });

      const result = await RequestService.fetchOU('ou-123');

      expect(result).toEqual(mockOU);
      expect(mockClient.queries.getOU).toHaveBeenCalledWith({ id: 'ou-123' });
    });
  });

  describe('getGroupMemberships', () => {
    it('should fetch group memberships', async () => {
      const mockMembers = { members: ['user1', 'user2'] };
      mockClient.queries.listGroups.mockResolvedValue({ data: mockMembers });

      const result = await RequestService.getGroupMemberships(['group-1']);

      expect(result).toEqual(mockMembers);
      expect(mockClient.queries.listGroups).toHaveBeenCalledWith({ groupIds: ['group-1'] });
    });
  });

  describe('fetchIdCGroups', () => {
    it('should fetch Identity Center groups', async () => {
      mockClient.queries.getIdCGroups.mockResolvedValue({ data: mockIdCGroups });

      const result = await RequestService.fetchIdCGroups();

      expect(result).toEqual(mockIdCGroups);
      expect(mockClient.queries.getIdCGroups).toHaveBeenCalled();
    });
  });

  describe('fetchUsers', () => {
    it('should fetch users', async () => {
      mockClient.queries.getUsers.mockResolvedValue({ data: mockUsers });

      const result = await RequestService.fetchUsers();

      expect(result).toEqual(mockUsers);
      expect(mockClient.queries.getUsers).toHaveBeenCalled();
    });
  });

  describe('getSessionList', () => {
    it('should fetch session list with pagination', async () => {
      mockClient.models.Requests.list
        .mockResolvedValueOnce({
          data: [mockRequests[0]],
          nextToken: 'token-1',
        })
        .mockResolvedValueOnce({
          data: [mockRequests[1]],
          nextToken: null,
        });

      const result = await RequestService.getSessionList();

      expect(result).toHaveLength(2);
      expect(mockClient.models.Requests.list).toHaveBeenCalledTimes(2);
    });
  });

  describe('getRequest', () => {
    it('should fetch single request by id', async () => {
      mockClient.models.Requests.get.mockResolvedValue({ data: mockRequests[0] });

      const result = await RequestService.getRequest('1');

      expect(result).toEqual(mockRequests[0]);
      expect(mockClient.models.Requests.get).toHaveBeenCalledWith({ id: '1' });
    });
  });

  describe('getAllApprovers', () => {
    it('should fetch all approvers with pagination', async () => {
      mockClient.models.Approvers.list
        .mockResolvedValueOnce({
          data: [mockApprovers[0]],
          nextToken: null,
        });

      const result = await RequestService.getAllApprovers();

      expect(result).toEqual([mockApprovers[0]]);
      expect(mockClient.models.Approvers.list).toHaveBeenCalled();
    });
  });

  describe('fetchLogs', () => {
    it('should fetch logs with query id', async () => {
      mockClient.queries.getLogs.mockResolvedValue({ data: mockLogs });

      const result = await RequestService.fetchLogs({ queryId: 'query-123' });

      expect(result).toEqual(mockLogs);
      expect(mockClient.queries.getLogs).toHaveBeenCalledWith({ queryId: 'query-123' });
    });
  });

  describe('fetchPolicy', () => {
    it('should fetch user policy', async () => {
      const mockPolicy = {
        id: 'policy-1',
        policy: mockEligibility,
        username: 'testuser',
      };
      mockClient.queries.getUserPolicy.mockResolvedValue({ data: mockPolicy });

      const result = await RequestService.fetchPolicy({
        userId: 'user-1',
        groupIds: ['group-1'],
      });

      expect(result).toEqual(mockPolicy);
      expect(mockClient.queries.getUserPolicy).toHaveBeenCalled();
    });
  });

  describe('Mutations', () => {
    describe('updateStatus', () => {
      it('should update request status', async () => {
        const updateData = { id: '1', status: 'approved' };
        mockClient.models.Requests.update.mockResolvedValue({ data: updateData });

        const result = await RequestService.updateStatus(updateData);

        expect(result).toEqual(updateData);
        expect(mockClient.models.Requests.update).toHaveBeenCalledWith(updateData);
      });
    });

    describe('requestTeam', () => {
      it('should create new request', async () => {
        const newRequest = {
          email: 'user@example.com',
          accountId: '123456789012',
          role: 'AdminRole',
          duration: '4',
        };
        mockClient.models.Requests.create.mockResolvedValue({ data: { id: '3' } });

        const result = await RequestService.requestTeam(newRequest);

        expect(result).toBe('3');
        expect(mockClient.models.Requests.create).toHaveBeenCalledWith(newRequest);
      });
    });

    describe('getSessionLogs', () => {
      it('should create session log', async () => {
        const sessionData = {
          startTime: '2024-01-01T10:00:00Z',
          username: 'testuser',
          accountId: '123456789012',
        };
        mockClient.models.Sessions.create.mockResolvedValue({ data: { id: 'session-2' } });

        const result = await RequestService.getSessionLogs(sessionData);

        expect(result).toBe('session-2');
        expect(mockClient.models.Sessions.create).toHaveBeenCalledWith(sessionData);
      });
    });

    describe('deleteSessionLogs', () => {
      it('should delete session log', async () => {
        const deleteData = { id: 'session-1' };
        mockClient.models.Sessions.delete.mockResolvedValue({ data: deleteData });

        const result = await RequestService.deleteSessionLogs(deleteData);

        expect(result).toEqual(deleteData);
        expect(mockClient.models.Sessions.delete).toHaveBeenCalledWith(deleteData);
      });
    });

    describe('addApprovers', () => {
      it('should add new approver', async () => {
        const approverData = {
          name: 'New Approver',
          type: 'Account',
          groupIds: ['group-1'],
        };
        mockClient.models.Approvers.create.mockResolvedValue({ data: { Id: 'approver-2' } });

        const result = await RequestService.addApprovers(approverData);

        expect(result).toBe('approver-2');
        expect(mockClient.models.Approvers.create).toHaveBeenCalledWith(approverData);
      });
    });

    describe('editApprover', () => {
      it('should update approver', async () => {
        const updateData = { id: 'approver-1', name: 'Updated Approver' };
        mockClient.models.Approvers.update.mockResolvedValue({ data: updateData });

        const result = await RequestService.editApprover(updateData);

        expect(result).toEqual(updateData);
        expect(mockClient.models.Approvers.update).toHaveBeenCalledWith(updateData);
      });
    });

    describe('addPolicy', () => {
      it('should create new eligibility policy', async () => {
        const policyData = {
          name: 'New Policy',
          type: 'Group',
          approvalRequired: true,
        };
        mockClient.models.Eligibility.create.mockResolvedValue({ data: { id: 'policy-2' } });

        const result = await RequestService.addPolicy(policyData);

        expect(result).toBe('policy-2');
        expect(mockClient.models.Eligibility.create).toHaveBeenCalledWith(policyData);
      });
    });

    describe('getSetting', () => {
      it('should fetch settings by id', async () => {
        mockClient.models.Settings.get.mockResolvedValue({ data: mockSettings });

        const result = await RequestService.getSetting('settings');

        expect(result).toEqual(mockSettings);
        expect(mockClient.models.Settings.get).toHaveBeenCalledWith({ id: 'settings' });
      });
    });

    describe('updateSetting', () => {
      it('should update settings', async () => {
        const updateData = { id: 'settings', duration: '12' };
        mockClient.models.Settings.update.mockResolvedValue({ data: updateData });

        const result = await RequestService.updateSetting(updateData);

        expect(result).toEqual(updateData);
        expect(mockClient.models.Settings.update).toHaveBeenCalledWith(updateData);
      });
    });

    describe('revokePim', () => {
      it('should revoke request', async () => {
        const revokeData = { id: '1', status: 'revoked' };
        mockClient.models.Requests.update.mockResolvedValue({ data: revokeData });

        await RequestService.revokePim(revokeData);

        expect(mockClient.models.Requests.update).toHaveBeenCalledWith(revokeData);
      });
    });
  });
});

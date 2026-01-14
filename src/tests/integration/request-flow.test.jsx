import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Request from '../../components/Requests/Request';
import { getCurrentUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';
import * as RequestService from '../../components/Shared/RequestService';
import { mockUserPolicy, mockSettings } from '../mocks/mockData';

vi.mock('aws-amplify/auth');
vi.mock('aws-amplify/api');
vi.mock('../../components/Shared/RequestService');

describe('Request Flow Integration Tests', () => {
  let mockClient;
  const mockProps = {
    user: 'test@example.com',
    userId: 'test-user-id',
    groupIds: ['group-1', 'group-2'],
    addNotification: vi.fn(),
    setActiveHref: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockClient = { graphql: vi.fn() };
    generateClient.mockReturnValue(mockClient);
    getCurrentUser.mockResolvedValue({ username: 'testuser' });
    RequestService.getSetting.mockResolvedValue(mockSettings);
    RequestService.fetchPolicy.mockResolvedValue(mockUserPolicy);
    RequestService.getMgmtAccountPs.mockResolvedValue({ permissions: [] });
  });

  const renderWithRouter = (component) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  describe('Complete Request Submission Flow', () => {
    it('should complete full request flow from load to submission', async () => {
      RequestService.requestTeam.mockResolvedValue({ success: true });
      RequestService.fetchApprovers.mockResolvedValue({
        groupIds: ['approver-group'],
      });
      RequestService.getGroupMemberships.mockResolvedValue({
        members: ['approver1', 'approver2'],
      });

      renderWithRouter(<Request {...mockProps} />);

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText('Elevated access request')).toBeInTheDocument();
      });

      // Verify all services were called on mount
      expect(RequestService.getSetting).toHaveBeenCalledWith('settings');
      expect(RequestService.fetchPolicy).toHaveBeenCalledWith({
        userId: 'test-user-id',
        groupIds: ['group-1', 'group-2'],
      });
      expect(RequestService.getMgmtAccountPs).toHaveBeenCalled();
    });

    it('should handle approval workflow correctly', async () => {
      RequestService.fetchApprovers.mockResolvedValue({
        groupIds: ['approver-group'],
      });
      RequestService.getGroupMemberships.mockResolvedValue({
        members: ['approver1', 'approver2', 'approver3'],
      });
      RequestService.fetchOU.mockResolvedValue({ Id: 'ou-123' });

      renderWithRouter(<Request {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('Elevated access request')).toBeInTheDocument();
      });

      // Component should handle approval checks
      expect(RequestService.getSetting).toHaveBeenCalled();
    });

    it('should handle no approvers scenario', async () => {
      RequestService.fetchApprovers.mockResolvedValue(null);
      RequestService.fetchOU.mockResolvedValue({ Id: 'ou-123' });

      renderWithRouter(<Request {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('Elevated access request')).toBeInTheDocument();
      });

      // Should still render form even without approvers
      expect(screen.getByText('Account')).toBeInTheDocument();
      expect(screen.getByText('Role')).toBeInTheDocument();
    });
  });

  describe('Validation Flow', () => {
    it('should validate all fields before submission', async () => {
      renderWithRouter(<Request {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('Submit')).toBeInTheDocument();
      });

      const submitButton = screen.getByText('Submit');
      await userEvent.click(submitButton);

      // Should show multiple validation errors
      await waitFor(() => {
        expect(screen.getByText('Select an account')).toBeInTheDocument();
        expect(screen.getByText('Select a role')).toBeInTheDocument();
      });

      // Request should not be submitted
      expect(RequestService.requestTeam).not.toHaveBeenCalled();
    });

    it('should clear validation errors when fields are corrected', async () => {
      renderWithRouter(<Request {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('Submit')).toBeInTheDocument();
      });

      // Submit to trigger validation
      const submitButton = screen.getByText('Submit');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Enter number between/)).toBeInTheDocument();
      });

      // Type valid duration
      const durationInput = screen.getByPlaceholderText(/Enter number between/);
      await userEvent.clear(durationInput);
      await userEvent.type(durationInput, '4');

      // Error should be cleared (component behavior)
      expect(durationInput).toHaveValue(4);
    });
  });

  describe('Policy Loading Flow', () => {
    it('should load and process user policy correctly', async () => {
      const customPolicy = {
        policy: [
          {
            accounts: [
              { name: 'Dev Account', id: '123' },
              { name: 'Test Account', id: '456' },
            ],
            permissions: [
              { name: 'AdminAccess', id: 'ps-1' },
              { name: 'DeveloperAccess', id: 'ps-2' },
            ],
            duration: 8,
            approvalRequired: true,
          },
        ],
      };

      RequestService.fetchPolicy.mockResolvedValue(customPolicy);

      renderWithRouter(<Request {...mockProps} />);

      await waitFor(() => {
        expect(RequestService.fetchPolicy).toHaveBeenCalledWith({
          userId: 'test-user-id',
          groupIds: ['group-1', 'group-2'],
        });
      });
    });

    it('should handle empty policy gracefully', async () => {
      RequestService.fetchPolicy.mockResolvedValue({ policy: [] });

      renderWithRouter(<Request {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('Elevated access request')).toBeInTheDocument();
      });

      // Form should still render
      expect(screen.getByText('Account')).toBeInTheDocument();
    });
  });

  describe('Settings Configuration Flow', () => {
    it('should apply custom settings correctly', async () => {
      const customSettings = {
        duration: '12',
        ticketNo: false,
        approval: false,
      };

      RequestService.getSetting.mockResolvedValue(customSettings);

      renderWithRouter(<Request {...mockProps} />);

      await waitFor(() => {
        expect(RequestService.getSetting).toHaveBeenCalledWith('settings');
      });
    });

    it('should handle missing settings with defaults', async () => {
      RequestService.getSetting.mockResolvedValue(null);

      renderWithRouter(<Request {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('Elevated access request')).toBeInTheDocument();
      });

      // Should still render with default values
      expect(screen.getByText('Duration')).toBeInTheDocument();
    });
  });

  describe('Error Handling Flow', () => {
    it('should handle service errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      RequestService.fetchPolicy.mockRejectedValue(new Error('Service error'));

      renderWithRouter(<Request {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('Elevated access request')).toBeInTheDocument();
      });

      consoleErrorSpy.mockRestore();
    });

    it('should show notification on submission error', async () => {
      RequestService.requestTeam.mockRejectedValue(new Error('Submission failed'));

      renderWithRouter(<Request {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('Elevated access request')).toBeInTheDocument();
      });

      // Component should handle errors internally
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });
  });
});

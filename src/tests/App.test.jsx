import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { fetchAuthSession, fetchUserAttributes, signInWithRedirect } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { mockAuthSession, mockUserAttributes } from './mocks/amplifyMocks';

vi.mock('aws-amplify/auth');
vi.mock('aws-amplify/utils');
vi.mock('../components/Navigation/Nav', () => ({
  default: ({ user, groups }) => (
    <div data-testid="nav-component">
      <span>User: {user?.email}</span>
      <span>Groups: {groups?.join(',')}</span>
    </div>
  ),
}));

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render Home component when user is not authenticated', async () => {
    fetchUserAttributes.mockRejectedValue(new Error('Not signed in'));
    fetchAuthSession.mockRejectedValue(new Error('Not signed in'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Federated Sign In')).toBeInTheDocument();
    });
  });

  it('should call signInWithRedirect when sign in button is clicked', async () => {
    fetchUserAttributes.mockRejectedValue(new Error('Not signed in'));
    fetchAuthSession.mockRejectedValue(new Error('Not signed in'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Federated Sign In')).toBeInTheDocument();
    });

    const signInButton = screen.getByText('Federated Sign In');
    await userEvent.click(signInButton);

    expect(signInWithRedirect).toHaveBeenCalled();
  });

  it('should render Nav component when user is authenticated', async () => {
    fetchUserAttributes.mockResolvedValue(mockUserAttributes);
    fetchAuthSession.mockResolvedValue(mockAuthSession);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('nav-component')).toBeInTheDocument();
      expect(screen.getByText(/User: test@example.com/)).toBeInTheDocument();
      expect(screen.getByText(/Groups: Admin,Users/)).toBeInTheDocument();
    });
  });

  it('should handle Hub auth events', async () => {
    let hubCallback;
    Hub.listen.mockImplementation((channel, callback) => {
      if (channel === 'auth') {
        hubCallback = callback;
      }
    });

    fetchUserAttributes.mockResolvedValue(mockUserAttributes);
    fetchAuthSession.mockResolvedValue(mockAuthSession);

    render(<App />);

    expect(Hub.listen).toHaveBeenCalledWith('auth', expect.any(Function));

    // Simulate cognitoHostedUI event
    if (hubCallback) {
      await hubCallback({
        payload: {
          event: 'cognitoHostedUI',
          data: {},
        },
      });
    }

    await waitFor(() => {
      expect(fetchUserAttributes).toHaveBeenCalled();
      expect(fetchAuthSession).toHaveBeenCalled();
    });
  });

  it('should handle authentication errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    fetchUserAttributes.mockRejectedValue(new Error('Auth error'));
    fetchAuthSession.mockRejectedValue(new Error('Auth error'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Federated Sign In')).toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore();
  });

  it('should extract user data from auth session correctly', async () => {
    const customSession = {
      tokens: {
        idToken: {
          payload: {
            'cognito:groups': ['admin', 'developer'],
            userId: 'custom-user-id',
            groupIds: 'group-a,group-b,group-c',
            groups: 'Admin,Developer,Tester',
          },
        },
      },
    };

    fetchUserAttributes.mockResolvedValue(mockUserAttributes);
    fetchAuthSession.mockResolvedValue(customSession);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Groups: Admin,Developer,Tester/)).toBeInTheDocument();
    });
  });
});

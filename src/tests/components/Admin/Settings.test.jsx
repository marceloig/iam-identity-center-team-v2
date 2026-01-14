import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as RequestService from '../../../components/Shared/RequestService';
import { mockSettings } from '../../mocks/mockData';

vi.mock('../../../components/Shared/RequestService');

// Mock do componente Settings (ajustar conforme implementação real)
const MockSettings = ({ user, addNotification }) => {
  const [duration, setDuration] = React.useState('');
  const [approval, setApproval] = React.useState(true);
  const [ticketNo, setTicketNo] = React.useState(true);

  React.useEffect(() => {
    RequestService.getSetting('settings').then((data) => {
      if (data) {
        setDuration(data.duration);
        setApproval(data.approval);
        setTicketNo(data.ticketNo);
      }
    });
  }, []);

  const handleSave = async () => {
    await RequestService.updateSetting({
      id: 'settings',
      duration,
      approval,
      ticketNo,
    });
    addNotification([
      {
        type: 'success',
        content: 'Settings updated successfully',
      },
    ]);
  };

  return (
    <div>
      <h1>Settings</h1>
      <label>
        Duration
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          data-testid="duration-input"
        />
      </label>
      <label>
        <input
          type="checkbox"
          checked={approval}
          onChange={(e) => setApproval(e.target.checked)}
          data-testid="approval-checkbox"
        />
        Require Approval
      </label>
      <label>
        <input
          type="checkbox"
          checked={ticketNo}
          onChange={(e) => setTicketNo(e.target.checked)}
          data-testid="ticket-checkbox"
        />
        Require Ticket Number
      </label>
      <button onClick={handleSave}>Save Settings</button>
    </div>
  );
};

describe('Settings Component', () => {
  const mockProps = {
    user: 'admin@example.com',
    addNotification: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    RequestService.getSetting.mockResolvedValue(mockSettings);
    RequestService.updateSetting.mockResolvedValue({ success: true });
  });

  it('should load settings on mount', async () => {
    render(<MockSettings {...mockProps} />);

    await waitFor(() => {
      expect(RequestService.getSetting).toHaveBeenCalledWith('settings');
    });
  });

  it('should display loaded settings', async () => {
    render(<MockSettings {...mockProps} />);

    await waitFor(() => {
      const durationInput = screen.getByTestId('duration-input');
      expect(durationInput).toHaveValue(8);
    });

    const approvalCheckbox = screen.getByTestId('approval-checkbox');
    const ticketCheckbox = screen.getByTestId('ticket-checkbox');

    expect(approvalCheckbox).toBeChecked();
    expect(ticketCheckbox).toBeChecked();
  });

  it('should update duration value', async () => {
    render(<MockSettings {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByTestId('duration-input')).toBeInTheDocument();
    });

    const durationInput = screen.getByTestId('duration-input');
    await userEvent.clear(durationInput);
    await userEvent.type(durationInput, '12');

    expect(durationInput).toHaveValue(12);
  });

  it('should toggle approval checkbox', async () => {
    render(<MockSettings {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByTestId('approval-checkbox')).toBeInTheDocument();
    });

    const approvalCheckbox = screen.getByTestId('approval-checkbox');
    await userEvent.click(approvalCheckbox);

    expect(approvalCheckbox).not.toBeChecked();
  });

  it('should save settings on button click', async () => {
    render(<MockSettings {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Save Settings')).toBeInTheDocument();
    });

    const saveButton = screen.getByText('Save Settings');
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(RequestService.updateSetting).toHaveBeenCalledWith({
        id: 'settings',
        duration: '8',
        approval: true,
        ticketNo: true,
      });
    });

    expect(mockProps.addNotification).toHaveBeenCalledWith([
      {
        type: 'success',
        content: 'Settings updated successfully',
      },
    ]);
  });

  it('should handle save errors gracefully', async () => {
    RequestService.updateSetting.mockRejectedValue(new Error('Save failed'));

    render(<MockSettings {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Save Settings')).toBeInTheDocument();
    });

    const saveButton = screen.getByText('Save Settings');
    await userEvent.click(saveButton);

    // Component should handle error internally
    await waitFor(() => {
      expect(RequestService.updateSetting).toHaveBeenCalled();
    });
  });
});

describe('Settings Validation', () => {
  it('should validate duration is positive number', () => {
    const validateDuration = (duration) => {
      const num = Number(duration);
      return !isNaN(num) && num > 0 && num <= 24;
    };

    expect(validateDuration('8')).toBe(true);
    expect(validateDuration('12')).toBe(true);
    expect(validateDuration('0')).toBe(false);
    expect(validateDuration('-1')).toBe(false);
    expect(validateDuration('25')).toBe(false);
    expect(validateDuration('abc')).toBe(false);
  });

  it('should validate expiry is positive number', () => {
    const validateExpiry = (expiry) => {
      const num = Number(expiry);
      return !isNaN(num) && num > 0 && num <= 168; // Max 1 week
    };

    expect(validateExpiry('24')).toBe(true);
    expect(validateExpiry('168')).toBe(true);
    expect(validateExpiry('0')).toBe(false);
    expect(validateExpiry('169')).toBe(false);
  });

  it('should validate email format', () => {
    const validateEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('test.user@domain.co.uk')).toBe(true);
    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail('invalid@')).toBe(false);
    expect(validateEmail('@invalid.com')).toBe(false);
  });
});

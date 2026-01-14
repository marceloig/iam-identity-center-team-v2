import { describe, it, expect } from 'vitest';

describe('Helper Functions', () => {
  describe('concatenateAccounts', () => {
    it('should concatenate and deduplicate accounts', () => {
      const data = [
        {
          accounts: [
            { name: 'Account 1', id: '123' },
            { name: 'Account 2', id: '456' },
          ],
        },
        {
          accounts: [
            { name: 'Account 1', id: '123' },
            { name: 'Account 3', id: '789' },
          ],
        },
      ];

      const concatenateAccounts = (data) => {
        let allAccounts = data.map((item) => item.accounts);
        allAccounts = [].concat.apply([], allAccounts);

        let uniqueAccounts = new Set();
        allAccounts.forEach((account) => {
          uniqueAccounts.add(JSON.stringify(account));
        });

        return Array.from(uniqueAccounts).map((account) => JSON.parse(account));
      };

      const result = concatenateAccounts(data);

      expect(result).toHaveLength(3);
      expect(result).toEqual([
        { name: 'Account 1', id: '123' },
        { name: 'Account 2', id: '456' },
        { name: 'Account 3', id: '789' },
      ]);
    });
  });

  describe('concatenatePermissions', () => {
    it('should concatenate and deduplicate permissions', () => {
      const data = [
        { name: 'Permission 1', id: 'ps-1' },
        { name: 'Permission 2', id: 'ps-2' },
        { name: 'Permission 1', id: 'ps-1' },
      ];

      const concatenatePermissions = (data) => {
        let uniquePermissions = new Set();
        data.forEach((permission) => {
          uniquePermissions.add(JSON.stringify(permission));
        });

        return Array.from(uniquePermissions).map((permission) => JSON.parse(permission));
      };

      const result = concatenatePermissions(data);

      expect(result).toHaveLength(2);
      expect(result).toEqual([
        { name: 'Permission 1', id: 'ps-1' },
        { name: 'Permission 2', id: 'ps-2' },
      ]);
    });
  });

  describe('checkGroupMembership', () => {
    it('should return true if user is in any of the groups', () => {
      const checkGroupMembership = (userGroups, requiredGroups) => {
        for (const groupId of userGroups) {
          if (requiredGroups.includes(groupId)) {
            return true;
          }
        }
        return false;
      };

      const userGroups = ['group-1', 'group-2'];
      const requiredGroups = ['group-2', 'group-3'];

      const result = checkGroupMembership(userGroups, requiredGroups);

      expect(result).toBe(true);
    });

    it('should return false if user is not in any of the groups', () => {
      const checkGroupMembership = (userGroups, requiredGroups) => {
        for (const groupId of userGroups) {
          if (requiredGroups.includes(groupId)) {
            return true;
          }
        }
        return false;
      };

      const userGroups = ['group-1', 'group-2'];
      const requiredGroups = ['group-3', 'group-4'];

      const result = checkGroupMembership(userGroups, requiredGroups);

      expect(result).toBe(false);
    });
  });

  describe('Validation Functions', () => {
    describe('validateDuration', () => {
      it('should validate duration within range', () => {
        const validateDuration = (duration, maxDuration) => {
          return (
            duration &&
            !isNaN(duration) &&
            Number(duration) <= Number(maxDuration) &&
            Number(duration) >= 1
          );
        };

        expect(validateDuration('4', '8')).toBe(true);
        expect(validateDuration('1', '8')).toBe(true);
        expect(validateDuration('8', '8')).toBe(true);
      });

      it('should invalidate duration outside range', () => {
        const validateDuration = (duration, maxDuration) => {
          return (
            duration &&
            !isNaN(duration) &&
            Number(duration) <= Number(maxDuration) &&
            Number(duration) >= 1
          );
        };

        expect(validateDuration('0', '8')).toBe(false);
        expect(validateDuration('9', '8')).toBe(false);
        expect(validateDuration('abc', '8')).toBe(false);
        expect(validateDuration('', '8')).toBe(false);
      });
    });

    describe('validateJustification', () => {
      it('should validate justification with alphanumeric start', () => {
        const validateJustification = (justification) => {
          return justification && /[\p{L}\p{N}]/u.test(justification[0]);
        };

        expect(validateJustification('Valid justification')).toBe(true);
        expect(validateJustification('123 numeric start')).toBe(true);
        expect(validateJustification('Ação válida')).toBe(true);
      });

      it('should invalidate justification with special char start', () => {
        const validateJustification = (justification) => {
          return justification && /[\p{L}\p{N}]/u.test(justification[0]);
        };

        expect(validateJustification('!Invalid')).toBe(false);
        expect(validateJustification(' Space start')).toBe(false);
        expect(validateJustification('')).toBe(false);
      });
    });

    describe('validateTicketNo', () => {
      it('should validate alphanumeric ticket numbers', () => {
        const validateTicketNo = (ticketNo) => {
          return ticketNo && /^[a-zA-Z0-9]+$/.test(ticketNo[0]);
        };

        expect(validateTicketNo('TICKET123')).toBe(true);
        expect(validateTicketNo('123456')).toBe(true);
        expect(validateTicketNo('ABC')).toBe(true);
      });

      it('should invalidate non-alphanumeric ticket numbers', () => {
        const validateTicketNo = (ticketNo) => {
          return ticketNo && /^[a-zA-Z0-9]+$/.test(ticketNo[0]);
        };

        expect(validateTicketNo('TICKET-123')).toBe(false);
        expect(validateTicketNo(' TICKET')).toBe(false);
        expect(validateTicketNo('')).toBe(false);
      });
    });
  });

  describe('Date Formatting', () => {
    it('should format date correctly', () => {
      const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString();
      };

      const result = formatDate('2024-01-01T10:00:00Z');
      expect(result).toBe('2024-01-01T10:00:00.000Z');
    });
  });

  describe('Status Helpers', () => {
    it('should determine if request is pending', () => {
      const isPending = (status) => status === 'pending';

      expect(isPending('pending')).toBe(true);
      expect(isPending('approved')).toBe(false);
      expect(isPending('rejected')).toBe(false);
    });

    it('should determine if request is approved', () => {
      const isApproved = (status) => status === 'approved';

      expect(isApproved('approved')).toBe(true);
      expect(isApproved('pending')).toBe(false);
    });

    it('should determine if request is active', () => {
      const isActive = (status) => ['pending', 'approved'].includes(status);

      expect(isActive('pending')).toBe(true);
      expect(isActive('approved')).toBe(true);
      expect(isActive('rejected')).toBe(false);
      expect(isActive('revoked')).toBe(false);
    });
  });
});

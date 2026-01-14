/**
 * Exemplos de Testes - Guia de Referência
 * 
 * Este arquivo contém exemplos de diferentes tipos de testes
 * que você pode usar como referência ao criar novos testes.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ============================================================================
// EXEMPLO 1: Teste Básico de Função
// ============================================================================

describe('Exemplo 1: Testes de Funções Puras', () => {
  const sum = (a, b) => a + b;
  const multiply = (a, b) => a * b;

  it('should add two numbers', () => {
    expect(sum(2, 3)).toBe(5);
    expect(sum(-1, 1)).toBe(0);
  });

  it('should multiply two numbers', () => {
    expect(multiply(2, 3)).toBe(6);
    expect(multiply(0, 5)).toBe(0);
  });
});

// ============================================================================
// EXEMPLO 2: Testes com Mocks
// ============================================================================

describe('Exemplo 2: Usando Mocks', () => {
  const fetchData = async (api) => {
    const response = await api.getData();
    return response.data;
  };

  it('should fetch data from API', async () => {
    // Criar mock da API
    const mockApi = {
      getData: vi.fn().mockResolvedValue({ data: 'test data' }),
    };

    const result = await fetchData(mockApi);

    expect(result).toBe('test data');
    expect(mockApi.getData).toHaveBeenCalledTimes(1);
  });

  it('should handle API errors', async () => {
    const mockApi = {
      getData: vi.fn().mockRejectedValue(new Error('API Error')),
    };

    await expect(fetchData(mockApi)).rejects.toThrow('API Error');
  });
});

// ============================================================================
// EXEMPLO 3: Testes de Componentes React
// ============================================================================

describe('Exemplo 3: Testes de Componentes', () => {
  const Button = ({ onClick, children, disabled }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );

  it('should render button with text', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);

    await userEvent.click(screen.getByText('Click Me'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeDisabled();
  });
});

// ============================================================================
// EXEMPLO 4: Testes Assíncronos
// ============================================================================

describe('Exemplo 4: Operações Assíncronas', () => {
  const AsyncComponent = () => {
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
      setTimeout(() => {
        setData('Loaded Data');
        setLoading(false);
      }, 100);
    }, []);

    if (loading) return <div>Loading...</div>;
    return <div>{data}</div>;
  };

  it('should show loading state initially', () => {
    render(<AsyncComponent />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should show data after loading', async () => {
    render(<AsyncComponent />);

    await waitFor(() => {
      expect(screen.getByText('Loaded Data')).toBeInTheDocument();
    });
  });
});

// ============================================================================
// EXEMPLO 5: Setup e Teardown
// ============================================================================

describe('Exemplo 5: Setup e Teardown', () => {
  let mockData;

  beforeEach(() => {
    // Executado antes de cada teste
    mockData = { id: 1, name: 'Test' };
  });

  afterEach(() => {
    // Executado após cada teste
    mockData = null;
  });

  it('should have access to mockData', () => {
    expect(mockData).toEqual({ id: 1, name: 'Test' });
  });

  it('should have fresh mockData in each test', () => {
    mockData.name = 'Modified';
    expect(mockData.name).toBe('Modified');
  });
});

// ============================================================================
// EXEMPLO 6: Testes Parametrizados
// ============================================================================

describe('Exemplo 6: Testes Parametrizados', () => {
  const isEven = (num) => num % 2 === 0;

  const testCases = [
    { input: 2, expected: true },
    { input: 3, expected: false },
    { input: 0, expected: true },
    { input: -2, expected: true },
    { input: -3, expected: false },
  ];

  testCases.forEach(({ input, expected }) => {
    it(`should return ${expected} for ${input}`, () => {
      expect(isEven(input)).toBe(expected);
    });
  });
});

// ============================================================================
// EXEMPLO 7: Testes de Validação
// ============================================================================

describe('Exemplo 7: Validação de Dados', () => {
  const validateUser = (user) => {
    const errors = [];

    if (!user.email || !user.email.includes('@')) {
      errors.push('Invalid email');
    }

    if (!user.password || user.password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }

    return errors;
  };

  it('should validate correct user', () => {
    const user = {
      email: 'test@example.com',
      password: 'password123',
    };

    expect(validateUser(user)).toEqual([]);
  });

  it('should return errors for invalid user', () => {
    const user = {
      email: 'invalid',
      password: '123',
    };

    const errors = validateUser(user);

    expect(errors).toContain('Invalid email');
    expect(errors).toContain('Password must be at least 8 characters');
  });
});

// ============================================================================
// EXEMPLO 8: Testes de Formulários
// ============================================================================

describe('Exemplo 8: Testes de Formulários', () => {
  const Form = ({ onSubmit }) => {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit({ email, password });
    };

    return (
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Submit</button>
      </form>
    );
  };

  it('should submit form with values', async () => {
    const handleSubmit = vi.fn();
    render(<Form onSubmit={handleSubmit} />);

    await userEvent.type(screen.getByPlaceholderText('Email'), 'test@example.com');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'password123');
    await userEvent.click(screen.getByText('Submit'));

    expect(handleSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });
});

// ============================================================================
// EXEMPLO 9: Testes de Erros
// ============================================================================

describe('Exemplo 9: Tratamento de Erros', () => {
  const divide = (a, b) => {
    if (b === 0) {
      throw new Error('Division by zero');
    }
    return a / b;
  };

  it('should divide numbers correctly', () => {
    expect(divide(10, 2)).toBe(5);
  });

  it('should throw error on division by zero', () => {
    expect(() => divide(10, 0)).toThrow('Division by zero');
  });
});

// ============================================================================
// EXEMPLO 10: Testes de Snapshot (Opcional)
// ============================================================================

describe('Exemplo 10: Snapshot Testing', () => {
  const Card = ({ title, content }) => (
    <div className="card">
      <h2>{title}</h2>
      <p>{content}</p>
    </div>
  );

  it('should match snapshot', () => {
    const { container } = render(
      <Card title="Test Title" content="Test Content" />
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});

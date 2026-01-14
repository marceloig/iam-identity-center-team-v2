# 🚀 Quick Start - Testes

## Instalação Rápida

```bash
# 1. Instalar dependências
npm install

# 2. Executar testes
npm test
```

## Comandos Essenciais

```bash
# Executar todos os testes (modo watch)
npm test

# Executar testes uma vez
npm run test:run

# Ver cobertura de código
npm run test:coverage

# Interface visual interativa
npm run test:ui
```

## Comandos Avançados

```bash
# Executar apenas testes de componentes
npm test -- src/tests/components

# Executar apenas testes de serviços
npm test -- src/tests/services

# Executar apenas testes de GraphQL
npm test -- src/tests/graphql

# Executar apenas testes de integração
npm test -- src/tests/integration

# Executar teste específico
npm test -- Request.test.jsx

# Executar testes com filtro
npm test -- --grep "should validate"

# Executar testes em modo debug
npm test -- --inspect-brk
```

## Verificar Cobertura

```bash
# Gerar relatório de cobertura
npm run test:coverage

# Abrir relatório HTML
# Windows
start coverage/index.html

# Mac/Linux
open coverage/index.html
```

## Estrutura de Arquivos

```
src/tests/
├── mocks/                    # Mocks reutilizáveis
│   ├── amplifyMocks.js      # AWS Amplify
│   └── mockData.js          # Dados de teste
├── components/              # Testes de componentes
├── services/                # Testes de serviços
├── graphql/                 # Testes GraphQL
├── integration/             # Testes de integração
├── utils/                   # Testes de utilitários
├── examples/                # Exemplos
├── setup.js                 # Setup global
└── README.md               # Documentação
```

## Criar Novo Teste

### 1. Teste de Componente

```javascript
// src/tests/components/MyComponent.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from '../../components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### 2. Teste de Serviço

```javascript
// src/tests/services/MyService.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateClient } from 'aws-amplify/api';
import * as MyService from '../../services/MyService';

vi.mock('aws-amplify/api');

describe('MyService', () => {
  let mockClient;

  beforeEach(() => {
    mockClient = { queries: { getData: vi.fn() } };
    generateClient.mockReturnValue(mockClient);
  });

  it('should fetch data', async () => {
    mockClient.queries.getData.mockResolvedValue({ data: 'test' });
    
    const result = await MyService.fetchData();
    
    expect(result).toBe('test');
  });
});
```

### 3. Teste de GraphQL

```javascript
// src/tests/graphql/myQuery.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateClient } from 'aws-amplify/api';
import * as queries from '../../graphql/queries';

vi.mock('aws-amplify/api');

describe('GraphQL Queries', () => {
  let mockClient;

  beforeEach(() => {
    mockClient = { graphql: vi.fn() };
    generateClient.mockReturnValue(mockClient);
  });

  it('should query data', async () => {
    mockClient.graphql.mockResolvedValue({
      data: { getData: { id: '1' } }
    });

    const client = generateClient();
    const result = await client.graphql({
      query: queries.getData,
      variables: { id: '1' }
    });

    expect(result.data.getData.id).toBe('1');
  });
});
```

## Usar Mocks

```javascript
// Importar mocks
import { mockAmplifyAuth } from './mocks/amplifyMocks';
import { mockRequests, mockSettings } from './mocks/mockData';

// Usar em testes
vi.mock('aws-amplify/auth', () => mockAmplifyAuth);

// Usar dados
mockClient.queries.getRequests.mockResolvedValue({ data: mockRequests });
```

## Debugging

```javascript
// Ver DOM renderizado
import { screen } from '@testing-library/react';
screen.debug();

// Ver elemento específico
screen.debug(screen.getByText('Hello'));

// Console log
console.log('Debug:', someValue);
console.table(arrayOfObjects);
```

## Dicas Rápidas

### ✅ Fazer
- Testar comportamento do usuário
- Usar `waitFor` para operações assíncronas
- Limpar mocks com `vi.clearAllMocks()`
- Testar casos de erro
- Usar mocks reutilizáveis

### ❌ Evitar
- Testar detalhes de implementação
- Usar `setTimeout` em testes
- Esquecer de limpar mocks
- Testes muito longos
- Duplicar código de teste

## Troubleshooting

### Erro: "Cannot find module"
```bash
# Verificar se dependências estão instaladas
npm install
```

### Erro: "ReferenceError: React is not defined"
```javascript
// Adicionar no topo do arquivo de teste
import React from 'react';
```

### Erro: "waitFor timeout"
```javascript
// Aumentar timeout
await waitFor(() => {
  expect(screen.getByText('Hello')).toBeInTheDocument();
}, { timeout: 5000 });
```

### Testes lentos
```bash
# Executar em paralelo (padrão)
npm test

# Executar sequencialmente
npm test -- --no-threads
```

## Recursos

- 📖 [TESTING.md](./TESTING.md) - Documentação completa
- 📖 [src/tests/README.md](./src/tests/README.md) - Guia rápido
- 💡 [src/tests/examples/example.test.js](./src/tests/examples/example.test.js) - Exemplos
- 📊 [TEST-SUMMARY.md](./TEST-SUMMARY.md) - Resumo da suíte

## Suporte

- [Vitest Docs](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Pronto para começar?**

```bash
npm install && npm test
```

🎉 Boa sorte com os testes!

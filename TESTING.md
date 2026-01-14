# Guia de Testes - IAM Identity Center Team

## 📋 Visão Geral

Este projeto utiliza uma suíte de testes moderna e abrangente com as seguintes tecnologias:

- **Vitest** - Framework de testes rápido e moderno (substituto do Jest)
- **React Testing Library** - Testes de componentes React focados no comportamento do usuário
- **@testing-library/user-event** - Simulação realista de interações do usuário
- **@testing-library/jest-dom** - Matchers customizados para assertions de DOM
- **jsdom** - Ambiente de DOM para testes
- **@vitest/coverage-v8** - Cobertura de código com V8

## 🚀 Instalação

Instale as dependências de teste:

```bash
npm install
```

## 📝 Scripts Disponíveis

```bash
# Executar testes em modo watch (desenvolvimento)
npm test

# Executar testes uma vez (CI/CD)
npm run test:run

# Executar testes com interface visual
npm run test:ui

# Executar testes com relatório de cobertura
npm run test:coverage
```

## 📁 Estrutura de Testes

```
src/tests/
├── mocks/
│   ├── amplifyMocks.js      # Mocks do AWS Amplify
│   └── mockData.js          # Dados de teste reutilizáveis
├── components/
│   └── Requests/
│       └── Request.test.jsx # Testes do componente Request
├── graphql/
│   ├── queries.test.js      # Testes de queries GraphQL
│   └── mutations.test.js    # Testes de mutations GraphQL
├── services/
│   └── RequestService.test.js # Testes dos serviços
├── integration/
│   └── request-flow.test.jsx # Testes de integração
├── utils/
│   └── helpers.test.js      # Testes de funções auxiliares
├── setup.js                 # Configuração global dos testes
└── App.test.jsx            # Testes do componente principal
```

## 🧪 Tipos de Testes

### 1. Testes Unitários

Testam funções e componentes isoladamente:

```javascript
// Exemplo: src/tests/utils/helpers.test.js
describe('validateDuration', () => {
  it('should validate duration within range', () => {
    expect(validateDuration('4', '8')).toBe(true);
  });
});
```

### 2. Testes de Componentes

Testam componentes React com interações do usuário:

```javascript
// Exemplo: src/tests/components/Requests/Request.test.jsx
it('should render request form with all fields', async () => {
  render(<Request {...mockProps} />);
  
  await waitFor(() => {
    expect(screen.getByText('Elevated access request')).toBeInTheDocument();
  });
});
```

### 3. Testes de Integração

Testam fluxos completos da aplicação:

```javascript
// Exemplo: src/tests/integration/request-flow.test.jsx
it('should complete full request flow from load to submission', async () => {
  // Testa o fluxo completo de criação de request
});
```

### 4. Testes de GraphQL

Testam queries e mutations do GraphQL:

```javascript
// Exemplo: src/tests/graphql/queries.test.js
it('should query request by id', async () => {
  const result = await client.graphql({
    query: queries.getRequests,
    variables: { id: '1' },
  });
  
  expect(result.data.getRequests).toEqual(mockRequests[0]);
});
```

## 🎭 Mocks e Stubs

### AWS Amplify

Os mocks do Amplify estão em `src/tests/mocks/amplifyMocks.js`:

```javascript
import { mockAmplifyAuth, mockGraphQLResponse } from './mocks/amplifyMocks';

// Usar em testes
vi.mock('aws-amplify/auth', () => mockAmplifyAuth);
```

### Dados de Teste

Dados reutilizáveis em `src/tests/mocks/mockData.js`:

```javascript
import { mockRequests, mockSettings, mockAccounts } from '../mocks/mockData';

// Usar em testes
mockClient.queries.getAccounts.mockResolvedValue({ data: mockAccounts });
```

### AWS SDK

Os SDKs da AWS são mockados automaticamente:

```javascript
vi.mock('@aws-sdk/client-sso-admin', () => ({
  SSOAdminClient: vi.fn(),
  CreateAccountAssignmentCommand: vi.fn(),
}));
```

## 📊 Cobertura de Código

### Metas de Cobertura

O projeto está configurado com as seguintes metas:

- **Linhas**: 80%
- **Funções**: 80%
- **Branches**: 80%
- **Statements**: 80%

### Visualizar Cobertura

```bash
npm run test:coverage
```

O relatório será gerado em:
- Console: Resumo da cobertura
- HTML: `coverage/index.html` (abra no navegador)
- LCOV: `coverage/lcov.info` (para integração com CI/CD)

### Arquivos Excluídos da Cobertura

- `node_modules/`
- `src/tests/`
- `**/*.d.ts`
- `**/*.config.js`
- `**/mockData.js`
- `amplify/`
- `deployment/`

## 🔧 Configuração

### vitest.config.js

```javascript
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
    },
  },
});
```

### setup.js

Configuração global executada antes de cada teste:

```javascript
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});
```

## ✅ Melhores Práticas

### 1. Nomenclatura de Testes

```javascript
// ✅ Bom - Descreve o comportamento esperado
it('should display error when duration exceeds maximum', () => {});

// ❌ Ruim - Muito genérico
it('test duration', () => {});
```

### 2. Arrange-Act-Assert

```javascript
it('should create request successfully', async () => {
  // Arrange - Preparar dados e mocks
  const mockData = { accountId: '123', role: 'Admin' };
  mockService.create.mockResolvedValue({ id: '1' });
  
  // Act - Executar ação
  const result = await createRequest(mockData);
  
  // Assert - Verificar resultado
  expect(result.id).toBe('1');
  expect(mockService.create).toHaveBeenCalledWith(mockData);
});
```

### 3. Testar Comportamento, Não Implementação

```javascript
// ✅ Bom - Testa o que o usuário vê
it('should show validation error for invalid email', async () => {
  render(<Form />);
  await userEvent.type(screen.getByLabelText('Email'), 'invalid');
  await userEvent.click(screen.getByText('Submit'));
  
  expect(screen.getByText('Invalid email format')).toBeInTheDocument();
});

// ❌ Ruim - Testa detalhes de implementação
it('should call validateEmail function', () => {
  const spy = vi.spyOn(validator, 'validateEmail');
  // ...
});
```

### 4. Usar waitFor para Operações Assíncronas

```javascript
it('should load data on mount', async () => {
  render(<Component />);
  
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
});
```

### 5. Limpar Mocks Entre Testes

```javascript
beforeEach(() => {
  vi.clearAllMocks();
});
```

## 🐛 Debugging

### Visualizar DOM Renderizado

```javascript
import { screen } from '@testing-library/react';

it('debug test', () => {
  render(<Component />);
  screen.debug(); // Imprime o DOM no console
});
```

### Usar UI do Vitest

```bash
npm run test:ui
```

Abre uma interface visual para:
- Ver testes em tempo real
- Debugar testes falhando
- Ver cobertura de código
- Filtrar e buscar testes

### Console Logs

```javascript
it('debug values', () => {
  console.log('Debug:', someValue);
  // ou
  console.table(arrayOfObjects);
});
```

## 🔄 CI/CD

### GitHub Actions

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:run
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

## 📚 Recursos Adicionais

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [AWS Amplify Testing Guide](https://docs.amplify.aws/react/build-a-backend/auth/test/)

## 🤝 Contribuindo

Ao adicionar novos recursos:

1. ✅ Escreva testes para novos componentes
2. ✅ Mantenha cobertura acima de 80%
3. ✅ Siga as convenções de nomenclatura
4. ✅ Adicione mocks para APIs externas
5. ✅ Execute `npm run test:coverage` antes de commit

## 📞 Suporte

Para dúvidas sobre testes:
1. Consulte este guia
2. Veja exemplos em `src/tests/`
3. Consulte a documentação do Vitest
4. Abra uma issue no repositório

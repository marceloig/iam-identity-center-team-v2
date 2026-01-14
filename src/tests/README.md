# Testes Unitários - IAM Identity Center Team

## 🎯 Objetivo

Esta suíte de testes fornece cobertura abrangente para o projeto IAM Identity Center Team, incluindo:

- ✅ Testes de componentes React
- ✅ Testes de serviços e APIs
- ✅ Testes de queries e mutations GraphQL
- ✅ Testes de integração de fluxos completos
- ✅ Mocks para AWS Amplify e AWS SDK
- ✅ Cobertura de código > 80%

## 🚀 Quick Start

```bash
# Instalar dependências
npm install

# Executar testes em modo watch
npm test

# Executar testes uma vez
npm run test:run

# Ver cobertura
npm run test:coverage

# Interface visual
npm run test:ui
```

## 📦 Tecnologias

- **Vitest** - Framework de testes moderno e rápido
- **React Testing Library** - Testes focados no usuário
- **@testing-library/user-event** - Simulação de interações
- **jsdom** - Ambiente DOM para testes
- **@vitest/coverage-v8** - Cobertura de código

## 📂 Estrutura

```
src/tests/
├── mocks/                    # Mocks reutilizáveis
│   ├── amplifyMocks.js      # AWS Amplify mocks
│   └── mockData.js          # Dados de teste
├── components/              # Testes de componentes
│   └── Requests/
│       └── Request.test.jsx
├── graphql/                 # Testes GraphQL
│   ├── queries.test.js
│   └── mutations.test.js
├── services/                # Testes de serviços
│   └── RequestService.test.js
├── integration/             # Testes de integração
│   └── request-flow.test.jsx
├── utils/                   # Testes de utilitários
│   └── helpers.test.js
├── setup.js                 # Setup global
├── App.test.jsx            # Teste do App
└── README.md               # Este arquivo
```

## 🧪 Exemplos de Testes

### Teste de Componente

```javascript
it('should render request form', async () => {
  render(<Request {...mockProps} />);
  
  await waitFor(() => {
    expect(screen.getByText('Elevated access request')).toBeInTheDocument();
  });
});
```

### Teste de Serviço

```javascript
it('should fetch accounts successfully', async () => {
  mockClient.queries.getAccounts.mockResolvedValue({ data: mockAccounts });
  
  const result = await RequestService.fetchAccounts();
  
  expect(result).toEqual(mockAccounts);
});
```

### Teste de GraphQL

```javascript
it('should create request', async () => {
  const result = await client.graphql({
    query: mutations.createRequests,
    variables: { input: newRequest },
  });
  
  expect(result.data.createRequests.status).toBe('pending');
});
```

## 🎭 Mocks Disponíveis

### AWS Amplify Auth

```javascript
import { mockAmplifyAuth } from './mocks/amplifyMocks';

vi.mock('aws-amplify/auth', () => mockAmplifyAuth);
```

### Dados de Teste

```javascript
import { 
  mockRequests, 
  mockSettings, 
  mockAccounts 
} from './mocks/mockData';
```

## 📊 Cobertura

Metas de cobertura configuradas:
- Linhas: 80%
- Funções: 80%
- Branches: 80%
- Statements: 80%

## 📖 Documentação Completa

Veja [TESTING.md](../../TESTING.md) para documentação completa incluindo:
- Guia detalhado de testes
- Melhores práticas
- Debugging
- CI/CD
- Troubleshooting

## 🤝 Contribuindo

Ao adicionar novos testes:

1. Siga a estrutura de pastas existente
2. Use os mocks disponíveis em `mocks/`
3. Mantenha cobertura > 80%
4. Siga o padrão Arrange-Act-Assert
5. Teste comportamento, não implementação

## 💡 Dicas

- Use `screen.debug()` para ver o DOM renderizado
- Use `npm run test:ui` para debugging visual
- Use `waitFor()` para operações assíncronas
- Limpe mocks com `vi.clearAllMocks()` no `beforeEach`
- Teste casos de erro além dos casos de sucesso

# 🧪 Suíte de Testes - IAM Identity Center Team v2

## 📖 Visão Geral

Este projeto agora inclui uma suíte completa de testes unitários e de integração usando as tecnologias mais modernas:

- ✅ **Vitest** - Framework de testes rápido e moderno
- ✅ **React Testing Library** - Testes focados no comportamento do usuário
- ✅ **Mocks completos** - AWS Amplify, AWS SDK e APIs externas
- ✅ **Cobertura > 80%** - Métricas de qualidade configuradas
- ✅ **CI/CD pronto** - GitHub Actions configurado

## 🚀 Quick Start

```bash
# Instalar dependências
npm install

# Executar testes
npm test

# Ver cobertura
npm run test:coverage

# Interface visual
npm run test:ui
```

## 📂 Estrutura de Testes

```
src/tests/
├── mocks/                    # Mocks reutilizáveis
│   ├── amplifyMocks.js      # AWS Amplify (Auth, API, GraphQL)
│   └── mockData.js          # Dados de teste (Requests, Sessions, etc.)
├── components/              # Testes de componentes React
│   ├── Requests/
│   └── Admin/
├── services/                # Testes de serviços
│   └── RequestService.test.js
├── graphql/                 # Testes de queries e mutations
│   ├── queries.test.js
│   └── mutations.test.js
├── integration/             # Testes de fluxos completos
│   └── request-flow.test.jsx
├── utils/                   # Testes de funções auxiliares
│   └── helpers.test.js
├── examples/                # Exemplos de testes
│   └── example.test.js
└── setup.js                 # Configuração global
```

## 📊 Cobertura

### Componentes Testados
- ✅ App (autenticação, navegação)
- ✅ Request (formulário, validação, submissão)
- ✅ Settings (configurações)

### Serviços Testados
- ✅ RequestService (15+ queries, 10+ mutations)
- ✅ Tratamento de erros
- ✅ Paginação

### GraphQL Testado
- ✅ Todas as queries principais
- ✅ Todas as mutations principais
- ✅ Tratamento de erros

### Fluxos Testados
- ✅ Fluxo completo de requisição
- ✅ Fluxo de aprovação
- ✅ Validação de formulários
- ✅ Carregamento de dados

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm test              # Modo watch (desenvolvimento)
npm run test:ui       # Interface visual interativa

# CI/CD
npm run test:run      # Executar uma vez
npm run test:coverage # Gerar relatório de cobertura

# Específicos
npm test -- src/tests/components    # Apenas componentes
npm test -- src/tests/services      # Apenas serviços
npm test -- src/tests/graphql       # Apenas GraphQL
npm test -- Request.test.jsx        # Teste específico
```

## 📚 Documentação

### Guias Completos
- 📖 [TESTING.md](./TESTING.md) - Documentação completa de testes
- 🚀 [QUICK-START-TESTS.md](./QUICK-START-TESTS.md) - Guia rápido
- ✅ [TEST-CHECKLIST.md](./TEST-CHECKLIST.md) - Checklist de verificação
- 📋 [TEST-SUMMARY.md](./TEST-SUMMARY.md) - Resumo da suíte

### Exemplos
- 💡 [src/tests/examples/example.test.js](./src/tests/examples/example.test.js) - Exemplos práticos
- 📖 [src/tests/README.md](./src/tests/README.md) - Guia dos testes

## 🎯 Melhores Práticas

### ✅ Implementadas
- Testes focados no comportamento do usuário
- Mocks completos de APIs externas
- Arrange-Act-Assert pattern
- Casos de sucesso e erro
- Documentação abrangente

### 🎭 Mocks Disponíveis
```javascript
// AWS Amplify
import { mockAmplifyAuth } from './mocks/amplifyMocks';

// Dados de teste
import { 
  mockRequests, 
  mockSettings, 
  mockAccounts 
} from './mocks/mockData';
```

## 🔧 Tecnologias

### Framework
- **Vitest 2.1.8** - Framework de testes moderno
- **jsdom 25.0.1** - Ambiente DOM

### Testing Library
- **@testing-library/react 16.1.0** - Testes de componentes
- **@testing-library/user-event 14.5.2** - Simulação de interações
- **@testing-library/jest-dom 6.6.3** - Matchers customizados

### Cobertura
- **@vitest/coverage-v8 2.1.8** - Cobertura de código
- **@vitest/ui 2.1.8** - Interface visual

## 📈 Métricas

### Metas de Cobertura
- Linhas: 80%
- Funções: 80%
- Branches: 80%
- Statements: 80%

### Arquivos de Teste
- **Total**: 13 arquivos
- **Casos de teste**: 100+
- **Mocks**: Completos para AWS

## 🚀 CI/CD

### GitHub Actions
Pipeline configurado em `.github/workflows/tests.yml`:
- ✅ Executa em push e PRs
- ✅ Gera relatório de cobertura
- ✅ Upload para Codecov
- ✅ Comenta PRs com cobertura

## 💡 Exemplos Rápidos

### Teste de Componente
```javascript
it('should render form', async () => {
  render(<Request {...mockProps} />);
  
  await waitFor(() => {
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });
});
```

### Teste de Serviço
```javascript
it('should fetch accounts', async () => {
  mockClient.queries.getAccounts.mockResolvedValue({ 
    data: mockAccounts 
  });
  
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

## 🐛 Debugging

```bash
# Interface visual
npm run test:ui

# Ver DOM renderizado
screen.debug();

# Executar teste específico
npm test -- Request.test.jsx
```

## 🤝 Contribuindo

Ao adicionar novos recursos:

1. ✅ Escreva testes para novos componentes
2. ✅ Use mocks disponíveis em `src/tests/mocks/`
3. ✅ Mantenha cobertura > 80%
4. ✅ Siga o padrão Arrange-Act-Assert
5. ✅ Execute `npm run test:coverage` antes de commit

## 📞 Suporte

### Recursos
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

### Documentação Local
- [TESTING.md](./TESTING.md) - Guia completo
- [QUICK-START-TESTS.md](./QUICK-START-TESTS.md) - Início rápido
- [TEST-CHECKLIST.md](./TEST-CHECKLIST.md) - Checklist

## ✨ Destaques

### Pontos Fortes
- ✅ Framework moderno (Vitest)
- ✅ Mocks completos do AWS
- ✅ Cobertura abrangente
- ✅ Documentação detalhada
- ✅ CI/CD configurado
- ✅ Interface visual

### Diferenciais
- ✅ Testes de integração de fluxos completos
- ✅ Mocks realistas de dados
- ✅ Validação de casos de erro
- ✅ Exemplos práticos
- ✅ Fácil manutenção

## 🎉 Começar Agora

```bash
# 1. Instalar
npm install

# 2. Testar
npm test

# 3. Ver cobertura
npm run test:coverage

# 4. Interface visual
npm run test:ui
```

---

**Pronto para testar?** Execute `npm test` e comece! 🚀

Para mais informações, consulte [TESTING.md](./TESTING.md)

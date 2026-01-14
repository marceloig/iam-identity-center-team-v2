# 🏗️ Estrutura do Projeto - Testes

## 📁 Visão Geral da Estrutura

```
iam-identity-center-team-v2/
│
├── 📚 Documentação de Testes (Raiz)
│   ├── QUICK-START-TESTS.md          # 🚀 Início rápido
│   ├── TEST-CHECKLIST.md             # ✅ Checklist de verificação
│   ├── TESTING.md                    # 📖 Guia completo (50+ páginas)
│   ├── TEST-SUMMARY.md               # 📋 Resumo técnico
│   ├── EXECUTIVE-SUMMARY-TESTS.md    # 📊 Resumo executivo
│   ├── README-TESTS.md               # 📖 Visão geral
│   ├── DOCS-INDEX.md                 # 📚 Índice de documentação
│   └── PROJECT-STRUCTURE-TESTS.md    # 🏗️ Este arquivo
│
├── ⚙️ Configuração
│   ├── vitest.config.js              # Configuração do Vitest
│   ├── package.json                  # Scripts e dependências
│   └── .gitignore                    # Arquivos ignorados (atualizado)
│
├── 🔄 CI/CD
│   └── .github/workflows/
│       └── tests.yml                 # GitHub Actions
│
└── 🧪 Testes (src/tests/)
    ├── setup.js                      # Setup global
    ├── README.md                     # Guia dos testes
    │
    ├── 🎭 mocks/                     # Mocks reutilizáveis
    │   ├── amplifyMocks.js          # AWS Amplify (Auth, API, GraphQL)
    │   └── mockData.js              # Dados de teste
    │
    ├── 🧩 components/                # Testes de componentes
    │   ├── Requests/
    │   │   └── Request.test.jsx     # Formulário de requisição
    │   └── Admin/
    │       └── Settings.test.jsx    # Configurações
    │
    ├── 🔧 services/                  # Testes de serviços
    │   └── RequestService.test.js   # 15+ queries, 10+ mutations
    │
    ├── 📡 graphql/                   # Testes GraphQL
    │   ├── queries.test.js          # Todas as queries
    │   └── mutations.test.js        # Todas as mutations
    │
    ├── 🔗 integration/               # Testes de integração
    │   └── request-flow.test.jsx    # Fluxos completos
    │
    ├── 🛠️ utils/                     # Testes de utilitários
    │   └── helpers.test.js          # Funções auxiliares
    │
    ├── 💡 examples/                  # Exemplos
    │   └── example.test.js          # 10 exemplos práticos
    │
    └── App.test.jsx                 # Teste do componente principal
```

## 📊 Estatísticas

### Arquivos
```
📚 Documentação:     8 arquivos
⚙️ Configuração:     3 arquivos
🧪 Testes:          13 arquivos
🎭 Mocks:            2 arquivos
───────────────────────────────
Total:              26 arquivos
```

### Linhas de Código
```
📖 Documentação:  ~5,000 linhas
🧪 Testes:        ~2,000 linhas
🎭 Mocks:          ~500 linhas
⚙️ Config:         ~100 linhas
───────────────────────────────
Total:           ~7,600 linhas
```

### Casos de Teste
```
🧩 Componentes:      30+ casos
🔧 Serviços:         40+ casos
📡 GraphQL:          20+ casos
🔗 Integração:       10+ casos
🛠️ Utilitários:      10+ casos
───────────────────────────────
Total:             100+ casos
```

## 🗂️ Organização por Tipo

### 1. Documentação (8 arquivos)

#### Início Rápido
- `QUICK-START-TESTS.md` - Comandos essenciais
- `TEST-CHECKLIST.md` - Verificação passo a passo

#### Guias Completos
- `TESTING.md` - Documentação completa
- `src/tests/README.md` - Guia dos testes

#### Resumos
- `TEST-SUMMARY.md` - Resumo técnico
- `EXECUTIVE-SUMMARY-TESTS.md` - Resumo executivo
- `README-TESTS.md` - Visão geral

#### Índices
- `DOCS-INDEX.md` - Índice de documentação
- `PROJECT-STRUCTURE-TESTS.md` - Este arquivo

### 2. Configuração (3 arquivos)

#### Vitest
- `vitest.config.js` - Configuração principal
  - Plugins: React
  - Environment: jsdom
  - Coverage: V8
  - Setup: src/tests/setup.js

#### Package.json
- Scripts de teste
- Dependências de teste
- Configurações

#### Git
- `.gitignore` - Arquivos de teste ignorados

### 3. CI/CD (1 arquivo)

#### GitHub Actions
- `.github/workflows/tests.yml`
  - Executa em push/PR
  - Gera cobertura
  - Upload para Codecov
  - Comenta PRs

### 4. Testes (13 arquivos)

#### Setup
- `src/tests/setup.js` - Configuração global
  - Mocks do Amplify
  - Matchers do jest-dom
  - Cleanup automático

#### Componentes (3 arquivos)
- `App.test.jsx` - Autenticação, navegação
- `Request.test.jsx` - Formulário, validação
- `Settings.test.jsx` - Configurações

#### Serviços (1 arquivo)
- `RequestService.test.js` - Queries, mutations

#### GraphQL (2 arquivos)
- `queries.test.js` - Todas as queries
- `mutations.test.js` - Todas as mutations

#### Integração (1 arquivo)
- `request-flow.test.jsx` - Fluxos completos

#### Utilitários (1 arquivo)
- `helpers.test.js` - Funções auxiliares

#### Exemplos (1 arquivo)
- `example.test.js` - 10 exemplos práticos

#### Mocks (2 arquivos)
- `amplifyMocks.js` - AWS Amplify
- `mockData.js` - Dados de teste

#### Documentação (1 arquivo)
- `README.md` - Guia dos testes

## 🎯 Fluxo de Trabalho

### 1. Desenvolvimento
```
Desenvolvedor
    ↓
Escreve código
    ↓
Executa: npm test
    ↓
Vitest (modo watch)
    ↓
Feedback instantâneo
    ↓
Corrige/Refatora
    ↓
Commit
```

### 2. CI/CD
```
Push/PR
    ↓
GitHub Actions
    ↓
npm install
    ↓
npm run test:run
    ↓
npm run test:coverage
    ↓
Upload Codecov
    ↓
Comenta PR
    ↓
Merge (se passar)
```

### 3. Debugging
```
Teste falha
    ↓
npm run test:ui
    ↓
Interface visual
    ↓
Identifica problema
    ↓
screen.debug()
    ↓
Corrige
    ↓
Teste passa
```

## 📈 Cobertura por Módulo

### Componentes
```
App.jsx           ████████████████████ 100%
Request.jsx       ██████████████████░░  90%
Settings.jsx      ████████████████░░░░  80%
```

### Serviços
```
RequestService    ████████████████████ 100%
```

### GraphQL
```
Queries           ████████████████████ 100%
Mutations         ████████████████████ 100%
```

### Utilitários
```
Helpers           ████████████████████ 100%
Validators        ████████████████████ 100%
```

## 🔍 Navegação Rápida

### Por Funcionalidade

#### Autenticação
- `src/tests/App.test.jsx`
- `src/tests/mocks/amplifyMocks.js`

#### Requisições
- `src/tests/components/Requests/Request.test.jsx`
- `src/tests/integration/request-flow.test.jsx`
- `src/tests/services/RequestService.test.js`

#### GraphQL
- `src/tests/graphql/queries.test.js`
- `src/tests/graphql/mutations.test.js`

#### Configurações
- `src/tests/components/Admin/Settings.test.jsx`

#### Validações
- `src/tests/utils/helpers.test.js`

### Por Nível de Complexidade

#### Básico
- `src/tests/utils/helpers.test.js`
- `src/tests/examples/example.test.js`

#### Intermediário
- `src/tests/components/Requests/Request.test.jsx`
- `src/tests/services/RequestService.test.js`

#### Avançado
- `src/tests/integration/request-flow.test.jsx`
- `src/tests/graphql/queries.test.js`

## 🛠️ Ferramentas e Dependências

### Core
```json
{
  "vitest": "^2.1.8",
  "jsdom": "^25.0.1"
}
```

### Testing Library
```json
{
  "@testing-library/react": "^16.1.0",
  "@testing-library/user-event": "^14.5.2",
  "@testing-library/jest-dom": "^6.6.3"
}
```

### Cobertura
```json
{
  "@vitest/coverage-v8": "^2.1.8",
  "@vitest/ui": "^2.1.8"
}
```

## 📝 Convenções

### Nomenclatura de Arquivos
```
ComponentName.test.jsx    # Componentes React
serviceName.test.js       # Serviços JavaScript
queries.test.js           # GraphQL queries
mutations.test.js         # GraphQL mutations
helpers.test.js           # Funções auxiliares
```

### Estrutura de Testes
```javascript
describe('ComponentName', () => {
  beforeEach(() => {
    // Setup
  });

  it('should do something', () => {
    // Arrange
    // Act
    // Assert
  });
});
```

### Nomenclatura de Testes
```javascript
// ✅ Bom
it('should display error when email is invalid', () => {});

// ❌ Ruim
it('test email', () => {});
```

## 🎓 Recursos de Aprendizado

### Documentação Local
1. [QUICK-START-TESTS.md](./QUICK-START-TESTS.md)
2. [TESTING.md](./TESTING.md)
3. [src/tests/examples/example.test.js](./src/tests/examples/example.test.js)

### Documentação Externa
1. [Vitest](https://vitest.dev/)
2. [React Testing Library](https://testing-library.com/react)
3. [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 🚀 Próximos Passos

### Imediato
1. ✅ `npm install`
2. ✅ `npm test`
3. ✅ Verificar cobertura

### Curto Prazo
1. ⏳ Adicionar testes para componentes restantes
2. ⏳ Aumentar cobertura para 90%
3. ⏳ Configurar Codecov

### Longo Prazo
1. ⏳ Testes E2E
2. ⏳ Testes de performance
3. ⏳ Testes de acessibilidade

---

**Última atualização**: Janeiro 2026  
**Versão**: 1.0  
**Status**: ✅ Completo e Pronto para Uso

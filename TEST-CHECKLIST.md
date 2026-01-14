# ✅ Checklist de Testes

## 📋 Verificação de Instalação

### Passo 1: Instalar Dependências
```bash
npm install
```

- [ ] Comando executado sem erros
- [ ] Todas as dependências instaladas
- [ ] `node_modules` criado

### Passo 2: Verificar Configuração
- [ ] `vitest.config.js` existe
- [ ] `src/tests/setup.js` existe
- [ ] `package.json` tem scripts de teste

### Passo 3: Executar Testes
```bash
npm test
```

- [ ] Vitest inicia sem erros
- [ ] Testes são descobertos
- [ ] Interface de watch funciona

## 🧪 Verificação de Testes

### Testes de Componentes
```bash
npm test -- src/tests/components
```

- [ ] App.test.jsx passa
- [ ] Request.test.jsx passa
- [ ] Settings.test.jsx passa

### Testes de Serviços
```bash
npm test -- src/tests/services
```

- [ ] RequestService.test.js passa
- [ ] Todos os métodos testados

### Testes de GraphQL
```bash
npm test -- src/tests/graphql
```

- [ ] queries.test.js passa
- [ ] mutations.test.js passa

### Testes de Integração
```bash
npm test -- src/tests/integration
```

- [ ] request-flow.test.jsx passa
- [ ] Fluxos completos funcionam

### Testes de Utilitários
```bash
npm test -- src/tests/utils
```

- [ ] helpers.test.js passa
- [ ] Validações funcionam

## 📊 Verificação de Cobertura

### Gerar Relatório
```bash
npm run test:coverage
```

- [ ] Comando executa sem erros
- [ ] Relatório gerado em `coverage/`
- [ ] Cobertura > 80% (meta)

### Verificar Relatório HTML
```bash
# Windows
start coverage/index.html

# Mac/Linux
open coverage/index.html
```

- [ ] Arquivo HTML abre no navegador
- [ ] Métricas visíveis
- [ ] Arquivos listados

## 🎨 Verificação de UI

### Interface Visual
```bash
npm run test:ui
```

- [ ] Interface abre no navegador
- [ ] Testes listados
- [ ] Pode executar testes individuais
- [ ] Pode ver cobertura

## 🔧 Verificação de Mocks

### Mocks do Amplify
- [ ] `amplifyMocks.js` existe
- [ ] Mocks de Auth funcionam
- [ ] Mocks de API funcionam
- [ ] Mocks de GraphQL funcionam

### Dados de Teste
- [ ] `mockData.js` existe
- [ ] mockRequests definido
- [ ] mockSessions definido
- [ ] mockSettings definido
- [ ] mockApprovers definido
- [ ] mockEligibility definido

## 📝 Verificação de Documentação

### Arquivos de Documentação
- [ ] TESTING.md existe e está completo
- [ ] TEST-SUMMARY.md existe
- [ ] QUICK-START-TESTS.md existe
- [ ] TEST-CHECKLIST.md existe (este arquivo)
- [ ] src/tests/README.md existe

### Exemplos
- [ ] example.test.js existe
- [ ] Exemplos funcionam
- [ ] Exemplos são claros

## 🚀 Verificação de CI/CD

### GitHub Actions
- [ ] `.github/workflows/tests.yml` existe
- [ ] Workflow configurado corretamente
- [ ] Testes executam em push
- [ ] Testes executam em PR

### Scripts NPM
- [ ] `npm test` funciona
- [ ] `npm run test:run` funciona
- [ ] `npm run test:coverage` funciona
- [ ] `npm run test:ui` funciona

## 🎯 Verificação de Qualidade

### Cobertura de Código
- [ ] Linhas > 80%
- [ ] Funções > 80%
- [ ] Branches > 80%
- [ ] Statements > 80%

### Tipos de Teste
- [ ] Testes unitários ✓
- [ ] Testes de componentes ✓
- [ ] Testes de serviços ✓
- [ ] Testes de GraphQL ✓
- [ ] Testes de integração ✓

### Casos de Teste
- [ ] Casos de sucesso testados
- [ ] Casos de erro testados
- [ ] Validações testadas
- [ ] Edge cases testados

## 🔍 Verificação de Funcionalidades

### Componentes
- [ ] App renderiza corretamente
- [ ] Request valida campos
- [ ] Settings atualiza configurações

### Serviços
- [ ] Queries funcionam
- [ ] Mutations funcionam
- [ ] Paginação funciona
- [ ] Erros são tratados

### GraphQL
- [ ] Queries retornam dados
- [ ] Mutations modificam dados
- [ ] Erros são capturados

### Integração
- [ ] Fluxo de requisição completo
- [ ] Fluxo de aprovação funciona
- [ ] Validações em fluxo funcionam

## 🐛 Verificação de Debugging

### Ferramentas
- [ ] `screen.debug()` funciona
- [ ] Console logs aparecem
- [ ] Vitest UI mostra erros claramente

### Troubleshooting
- [ ] Erros são claros
- [ ] Stack traces são úteis
- [ ] Pode debugar testes individuais

## 📦 Verificação de Dependências

### Dependências Instaladas
```bash
npm list vitest @testing-library/react @testing-library/user-event
```

- [ ] vitest instalado
- [ ] @testing-library/react instalado
- [ ] @testing-library/user-event instalado
- [ ] @testing-library/jest-dom instalado
- [ ] jsdom instalado
- [ ] @vitest/ui instalado
- [ ] @vitest/coverage-v8 instalado

## ✨ Verificação Final

### Tudo Funcionando
```bash
# Executar todos os testes
npm run test:run

# Gerar cobertura
npm run test:coverage

# Abrir UI
npm run test:ui
```

- [ ] Todos os testes passam
- [ ] Cobertura adequada
- [ ] UI funciona
- [ ] Sem warnings críticos

### Pronto para Produção
- [ ] Testes passam consistentemente
- [ ] Cobertura > 80%
- [ ] Documentação completa
- [ ] CI/CD configurado
- [ ] Mocks funcionam
- [ ] Exemplos claros

## 🎉 Status Final

### ✅ Tudo Pronto
Se todos os itens acima estão marcados, a suíte de testes está pronta para uso!

### ⚠️ Problemas Encontrados
Se algum item falhou, consulte:
1. [TESTING.md](./TESTING.md) - Documentação completa
2. [QUICK-START-TESTS.md](./QUICK-START-TESTS.md) - Guia rápido
3. [src/tests/examples/example.test.js](./src/tests/examples/example.test.js) - Exemplos

### 🆘 Precisa de Ajuda?
- Verifique a documentação
- Veja os exemplos
- Execute `npm test -- --help`
- Consulte [Vitest Docs](https://vitest.dev/)

---

**Última Verificação:**
```bash
npm install && npm run test:run && npm run test:coverage
```

Se tudo passar, você está pronto! 🚀

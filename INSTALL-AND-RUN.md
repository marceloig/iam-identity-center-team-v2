# 🚀 Instalação e Execução - Testes

## ⚡ Instalação Rápida (5 minutos)

### Passo 1: Instalar Dependências
```bash
cd iam-identity-center-team-v2
npm install
```

**Aguarde**: ~2-3 minutos para instalar todas as dependências.

### Passo 2: Verificar Instalação
```bash
npm test -- --version
```

**Esperado**: Deve mostrar a versão do Vitest (2.1.8 ou superior).

### Passo 3: Executar Testes
```bash
npm test
```

**Esperado**: 
- Vitest inicia em modo watch
- Testes são descobertos e executados
- Todos os testes devem passar ✅

## ✅ Verificação Completa

### 1. Verificar Estrutura de Arquivos
```bash
# Windows
dir src\tests

# Mac/Linux
ls -la src/tests
```

**Esperado**:
```
src/tests/
├── mocks/
├── components/
├── services/
├── graphql/
├── integration/
├── utils/
├── examples/
├── setup.js
├── README.md
└── App.test.jsx
```

### 2. Verificar Dependências
```bash
npm list vitest @testing-library/react @testing-library/user-event
```

**Esperado**: Todas as dependências instaladas sem erros.

### 3. Executar Todos os Testes
```bash
npm run test:run
```

**Esperado**: 
```
✓ src/tests/App.test.jsx (X tests)
✓ src/tests/components/Requests/Request.test.jsx (X tests)
✓ src/tests/services/RequestService.test.js (X tests)
✓ src/tests/graphql/queries.test.js (X tests)
✓ src/tests/graphql/mutations.test.js (X tests)
...

Test Files  X passed (X)
Tests  X passed (X)
```

### 4. Verificar Cobertura
```bash
npm run test:coverage
```

**Esperado**:
```
File                    | % Stmts | % Branch | % Funcs | % Lines
------------------------|---------|----------|---------|--------
All files              |   80+   |   80+    |   80+   |   80+
```

### 5. Abrir Interface Visual
```bash
npm run test:ui
```

**Esperado**: 
- Navegador abre automaticamente
- Interface do Vitest carrega
- Testes listados e executáveis

## 🔧 Comandos Disponíveis

### Desenvolvimento
```bash
# Modo watch (recomendado para desenvolvimento)
npm test

# Interface visual
npm run test:ui
```

### CI/CD
```bash
# Executar uma vez
npm run test:run

# Com cobertura
npm run test:coverage
```

### Específicos
```bash
# Apenas componentes
npm test -- src/tests/components

# Apenas serviços
npm test -- src/tests/services

# Apenas GraphQL
npm test -- src/tests/graphql

# Teste específico
npm test -- Request.test.jsx

# Com filtro
npm test -- --grep "should validate"
```

## 📊 Verificar Cobertura Detalhada

### Gerar Relatório HTML
```bash
npm run test:coverage
```

### Abrir Relatório no Navegador
```bash
# Windows
start coverage/index.html

# Mac
open coverage/index.html

# Linux
xdg-open coverage/index.html
```

## 🐛 Troubleshooting

### Problema: "Cannot find module 'vitest'"
**Solução**:
```bash
npm install
```

### Problema: "ReferenceError: React is not defined"
**Solução**: Já está configurado no setup.js, mas se persistir:
```javascript
// Adicionar no topo do arquivo de teste
import React from 'react';
```

### Problema: Testes muito lentos
**Solução**:
```bash
# Executar em paralelo (padrão)
npm test

# Ou limpar cache
npm test -- --clearCache
```

### Problema: "ENOENT: no such file or directory"
**Solução**: Verificar se está no diretório correto:
```bash
cd iam-identity-center-team-v2
pwd  # ou cd (Windows)
```

### Problema: Porta já em uso (Vitest UI)
**Solução**:
```bash
# Especificar porta diferente
npm run test:ui -- --port 5174
```

## 📝 Checklist de Instalação

- [ ] Node.js 20+ instalado
- [ ] npm instalado
- [ ] Dependências instaladas (`npm install`)
- [ ] Vitest instalado (verificar com `npm test -- --version`)
- [ ] Testes executam sem erros (`npm test`)
- [ ] Cobertura gera relatório (`npm run test:coverage`)
- [ ] Interface visual abre (`npm run test:ui`)

## 🎯 Próximos Passos

### Após Instalação Bem-Sucedida

1. **Explorar Exemplos**
   ```bash
   # Ver exemplos práticos
   code src/tests/examples/example.test.js
   ```

2. **Ler Documentação**
   - [QUICK-START-TESTS.md](./QUICK-START-TESTS.md) - Comandos essenciais
   - [TESTING.md](./TESTING.md) - Guia completo
   - [src/tests/README.md](./src/tests/README.md) - Guia dos testes

3. **Escrever Primeiro Teste**
   - Copiar exemplo de `src/tests/examples/example.test.js`
   - Adaptar para seu componente
   - Executar com `npm test`

4. **Configurar IDE**
   - Instalar extensão Vitest (VS Code)
   - Configurar snippets
   - Habilitar auto-import

## 🔍 Verificação Final

Execute todos os comandos abaixo para garantir que tudo está funcionando:

```bash
# 1. Instalar
npm install

# 2. Verificar versão
npm test -- --version

# 3. Executar testes
npm run test:run

# 4. Gerar cobertura
npm run test:coverage

# 5. Abrir UI (opcional)
npm run test:ui
```

**Se todos os comandos executarem sem erros, você está pronto! 🎉**

## 📚 Recursos

### Documentação Local
- [QUICK-START-TESTS.md](./QUICK-START-TESTS.md) - Início rápido
- [TEST-CHECKLIST.md](./TEST-CHECKLIST.md) - Checklist completo
- [TESTING.md](./TESTING.md) - Guia completo
- [DOCS-INDEX.md](./DOCS-INDEX.md) - Índice de documentação

### Documentação Externa
- [Vitest](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 🆘 Precisa de Ajuda?

1. Consulte [TEST-CHECKLIST.md](./TEST-CHECKLIST.md)
2. Veja [TESTING.md](./TESTING.md) - Seção Troubleshooting
3. Execute `npm test -- --help`
4. Abra uma issue no repositório

---

**Tempo estimado de instalação**: 5 minutos  
**Tempo estimado de verificação**: 10 minutos  
**Total**: ~15 minutos

**Pronto para começar?**
```bash
npm install && npm test
```

🎉 Boa sorte com os testes!

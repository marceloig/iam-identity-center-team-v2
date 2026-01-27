# AGENTS.md

## Project Overview

This is an AWS IAM Identity Center Team Management application with:
- **Frontend**: React + Vite application (src/)
- **Backend**: AWS Amplify with serverless functions and GraphQL API (amplify/)
- **Infrastructure**: AWS CDK (deployment/team/)

## Dev Environment Tips

- The project uses **npm** as the package manager. Run `npm install` to set up dependencies.
- Node.js version 20.x or higher is required. Check `"engine": { "node": ">=20.0.0" }` in package.json.
- The frontend is a Vite + React application with TypeScript support.
- Backend functions are located in `amplify/functions/` and are primarily Python-based serverless functions.
- The CDK deployment code is in `deployment/team/` and uses TypeScript with AWS CDK v2.
- Frontend alias: Use `@` to reference `src/` directory (e.g., `import { Component } from '@/components'`).

## Frontend Development

### Running the development server
```bash
npm run dev          # Start Vite dev server (http://localhost:5173)
npm run build        # Production build to dist/
npm run preview      # Preview production build locally
```

### Frontend code structure
- **src/components/**: React components organized by feature (Admin, Approvals, Audit, Navigation, Requests, Sessions, Shared)
- **src/graphql/**: GraphQL queries, mutations, and subscriptions
- **src/models/**: TypeScript type definitions and GraphQL schema
- **src/tests/**: Vitest test files and setup
- **src/index.jsx**: Main entry point

## Testing Instructions

### Running tests
- `npm test` – Watch mode, great for TDD
- `npm run test:run` – Single run (used in CI)
- `npm run test:ui` – Interactive UI dashboard
- `npm run test:coverage` – Generate coverage report (target: 80% coverage)

### Test file locations and patterns
- Frontend tests: `src/**/*.{test,spec}.{js,jsx,ts,tsx}`
- Vitest config: `vitest.config.js`
- Test setup: `src/tests/setup.js`
- Test utilities: `src/tests/utils/`, mocks: `src/tests/mocks/`

### Coverage requirements
The project enforces 80% minimum coverage for:
- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

Excluded from coverage: node_modules, tests, type definitions, config files, amplify/, deployment/

### Focus on specific tests
```bash
npm run test:run -- -t "<test name>"  # Run tests matching pattern
npm run test:run -- src/components/Admin  # Run tests in specific directory
```

### Before committing
1. Fix any test failures: `npm run test:run`
2. Fix any type errors and linting issues: `npm run lint`
3. Verify coverage hasn't dropped: `npm run test:coverage`
4. Check that all features you added have test coverage

### Backend function testing
- CDK tests: `cd deployment/team && npm test` (Jest)
- Backend functions are tested individually; check requirements.txt in each function folder for Python dependencies

## Linting & Code Quality

### Running linting
```bash
npm run lint  # ESLint check on all .js and .jsx files
```

### ESLint Configuration
- Config file: `eslint.config.js`
- Enforced rules:
  - ESLint recommended rules
  - React Hooks rules
  - React Refresh rules
  - Unused variables warning (except uppercase/underscore-prefixed)

### Fixing code style
- ESLint will report issues; many can be auto-fixed
- Fix issues before committing to ensure CI passes

## CI/CD Pipeline

The project has automated checks on push to main/develop and on pull requests:
- **Linting**: ESLint validation
- **Tests**: Vitest (frontend) + Jest (CDK)
- **Coverage**: Minimum 80% required
- **Security**: Bandit (Python), Snyk (dependencies), Git hygiene checks
- **Pages**: Deployment of GitHub Pages documentation

All checks must pass before merging a PR. See `.github/workflows/` for details.

## PR Instructions

### Before creating a PR
1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Run all checks:
   ```bash
   npm run lint
   npm run test:run
   npm run test:coverage
   ```
3. Fix any errors until the entire suite is green
4. Commit changes with clear messages

### PR Title Format
- Use format: `[component/feature] Description`
- Examples:
  - `[Admin] Add user role validation`
  - `[API] Fix GraphQL mutation error handling`
  - `[Tests] Increase Admin component coverage to 85%`

### PR Description
- Explain what changed and why
- Reference related issues if any
- Note any breaking changes
- Include test coverage details for new features

### Merge requirements
- All status checks must pass (lint, test, coverage, security)
- Code review approval (if required by repo settings)
- No merge conflicts with base branch
- Coverage must not decrease

## Making Changes

### Adding or modifying components
1. Create component file in appropriate `src/components/` subdirectory
2. Add tests: `ComponentName.test.jsx`
3. Update types in `src/models/` if needed
4. Run `npm run lint` and `npm run test:run` to verify

### Adding backend functions
1. Create function folder in `amplify/functions/`
2. Follow naming convention: `team<FunctionName>/`
3. Include `requirements.txt` for Python dependencies
4. Create resource definition in `resource.ts`
5. Implement handler in `src/`
6. Update GraphQL schema and resolvers as needed

### Modifying infrastructure (CDK)
1. Update files in `deployment/team/lib/` or `bin/`
2. Run `cd deployment/team && npm run build` to compile
3. Review changes with `cdk diff`
4. Test with `cdk deploy` in a sandbox environment
5. Include CDK changes in PR description

## Common Workflows

### Debugging a failed test
```bash
# Run tests in watch mode and filter by name
npm test -- -t "specific test name"

# Use debug UI
npm run test:ui
# Navigate to the failing test and inspect the failure details
```

### Running a full quality check locally
```bash
npm run lint && npm run test:run && npm run test:coverage
# This mimics the CI pipeline
```

### Setting up a new feature branch
```bash
git checkout main
git pull origin main
git checkout -b feature/my-new-feature
npm install  # Ensure clean dependencies
npm run dev  # Start development server
```

### Reverting a change
```bash
git diff  # See what changed
git checkout -- path/to/file.jsx  # Revert specific file
git reset --hard HEAD~1  # Revert last commit
```

## Useful Resources

- [Vite Documentation](https://vite.dev/)
- [Vitest Documentation](https://vitest.dev/)
- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [AWS CDK TypeScript Documentation](https://docs.aws.amazon.com/cdk/v2/guide/home.html)
- [React Testing Library](https://testing-library.com/react)
- [GraphQL Documentation](https://graphql.org/learn/)
- [AWS IAM Identity Center Documentation](https://docs.aws.amazon.com/singlesignon/latest/userguide/what-is.html)

## Troubleshooting

### Dependencies not installed
```bash
rm -rf node_modules package-lock.json
npm install
```

### Type errors in IDE but tests pass
- Run `npm run lint` to check for actual ESLint/TypeScript issues
- Ensure your editor is pointing to the correct TypeScript version
- Restart your IDE's TypeScript server

### Test coverage not meeting threshold
- Check `npm run test:coverage` output for uncovered lines
- Add tests for new code paths
- Update exclusions in `vitest.config.js` if necessary

### GraphQL schema out of sync
- Regenerate models: Check Amplify CLI documentation
- Ensure schema changes are deployed before testing

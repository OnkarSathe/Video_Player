# Prasanna Assignment – Angular Starter

This Angular project follows opinionated best practices for scalability, maintainability, and performance. It includes ESLint with Angular rules, Prettier formatting, strict TypeScript settings, Husky pre-commit hooks with lint-staged, and a sample feature module structure.

## Development server

To start a local development server, run:

```bash
npm start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
npx ng generate component path/to/feature/your-component --standalone --skip-tests --style css
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
npm run build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
npm test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
npx ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Linting and formatting

- ESLint is configured with `angular-eslint` rules and TypeScript ESLint recommended configs.
- Prettier is integrated via `eslint-config-prettier` and `eslint-plugin-prettier`.

Commands:

```bash
npm run lint        # Run ESLint
npm run lint:fix    # Fix auto-fixable lint issues
npm run format      # Run Prettier formatting
```

On commit, `husky` runs `lint-staged` to format changed files and lint them.

## TypeScript strictness

TypeScript compiler is set to strict mode with additional safety flags:

- `noImplicitAny`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`
- `noImplicitReturns`, `noFallthroughCasesInSwitch`
- Angular template type checking is strict via `strictTemplates`.

## Project structure and routing

- Example feature: `src/app/features/home` with a standalone component and route configured in `src/app/app.routes.ts`.
- Root providers are declared in `src/app/app.config.ts`.

## Commit hooks

Husky installs a `pre-commit` hook that invokes `lint-staged`:

- Formats staged files with Prettier
- Lints staged files with ESLint (non-blocking if warnings only)

If hooks are not active, ensure dependencies are installed and run:

```bash
npm run prepare
```

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

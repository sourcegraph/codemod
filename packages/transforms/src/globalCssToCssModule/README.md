# Global CSS to CSS Module codemod

Convert globally scoped stylesheet tied to the React component into a CSS Module.

1. Find `.tsx` file.
2. Check if corresponding `.scss` file exists in the same folder.
3. Convert this `.scss` file into `.module.scss`.
4. Get info about CSS class names and matching CSS module export tokens.
5. Replace all matching class names with export tokens.
6. Add `classNames` import to the `.tsx` file if needed.
7. Add `.module.scss` import to the `.tsx` file.

## Usage

See available commands and options:

```sh
yarn transform --help
```

Apply codemod:

```sh
yarn transform -t globalCssToCssModule --write true "/client/web/src/search/**/*.tsx"
```

To automatically fix formatting in the updated React components use the `--format true` flag.

```sh
yarn transform -t globalCssToCssModule --write true --format true "/client/web/src/search/**/*.tsx"
```

Currently, it's quite slow because a new ESLint instance is initialized for each file. Consider running `eslint --fix` after the codemod if you're changing a lot of files in one command.

## Post codemod steps for the Sourcegraph repo

1. Remove global styles import from the codebase: `@import 'DeletedGlobalStylesFile';`.
2. Check "Unused CSS classes" reported in the CLI output. These are classes that exist in the CSS module but were not found in the adjacent React component.
   1. Remove redundant CSS classes from the CSS module.
   2. Fix classes used outside of the component by using CSS module there or convert them to props to eliminate the implicit dependency.
3. Double-check the usage of the deleted global CSS classes in integration tests or other stylesheets.
   1. If global CSS class is used in the integration test — add `data-testid="some-name-here"` to the relevant Jsx element and use `[data-testid="some-name-here"]` selector in the integration test.
4. Fix usage of the global SCSS variables in the CSS module:`color: $success; -> color: var(--success);`
   1. If CSS variable doesn't exist — add it next to the SCSS variable: `$spacer: 1px; -> $spacer: 1px; :root { --spacer: #{$spacer}; }`
5. Double-check that the `:global(...)` selector usage in the created CSS module is correct.
6. Run `yarn test -u` to update Jest snapshots.
7. Run `eslint --fix` to update the Typescript source files formatting if `--format` flag was not used in the codemod command.

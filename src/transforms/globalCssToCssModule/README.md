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

```sh
yarn transform -t globalCssToCssModule --write true "/client/web/src/search/**/*.tsx"
```

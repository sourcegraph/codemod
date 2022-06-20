# `mdi-react` `ExampleIcon` to `@mdi/react` `mdiExample` path codemod

yarn transform --write -t ./packages/transforms/src/mdiIconToMdiPath/mdiIconToMdiPath.ts '/sourcegraph/client/!(wildcard)/src/\*_/_.{ts,tsx}'

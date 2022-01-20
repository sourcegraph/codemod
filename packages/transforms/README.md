# Transforms

Transform functions built with toolkits defined in this repo.

## Adding new transform

1. Each transform has its own folder.
2. A transform module should have one named export that the CLI package will use to run it over multiple files.
3. For `typescript` transforms use `runTransform` helper defined in `@sourcegraph/toolkit-ts`.

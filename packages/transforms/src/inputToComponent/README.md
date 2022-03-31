# Icon element to `<Icon />` Wildcard component codemod

yarn transform --write -t ./packages/transforms/src/inputToComponent/inputToComponent.ts '/sourcegraph/client/!(wildcard)/src/\*_/_.{ts,tsx}'

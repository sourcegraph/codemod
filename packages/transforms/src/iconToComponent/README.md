# Icon element to `<Icon />` Wildcard component codemod

yarn transform --write -t ./packages/transforms/src/iconToComponent/iconToComponent.ts '/sourcegraph/client/!(wildcard)/src/\*_/_.{ts,tsx}'

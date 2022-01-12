# Button element to `<Button />` Wildcard component codemod

Convert `<button class="btn-primary" />` element to the `<Button variant="primary" />` component. See more cases in [tests](./__tests__/buttonElementToComponent.test.ts).

## Usage

```sh
yarn transform --write -t /packages/transforms/src/buttonElementToComponent/buttonElementToComponent.ts '/sourcegraph/client/!(wildcard)/src/asd**/*.{ts,tsx}'
```

To convert tags other than `button` use `--tagToConvert` option:

```sh
yarn transform --write --tagToConvert=Link -t /packages/transforms/src/buttonElementToComponent/buttonElementToComponent.ts '/sourcegraph/client/!(wildcard)/src/asd**/*.{ts,tsx}'
```

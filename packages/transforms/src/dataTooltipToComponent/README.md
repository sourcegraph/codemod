# `data-tooltip` attribute to `<Tooltip>` Wildcard component codemod

Convert any element with the `data-tooltip` property to be wrapped with the `<Tooltip>` component instead. See more cases in [tests](./__tests__/dataTooltipToComponent.test.ts).

## Usage

Running commands from the project root folder. Otherwise, please path to the transform file.

```sh
yarn transform --write -t ./packages/transforms/src/dataTooltipToComponent/dataTooltipToComponent.ts '/sourcegraph/client/!(wildcard)/src/**/*.{ts,tsx}'
```

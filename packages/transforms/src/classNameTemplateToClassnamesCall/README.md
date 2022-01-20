# Classname template literal to `classNames()` call codemod

Convert template string used in the `className` Jsx prop into a `classNames()` utility call:

```tsx
<div className={`d-flex ${props.className`}>
```

Turns into

```tsx
<div className={classNames('d-flex', props.className}>
```

## Usage

```sh
yarn transform -t classNameTemplateToClassnamesCall --write true "/client/web/src/search/**/*.tsx"
```

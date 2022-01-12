# Enforce usage of the `<Button />` Wildcard component

## Rule Details

After introducing the wildcard component `<Button />`, we want
to make sure that we use it for every button in the UI to ensure consistency.

## How to Use

```jsonc
{
  "@sourcegraph/sourcegraph/use-button-element": ["error"]
}
```

## Attributes

- [x] ✅ Recommended
- [ ] 🔧 Fixable
- [ ] 💭 Requires type information

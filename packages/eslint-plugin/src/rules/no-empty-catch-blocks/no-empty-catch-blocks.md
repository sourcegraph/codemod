# Ban unexplained empty `catch` blocks

## Rule details

This rule bans `catch` blocks that have an empty body, unless the block is supported by a helpful comment explaining why this exception can be safely ignore and not processed.

### Bad code

```ts
try {
  // do something
} catch (error) {}
```

### Good code

```ts
try {
  // do something
} catch (error) {
  // This error can be ignored because XYZ.
}
```

### (Bonus) Awesome code

```ts
try {
  // do something
} catch (error) {
  Sentry.captureException(error) // ...or something like this
}
```

## How to Use

```jsonc
{
  "@sourcegraph/sourcegraph/no-empty-catch-blocks": "error"
}
```

# Ban unexplained `console.error` calls

## Rule details

This rule bans logging errors directly to the console using `console.error()` calls, unless supported with a comment explaining why it's required. Otherwise, it's recommended to pass the error through `Sentry.captureException()`.

### Bad code

```ts
try {
  // do something
} catch (error) {
  console.error(error)
}
```

### Okay code

```ts
try {
  // do something
} catch (error) {
  // We need to log this to the browser console because XYZ
  console.error(error)
}
```

### (Bonus) Awesome code

```ts
try {
  // do something
} catch (error) {
  Sentry.captureException(error)
}
```

## How to Use

```jsonc
{
  "@sourcegraph/sourcegraph/no-unexplained-console-error": "error"
}
```

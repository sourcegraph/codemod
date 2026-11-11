# Check help links for validity

## Rule details

This rule parses `Link` and `a` elements in JSX/TSX files. If a list of valid
docsite pages is provided, elements that point to a `/help/*` link are checked
against that list: if they don't exist, a linting error is raised.

The list of docsite pages is provided either via the `DOCSITE_LIST` environment
variable, which should be a newline separated list of pages as outputted by
`docsite ls`, or via the `docsiteList` rule option, which is the same data as
an array.

If neither of these are set, then the rule will silently succeed.

## How to Use

```jsonc
{
  "@sourcegraph/sourcegraph/check-help-links": "error"
}
```

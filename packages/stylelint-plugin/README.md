# stylelint-plugin-sourcegraph

Recommended Stylelint rules for the Sourcegraph repo.

## Setup

Update your `.stylelintrc.json` file to add the following configuration:

```json
{
  "plugins": [
    "@sourcegraph/stylelint-plugin-sourcegraph"
  ],
  "rules": {
    "@sourcegraph/filenames-match-regex": [2, {
        "regexp": "^.+\\.module(\\.scss)$"
    }],
    "@sourcegraph/no-restricted-imports": [2, {
        "paths": ["bootstrap*", "reactstrap/styles.css"],
      }
    ]
  }
}
```

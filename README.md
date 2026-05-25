# tag-and-push

Create a git tag on GitHub from a workflow using the GraphQL API, without `git push`.

Inspired by [planetscale/ghcommit](https://github.com/planetscale/ghcommit) and
[planetscale/ghcommit-action](https://github.com/planetscale/ghcommit-action).

Tags the workflow commit (`github.context.sha`) in the current repository.
An existing tag with the same name is replaced.

## Usage

```yaml
permissions:
  contents: write

steps:
  - uses: actions/checkout@v4

  - uses: lucaspopp0/tag-and-push@v1
    with:
      tag: v1.2.3
    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Inputs

| Input | Required | Description |
| --- | --- | --- |
| `tag` | yes | Tag name (for example `v1.0.0`) |

## Outputs

| Output | Description |
| --- | --- |
| `tag-url` | GitHub URL for the tag |
| `tag-sha` | Commit SHA the tag points to |

## Development

```bash
npm install
npm run build
npm run pack
```

Commit `dist/index.js` when releasing a new action version.

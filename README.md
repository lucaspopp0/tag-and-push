# tag-and-push

Create a git tag on GitHub from a workflow using the GraphQL API, without `git push`

Tags the workflow commit (`github.context.sha`) in the current repository.
An existing tag with the same name is replaced.

* [Example Usage](./#example-usage)
* [Inputs](./#inputs)
* [Outputs](./#outputs)

## Example Usage

```yaml
name: tag-and-release

on:
  push:
    branches: [main]

permissions:
  contents: write
  pull-requests: read

defaults:
  run:
    shell: bash

jobs:

  tag-and-release:
    runs-on: ubuntu-latest
    steps:
      -
        uses: actions/checkout@v6
        with:
          fetch-depth: 0
      -
        name: Pick next version
        uses: lucaspopp0/semantic-version@v0
        id: next-version
        with:
          tag-prefix: v
      -
        name: "Tag and push new version (ex: v0.0.1)"
        uses: lucaspopp0/tag-and-push@v0
        env:
          GITHUB_TOKEN: ${{ github.token }}
        with:
          tag: ${{ steps.next-version.outputs.next-patch-tag }}
          release: true
      -
        name: "Tag and push floating major tag (ex: v0)"
        if: true
        uses: lucaspopp0/tag-and-push@v0
        env:
          GITHUB_TOKEN: ${{ github.token }}
        with:
          tag: ${{ steps.next-version.outputs.next-major-tag }}
          release: false
```

## Inputs

<!-- AUTO-DOC-INPUT:START - Do not remove or modify this section -->

|                         INPUT                         |  TYPE  | REQUIRED |  DEFAULT  |                                    DESCRIPTION                                    |
|-------------------------------------------------------|--------|----------|-----------|-----------------------------------------------------------------------------------|
| <a name="input_release"></a>[release](#input_release) | string |  false   | `"false"` |               If 'true', creates a release <br>pointing to the tag                |
|       <a name="input_tag"></a>[tag](#input_tag)       | string |   true   |           | Tag name (for example v1.0.0). The refs/tags/ <br>prefix is added automatically.  |

<!-- AUTO-DOC-INPUT:END -->

| Input | Required | Description |
| --- | --- | --- |
| `tag` | yes | Tag name (for example `v1.0.0`) |
| `release` | no | If `true`, creates a release named after the tag and pointing to it. Defaults to `false`. |

## Outputs

<!-- AUTO-DOC-OUTPUT:START - Do not remove or modify this section -->

|                               OUTPUT                                |  TYPE  |                              DESCRIPTION                               |
|---------------------------------------------------------------------|--------|------------------------------------------------------------------------|
| <a name="output_release-url"></a>[release-url](#output_release-url) | string | URL for the release on <br>GitHub. Set only when release <br>is true.  |
|       <a name="output_tag-sha"></a>[tag-sha](#output_tag-sha)       | string |                   Commit SHA the tag points <br>to.                    |
|       <a name="output_tag-url"></a>[tag-url](#output_tag-url)       | string |                    URL for the tag on <br>GitHub.                      |

<!-- AUTO-DOC-OUTPUT:END -->

| Output | Description |
| --- | --- |
| `tag-url` | GitHub URL for the tag |
| `tag-sha` | Commit SHA the tag points to |
| `release-url` | GitHub URL for the release. Set only when `release` is `true`. |

## Development

```bash
npm install
npm run build
npm run pack
```

Commit `dist/index.js` when releasing a new action version.

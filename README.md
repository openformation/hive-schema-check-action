# GraphQL Hive schema check

Use this action to check changes in your schema against GraphQL Hive using the Hive CLI. This detects breaking changes before they are merged. Additionally, this action will comment the check result on the PR introducing the change.

# Usage
```yaml
on: pull_request

jobs:
  check_schema:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
    name: Check the GraphQL schema against Hive
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Check schema
        uses: openformation/hive-schema-check-action@v1
        with:
          service-name: products
          schema-path: schema.graphql
          hive-registry-access-token: ${{ secrets.HIVE_TOKEN }}
          comment-pr: true
          github-token: ${{ secrets.GITHUB_TOKEN }}
```
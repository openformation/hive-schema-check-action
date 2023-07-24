# GraphQL Hive Schema Check Action

Use this action to check changes in your schema against GraphQL Hive using the Hive CLI. This can detect breaking changes before they are merged. Additionally, this action will comment the check result on the PR introducing the change.

## Usage
```yaml
on: pull_request

jobs:
  check_schema:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    name: Run GraphQL Hive schema check
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

## Configuration

| Name | Required | Description | Default |
|---|---|---|---|
| `service-name` | *Required* | Name of the service in Hive | None |
| `schema-path` | *Required* | Path to the .graphql schema file within the repository | None |
| `hive-registry-access-token` | *Required* | Hive registry access token | None |
| `comment-pr` | *Optional* | Enables commenting schema check results on PR | `true` |
| `github-token` | *Required* | Github token to use when commenting on PRs. Setting to `${{ secrets.GITHUB_TOKEN }}` is sufficient in most cases | None |

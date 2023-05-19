import * as core from '@actions/core'
import { existsSync } from 'fs'
import { execa } from 'execa'
import * as github from '@actions/github'

async function run(): Promise<void> {
  try {
    // Inputs
    const serviceName = core.getInput('service-name', { required: true })
    if (!serviceName || serviceName.length === 0) {
      throw new Error('Input "service-name" is required')
    }

    const schemaPath = core.getInput('schema-path', { required: true })
    if (!schemaPath || schemaPath.length === 0) {
      throw new Error('Input "schema-path" is required')
    }

    const registryToken = core.getInput('hive-registry-access-token', {
      required: true
    })
    if (!registryToken || registryToken.length === 0) {
      throw new Error('Input "hive-registry-access-token" is required')
    }

    const shouldCommentPR = core.getBooleanInput('comment-pr')

    const githubToken = core.getInput('github-token', { required: false })
    if (shouldCommentPR && (!githubToken || githubToken.length === 0)) {
      throw new Error(
        'Input "github-token" is required when PR comments are enabled'
      )
    }

    const registryEndpoint = 'https://registry.hive.openformation.io/graphql'

    // Check if schema file exists
    if (!existsSync(schemaPath)) {
      throw new Error('The schema file could not be found at the provided path')
    }

    // Install Hive CLI
    const curl = execa('curl', ['-sSL', 'https://graphql-hive.com/install.sh'])
    if (!curl.pipeStdout) {
      throw new Error('Hive CLI could not be installed.')
    }
    await curl.pipeStdout(execa('sh'))

    // Log Hive CLI version
    const { stdout: version } = await execa('hive', ['--version'])
    core.info(`Installed Hive CLI with version: ${version}`)

    // Run schema check
    const { stdout: result, exitCode } = await execa(
      'hive',
      [
        'schema:check',
        schemaPath,
        '--service',
        serviceName,
        '--registry.endpoint',
        registryEndpoint
      ],
      {
        env: {
          HIVE_TOKEN: registryToken
        },
        reject: false
      }
    )

    const schemaCheckPassed = exitCode === 0

    const pullNumber = github.context.payload.pull_request?.number
    if (pullNumber && shouldCommentPR) {
      const message = `## Hive schema check result\n${result}`

      const octokit = github.getOctokit(githubToken)
      try {
        await octokit.rest.issues.createComment({
          ...github.context.repo,
          issue_number: pullNumber,
          body: message
        })
      } catch (error) {
        throw new Error('Failed to comment on PR')
      }
    }

    if (!schemaCheckPassed) {
      core.setFailed(`Schema check failed:\n${result}`)
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()

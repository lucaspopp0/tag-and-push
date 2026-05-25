import { getInput, setFailed } from "@actions/core";
import { createActionAuth } from "@octokit/auth-action";
import { Octokit } from "@octokit/rest";
import cleanupExistingTag from "./steps/cleanupExistingTag";
import createNewTag from "./steps/createNewTag";

const run = async () => {
    const inputTag = getInput('tag');

    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
        setFailed(`Empty GITHUB_TOKEN environment variable`)
        process.exit()
    }

    const octokit = new Octokit({
        authStrategy: createActionAuth,
    })

    await cleanupExistingTag(octokit, inputTag)
    await createNewTag(octokit, inputTag)
}

run()

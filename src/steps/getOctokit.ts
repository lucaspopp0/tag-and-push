import { getInput, setFailed } from "@actions/core";
import { createActionAuth } from "@octokit/auth-action";
import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";



const getOctokit = (): Octokit => {
    const inputAppClientId = getInput('app-client-id');
    const inputAppPrivateKey = getInput('app-private-key');

    if (inputAppClientId && inputAppPrivateKey) {
        return new Octokit({
            authStrategy: createAppAuth,
            auth: {
                appId: inputAppClientId,
                privateKey: inputAppPrivateKey,
            },
        })
    }

    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
        setFailed(`Empty GITHUB_TOKEN environment variable`)
        process.exit()
    }

    return new Octokit({
        authStrategy: createActionAuth,
    })
}

export default getOctokit;

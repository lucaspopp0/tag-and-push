import { getInput, setFailed } from "@actions/core";
import { createActionAuth } from "@octokit/auth-action";
import { Octokit } from "@octokit/rest";
import getOctokit from "./steps/getOctokit";
import cleanupExistingTag from "./steps/cleanupExistingTag";
import createNewTag from "./steps/createNewTag";

const run = async () => {
    const inputTag = getInput('tag');

    const octokit = getOctokit()
    
    await cleanupExistingTag(octokit, inputTag)
    await createNewTag(octokit, inputTag)
}

run()

import { RequestError } from "@octokit/request-error";
import { Octokit } from "@octokit/rest";
import { context } from "@actions/github";

const cleanupExistingTag = async (
    octokit: Octokit,
    tagName: string,
) => {
    const exists = await tagExists(octokit, tagName);
    if (!exists) {
        return
    }

    await deleteTag(octokit, tagName)
}

const tagExists = async (
    octokit: Octokit,
    tagName: string,
): Promise<boolean> => {
    try {
        await octokit.git.getRef({
            owner: context.repo.owner,
            repo: context.repo.repo,
            ref: `refs/tags/${tagName}`,
        })
        return true
    } catch (error) {
        if (error instanceof RequestError && error.status === 404) {
            return false
        }
        throw error
    }
}

const deleteTag = async (
    octokit: Octokit,
    tagName: string,
) => {
    await octokit.git.deleteRef({
        owner: context.repo.owner,
        repo: context.repo.repo,
        ref: `refs/tags/${tagName}`,
    })
}

export default cleanupExistingTag;

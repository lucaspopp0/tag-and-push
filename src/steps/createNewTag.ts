import { Octokit } from "@octokit/rest";
import { context } from "@actions/github";
import { setFailed } from "@actions/core";

const createNewTag = async (
    octokit: Octokit,
    tagName: string,
) => {
    const author = await getAppAuthor(octokit)

    await createGitTag(octokit, tagName, author)
}

type AppAuthor = {
    name: string
    email: string
}

const getAppAuthor = async (
    octokit: Octokit,
): Promise<AppAuthor> => {
    const app = await octokit.apps.getAuthenticated();
    if (!app.data) {
        setFailed('Error fetching app data')
        process.exit()
    }

    const authorName = `${app.data.name}[bot]`;
    const authorEmail = `${app.data.id}+${authorName}@users.noreply.github.com`;

    return {
        name: authorName,
        email: authorEmail,
    }
}

const createGitTag = async (
    octokit: Octokit,
    tagName: string,
    author: AppAuthor,
) => {
    await octokit.git.createTag({
        owner: context.repo.owner,
        repo: context.repo.repo,
        tag: tagName,
        message: tagName,
        object: context.sha,
        type: 'commit',
        tagger: author,
    })

    await octokit.git.createRef({
        owner: context.repo.owner,
        repo: context.repo.repo,
        ref: `refs/tags/${tagName}`,
        sha: context.sha,
    })
}

export default createNewTag;

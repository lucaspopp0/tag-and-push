import * as core from "@actions/core";
import * as github from "@actions/github";
import { createRelease, deleteReleaseIfExists } from "./release";
import { getRepositoryId, normalizeTagName, pushTag } from "./tag";

const run = async (): Promise<void> => {
    const tag = normalizeTagName(core.getInput("tag", { required: true }));
    const shouldCreateRelease = core.getBooleanInput("release");
    const owner = github.context.repo.owner;
    const repo = github.context.repo.repo;
    const sha = github.context.sha;

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        throw new Error("GITHUB_TOKEN is not set");
    }

    if (shouldCreateRelease) {
        const deleted = await deleteReleaseIfExists({
            token,
            owner,
            repo,
            tagName: tag,
        });

        if (deleted) {
            core.info(`Deleted existing release "${tag}"`);
        }
    }

    core.info(`Creating tag "${tag}" on ${owner}/${repo} at ${sha}`);

    const result = await pushTag({
        token,
        owner,
        repo,
        tag,
        sha,
    });

    core.setOutput("tag-url", result.tagUrl);
    core.setOutput("tag-sha", result.tagSha);
    core.info(`Tag created: ${result.tagUrl}`);

    if (shouldCreateRelease) {
        const repositoryId = await getRepositoryId(token, owner, repo);
        const release = await createRelease({
            token,
            repositoryId,
            tagName: tag,
        });

        core.setOutput("release-url", release.releaseUrl);
        core.info(`Release created: ${release.releaseUrl}`);
    }
};

run().catch((error: unknown) => {
    if (error instanceof Error) {
        core.setFailed(error.message);
        return;
    }
    core.setFailed("Unknown error");
});

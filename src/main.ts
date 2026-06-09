import * as core from "@actions/core";
import * as github from "@actions/github";
import {
    createRelease,
    deleteReleaseIfExists,
    parseReleaseType,
} from "./release";
import { normalizeTagName, pushTag } from "./tag";

const run = async (): Promise<void> => {
    const tag = normalizeTagName(core.getInput("tag", { required: true }));
    const shouldCreateRelease = core.getBooleanInput("release");
    const releaseType = parseReleaseType(core.getInput("release-type"));
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
        const release = await createRelease({
            token,
            owner,
            repo,
            tagName: tag,
            releaseType,
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

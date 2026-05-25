import * as core from "@actions/core";
import * as github from "@actions/github";
import { pushTag } from "./tag";

const run = async (): Promise<void> => {
    const tag = core.getInput("tag", { required: true });
    const owner = github.context.repo.owner;
    const repo = github.context.repo.repo;
    const sha = github.context.sha;

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        throw new Error("GITHUB_TOKEN is not set");
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
};

run().catch((error: unknown) => {
    if (error instanceof Error) {
        core.setFailed(error.message);
        return;
    }
    core.setFailed("Unknown error");
});

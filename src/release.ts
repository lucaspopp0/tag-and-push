import { getOctokit } from "@actions/github";
import { RequestError } from "@octokit/request-error";

export type ReleaseType = "release" | "prerelease";

type ReleaseResult = {
    releaseUrl: string;
};

export const parseReleaseType = (value: string): ReleaseType => {
    if (value === "release" || value === "prerelease") {
        return value;
    }

    throw new Error(
        `Invalid release-type "${value}": must be "release" or "prerelease"`,
    );
};

const isNotFoundError = (error: unknown): boolean => {
    return error instanceof RequestError && error.status === 404;
};

export const deleteReleaseIfExists = async (options: {
    token: string;
    owner: string;
    repo: string;
    tagName: string;
}): Promise<boolean> => {
    const { token, owner, repo, tagName } = options;
    const octokit = getOctokit(token);

    let releaseId: number;

    try {
        const { data } = await octokit.rest.repos.getReleaseByTag({
            owner,
            repo,
            tag: tagName,
        });
        releaseId = data.id;
    } catch (error: unknown) {
        if (isNotFoundError(error)) {
            return false;
        }

        throw error;
    }

    await octokit.rest.repos.deleteRelease({
        owner,
        repo,
        release_id: releaseId,
    });

    return true;
};

export const createRelease = async (options: {
    token: string;
    owner: string;
    repo: string;
    tagName: string;
    releaseType?: ReleaseType;
}): Promise<ReleaseResult> => {
    const { token, owner, repo, tagName, releaseType = "release" } = options;
    const octokit = getOctokit(token);

    const { data } = await octokit.rest.repos.createRelease({
        owner,
        repo,
        tag_name: tagName,
        name: tagName,
        prerelease: releaseType === "prerelease",
    });

    return {
        releaseUrl: data.html_url,
    };
};

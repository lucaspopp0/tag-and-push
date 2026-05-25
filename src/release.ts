import { graphql } from "@octokit/graphql";

type ReleaseResult = {
    releaseUrl: string;
};

const getReleaseIdByTagName = async (
    token: string,
    owner: string,
    name: string,
    tagName: string,
): Promise<string | null> => {
    const { repository } = await graphql<{
        repository: { release: { id: string } | null };
    }>(
        `
            query ($owner: String!, $name: String!, $tagName: String!) {
                repository(owner: $owner, name: $name) {
                    release(tagName: $tagName) {
                        id
                    }
                }
            }
        `,
        {
            owner,
            name,
            tagName,
            headers: { authorization: `token ${token}` },
        },
    );

    return repository.release?.id ?? null;
};

const deleteReleaseById = async (
    token: string,
    releaseId: string,
): Promise<void> => {
    await graphql(
        `
            mutation ($input: DeleteReleaseInput!) {
                deleteRelease(input: $input) {
                    clientMutationId
                }
            }
        `,
        {
            input: { releaseId },
            headers: { authorization: `token ${token}` },
        },
    );
};

const createReleaseForTag = async (
    token: string,
    repositoryId: string,
    tagName: string,
): Promise<ReleaseResult> => {
    const { createRelease } = await graphql<{
        createRelease: {
            release: {
                url: string;
            };
        };
    }>(
        `
            mutation ($input: CreateReleaseInput!) {
                createRelease(input: $input) {
                    release {
                        url
                    }
                }
            }
        `,
        {
            input: {
                repositoryId,
                tagName,
                name: tagName,
            },
            headers: { authorization: `token ${token}` },
        },
    );

    return {
        releaseUrl: createRelease.release.url,
    };
};

export const deleteReleaseIfExists = async (options: {
    token: string;
    owner: string;
    repo: string;
    tagName: string;
}): Promise<boolean> => {
    const { token, owner, repo, tagName } = options;
    const releaseId = await getReleaseIdByTagName(token, owner, repo, tagName);

    if (!releaseId) {
        return false;
    }

    await deleteReleaseById(token, releaseId);
    return true;
};

export const createRelease = async (options: {
    token: string;
    repositoryId: string;
    tagName: string;
}): Promise<ReleaseResult> => {
    const { token, repositoryId, tagName } = options;

    return createReleaseForTag(token, repositoryId, tagName);
};

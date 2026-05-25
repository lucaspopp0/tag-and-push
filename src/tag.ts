import { graphql } from "@octokit/graphql";

type RepositoryIds = {
    repositoryId: string;
    owner: string;
    name: string;
};

type TagResult = {
    tagUrl: string;
    tagSha: string;
};

const normalizeTagName = (tag: string): string => {
    return tag.startsWith("refs/tags/") ? tag.slice("refs/tags/".length) : tag;
};

const tagRefName = (tag: string): string => {
    const name = normalizeTagName(tag);
    return `refs/tags/${name}`;
};

const getRepositoryId = async (
    token: string,
    owner: string,
    name: string,
): Promise<string> => {
    const { repository } = await graphql<{ repository: { id: string } }>(
        `
            query ($owner: String!, $name: String!) {
                repository(owner: $owner, name: $name) {
                    id
                }
            }
        `,
        {
            owner,
            name,
            headers: { authorization: `token ${token}` },
        },
    );

    return repository.id;
};

const getTagRefId = async (
    token: string,
    owner: string,
    name: string,
    ref: string,
): Promise<string | null> => {
    const { repository } = await graphql<{
        repository: { ref: { id: string } | null };
    }>(
        `
            query ($owner: String!, $name: String!, $ref: String!) {
                repository(owner: $owner, name: $name) {
                    ref(qualifiedName: $ref) {
                        id
                    }
                }
            }
        `,
        {
            owner,
            name,
            ref,
            headers: { authorization: `token ${token}` },
        },
    );

    return repository.ref?.id ?? null;
};

const deleteTagRef = async (
    token: string,
    refId: string,
): Promise<void> => {
    await graphql(
        `
            mutation ($input: DeleteRefInput!) {
                deleteRef(input: $input) {
                    clientMutationId
                }
            }
        `,
        {
            input: { refId },
            headers: { authorization: `token ${token}` },
        },
    );
};

const createTagRef = async (
    token: string,
    repositoryId: string,
    owner: string,
    name: string,
    ref: string,
    sha: string,
): Promise<TagResult> => {
    const { createRef } = await graphql<{
        createRef: {
            ref: {
                name: string;
                target: { oid: string };
            };
        };
    }>(
        `
            mutation ($input: CreateRefInput!) {
                createRef(input: $input) {
                    ref {
                        name
                        target {
                            ... on Commit {
                                oid
                            }
                        }
                    }
                }
            }
        `,
        {
            input: {
                repositoryId,
                name: ref,
                oid: sha,
            },
            headers: { authorization: `token ${token}` },
        },
    );

    const tagName = normalizeTagName(createRef.ref.name);
    const tagUrl =
        `https://github.com/${owner}/${name}/tree/${encodeURIComponent(tagName)}`;

    return {
        tagUrl,
        tagSha: createRef.ref.target.oid,
    };
};

export const pushTag = async (options: {
    token: string;
    owner: string;
    repo: string;
    tag: string;
    sha: string;
}): Promise<TagResult> => {
    const { token, owner, repo, tag, sha } = options;
    const repositoryId = await getRepositoryId(token, owner, repo);
    const ref = tagRefName(tag);

    const existingRefId = await getTagRefId(token, owner, repo, ref);
    if (existingRefId) {
        await deleteTagRef(token, existingRefId);
    }

    return createTagRef(token, repositoryId, owner, repo, ref, sha);
};

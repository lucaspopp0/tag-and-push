import { graphql } from '@octokit/graphql';
import { normalizeTagName, pushTag } from './tag';

const mockGraphql = jest.mocked(graphql);

const pushTagOptions = {
    token: 'gh-token',
    owner: 'acme',
    repo: 'widgets',
    tag: 'v1.0.0',
    sha: 'abc123',
};

describe('normalizeTagName', () => {
    it('returns the tag unchanged when not prefixed', () => {
        expect(normalizeTagName('v1.0.0')).toBe('v1.0.0');
    });

    it('strips a refs/tags/ prefix', () => {
        expect(normalizeTagName('refs/tags/v1.0.0')).toBe('v1.0.0');
    });
});

describe('pushTag', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('creates a tag when none exists', async () => {
        mockGraphql
            .mockResolvedValueOnce({ repository: { id: 'repo-id' } })
            .mockResolvedValueOnce({ repository: { ref: null } })
            .mockResolvedValueOnce({
                createRef: {
                    ref: {
                        name: 'refs/tags/v1.0.0',
                        target: { oid: 'abc123' },
                    },
                },
            });

        const result = await pushTag(pushTagOptions);

        expect(result).toEqual({
            tagUrl: 'https://github.com/acme/widgets/tree/v1.0.0',
            tagSha: 'abc123',
        });
        expect(mockGraphql).toHaveBeenCalledTimes(3);
    });

    it('deletes an existing tag before creating a new one', async () => {
        mockGraphql
            .mockResolvedValueOnce({ repository: { id: 'repo-id' } })
            .mockResolvedValueOnce({ repository: { ref: { id: 'ref-id' } } })
            .mockResolvedValueOnce({ deleteRef: { clientMutationId: null } })
            .mockResolvedValueOnce({
                createRef: {
                    ref: {
                        name: 'refs/tags/v1.0.0',
                        target: { oid: 'def456' },
                    },
                },
            });

        const result = await pushTag({
            ...pushTagOptions,
            sha: 'def456',
        });

        expect(result).toEqual({
            tagUrl: 'https://github.com/acme/widgets/tree/v1.0.0',
            tagSha: 'def456',
        });
        expect(mockGraphql).toHaveBeenCalledTimes(4);
    });

    it('normalizes a refs/tags/ input before creating the ref', async () => {
        mockGraphql
            .mockResolvedValueOnce({ repository: { id: 'repo-id' } })
            .mockResolvedValueOnce({ repository: { ref: null } })
            .mockResolvedValueOnce({
                createRef: {
                    ref: {
                        name: 'refs/tags/v2.0.0',
                        target: { oid: 'abc123' },
                    },
                },
            });

        await pushTag({
            ...pushTagOptions,
            tag: 'refs/tags/v2.0.0',
        });

        expect(mockGraphql).toHaveBeenNthCalledWith(
            2,
            expect.any(String),
            expect.objectContaining({
                ref: 'refs/tags/v2.0.0',
            }),
        );
    });
});

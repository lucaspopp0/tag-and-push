import { getOctokit } from '@actions/github';
import { RequestError } from '@octokit/request-error';
import { createRelease, deleteReleaseIfExists } from './release';

const mockGetOctokit = jest.mocked(getOctokit);

const releaseOptions = {
    token: 'gh-token',
    owner: 'acme',
    repo: 'widgets',
    tagName: 'v1.0.0',
};

const createMockOctokit = (): {
    rest: {
        repos: {
            getReleaseByTag: jest.Mock,
            deleteRelease: jest.Mock,
            createRelease: jest.Mock,
        },
    },
} => ({
    rest: {
        repos: {
            getReleaseByTag: jest.fn(),
            deleteRelease: jest.fn(),
            createRelease: jest.fn(),
        },
    },
});

describe('deleteReleaseIfExists', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns false when no release exists for the tag', async () => {
        const mockOctokit = createMockOctokit();
        mockGetOctokit.mockReturnValue(mockOctokit as never);
        mockOctokit.rest.repos.getReleaseByTag.mockRejectedValue(
            new RequestError('Not Found', 404, {
                request: {
                    method: 'GET',
                    url: '/repos/acme/widgets/releases/tags/v1.0.0',
                    headers: {},
                },
            }),
        );

        const result = await deleteReleaseIfExists(releaseOptions);

        expect(result).toBe(false);
        expect(mockOctokit.rest.repos.deleteRelease).not.toHaveBeenCalled();
    });

    it('deletes and returns true when a release exists', async () => {
        const mockOctokit = createMockOctokit();
        mockGetOctokit.mockReturnValue(mockOctokit as never);
        mockOctokit.rest.repos.getReleaseByTag.mockResolvedValue({
            data: { id: 42 },
        });
        mockOctokit.rest.repos.deleteRelease.mockResolvedValue(undefined);

        const result = await deleteReleaseIfExists(releaseOptions);

        expect(result).toBe(true);
        expect(mockOctokit.rest.repos.deleteRelease).toHaveBeenCalledWith({
            owner: 'acme',
            repo: 'widgets',
            release_id: 42,
        });
    });

    it('rethrows non-404 errors', async () => {
        const mockOctokit = createMockOctokit();
        mockGetOctokit.mockReturnValue(mockOctokit as never);
        const error = new RequestError('Forbidden', 403, {
            request: {
                method: 'GET',
                url: '/repos/acme/widgets/releases/tags/v1.0.0',
                headers: {},
            },
        });
        mockOctokit.rest.repos.getReleaseByTag.mockRejectedValue(error);

        await expect(deleteReleaseIfExists(releaseOptions)).rejects.toBe(error);
    });
});

describe('createRelease', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('creates a release for the tag', async () => {
        const mockOctokit = createMockOctokit();
        mockGetOctokit.mockReturnValue(mockOctokit as never);
        mockOctokit.rest.repos.createRelease.mockResolvedValue({
            data: {
                html_url: 'https://github.com/acme/widgets/releases/tag/v1.0.0',
            },
        });

        const result = await createRelease(releaseOptions);

        expect(result).toEqual({
            releaseUrl: 'https://github.com/acme/widgets/releases/tag/v1.0.0',
        });
        expect(mockOctokit.rest.repos.createRelease).toHaveBeenCalledWith({
            owner: 'acme',
            repo: 'widgets',
            tag_name: 'v1.0.0',
            name: 'v1.0.0',
        });
    });
});

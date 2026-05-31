/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/*.test.ts'],
    clearMocks: true,
    watchman: false,
    moduleNameMapper: {
        '^@actions/core$': '<rootDir>/test/mocks/actions-core.js',
        '^@actions/github$': '<rootDir>/test/mocks/actions-github.js',
        '^@octokit/graphql$': '<rootDir>/test/mocks/octokit-graphql.js',
        '^@octokit/request-error$': '<rootDir>/test/mocks/octokit-request-error.js',
    },
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                tsconfig: {
                    types: ['jest', 'node'],
                },
            },
        ],
    },
};

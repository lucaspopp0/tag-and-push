import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        ignores: [
            'dist/**',
            'lib/**',
            'node_modules/**',
            'eslint.config.mjs',
            'jest.config.cjs',
            'test/**',
        ],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommended.map((config) => ({
        ...config,
        files: ['**/*.test.ts'],
    })),
    ...tseslint.configs.recommendedTypeChecked.map((config) => ({
        ...config,
        files: ['**/*.ts'],
        ignores: ['**/*.test.ts'],
    })),
    {
        files: ['**/*.ts'],
        ignores: ['**/*.test.ts'],
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        files: ['**/*.test.ts'],
        languageOptions: {
            globals: {
                ...globals.jest,
            },
        },
    },
);

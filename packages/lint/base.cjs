module.exports = {
  extends: ['next', 'turbo', 'prettier'],
  ignorePatterns: ['**/dist/*', '**/__generated__/*'],
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
    'react/jsx-key': 'off',
    'import/no-extraneous-dependencies': 'error',
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['../../*'],
            message: 'usage of import from external modules not allowed',
          },
          {
            group: [
              '*/*/*',
              '!~/*/*',
              '!@apollo/**',
              '!graphql-shield/**',
              '!@num/**',
              '!@hookform/**',
            ],
            message: 'reaching to internals of a module is not allowed',
          },
        ],
      },
    ],
  },
};

module.exports = {
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  printWidth: 100,
  tabWidth: 2,
  singleQuote: true,
  semi: true,
  importOrder: [
    '^@gen/(.*)$',
    '^@repo/(.*)$',
    '~/graphql/builder',
    '<THIRD_PARTY_MODULES>',
    '^[./]',
  ],
  importOrderSeparation: true,
  importOrderCaseInsensitive: true,
  jsxSingleQuote: false,
  bracketSameLine: false,
};

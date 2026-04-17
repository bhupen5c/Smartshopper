import base from './base.mjs';

export default [
  ...base,
  {
    files: ['**/*.ts'],
    rules: {
      // NestJS uses param decorators that ESLint sometimes flags spuriously.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
      '@typescript-eslint/no-extraneous-class': 'off',
    },
  },
];

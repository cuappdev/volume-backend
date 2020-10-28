module.exports = {
    extends: 'airbnb-typescript-prettier',
    "rules": {
      'class-methods-use-this': 0,
      'import/no-cycle': 0,
      'no-plusplus': 0,
      'no-restricted-syntax': 0,
      'no-use-before-define': 0,
      'array-callback-return': 0,
      '@typescript-eslint/explicit-module-boundary-types': 0,
      '@typescript-eslint/no-explicit-any': 0,
      '@typescript-eslint/no-unused-vars': 0
    },
    // This gets rid of weird react error for non-react project
    settings: {
      react: {
        version: '999.999.999',
      },
    },
  };
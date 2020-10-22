module.exports = {
    extends: 'airbnb-typescript/base',
    "rules": {
        'class-methods-use-this': 0,
        '@typescript-eslint/no-unused-vars': 0
    },
    parserOptions: {
        project: './tsconfig.json'
    }
};
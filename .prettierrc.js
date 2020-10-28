module.exports = {
    singleQuote: true,
    printWidth: 100,
    trailingComma: "all",
    semi: true,
    tabWidth: 2,
    useTabs: false,
    overrides: [{
        "files": "*.ts",
        "options": {
            "parser": "typescript"
        }
    }]
};
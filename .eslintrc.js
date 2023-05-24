module.exports = {
    "env": {
        "browser": true,
        "node": true,
        "es6": true,
        "es2021": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended"
    ],
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": 12,
        "sourceType": "module"
    },
    "plugins": [
        "react",
        "react-hooks"
    ],
    "rules": {
        "react/prop-types": "off",
        "react/display-name": "off",
        "no-case-declarations": "off",
        "no-extra-semi": "off",
        "no-unused-vars": ["error", { "vars": "all", "argsIgnorePattern": "^_" }],
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn"
    }
};
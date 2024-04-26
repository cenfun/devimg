// https://eslint.org/docs/rules/
module.exports = {
    'root': true,
    // system globals
    'env': {
        'node': true,
        'browser': true,
        'amd': true,
        'commonjs': true,
        'es6': true,
        'mocha': true
    },
    // other globals
    'globals': {},

    'plugins': [
        'react',
        'react-hooks',
        'html'
    ],

    'extends': [
        'plus',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'next/core-web-vitals'
    ],

    'parserOptions': {
        'ecmaVersion': 'latest',
        'sourceType': 'module'
    },

    'rules': {
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn'
    }
};

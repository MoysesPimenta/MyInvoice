module.exports = [
  {
    files: ['**/*.gs'],
    languageOptions: {
      ecmaVersion: 5,
      sourceType: 'script'
    },
    rules: {}
  },
  {
    files: ['front-end/**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module'
    },
    plugins: {
      flowtype: require('eslint-plugin-flowtype')
    },
    rules: {
      'flowtype/define-flow-type': 1,
      'flowtype/use-flow-type': 1
    }
  }
];

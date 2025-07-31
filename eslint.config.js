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
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module'
    },
    rules: {}
  }
];

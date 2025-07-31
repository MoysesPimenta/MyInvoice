module.exports = [
  {
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        SpreadsheetApp: 'readonly',
        ScriptApp: 'readonly',
        ContentService: 'readonly',
      },
    },
    plugins: {
      flowtype: require('eslint-plugin-flowtype'),
    },
    rules: {},
  },
];

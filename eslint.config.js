module.exports = [
  {
    files: ["**/*.gs"],
    languageOptions: {
      ecmaVersion: 5,
      sourceType: "script"
    },
    plugins: {
      jsdoc: require("eslint-plugin-jsdoc")
    },
    rules: {
      "jsdoc/check-tag-names": "error",
      "jsdoc/check-param-names": "error",
      "jsdoc/check-types": "error"
    }
  },
  {
    files: ["front-end/**/*.js"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      parser: require("@babel/eslint-parser"),
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          plugins: ["@babel/plugin-syntax-flow"]
        }
      }
    },
    plugins: {
      flowtype: require("eslint-plugin-flowtype"),
      jsdoc: require("eslint-plugin-jsdoc")
    },
    rules: {
      "flowtype/define-flow-type": 1,
      "flowtype/use-flow-type": 1,
      "jsdoc/check-tag-names": "error",
      "jsdoc/check-param-names": "error",
      "jsdoc/check-types": "error"
    }
  }
];

/** @type {import('ts-jest').JestConfigWithTsJest} */

const packageInfo = require('./package.json');

module.exports = {
  preset: 'ts-jest',
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [],
  globals: {
    SDK_VERSION: `${packageInfo.version}-unit-tests`,
  },
};

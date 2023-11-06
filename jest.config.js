/** @type {import('ts-jest').JestConfigWithTsJest} */

const { compilerOptions }= require('./tsconfig.json');
const { pathsToModuleNameMapper } = require('ts-jest');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: "<rootDir>" } )
}

// const path = require('path');

// module.exports = {
//   moduleFileExtensions: ['js', 'json', 'ts'],
//   // roots: ['src'],
//   transform: {
//     '^.+\\.(t|j)s$': 'ts-jest',
//   },
//   collectCoverageFrom: ['**/*.(t|j)s'],
//   coverageDirectory: '../coverage',
//   testEnvironment: 'node',
//   // moduleDirectories: ['node_modules', 'src', __dirname],
//   preset: 'ts-jest',
//   "roots": [
//     "<rootDir>",
//     "./src"
//   ],
//   "modulePaths": [
//     "<roo\n}tDir>",
//     "./src"
//   ],
//   "moduleDirectories": [
//     "node_modules"
//   ]

/** @type {import('./dist').JestConfigWithTsJest} */
import type { Config } from 'jest';

// const config: Config = {
//   verbose: true,
//   modulePaths: ["<rootDir>", "<rootDir>/test/", "<rootDir>/src/"]
// };

// export default config;
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
// module.exports = {
//   preset: 'ts-jest',
//   testEnvironment: 'node',

//   /** ПУТИ */
//   rootDir: '.',
//   roots: ['<rootDir>', '<rootDir>/test'],
//   modulePaths: ['<rootDir>', '<rootDir>/test', '<rootDir>/src'],
//   moduleDirectories: ['node_modules'],
//   transform: { '^.+\\.tsx?$': 'ts-jest' },
//   testRegex: '(/test/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
//   // testMatch: [ '**/test/**/*.js?(x)', '**/?(*.)(spec|test).js?(x)' ],
//   testPathIgnorePatterns: ['/node_modules/', './dist'],
//   moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

//   /** ОТЧЕТ: ПОКРЫТИЕ ТЕСТАМИ */
//   collectCoverage: false,
//   coverageDirectory: '<rootDir>/test/coverage',
//   // coverageProvider: 'v8',

//   /** ОТЧЕТ: РЕЗУЛЬТАТЫ ТЕСТОВ */
//   reporters: [
//     'default',
//     [
//       '<rootDir>/node_modules/jest-html-reporter',
//       {
//         outputPath: '<rootDir>/test/reports/test-report.html',
//         pageTitle: 'Тесты Docnode2',
//         includeFailureMsg: true,
//       },
//     ],
//   ],
// };

// // module.exports = {
// //   rootDir: '.',
// //   roots: ['<rootDir>/src'],
// //   transform: {
// //     '^.+\\.tsx?$': 'ts-jest',
// //   },
// //   testRegex: '.*\\.spec\\.tsx?$',
// //   moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
// //   moduleNameMapper: { '^src/(.*)$': '<rootDir>/src/$1' },
// //   testEnvironment: 'node',
// //   collectCoverageFrom: ['src/**/*.ts'],
// //   coverageDirectory: 'coverage',
// // };

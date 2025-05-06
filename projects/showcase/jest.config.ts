import presets from 'jest-preset-angular/presets';

import type { Config } from 'jest';

const esmPreset = presets.createEsmPreset();

const jestConfig: Config = {
  ...esmPreset,
  extensionsToTreatAsEsm: ['.ts'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        stringifyContentPathRegex: '\\.(html|svg)$',
        tsconfig: '<rootDir>/tsconfig.spec.json',
        useESM: true,
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!(tslib|@angular/cdk))'],
  moduleNameMapper: {
    ...esmPreset.moduleNameMapper,
    tslib: 'tslib/tslib.es6.js',
    // the ^ and $ matters to prevent accidental matches
    '^uuid$': 'uuid',
    '^rxjs(/operators)?$': '<rootDir>../../node_modules/rxjs/dist/cjs/index.js',
    '^rxjs/testing$':
      '<rootDir>../../node_modules/rxjs/dist/cjs/testing/index.js',
    '@angular-experts\\/resource\\/(.*)': '<rootDir>/../resource/$1',
    '@angular-experts\\/resource': '<rootDir>/../resource/src/public-api.ts',
    '\\.(jpg|ico|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|css|less)$':
      '<rootDir>/jest.mocks.ts',
    '^raw-loader!(.*)$': '<rootDir>/jest.mocks.ts',
  },

  // perf
  maxWorkers: '8',

  // coverage
  coverageDirectory: '../../coverage/showcase',
  coverageReporters: ['html', 'text-summary', 'cobertura'],
  reporters: ['default'],
  collectCoverageFrom: [
    '**/src/{lib,app}/**/*.{ts,js}',
    '!**/public{_,-}api.ts',
    '!**/index.ts',
    '!**/*.routes.ts',
  ],
};

export default jestConfig;

import type { Config } from 'jest';
import presets from 'jest-preset-angular/presets';

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
  moduleNameMapper: {
    ...esmPreset.moduleNameMapper,
    '^rxjs(/operators)?$':
      '<rootDir>../../node_modules/rxjs/dist/bundles/rxjs.umd.js',
    '^rxjs/testing$':
      '<rootDir>../../node_modules/rxjs/dist/cjs/testing/index.js',
  },

  // perf
  maxWorkers: '8',

  // coverage
  coverageDirectory: '../../coverage/lib',
  coverageReporters: ['html', 'text-summary', 'cobertura'],
  reporters: ['default'],
  collectCoverageFrom: [
    '**/src/{lib,app}/**/*.{ts,js}',
    '!**/public{_,-}api.ts',
    '!**/index.ts',
  ],
};

export default jestConfig;

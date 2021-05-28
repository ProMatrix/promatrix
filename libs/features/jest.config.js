module.exports = {
  displayName: 'features',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.(html|svg)$',
      astTransformers: {
        before: [
          'jest-preset-angular/build/InlineFilesTransformer',
          'jest-preset-angular/build/StripStylesTransformer',
        ],
      },
    },
  },
  coverageDirectory: '../../coverage/libs/features',
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes.js',
    'jest-preset-angular/build/serializers/ng-snapshot.js',
    'jest-preset-angular/build/serializers/html-comment.js',
  ],
};

/** データ・計算ロジック・保存処理（UIに依存しない部分）のテスト用 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      { tsconfig: { strict: true, esModuleInterop: true, module: 'commonjs', target: 'es2020' }, diagnostics: true },
    ],
  },
};

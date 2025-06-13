import { defineConfig, globalIgnores } from 'eslint/config';
import jest from 'eslint-plugin-jest';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  globalIgnores(['dist/', '.yarn/', 'webpack.*.js']),
  {
    extends: compat.extends('airbnb-base', 'prettier'),

    plugins: {
      jest,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.commonjs,
        ...globals.node,
        ...jest.environments.globals.globals,
      },

      ecmaVersion: 13,
      sourceType: 'module',
    },

    files: ['src/**/*.js'],

    rules: {
      'import/prefer-default-export': 'off',
      'import/extensions': 'off',
      'implicit-arrow-linebreak': 0,
      'no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false,
          argsIgnorePattern: '^_$', // Ignore parameters that are exactly underscore
          //   varsIgnorePattern: '^_$', // Ignore variables that are exactly underscore
          caughtErrorsIgnorePattern: '^_$', // Ignore caught errors that are exactly underscore
        },
      ],

      'no-plusplus': [
        'error',
        {
          allowForLoopAfterthoughts: true,
        },
      ],
    },
  },
]);

/*
 * Copyright 2024 Cortex Applications, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* eslint-disable import/no-extraneous-dependencies */
import resolve from '@rollup/plugin-node-resolve';
import esbuild from 'rollup-plugin-esbuild';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import commonjs from '@rollup/plugin-commonjs';
import dts from 'rollup-plugin-dts';

// eslint-disable-next-line import/no-anonymous-default-export
export default [
  {
    input: 'src/index.ts',
    output: {
      dir: 'dist',
      entryFileNames: 'index.esm.js',
      chunkFileNames: 'esm/[name]-[hash].js',
      format: 'module',
    },
    preserveEntrySignatures: 'strict',
    external: require('module').builtinModules,

    plugins: [
      peerDepsExternal({
        includeDependencies: true,
      }),
      commonjs({
        include: ['node_modules/**', '../../node_modules/**'],
        exclude: ['**/*.stories.*', '**/*.test.*'],
      }),
      esbuild({
        target: 'es2019',
      }),
      resolve({
        mainFields: ['browser', 'module', 'main'],
      }),
    ],
  },

  {
    input: 'dist-types/src/index.d.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
];

import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
import serve from 'rollup-plugin-serve';

const dev = process.env.ROLLUP_WATCH;

const serveopts = {
  contentBase: ['./dist'],
  host: '0.0.0.0',
  port: 5000,
  allowCrossOrigin: true,
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
};

const plugins = [
  nodeResolve({
    preferBuiltins: false,
    browser: true,
  }),
  commonjs(),
  typescript({
    tsconfig: './tsconfig.json',
    declaration: false,
    declarationMap: false,
  }),
  json(),
  dev && serve(serveopts),
  !dev && terser({
    mangle: {
      safari10: true,
    },
    format: {
      comments: false,
    },
  }),
].filter(Boolean);

export default {
  input: 'src/index.ts',
  output: {
    file: 'timeflow-card.js',
    format: 'es',
    sourcemap: true
  },
  plugins
};

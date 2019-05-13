import { makeCompiler, runTest } from './helpers/compiler';

const FILE_TYPES = /\.(jpe?g|png|gif|svg)$/;
const DOG = './assets/dog.jpg';
const ICELAND = './assets/iceland.jpg';

describe('sharp-transform-loader spec', () => {
  const RULE = {
    test: FILE_TYPES,
    use: [
      'sharp-transform-loader',
      'file-loader',
    ],
  };
  test('should return path to image if no query params passed', () => {
    const compiler = makeCompiler({
      files: {
        'main.js': `window.img = require('${DOG}');`,
      },
      rule: RULE
    });

    runTest(compiler, () => {
      const { img } = window;
      console.log("TCL: img", img);

    })
  });
});
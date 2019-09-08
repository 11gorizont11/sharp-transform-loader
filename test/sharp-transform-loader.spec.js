import { makeCompiler, runTest } from './compiler';

const FILE_TYPES = /\.(jpe?g|png|gif|svg)$/;
const WEBP_FORMAT = new RegExp(/(.webp)$/g);
const DOG = './test/assets/dog.jpg';
const ICELAND = './test/assets/iceland.jpg';
const FLOWER = './test/assets/flower.jpg';

describe('sharp-transform-loader spec', () => {
  const RULE = {
    test: FILE_TYPES,
    use: ['sharp-transform-loader', 'file-loader']
  };
  test('path to image if no query params passed', () => {
    const compiler = makeCompiler({
      files: {
        'main.js': `window.img = require('${DOG}');`
      },
      rule: RULE
    });

    return runTest(compiler, window => {
      expect(typeof window.img).toBe('string');
    });
  });

  test('placeholder', () => {
    const compiler = makeCompiler({
      files: {
        'main.js': `window.img = require('${DOG}?placeholder');`
      },
      rule: RULE
    });

    return runTest(compiler, window => {
      expect(typeof window.img.placeholder.url).toBe('string');
      expect(typeof window.img.placeholder.aspectRatio).not.toBeNaN();
      expect(window.img.placeholder.aspectRatio).toBeGreaterThan(1);
    });
  });
  test('webp format image', () => {
    const compiler = makeCompiler({
      files: {
        'main.js': `window.img = require('${DOG}?webp');`
      },
      rule: RULE
    });

    return runTest(compiler, window => {
      expect(typeof window.img.webp).toBe('string');
      expect(window.img.webp).toMatch(WEBP_FORMAT);
    });
  });
  test('sources provided sizes values', () => {
    const compiler = makeCompiler({
      files: {
        'main.js': `window.img = require('${DOG}?sizes=400w+800w');`
      },
      rule: RULE
    });

    return runTest(compiler, window => {
      expect(Object.keys(window.img.sources)).toEqual(['400w', '800w']);
      expect(window.img.srcSet).toContain('400w');
      expect(window.img.srcSet).toContain('800w');
    });
  });

  test('sources provided sizes values with webp ext', () => {
    const compiler = makeCompiler({
      files: {
        'main.js': `window.img = require('${DOG}?sizes=400w+400w.webp+800w+800w.webp');`
      },
      rule: RULE
    });

    return runTest(compiler, window => {
      expect(Object.keys(window.img.sources)).toEqual([
        '400w',
        '400w.webp',
        '800w',
        '800w.webp'
      ]);
      expect(window.img.srcSet).toContain('400w');
      expect(window.img.srcSetWebp).toContain('400w');
    });
  });

  test('default image src', () => {
    const compiler = makeCompiler({
      files: {
        'main.js': `window.img = require('${FLOWER}?webp&placeholder');`
      },
      rule: RULE
    });

    return runTest(compiler, window => {
      expect(Object.keys(window.img)).toEqual(['image', 'placeholder', 'webp']);
    });
  });

  test('sources with provided density', () => {
    const compiler = makeCompiler({
      files: {
        'main.js': `window.img = require('${FLOWER}?sizes=1x+1x.webp+2x+2x.webp');`
      },
      rule: RULE
    });

    return runTest(compiler, window => {
      console.log('TCL: window.img.sources', window.img.sources);
      expect(Object.keys(window.img.sources)).toEqual([
        '1x',
        '1x.webp',
        '2x',
        '2x.webp'
      ]);
      expect(window.img.srcSet).toContain('2x');
      expect(window.img.srcSetWebp).toContain('2x');
    });
  });

  test('sizes provided in trivial way', () => {
    const compiler = makeCompiler({
      files: {
        'main.js': `window.img = require('${ICELAND}?sizes[]=400w&sizes[]=800w&sizes[]=2x');`
      },
      rule: RULE
    });

    return runTest(compiler, window => {
      expect(Object.keys(window.img.sources)).toEqual(['400w', '800w', '2x']);
      expect(window.img.srcSet).toContain('400w');
      expect(window.img.srcSet).toContain('800w');
      expect(window.img.srcSet).toContain('2x');
    });
  });
});

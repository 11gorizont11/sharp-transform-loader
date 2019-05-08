import path from 'path';
import fs from 'fs';
import webpack from 'webpack';
import MemoryFs from 'memory-fs';

export default (fixture, options = {}) => {
  const compiler = webpack({
    context: __dirname,
    entry: `./${fixture}`,
    output: {
      path: path.resolve(__dirname),
      filename: 'bundle.js',
    },
    module: {
      rules: [{
        test: /\.(jpe?g|png|gif|svg)$/,
        use: [{
          loader: path.resolve(__dirname, '../src/index'),
        }, {
          loader: 'file-loader'
        }]
      }]
    }
  });

  const memoryFs = new MemoryFs();

  // Tell webpack to use our in-memory FS
  compiler.inputFileSystem = memoryFs;
  compiler.outputFileSystem = memoryFs;
  compiler.resolvers.normal.fileSystem = memoryFs;
  compiler.resolvers.context.fileSystem = memoryFs;


  ['readFileSync', 'statSync'].forEach((fn) => {
    // Preserve the reference to original function
    const memoryMethod = memoryFs[fn];

    compiler.inputFileSystem[fn] = function bridgeMethod(...args) {
      const filePath = args[0];

      // Fallback to real FS if file is not in the memoryFS
      if (memoryFs.existsSync(filePath)) {
        return memoryMethod.call(memoryFs, ...args);
      }

      return fs[fn].call(fs, ...args);
    };
  });

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) reject(err);
      if (stats.hasErrors()) reject(new Error(stats.toJson().errors));

      resolve(stats);
    });
  });
};
import { toPlaceholder } from './utils';

module.exports = function placeholderLoader(content) {
  if (this.cacheable) {
    this.cacheable();
  }

  const callback = this.async();

  toPlaceholder(content).then((placeholder) => {
    callback(null, `module.exports = ${JSON.stringify(placeholder)}`);
  }).catch((err) => {
    callback(err);
  });
};

module.exports.raw = true;

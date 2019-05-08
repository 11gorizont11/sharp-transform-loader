import { toWebp } from './utils';

module.exports = function toFormatLoader(content) {
  if (this.cacheable) {
    this.cacheable();
  }

  const callback = this.async();

  toWebp(content).then((buffer) => {
    callback(null, buffer);
  }).catch((err) => {
    callback(err);
  });
};

module.exports.raw = true;

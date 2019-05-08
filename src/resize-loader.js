import loaderUtils from 'loader-utils';
import { resizeImage } from './utils';

module.exports = function resizeLoader(content) {
  if (this.cacheable) {
    this.cacheable();
  }


  const callback = this.async();

  const { size } = loaderUtils.parseQuery(this.query) || { size: '' };
  console.log("TCL: resizeLoader -> size", size)

  resizeImage(content, size).then((buffer) => {
    callback(null, buffer);
  }).catch((err) => {
    callback(err);
  });
};

module.exports.raw = true;

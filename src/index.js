import url from 'url';
import path from 'path';
import { parseQuery, getOptions } from 'loader-utils';
import validateOptions from 'schema-utils';
import schema from './options.json';

const ALLOWED_SIZES_TYPES = ['String', 'Undefined', 'Array'];

// helper functions
const getType = (item) => Object.prototype.toString.call(item).slice(8, -1);
const isOneOfType = (item) => (types) => types.includes(getType(item));
const isString = (item) => isOneOfType(item)(['String']);
const getUniqArray = (items) => Array.from(new Set(items));
const pipe = (...funcs) => (...args) => funcs.reduce((a, b) => a(b(...args)));
const findInObjects = (prop, ...objects) => {
  for (const obj of objects) {
    if (obj.hasOwnProperty(prop)) return obj[prop];
  }

  return undefined;
};

// building functions
function removeResourceQuery(resource) {
  return resource.split('?')[0];
}

function splitRemainingRequest(remainingRequest) {
  const split = remainingRequest.split('!');
  const rawResource = split.pop();
  const resource = removeResourceQuery(rawResource);
  return [split, resource];
}

function rebuildRemainingRequest(loaders, resource) {
  return `-!${[...loaders, resource].join('!')}`;
}

function buildResizeLoader(size) {
  return url.format({
    pathname: path.join(__dirname, './resize-loader'),
    query: { size },
  });
}

function createToWebpLoader(resource) {
  const loaderOptions = url.format({
    pathname: path.join(__dirname, './to-webp-loader'),
  });

  return `require('!!file-loader?name=[hash].webp!${url.format(loaderOptions)}!${resource}')`;
}

function createResizeRequest(size, existingLoaders, resource) {
  const loaders = [...existingLoaders, buildResizeLoader(size)]
  const remainingRequest = rebuildRemainingRequest(loaders, resource);
  return `require(${JSON.stringify(remainingRequest)})`;
}

function createPlaceholderRequest(resource) {
  const loaderOptions = {
    pathname: path.join(__dirname, './placeholder-loader'),
  };

  return `require('!!${url.format(loaderOptions)}!${resource}')`;
}

function buildSources(sizes, loaders, resource) {
  const sources = {};

  sizes.forEach((size) => {
    if (size !== null && !/\d+\w/.test(size)) {
      throw new TypeError(`sharp-transform-loader: Received size "${size}" does not match the format "\\d+w"`);
    }

    const actualSize = size;
    sources[actualSize] = createResizeRequest(actualSize, loaders, resource(size));
  });

  return sources;
}

function stringifySources(sources) {
  return `
  {
    ${
    Object.keys(sources).map((source) => `"${source}": ${sources[source]}`).join(',\n')
    }
  }
`;
}

function stringifySrcSet(sources) {
  return Object.keys(sources).map((size) => {
    if (size === 'default') {
      return `${sources[size]} `;
    }

    return `${sources[size]} + " ${size}"`;
  }).join('+","+');
}

function getSizes(rawSizes) {
  if (!isOneOfType(rawSizes)(ALLOWED_SIZES_TYPES)) {
    throw new TypeError(`sharp-transform-loader: "?sizes=${rawSizes}" is invalid - expected a query like "?sizes[]=<size>&sizes[]=..." or "?sizes=<size>+<size>+...".`);
  }
  const sizes = isString(rawSizes) ? rawSizes.split('+') : rawSizes;
  return getUniqArray(sizes);
}

/** Start Loader body */
export default function sharpTransformLoader(content) {
  return content;
}

sharpTransformLoader.pitch = function sharpTransformLoaderPitch(remainingRequest) {
  const loaderQuery = getOptions(this) || {};
  const resourceQuery = parseQuery(this.resourceQuery) || {};

  validateOptions(schema, loaderQuery, 'sharp-transform-loader');

  const placeholder = findInObjects('placeholder', resourceQuery, loaderQuery);
  const webp = findInObjects('webp', resourceQuery, loaderQuery);
  const sizes = pipe(getSizes, findInObjects)('sizes', resourceQuery, loaderQuery);

  // neither is requested, no need to run this loader.
  if (!placeholder && !sizes.length && !webp) {
    return undefined;
  }

  const [loaders, resource] = splitRemainingRequest(remainingRequest);

  const transformResource = ((inputSource, size) => `${inputSource}?size = ${size} `);

  const sources = buildSources(sizes, loaders, ((size) => transformResource(resource, size)));

  const srcSet = Object.keys(sources).length ? `srcSet: ${stringifySrcSet(sources)}, ` : '';


  const webpFormat = webp ? `webp: ${createToWebpLoader(resource)}, ` : '';

  const placeholderScript = placeholder
    ? `placeholder: ${createPlaceholderRequest(resource)}, `
    : '';

  return `module.exports = {
    sources: ${stringifySources(sources)},
    ${srcSet}
    ${placeholderScript}
    ${webpFormat}
};
`;
};

module.exports.pitch = sharpTransformLoader.pitch;

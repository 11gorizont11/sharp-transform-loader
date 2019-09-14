<div align="center">
  <a href="https://github.com/webpack/webpack">
    <img width="200" height="200" src="https://webpack.js.org/assets/icon-square-big.svg">
  </a>
</div>

# Sharp-transform-loader

### Used [sharp](https://github.com/lovell/sharp) under the hood

A `webpack` loader for generating images different sizes from the source image. Optionally loader supports webp format and generates placeholder for this image.

Motivation: automatically resize source image and return requested dimensions in two format initial and webp as srcset string. Optionally generate blurred placeholder for the image.

## Getting started

To begin, you'll need to install `sharp-transform-loader`:

```bash
  npm i -D sharp-transform-loader
```

## Usage

Basically is two configuration for the loader:

- loader itself
- image that you want to be processed by loader

for all images general loader config:

```javascript
const webpackConfig = {
  // Only showing relevant parts.
  module: {
    rules: [
      {
        // match image files
        test: /\.(jpe?g|png|svg|gif)$/,
        use: [
          {
            loader: 'sharp-transform-loader',
            options: {
              sizes: ['400w', '2x'],
              placeholder: true
            }
          },
          {
            loader: 'file-loader'
          }
          // chain of other loader
        ]
      }
    ]
  }

  // ...
};
```

direct for the image that should be processed:

```javascript
import image './image.jpeg?sizes=400w+400w.webp+800w+800w.webp&placeholder'
```

or in more canonical way:

```javascript
import image './image.jpeg?sizes[]=400w&sizes[]=800w&placeholder'
```

This allows us to separate the configuration of the loader, and the specification of the image sizes.

## `sharp-transform-loader` options

### `image`

`image` default field consist image in provided format.

### `sizes`

`sizes` this is the main feature of the `sharp-transform-loader`, use this option to specify the different image sizes you wish to import.
You can either specify the different sizes as a standard array (`?sizes[]=100w&sizes[]=200w`) or using the less verbose, syntax (`?sizes=100w+200w`)

sizes values must follow format `<number>w`, `<multiplier>x`, also size can be processed into webp format `<number>w.webp`.

### `placeholder`

`placeholder` will generate tiny inline base64 20px width blurred image and return object with placeholder url and aspectRatio.

### 'webp'

`webp` will transform source to webp format and return path to `xxxx.webp` image.

## Results of transforming image

`sources : object` - all requested sizes for the image

```javascript
import image from './image.jpeg?sizes=200w+200w.webp+800w+800w.webp';
/*
  image.sources => {
    '200w': 'xxxx.jpeg',
    '200w.webp': 'xxxx.webp',
    '800w': 'xxxx.jpeg',
    '800w.webp': 'xxxx.webp',
  }
  */
```

`placeholder : object` - object with keys:

- `url`: base64 string blurred small image.
- `aspectRatio`: number the width to height ratio of the image

```javascript
import image from './image.jpeg?sizes=200w+800w&placeholder';
/*
  image.placeholder => {
    'url': 'data:image/jpeg;base64,xxxxxxxxxxx...',
    'aspectRatio': 1.4992435703479576,
  }
  */
```

`srcSet: string` - srcset string like value for `<img srcset="..."/>`.

```javascript
import image from './image.jpeg?sizes=200w+800w';
// image.srcSet => 'xxxx.jpeg 200w,xxxx.jpeg 800w'
```

`srcSetWebp` - srcset with webp format images

```javascript
import image from './image.jpeg?sizes=200w.webp+800w.webp';
// image.srcSetWebp => 'xxxx.webp 200w,xxxx.webp 800w'
```

`webp` - path to webp format image

```javascript
import image from './image.jpeg?webp';
// image.webp => 'xxxx.webp'
```

## Inspired mostly by [src-loader](https://github.com/timse/srcset-loader), [file loader](https://github.com/webpack-contrib/file-loader).

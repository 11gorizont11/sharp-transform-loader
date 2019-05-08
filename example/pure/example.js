import whale from './whale.jpeg?sizes=400w+400w.webp+800w+800w.webp+1x+2x&placeholder&webp';
// alternative syntax
import paris from './paris.jpeg?sizes[]=400w&sizes[]=800w&placeholder';

console.log('IMAGE', whale);

console.log('TCL: paris', paris);

[whale, paris].forEach((src) => {
  const image = new Image();
  image.srcset = src.srcSet;
  image.src = src.sources['800w'];
  image.sizes = '(min-width: 1000px) 800px, 400px';
  image.style = 'width: 100%';
  document.body.appendChild(image);
});


function addImage(src, srcSet) {
  const image = new Image();
  image.src = src;
  image.style.cssText = 'background:red;';
  image.style = 'width: 100%';

  if (srcSet) { image.srcset = srcSet; }
  document.body.appendChild(image);
}

// addImage(whale.placeholder.url);
Object.keys(whale.sources).forEach((srcKey) => addImage(whale.sources[srcKey]));
// addImage(whale.webp);

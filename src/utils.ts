export const NS_SVG = 'http://www.w3.org/2000/svg';
export const NS_XHTML = 'http://www.w3.org/1999/xhtml';

export function getUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.addEventListener('loadend', () =>
      resolve(reader.result as string));
    reader.addEventListener('error', () =>
      reject(new Error('Unable to get URL from blob.')));
  });
}

export function getImageDimensions(src: string) {
  return new Promise<{ width: number; height: number; }>((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.addEventListener('load', () => resolve({
      width: img.naturalWidth,
      height: img.naturalHeight,
    }));
    img.addEventListener('error', () =>
      reject(new Error('Could not load image from src.')));
  });
}

export function clearChildren(node: Node) {
  while(node.hasChildNodes())
    node.removeChild(node.firstChild!);
}

export function formatTime(time: number) {
  const absTime = Math.abs(time);
  let result = `${
    Math.floor(absTime / 6e4 % 60).toString(10).padStart(2, '0')
  }:${
    Math.floor(absTime / 1e3 % 60).toString(10).padStart(2, '0')
  }`;
  if(time < 36e5) return (time < 0 ? '-' : '') + result;
  result = `${
    Math.floor(absTime / 36e5 % 24).toString(10).padStart(2, '0')
  }:${result}`;
  if(time < 864e5) return (time < 0 ? '-' : '') + result;
  return `${
    Math.floor(time / 864e5).toString(10).padStart(2, '0')
  }d ${result}`;
}

export function getSeed(seed: any): number {
  switch(typeof seed) {
    case 'undefined':
    case 'object':
      if(seed == null)
        seed = '';
    default:
      seed = seed.toString();
    case 'string': {
      let hash = 0;
      for(let i = 0; i < seed.length; i++)
        hash = Math.imul(31, hash) + seed.charCodeAt(i) | 0;
      seed = hash;
    }
  }
  return seed;
}

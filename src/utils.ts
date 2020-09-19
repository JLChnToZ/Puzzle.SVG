export const NS_SVG = 'http://www.w3.org/2000/svg';
export const NS_XHTML = 'http://www.w3.org/1999/xhtml';
export const CDATA_END = String.fromCharCode(0x5D, 0x5D, 0x3E);

export const spaceMatcher = /^\s*$/;
export const trimmableMatcher = /^\s+|\s+$/g;
export const styleSpaceMatcher = /(?<=^|\W)\s+|\s+(?![\w\.\[\:\*#])/g;

export function round(n: number, c = 0) {
  c = 10 ** c;
  return Math.round((n + Number.EPSILON) * c) / c;
}

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
  node.textContent = '';
  while(node.hasChildNodes())
    node.removeChild(node.firstChild!);
}

export function formatNumber(n: number, digits: number) {
  return n.toString(10).padStart(digits, '0');
}

export function formatTime(time: number) {
  const absTime = Math.abs(time);
  let result = `${
    formatNumber(Math.floor(absTime / 6e4 % 60), 2)
  }:${
    formatNumber(Math.floor(absTime / 1e3 % 60), 2)
  }`;
  if(time < 36e5) return (time < 0 ? '-' : '') + result;
  result = `${
    formatNumber(Math.floor(absTime / 36e5 % 24), 2)
  }:${result}`;
  if(time < 864e5) return (time < 0 ? '-' : '') + result;
  return `${
    formatNumber(Math.floor(time / 864e5), 2)
  }d ${result}`;
}

export function formatDateTime(date: Date = new Date()) {
  const yr = date.getFullYear();
  const mo = date.getMonth();
  const dy = date.getDate();
  const hr = date.getHours();
  const mi = date.getMinutes();
  const se = date.getSeconds();
  return `${
    formatNumber(dy, 2)
  }/${
    formatNumber(mo + 1, 2)
  }/${
    formatNumber(yr, 4)
  } ${
    formatNumber(hr % 12 || 12, 2)
  }:${
    formatNumber(mi, 2)
  }:${
    formatNumber(se, 2)
  } ${hr >= 12 ? 'PM' : 'AM'}`;
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

export function transferChildren(src: Element, dest: Element) {
  if(!src.childElementCount) return;
  const frag = src.ownerDocument.createDocumentFragment();
  Array.from(src.childNodes).forEach(frag.appendChild, frag);
  dest.appendChild(frag);
}

export function interceptEvent(e: Event) {
  if(e.cancelable && !e.defaultPrevented)
    e.preventDefault();
  e.stopPropagation();
}

export function toPromise<S, T>(thisArg: S, src: (this: S, callback: (result: T) => void) => void): Promise<T>;
export function toPromise(thisArg: any, src: (...args: any[]) => void, ...args: any[]): Promise<any>;
export function toPromise(thisArg: any, src: (...args: any[]) => void, ...args: any[]) {
  return new Promise(resolve => src.call(thisArg, ...args, resolve));
}

export function findStyle(selector: string, root: (ParentNode & Node) = window.document) {
  const styleElements = root.querySelectorAll<Element & LinkStyle>('style');
  let lastSheet: CSSStyleSheet | undefined;
  for(let i = styleElements.length - 1; i >= 0; i--) {
    const { sheet } = styleElements[i];
    if(!sheet) continue;
    if(!lastSheet) lastSheet = sheet;
    for(let j = sheet.rules.length - 1; j >= 0; j--) {
      const rule = sheet.rules[j];
      if(rule.type !== CSSRule.STYLE_RULE)
        continue;
      for(const targetSelector of (rule as CSSStyleRule).selectorText.split(','))
        if(targetSelector.trim() === selector)
          return rule as CSSStyleRule;
    }
  }
  if(!lastSheet) {
    const document = root.ownerDocument ?? root as Document;
    lastSheet = (
      (document.documentElement instanceof SVGElement) ?
      (document.appendChild(document.createElementNS(NS_SVG, 'style')) as SVGStyleElement & LinkStyle) :
      document.head.appendChild(document.createElement('style'))
    ).sheet!;
  }
  const index = lastSheet.insertRule(`${selector} {}`, lastSheet.rules.length - 1);
  return lastSheet.cssRules[index] as CSSStyleRule;
}

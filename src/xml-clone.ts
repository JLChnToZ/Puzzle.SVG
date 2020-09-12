import { CDATA_END, NS_SVG, NS_XHTML, styleSpaceMatcher, spaceMatcher, trimmableMatcher } from './utils';

export async function downloadDocument(src: Element, name: string, treatments?: (root: Element, document: Document) => (void | Promise<void>)) {
  const document = src.ownerDocument;
  const root = document.implementation.createDocument(NS_SVG, 'svg', null);
  const clone = root.importNode(src, true);
  root.replaceChild(clone, root.firstChild!);
  await Promise.all(Array.prototype.map.call(clone.querySelectorAll('script'), resolveScript));
  await treatments?.(clone, root);
  clone.querySelectorAll('style').forEach(minifyStyle);
  removeWhiteSpaces(root);
  const blob = new Blob([new XMLSerializer().serializeToString(root)], { type: 'image/svg+xml' });
  const element = document.createElementNS(NS_XHTML, 'a') as HTMLAnchorElement;
  element.href = URL.createObjectURL(blob);
  element.download = name;
  element.click();
  URL.revokeObjectURL(element.href);
}

async function resolveScript(script: Element) {
  if(script instanceof HTMLScriptElement) {
    const { src } = script;
    if(!src) return;
    script.removeAttribute('src');
    script.textContent = await (await fetch(src)).text();
  } else if(script instanceof SVGScriptElement) {
    const href = script.href.baseVal;
    if(!href) return;
    script.removeAttribute('href');
    script.appendChild(script.ownerDocument.createCDATASection(await (await fetch(href)).text()));
  }
}

function removeWhiteSpaces(root: Node) {
  const document = root.ownerDocument ?? root as Document;
  const treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const removals: Text[] = [];
  const checkSpaces: Text[] = [];
  let current: Node | null;
  while(current = treeWalker.nextNode()) {
    if(!(current instanceof Text) || (current instanceof CDATASection))
      continue;
    if(spaceMatcher.test(current.wholeText))
      removals.push(current);
    else
      checkSpaces.push(current);
  }
  for(const whiteSpace of removals)
    whiteSpace.remove();
  for(const text of checkSpaces) {
    const original = text.wholeText;
    const changed = original.replaceAll(trimmableMatcher, ' ');
    if(original !== changed) text.replaceWith(text.ownerDocument.createTextNode(changed));
  }
  return root;
}

function minifyStyle(style: Element) {
  const textContent = style.textContent?.replaceAll(styleSpaceMatcher, '');
  if(textContent == null) return;
  try {
    const child = style.firstChild;
    if((child instanceof CDATASection) && !textContent.includes(CDATA_END)) {
      const cdata = style.ownerDocument.createCDATASection(textContent);
      style.textContent = '';
      style.appendChild(cdata);
    } else
      style.textContent = textContent;
  } catch {
    style.textContent = textContent;
  }
}

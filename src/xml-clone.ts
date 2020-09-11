import { NS_SVG, NS_XHTML } from './utils';

export async function downloadDocument(src: Element, name: string, treatments?: (root: Element, document: Document) => (void | Promise<void>)) {
  const document = src.ownerDocument;
  const root = document.implementation.createDocument(NS_SVG, 'svg', null);
  const clone = root.importNode(src, true);
  root.replaceChild(clone, root.firstChild!);
  await Promise.all(Array.prototype.map.call(clone.querySelectorAll('script'), resolveScript));
  await treatments?.(clone, root);
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
  const matcher = /^\s*$/;
  const removals: Text[] = [];
  let current: Node | null;
  while(current = treeWalker.nextNode())
    if((current instanceof Text) && matcher.test(current.wholeText))
      removals.push(current);
  for(const whiteSpace of removals)
    whiteSpace.remove();
  return root;
}

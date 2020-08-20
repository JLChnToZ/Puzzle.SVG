
export async function downloadDocument(src: Element, name: string, type?: string) {
  const root = new XMLDocument();
  const clone = root.importNode(src, true);
  await Promise.all(Array.from(clone.querySelectorAll('script')).map(resolveScript));
  const str = new Blob([new XMLSerializer().serializeToString(root)], { type });
  const element = src.ownerDocument.createElement('a');
  element.href = URL.createObjectURL(new Blob([str]));
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
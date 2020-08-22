export interface DraggingState {
  target: SVGGraphicsElement;
  element: SVGGraphicsElement;
  identifier?: number;
  transform: SVGTransform;
  offsetX: number;
  offsetY: number;
}

export function registerDraggable(
  root: GlobalEventHandlers = document,
  onDrag?: (element: SVGElement) => void,
  onDrop?: (state: DraggingState) => void,
  draggableClass = '.draggable', handlerClass = '.handler',
) {
  const draggingElements = new Map<SVGElement, DraggingState>();
  const states = new Map<number | undefined, DraggingState>();

  root.addEventListener('mousedown', onMouseStartDrag, true);
  root.addEventListener('mousemove', onMouseDragging);
  root.addEventListener('mouseup', onMouseEndDrag);
  root.addEventListener('mouseleave', onMouseEndDrag);
  root.addEventListener('touchstart', onTouchStartDrag, { capture: true, passive: false });
  root.addEventListener('touchmove', onTouchDragging, { passive: false });
  root.addEventListener('touchend', onTouchEndDrag, { passive: false });
  root.addEventListener('touchcancel', onTouchEndDrag, { passive: false });

  function getState(e: MouseEvent | Touch) {
    const state = states.get((e as Touch).identifier);
    return state && (state.identifier == null) === (e instanceof MouseEvent) ? state : null;
  }

  function onMouseStartDrag(e: MouseEvent) {
    if(e.button !== 0) return;
    const target = (e.target as Element)?.closest?.(`${draggableClass} ${handlerClass}, ${draggableClass}${handlerClass}`);
    if(!(target instanceof SVGGraphicsElement)) return;
    handleStartDrag(target, e, undefined, e.ctrlKey);
    interceptEvent(e);
  }

  function onTouchStartDrag(e: TouchEvent) {
    const target = (e.target as Element)?.closest?.(`${draggableClass} ${handlerClass}, ${draggableClass}${handlerClass}`);
    if(!(target instanceof SVGGraphicsElement)) return;
    const root = target.ownerSVGElement!;
    let pointer: Touch | undefined;
    let identifier: number | undefined;
    const { targetTouches } = e as TouchEvent;
    let srcElement: Element | null | undefined = target;
    const ctm = (target.parentNode as SVGGraphicsElement)?.getScreenCTM?.()?.inverse();
    while(srcElement) {
      if(srcElement instanceof SVGUseElement) {
        srcElement = srcElement.instanceRoot?.correspondingElement;
        continue;
      } if(srcElement instanceof SVGGeometryElement) {
        for(let i = 0; i < targetTouches.length; i++) {
          const touch = targetTouches[i];
          const lp = getLocalPoint(root, touch, ctm);
          if(srcElement.isPointInFill(lp) || srcElement.isPointInStroke(lp)) {
            identifier = touch.identifier;
            pointer = touch;
            break;
          }
        }
      } else if(srcElement instanceof SVGGraphicsElement) {
        const bbox = target.getBBox();
        for(let i = 0; i < targetTouches.length; i++) {
          const touch = targetTouches[i];
          const lp = getLocalPoint(root, touch, ctm);
          if(bbox.x <= lp.x && bbox.x + bbox.width > lp.x &&
            bbox.y <= lp.y && bbox.y + bbox.height > lp.y) {
            identifier = touch.identifier;
            pointer = touch;
            break;
          }
        }
      }
      break;
    }
    if(!pointer) return;
    handleStartDrag(target, pointer, identifier);
    interceptEvent(e);
  }

  function handleStartDrag(target: SVGGraphicsElement, pointer: MouseEvent | Touch, identifier: number | undefined, forceBringToFront?: boolean) {
    const root = target.ownerSVGElement!;
    const element = target.matches(draggableClass) ? target : target?.closest<SVGGraphicsElement>(draggableClass) as SVGGraphicsElement;
    if(draggingElements.has(element)) return;
    const transforms = element.transform.baseVal;
    if(!transforms.numberOfItems || transforms.getItem(0).type !== SVGTransform.SVG_TRANSFORM_TRANSLATE) {
      const transform = root.createSVGTransform();
      transform.setTranslate(0, 0);
      transforms.insertItemBefore(transform, 0);
    }
    const transform = transforms.getItem(0);
    const offset = getLocalPoint(
      root, pointer, element.parentNode! as SVGGraphicsElement,
    ).matrixTransform(transform.matrix.inverse());
    const state: DraggingState = {
      element, target, identifier, transform,
      offsetX: offset.x,
      offsetY: offset.y,
    };
    draggingElements.set(element, state);
    states.set(identifier, state);
    if(element.nextSibling && (target.childElementCount < 10 || forceBringToFront))
      element.parentNode?.appendChild(element);
    onDrag?.(element);
  }

  function onMouseDragging(e: MouseEvent) {
    if(states.size && e.button === 0 && handleDrag(e))
      interceptEvent(e); 
  }

  function onTouchDragging(e: TouchEvent) {
    if(states.size &&
      e.changedTouches.length &&
      Array.prototype.map.call(e.changedTouches, handleDrag).includes(true))
      interceptEvent(e);
  }
  
  function handleDrag(e: MouseEvent | Touch) {
    const state = getState(e);
    if(!state) return false;
    const coord = getLocalPoint(
      state.element.ownerSVGElement!, e,
      state.element.parentNode! as SVGGraphicsElement,
    );
    coord.x -= state.offsetX;
    coord.y -= state.offsetY;
    state.transform.setTranslate(coord.x, coord.y);
    return true;
  }

  function onMouseEndDrag(e: MouseEvent) {
    if(states.size && handleEndDrag(e))
      interceptEvent(e);
  }

  function onTouchEndDrag(e: TouchEvent) {
    if(states.size &&
      e.changedTouches.length &&
      Array.prototype.map.call(e.changedTouches, handleEndDrag).includes(true))
      interceptEvent(e);
  }
  
  function handleEndDrag(e: MouseEvent | Touch) {
    const state = getState(e);
    if(!state) return false;
    draggingElements.delete(state.element);
    states.delete(state.identifier);
    onDrop?.(state);
    return true;
  }

  return {
    isDragging(element: SVGElement) {
      return draggingElements.has(element);
    },
  };
}

function getLocalPoint(
  root: SVGSVGElement,
  pointer: MouseEvent | Touch,
  base?: DOMMatrix | SVGGraphicsElement | null,
) {
  const p = root.createSVGPoint();
  p.x = pointer.clientX;
  p.y = pointer.clientY;
  return base != null ? p.matrixTransform(
    base instanceof SVGGraphicsElement ?
    base.getScreenCTM()!.inverse() :
    base,
  ) : p;
}

function interceptEvent(e: Event) {
  if(e.cancelable && !e.defaultPrevented)
    e.preventDefault();
  e.stopPropagation();
}
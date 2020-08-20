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

  root.addEventListener('mousedown', onStartDrag, true);
  root.addEventListener('mousemove', onDragging);
  root.addEventListener('mouseup', onEndDrag);
  root.addEventListener('mouseleave', onEndDrag);
  root.addEventListener('touchstart', onStartDrag, true);
  root.addEventListener('touchmove', onDragging);
  root.addEventListener('touchend', onEndDrag);
  root.addEventListener('touchcancel', onEndDrag);

  function getState(e: MouseEvent | Touch) {
    const state = states.get((e as Touch).identifier);
    return state && (state.identifier == null) === (e instanceof MouseEvent) ? state : null;
  }

  function onStartDrag(e: MouseEvent | TouchEvent) {
    let target = (e.target as Element)?.closest?.(`${draggableClass}>${handlerClass}, ${draggableClass}${handlerClass}`);
    if(!(target instanceof SVGGraphicsElement)) return;
    const root = target.ownerSVGElement!;
    let pointer: Touch | MouseEvent | undefined;
    let identifier: number | undefined;
    const { targetTouches } = e as TouchEvent;
    if(targetTouches) {
      const ctm = target.getScreenCTM()!.inverse();
      if(target instanceof SVGGeometryElement)
        for(let i = 0; i < targetTouches.length; i++) {
          const touch = targetTouches[i];
          const lp = getLocalPoint(root, touch, ctm);
          if(target.isPointInFill(lp) || target.isPointInStroke(lp)) {
            identifier = touch.identifier;
            pointer = touch;
            break;
          }
        }
      else {
        const bbox = target.getBBox();
        for(let i = 0; i < targetTouches.length; i++) {
          const touch = targetTouches[i];
          const lp = getLocalPoint(root, touch, ctm);
          if(bbox.left <= lp.x && bbox.right > lp.x &&
            bbox.top <= lp.y && bbox.bottom > lp.y) {
            identifier = touch.identifier;
            pointer = touch;
            break;
          }
        }
      }
    } else {
      if((e as MouseEvent).button !== 0)
        return;
      pointer = e as MouseEvent;
    }
    if(!pointer) return;
    const element = target.matches('.draggable') ? target : target.parentNode! as SVGGraphicsElement;
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
    draggingElements.set(target, state);
    states.set(identifier, state);
    element.parentNode?.appendChild(element);
    interceptEvent(e);
    onDrag?.(element);
  }
  
  function onDragging(e: MouseEvent | TouchEvent) {
    const { changedTouches } = e as TouchEvent;
    if(changedTouches ?
      Array.prototype.map.call(changedTouches, handleDrag).includes(true) :
      handleDrag(e as MouseEvent))
      interceptEvent(e);
  }
  
  function handleDrag(e: MouseEvent | Touch) {
    const state = getState(e);
    if(!state) return false;
    const coord = getLocalPoint(
      state.element.ownerSVGElement!, e,
      state.element.parentNode! as SVGGraphicsElement,
    );
    if(!coord) return false;
    state.transform.setTranslate(
      coord.x - state.offsetX,
      coord.y - state.offsetY,
    );
    return true;
  }
  
  function onEndDrag(e: MouseEvent | TouchEvent) {
    const { changedTouches } = e as TouchEvent;
    if(changedTouches ?
      Array.prototype.map.call(changedTouches, handleEndDrag).includes(true) :
      handleEndDrag(e as MouseEvent))
      interceptEvent(e);
  }
  
  function handleEndDrag(e: MouseEvent | Touch) {
    const state = getState(e);
    if(!state) return false;
    draggingElements.delete(state.element);
    states.delete((e as Touch).identifier);
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
  base: DOMMatrix | SVGGraphicsElement,
) {
  const p = root.createSVGPoint();
  p.x = pointer.clientX;
  p.y = pointer.clientY;
  return p.matrixTransform(
    base instanceof SVGGraphicsElement ?
    base.getScreenCTM()!.inverse() :
    base,
  );
}

function interceptEvent(e: Event) {
  if(e.cancelable && !e.defaultPrevented)
    e.preventDefault();
  e.stopPropagation();
}
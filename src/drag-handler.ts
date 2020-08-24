import { interceptEvent } from './utils';

export interface DraggingState {
  target: SVGGraphicsElement;
  element: SVGGraphicsElement;
  identifier?: number;
  transform: SVGTransform;
  offsetX: number;
  offsetY: number;
  bringToFrontAfter?: boolean;
}

interface Pointer {
  clientX: number;
  clientY: number;
  identifier?: number;
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

  function getState(e: Pointer) {
    const state = states.get(e.identifier);
    return state && (state.identifier == null) === (e instanceof MouseEvent) ? state : null;
  }

  function getHandlerTarget(e: Event) {
    let { target } = e;
    if(!(target instanceof Element)) return;
    target = target.closest(`${draggableClass} ${handlerClass}, ${draggableClass}${handlerClass}`);
    if(target instanceof SVGGraphicsElement)
      return target;
  }

  function onMouseStartDrag(e: MouseEvent) {
    if(e.button !== 0) return;
    const target = getHandlerTarget(e);
    if(!target) return;
    handleStartDrag(target, e, e.ctrlKey || e.shiftKey);
    interceptEvent(e);
  }

  function onTouchStartDrag(e: TouchEvent) {
    const pointer = e.targetTouches.item(0);
    if(!pointer) return;
    const target = getHandlerTarget(e);
    if(!target) return;
    handleStartDrag(target, pointer, e.ctrlKey || e.shiftKey);
    interceptEvent(e);
  }

  function handleStartDrag(target: SVGGraphicsElement, pointer: Pointer, forceBringToFront?: boolean) {
    const root = target.ownerSVGElement!;
    const element = target.matches(draggableClass) ? target : target.closest<SVGGraphicsElement>(draggableClass) as SVGGraphicsElement;
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
    const { identifier } = pointer;
    const state: DraggingState = {
      element, target, identifier, transform,
      offsetX: offset.x,
      offsetY: offset.y,
    };
    draggingElements.set(element, state);
    states.set(identifier, state);
    if(element.nextSibling && forceBringToFront)
      element.parentNode?.appendChild(element);
    else
      state.bringToFrontAfter = true;
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
  
  function handleDrag(e: Pointer) {
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
  
  function handleEndDrag(e: Pointer) {
    const state = getState(e);
    if(!state) return false;
    draggingElements.delete(state.element);
    states.delete(state.identifier);
    if(state.bringToFrontAfter)
      state.element.parentNode?.appendChild(state.element);
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
  pointer: Pointer,
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
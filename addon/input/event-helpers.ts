import { isElement } from '@lblod/ember-rdfa-editor/utils/dom-helpers';

export function isKeyUpEvent(event: Event): event is KeyboardEvent {
  return event.type === 'keyup';
}

export function isKeyDownEvent(event: Event): event is KeyboardEvent {
  return event.type === 'keydown';
}

export function isInputEvent(event: Event): event is InputEvent {
  return event.type === 'input';
}

export function isBeforeInputEvent(event: Event): event is InputEvent {
  return event.type === 'beforeinput';
}

export function isInInlineComponent(event: Event): boolean {
  let node: Node | null = event.target as Node;
  while (node) {
    if (isElement(node)) {
      if (node.classList.contains('inline-component')) {
        return true;
      }
    }
    node = node.parentNode;
  }
  return false;
}

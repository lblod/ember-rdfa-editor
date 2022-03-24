import {
  isTextOrElement,
  TextOrElement,
} from '@lblod/ember-rdfa-editor/model/util/types';
import {
  isElement,
  isTextNode,
} from '@lblod/ember-rdfa-editor/utils/dom-helpers';

export default interface NodeView {
  viewRoot: Node;
  contentRoot: Node;
}

export interface ElementView extends NodeView {
  viewRoot: HTMLElement;
  contentRoot: HTMLElement;
}

export function isElementView(view: NodeView): view is ElementView {
  return isElement(view.viewRoot) && isElement(view.contentRoot);
}

export interface TextView extends NodeView {
  viewRoot: TextOrElement;
  contentRoot: Text;
}

export function isTextView(view: NodeView): view is TextView {
  return isTextOrElement(view.viewRoot) && isTextNode(view.contentRoot);
}

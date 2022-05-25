import State from '@lblod/ember-rdfa-editor/core/state';
import SelectionWriter from '@lblod/ember-rdfa-editor/model/writers/selection-writer';
import ModelNode from '../model/model-node';
import ModelPosition from '../model/model-position';
import HtmlWriter from '../model/writers/html-writer';
import { domPosToModelPos, modelPosToDomPos } from '../utils/dom-helpers';
import { PositionError } from '../utils/errors';
import { createLogger, Logger } from '../utils/logging-utils';

export interface View {
  domRoot: HTMLElement;

  modelToView(state: State, modelNode: ModelNode): Node | null;

  viewToModel(state: State, domNode: Node): ModelNode;

  update(state: State): void;
}

export class EditorView implements View {
  domRoot: HTMLElement;
  logger: Logger;

  constructor(domRoot: HTMLElement) {
    this.logger = createLogger('editorView');
    this.domRoot = domRoot;
  }

  modelToView(state: State, modelNode: ModelNode): Node | null {
    return modelToView(state, this.domRoot, modelNode);
  }
  viewToModel(state: State, domNode: Node): ModelNode {
    return viewToModel(state, this.domRoot, domNode);
  }

  update(state: State): void {
    this.logger('Updating view with state:', state);
    const writer = new HtmlWriter();
    writer.write(state, this);
    const selectionWriter = new SelectionWriter();
    selectionWriter.write(state, this.domRoot, state.selection);
  }
}
export function modelToView(
  state: State,
  viewRoot: HTMLElement,
  modelNode: ModelNode
): Node {
  const modelPosition = ModelPosition.fromBeforeNode(modelNode);
  const domPosition = modelPosToDomPos(state, viewRoot, modelPosition);
  const domNode = domPosition.container;
  return domNode;
}

export function viewToModel(
  state: State,
  viewRoot: HTMLElement,
  domNode: Node
): ModelNode {
  const position = domPosToModelPos(state, viewRoot, domNode, 0);
  const node = position.nodeAfter();
  if (!node) {
    throw new PositionError('no node found after position');
  }
  return node;
}

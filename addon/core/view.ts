import State from '@lblod/ember-rdfa-editor/core/state';
import SelectionWriter from '@lblod/ember-rdfa-editor/model/writers/selection-writer';
import ModelNode from '../model/model-node';
import ModelPosition from '../model/model-position';
import { Difference } from '../model/util/tree-differ';
import HtmlWriter from '../model/writers/html-writer';
import { domPosToModelPos, modelPosToDomPos } from '../utils/dom-helpers';
import { PositionError } from '../utils/errors';
import { createLogger, Logger } from '../utils/logging-utils';

/**
 * This interface controls the interaction with the html DOM
 * It doesn't hold state of its own (well, or very little), but simply manages
 * updating the representation of any state that it gets on the dom.
 * */
export interface View {
  /**
   * The html element that the editor will render in
   * */
  domRoot: Element;

  /**
   * Get the domNode that corresponds to the given modelNode
   * State is needed because active configuration may influence the result
   * */
  modelToView(state: State, modelNode: ModelNode): Node | null;

  /**
   * Get the modelnode that corresponds tot the given domNode
   * State is needed because active configuration may influence the result
   * */
  viewToModel(state: State, domNode: Node): ModelNode;

  /**
   * Update the DOM to represent the given state
   * */
  update(state: State, differences: Difference[]): void;
}

/**
 * Default implementation of the view interface
 * */
export class EditorView implements View {
  domRoot: Element;
  logger: Logger;

  constructor(domRoot: Element) {
    this.logger = createLogger('editorView');
    this.domRoot = domRoot;
  }

  modelToView(state: State, modelNode: ModelNode): Node | null {
    return modelToView(state, this.domRoot, modelNode);
  }
  viewToModel(state: State, domNode: Node): ModelNode {
    return viewToModel(state, this.domRoot, domNode);
  }

  update(state: State, differences: Difference[]): void {
    this.logger('Updating view with state:', state);
    const writer = new HtmlWriter();
    differences.forEach((difference) => {
      writer.write2(
        state,
        this,
        difference.node,
        difference.changes || new Set()
      );
    });
    // state.inlineComponentsRegistry.clearComponentInstances();
    const selectionWriter = new SelectionWriter();
    selectionWriter.write(state, this.domRoot, state.selection);
  }
}
export function modelToView(
  state: State,
  viewRoot: Element,
  modelNode: ModelNode
): Node {
  const modelPosition = ModelPosition.fromBeforeNode(modelNode);
  const domPosition = modelPosToDomPos(state, viewRoot, modelPosition);
  const domNode = domPosition.container;
  return domNode;
}

export function viewToModel(
  state: State,
  viewRoot: Element,
  domNode: Node
): ModelNode {
  const position = domPosToModelPos(state, viewRoot, domNode, 0);
  const node = position.nodeAfter();
  if (!node) {
    throw new PositionError('no node found after position');
  }
  return node;
}

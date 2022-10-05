import ConfigStep from '@lblod/ember-rdfa-editor/core/state/steps/config-step';
import {
  isConfigStep,
  isSelectionStep,
} from '@lblod/ember-rdfa-editor/core/state/steps/step';
import Transaction from '@lblod/ember-rdfa-editor/core/state/transaction';
import Controller from '@lblod/ember-rdfa-editor/core/controllers/controller';
import ModelElement from '@lblod/ember-rdfa-editor/core/model/nodes/model-element';
import ModelNode from '@lblod/ember-rdfa-editor/core/model/nodes/model-node';
import { isElement } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import { EditorPlugin } from '@lblod/ember-rdfa-editor/core/model/editor-plugin';

const PATH_MARKER = 'data-editor-position-level';
const RDFA_PATH_MARKER = 'data-editor-rdfa-position-level';
const SHOW_RDFA_CLASS = 'show-rdfa-path';

export default class ShowActiveRdfaPlugin implements EditorPlugin {
  private activeElement: ModelElement | null = null;
  controller!: Controller;

  get name() {
    return 'show-active-rdfa';
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async initialize(_transaction: Transaction, controller: Controller) {
    this.controller = controller;
    controller.addTransactionDispatchListener(this.onTransactionDispatch);
  }

  onTransactionDispatch = (transaction: Transaction) => {
    const configSteps: ConfigStep[] = transaction.steps.filter(
      (step) => isConfigStep(step) && step.key === 'showRdfaBlocks'
    ) as ConfigStep[];
    if (configSteps.length) {
      const lastStep = configSteps[configSteps.length - 1];
      const rootNode = this.controller.view.domRoot;
      if (lastStep.value) {
        rootNode.classList.add(SHOW_RDFA_CLASS);
      } else {
        rootNode.classList.remove(SHOW_RDFA_CLASS);
      }
    }
    if (transaction.steps.some(isSelectionStep)) {
      this.updateAttributes();
    }
  };

  updateAttributes() {
    removePathAttributes();
    const ancestryPath =
      this.controller.selection.lastRange?.findCommonAncestorsWhere(
        ModelNode.isModelElement
      );
    if (ancestryPath) {
      let level = 0;
      let rdfaLevel = 0;

      for (const element of ancestryPath) {
        const domNode = this.controller.view.modelToView(
          this.controller.currentState,
          element
        );

        if (domNode && isElement(domNode)) {
          if (!element.getRdfaAttributes().isEmpty) {
            domNode.setAttribute(RDFA_PATH_MARKER, rdfaLevel.toString());
            rdfaLevel += 1;
          }
          domNode.setAttribute(PATH_MARKER, level.toString());
          level += 1;
        }
      }
    }
  }
}

function removePathAttributes() {
  // clean old marks
  for (const oldNode of document.querySelectorAll(`[${PATH_MARKER}]`)) {
    oldNode.removeAttribute(PATH_MARKER);
  }
  // clean old RDFa marks
  for (const oldNode of document.querySelectorAll(`[${RDFA_PATH_MARKER}]`)) {
    oldNode.removeAttribute(RDFA_PATH_MARKER);
  }
}

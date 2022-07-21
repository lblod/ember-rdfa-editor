import { EditorController } from '@lblod/ember-rdfa-editor/model/controller';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import { isElement } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
// import { ConfigUpdatedEvent } from '@lblod/ember-rdfa-editor/utils/editor-event';
import { EditorPlugin } from '@lblod/ember-rdfa-editor/utils/editor-plugin';

const PATH_MARKER = 'data-editor-position-level';
const RDFA_PATH_MARKER = 'data-editor-rdfa-position-level';
// const SHOW_RDFA_CLASS = 'show-rdfa-path';

export default class ShowActiveRdfaPlugin implements EditorPlugin {
  private activeElement: ModelElement | null = null;
  get name() {
    return 'show-active-rdfa';
  }
  // eslint-disable-next-line @typescript-eslint/require-await
  async initialize(controller: EditorController) {
    // TODO: reimplement this with transaction listener
    // controller.onEvent('configUpdated', (event: ConfigUpdatedEvent) => {
    //   if (event.payload.changedKey === 'showRdfaBlocks') {
    //     const rootNode = controller.domRoot;
    //     if (event.payload.newValue) {
    //       rootNode.classList.add(SHOW_RDFA_CLASS);
    //     } else {
    //       rootNode.classList.remove(SHOW_RDFA_CLASS);
    //     }
    //   }
    // });
    controller.onEvent('selectionChanged', () => {
      removePathAttributes();
      const ancestryPath =
        controller.selection.lastRange?.findCommonAncestorsWhere(
          ModelNode.isModelElement
        );
      if (ancestryPath) {
        let level = 0;
        let rdfaLevel = 0;

        for (const element of ancestryPath) {
          const domNode = controller.modelToView(element);

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
    });
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

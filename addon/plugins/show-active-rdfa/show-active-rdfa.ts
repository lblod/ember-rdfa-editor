import { RawEditorController } from '@lblod/ember-rdfa-editor/model/controller';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import { isElement } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import { ConfigUpdatedEvent } from '@lblod/ember-rdfa-editor/utils/editor-event';
import { EditorPlugin } from '@lblod/ember-rdfa-editor/utils/editor-plugin';

export default class ShowActiveRdfaPlugin implements EditorPlugin {
  private activeElement: ModelElement | null = null;
  get name() {
    return 'show-active-rdfa';
  }
  // eslint-disable-next-line @typescript-eslint/require-await
  async initialize(controller: RawEditorController) {
    controller.onEvent('configUpdated', (event: ConfigUpdatedEvent) => {
      if (
        event.payload.changedKey === 'showRdfaBlocks' &&
        !event.payload.newValue
      ) {
        const activeElements = document.getElementsByClassName('active');
        for (const el of activeElements) {
          el.classList.remove('active');
        }
      }
    });
    controller.onEvent('selectionChanged', () => {
      const activeElements = document.getElementsByClassName('active');
      for (const el of activeElements) {
        el.classList.remove('active');
      }
      if (controller.getConfig('showRdfaBlocks')) {
        const nearestRdfaNode = controller.selection.lastRange
          ?.findCommonAncestorsWhere((el) => !el.getRdfaAttributes().isEmpty)
          .next().value;
        if (nearestRdfaNode) {
          const activeRdfaNode =
            controller.modelToView(nearestRdfaNode)?.viewRoot;
          if (activeRdfaNode) {
            if (isElement(activeRdfaNode)) {
              activeRdfaNode.classList.add('active');
            } else {
              activeRdfaNode.parentElement!.classList.add('active');
            }
          }
        }
      }
    });
  }
}

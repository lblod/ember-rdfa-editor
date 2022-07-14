import Controller from '@lblod/ember-rdfa-editor/model/controller';
import { EditorPlugin } from '@lblod/ember-rdfa-editor/utils/editor-plugin';

export default class PlaceHolderPlugin implements EditorPlugin {
  get name() {
    return 'placeholder';
  }
  initialize(_controller: Controller, _options: unknown): Promise<void> {
    return Promise.resolve();
  }
}
// TODO
// /**
//  *
//  * @class PlaceholderTextBackspacePlugin
//  * @module plugins/placeholder-text
//  */
// export default class PlaceholderTextBackspacePlugin implements BackspacePlugin {
//   label = 'Backspace plugin for handling placeholder nodes';

//   guidanceForManipulation(
//     manipulation: BackspaceHandlerManipulation
//   ): ManipulationGuidance | null {
//     const node = manipulation.node;
//     const parentNode = node.parentElement;
//     if (parentNode && parentNode.classList.contains('mark-highlight-manual')) {
//       return {
//         allow: true,
//         executor: this.removePlaceholder,
//       };
//     }

//     return null;
//   }

//   /**
//    * This executor removes the placeholder node containing manipulation.node completely.
//    * @method removePlaceholder
//    */
//   removePlaceholder = (
//     manipulation: BackspaceHandlerManipulation,
//     editor: Editor
//   ): void => {
//     const node = manipulation.node;
//     const parentNode = node.parentElement;

//     if (parentNode) {
//       const textNode = document.createTextNode(INVISIBLE_SPACE);
//       parentNode.replaceWith(textNode);
//       window.getSelection()?.collapse(textNode, 0);
//       const tr = editor.state.createTransaction();
//       tr.readFromView(editor.view);
//       editor.dispatchTransaction(tr, false);
//     }
//   };

//   /**
//    * Allows the plugin to notify the backspace handler a change has occurred.
//    * Returns true explicitly when it detects the manipulation.node is inside a placeholder node.
//    * @method detectChange
//    */
//   detectChange(manipulation: BackspaceHandlerManipulation): boolean {
//     const node = manipulation.node;
//     const parentNode = node.parentElement;

//     return !!(
//       parentNode && parentNode.classList.contains('mark-highlight-manual')
//     );
//   }
// }


/**
 * @class PlaceholderTextInputPlugin
 * @module plugins/placeholder-text
 */
export default class PlaceholderTextInputPlugin implements TextInputPlugin {
  label = 'Text input plugin for handling RDFA specific logic';

  guidanceForManipulation(
    manipulation: TextHandlerManipulation
  ): ManipulationGuidance | null {
    const { range: originalRange, text } = manipulation;
    let range = originalRange;

    if (
      ModelNodeUtils.isPlaceHolder(originalRange.start.parent) ||
      ModelNodeUtils.isPlaceHolder(originalRange.end.parent)
    ) {
      range = ModelRangeUtils.getExtendedToPlaceholder(originalRange);
      return {
        allow: true,
        executor: (_, rawEditor: RawEditor) => {
          rawEditor.executeCommand('insert-text', text, range);
        },
      };
    }

    return null;
  }
}

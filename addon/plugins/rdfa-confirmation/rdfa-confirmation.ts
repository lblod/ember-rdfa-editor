import { deleteTargetRange } from '@lblod/ember-rdfa-editor/input/utils';
import Controller from '@lblod/ember-rdfa-editor/core/controllers/controller';
import ModelNode from '@lblod/ember-rdfa-editor/core/model/nodes/model-node';
import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import ArrayUtils from '@lblod/ember-rdfa-editor/utils/array-utils';
import GenTreeWalker from '@lblod/ember-rdfa-editor/utils/gen-tree-walker';
import { EditorPlugin } from '@lblod/ember-rdfa-editor/core/model/editor-plugin';
import Transaction from '@lblod/ember-rdfa-editor/core/state/transaction';

export default class RdfaConfirmationPlugin implements EditorPlugin {
  controller!: Controller;
  get name() {
    return 'rdfa-confirmation';
  }
  initialize(
    _transaction: Transaction,
    _controller: Controller,
    _options: unknown
  ): Promise<void> {
    this.controller = _controller;
    return Promise.resolve();
  }

  handleEvent(event: InputEvent) {
    switch (event.inputType) {
      case 'deleteContentBackward':
        return this.handleDelete(event, -1);
      case 'deleteContentForward':
        return this.handleDelete(event, 1);
      default:
        return { handled: false };
    }
  }

  handleDelete(event: InputEvent, direction: number) {
    const range = deleteTargetRange(this.controller.currentState, direction);
    const walker = GenTreeWalker.fromRange({
      range,
      reverse: direction === -1,
    });
    const nodes = [...walker.nodes()];
    if (
      ArrayUtils.all(
        nodes,
        (node) =>
          ModelNode.isModelElement(node) && !node.getRdfaAttributes().isEmpty
      ) &&
      nodes.length
    ) {
      event.preventDefault();
      const resultingRange = new ModelRange(
        direction === -1 ? range.start : range.end
      );
      this.controller.perform((tr) => {
        tr.selectRange(resultingRange);
      });
      return { handled: true };
    }

    return { handled: false };
  }
}

// TODO
// /**
//  * Class responsible for the handling of RDFA.
//  *
//  * CURRENT BEHAVIOUR
//  * -----------------
//  * (current) Sole functionality of warning the user when RDFA content is about to be removed from the editor.
//  *
//  * HOW
//  * ---
//  * Suppose we have:
//  * ````
//  * <element property="http://foo">to backspac|</element>
//  * ```
//  *
//  * When the length of element.innerText is about to reach certain treshold of size while backspacing,
//  * attributes are added to the element (`data-flagged-remove`) to the element, so visuals may be coupled
//  * to warn the user there is potentialy important stuff to be removed.
//  *
//  * Current implementation goes through the following steps:
//  *   - Initial state: backspacing in nodes whose direct parent have RDFA attributes.
//  *   - `data-flagged-remove='almost-complete'`:
//  *     -  A 'warning' flag is added, when the length of the parent becomes small. This remains until length of the inner text
//  *        equals = 1
//  *   - `data-flagged-remove='complete'`
//  *     - Last call. The parent is an empty Element. User gets to see a last warning, next backspaces key-stroke removes it.
//  *   - Removal of the parent RDFA-Element.
//  *
//  * NOTES
//  * -----
//  *  - Some tight coupling with rdfa/handlers/text-input-data-remove-handlers.js
//  *    This logic performs the 'inverse' operation, i.e. undo the warning flow when text is added again to the RDFA-Elements.
//  *  - Current implementation, to make sense for the user, relies also on specific CSS.
//  * @class RdfaBackspacePlugin
//  * @module plugin/lump-node
//  */

// const SUPPORTED_TEXT_NODE_MANIPULATIONS = [
//   'removeCharacter',
//   'removeEmptyTextNode',
// ];

// const SUPPORTED_ELEMENT_MANIPULATIONS = [
//   'removeEmptyElement',
//   'removeVoidElement',
//   'removeElementWithOnlyInvisibleTextNodeChildren',
//   'removeElementWithChildrenThatArentVisible',
// ];

// const TEXT_LENGTH_ALMOST_COMPLETE_TRESHOLD = 5;

// export default class RdfaBackspacePlugin implements BackspacePlugin {
//   label = 'Backspace plugin for handling RDFA specific logic';

//   guidanceForManipulation(
//     manipulation: BackspaceHandlerManipulation
//   ): ManipulationGuidance | null {
//     if (this.needsRemoveStep(manipulation)) {
//       return {
//         allow: true,
//         executor: this.executeRemoveStep, //TODO: extract these functions out of the class.
//       };
//     } else if (this.needsCompleteStep(manipulation)) {
//       return {
//         allow: true,
//         executor: this.executeCompleteStep,
//       };
//     } else if (this.needsAlmostCompleteStep(manipulation)) {
//       return {
//         allow: true,
//         executor: this.executeAlmostCompleteStep,
//       };
//     }

//     return null;
//   }

//   /**
//    * Current implementation returns true (and thus breaks the backspace exection flow) when
//    * an element, or the parentElement of a node where it is acting upon, has attribute:
//    * `data-flagged-remove='complete'`.
//    * This will require from the user to press backspace once more to remove the element.
//    * @method detectChange
//    */
//   detectChange(manipulation: BackspaceHandlerManipulation): boolean {
//     if (
//       this.isManipulationSupportedFor(
//         SUPPORTED_TEXT_NODE_MANIPULATIONS,
//         manipulation
//       )
//     ) {
//       const node = manipulation.node;
//       const parent = node.parentElement;

//       return !!(parent && this.hasFlagComplete(parent));
//     } else if (
//       this.isManipulationSupportedFor(
//         SUPPORTED_ELEMENT_MANIPULATIONS,
//         manipulation
//       )
//     ) {
//       const node = manipulation.node;
//       if (isElement(node)) {
//         return this.hasFlagComplete(node as Element);
//       }
//     }

//     return false;
//   }

//   /**
//    * Tests whether the 'warning' flag may be added.
//    * Note: This is only done on TextNode operations for now.
//    * It feels like such flow for emptyElements would feel cumbersome (and add complexity).
//    */
//   needsAlmostCompleteStep(manipulation: BackspaceHandlerManipulation): boolean {
//     const node = manipulation.node;
//     const parent = node.parentElement;

//     return !!(
//       parent &&
//       this.isManipulationSupportedFor(
//         SUPPORTED_TEXT_NODE_MANIPULATIONS,
//         manipulation
//       ) &&
//       !this.hasFlagForRemoval(parent) &&
//       this.doesElementLengthRequireAlmostComplete(parent) &&
//       this.isRdfaNode(parent)
//     );
//   }

//   /**
//    * Tests whether the 'last call' flag may be added.
//    */
//   needsCompleteStep(manipulation: BackspaceHandlerManipulation): boolean {
//     if (
//       this.isManipulationSupportedFor(
//         SUPPORTED_TEXT_NODE_MANIPULATIONS,
//         manipulation
//       )
//     ) {
//       const node = manipulation.node;
//       const parent = node.parentElement;

//       return !!(
//         parent &&
//         this.hasFlagAlmostComplete(parent) &&
//         stringToVisibleText(parent.innerText).length === 1
//       );
//     } else if (
//       this.isManipulationSupportedFor(
//         SUPPORTED_ELEMENT_MANIPULATIONS,
//         manipulation
//       )
//     ) {
//       const node = manipulation.node;
//       return this.isRdfaNode(node as Element);
//     }

//     return false;
//   }

//   /**
//    * Tests whether the element should be removed, after having given all the warnings.
//    */
//   needsRemoveStep(manipulation: BackspaceHandlerManipulation): boolean {
//     if (
//       this.isManipulationSupportedFor(
//         SUPPORTED_TEXT_NODE_MANIPULATIONS,
//         manipulation
//       )
//     ) {
//       const node = manipulation.node;
//       const parent = node.parentElement;

//       return !!(
//         parent &&
//         this.hasFlagComplete(parent) &&
//         stringToVisibleText(parent.innerText).length === 0
//       );
//     } else if (
//       this.isManipulationSupportedFor(
//         SUPPORTED_ELEMENT_MANIPULATIONS,
//         manipulation
//       )
//     ) {
//       const node = manipulation.node;
//       return this.hasFlagComplete(node as Element);
//     }

//     return false;
//   }

//   /**
//    * Sets the `data-flagged-remove=almost-complete`.
//    * Note: This is only done on TextNode operations for now.
//    * (again) It feels like such flow for emptyElements would feel cumbersome (and add complexity).
//    */
//   executeAlmostCompleteStep = (
//     manipulation: BackspaceHandlerManipulation
//   ): void => {
//     const node = manipulation.node;
//     const parent = node.parentElement;

//     if (
//       this.isManipulationSupportedFor(
//         SUPPORTED_TEXT_NODE_MANIPULATIONS,
//         manipulation
//       ) &&
//       parent
//     ) {
//       parent.setAttribute('data-flagged-remove', 'almost-complete');
//     }
//   };

//   /**
//    * For textNode manipulations, removes the last visible text node and adds `data-flagged-remove=complete` to the parent.
//    * For empty element manipulation, just adds `data-flagged-remove=complete`.
//    */
//   executeCompleteStep = (
//     manipulation: BackspaceHandlerManipulation,
//     editor: Editor
//   ): void => {
//     const node = manipulation.node;
//     const parent = node.parentElement;

//     if (
//       this.isManipulationSupportedFor(
//         SUPPORTED_TEXT_NODE_MANIPULATIONS,
//         manipulation
//       ) &&
//       parent
//     ) {
//       parent.removeChild(node);
//       parent.setAttribute('data-flagged-remove', 'complete');
//       window.getSelection()?.collapse(parent, 0); // TODO
//       const tr = editor.state.createTransaction();
//       tr.readFromView(editor.view);
//       editor.dispatchTransaction(tr, false);
//     } else if (
//       this.isManipulationSupportedFor(
//         SUPPORTED_ELEMENT_MANIPULATIONS,
//         manipulation
//       )
//     ) {
//       (node as Element).setAttribute('data-flagged-remove', 'complete');
//       window.getSelection()?.collapse(node, 0);
//       const tr = editor.state.createTransaction();
//       tr.readFromView(editor.view);
//       editor.dispatchTransaction(tr, false);
//     }
//   };

//   /**
//    * Last step. The rdfa element is removed.
//    */
//   executeRemoveStep = (
//     manipulation: BackspaceHandlerManipulation,
//     editor: Editor
//   ): void => {
//     let removedElement;
//     let updatedSelection;

//     if (
//       this.isManipulationSupportedFor(
//         SUPPORTED_TEXT_NODE_MANIPULATIONS,
//         manipulation
//       )
//     ) {
//       const node = manipulation.node;
//       const rdfaElement = node.parentElement;

//       if (!rdfaElement) {
//         throw new Error(
//           `rdfa/backspace-plugin: Expected ${node.toString()} node to have a parent.`
//         );
//       }

//       updatedSelection = moveCaretBefore(rdfaElement);
//       rdfaElement.remove();
//       removedElement = rdfaElement; //TODO: is this wrong to assume so?
//       const tr = editor.state.createTransaction();
//       tr.readFromView(editor.view);
//       editor.dispatchTransaction(tr, false);
//     } else if (
//       this.isManipulationSupportedFor(
//         SUPPORTED_ELEMENT_MANIPULATIONS,
//         manipulation
//       )
//     ) {
//       const rdfaElement = manipulation.node as Element;
//       updatedSelection = moveCaretBefore(rdfaElement);
//       rdfaElement.remove();
//       removedElement = rdfaElement as HTMLElement;
//       const tr = editor.state.createTransaction();
//       tr.readFromView(editor.view);
//       editor.dispatchTransaction(tr, false);
//     }

//     if (!updatedSelection) {
//       throw new Error(
//         'rdfa/backspace-plugin: Update selection (before removal) failed.'
//       );
//     }

//     if (!removedElement) {
//       throw new Error('rdfa/backspace-plugin: Removal of element failed.');
//     }

//     // Here a 'gotcha' piece of logic is executed.
//     // Suppose we have: ```<rdfa><rdfa>|</rdfa></rdfa>```
//     // The above statements so far removed the inner most `<rdfa>` element.
//     // Problem is here, under normal flow, the cursor would end up in an empty Element, which
//     // is invisible for the user at that point. Press backspaces again, and the normal
//     // warning flow would start over again.
//     // Somehow, I don't think it is nice, and I want the user to immediatly draw attention to this empty
//     // RDFA-element. Hence the next couple of lines to do so.
//     // Extra notes:
//     // -----------
//     // Since we are in a different state compared to the other methods of this plugins, i.e. the node has been update in the DOM,
//     // the checks are slightly different.
//     const anchorNode = updatedSelection.anchorNode;

//     if (!anchorNode) {
//       return;
//     } else if (isTextNode(anchorNode)) {
//       const parentElement = anchorNode.parentElement;
//       if (
//         parentElement &&
//         stringToVisibleText(parentElement.innerText).length === 0 &&
//         this.isRdfaNode(parentElement)
//       ) {
//         parentElement.setAttribute('data-flagged-remove', 'complete');
//         this.setNextBackgroundColorCycleOnComplete(
//           removedElement,
//           parentElement
//         );
//       } else if (
//         parentElement &&
//         this.doesElementLengthRequireAlmostComplete(parentElement) &&
//         this.isRdfaNode(parentElement)
//       ) {
//         parentElement.setAttribute('data-flagged-remove', 'almost-complete');
//       }
//     } else if (
//       anchorNode &&
//       isElement(anchorNode) &&
//       this.isRdfaNode(anchorNode)
//     ) {
//       const updatedElement = anchorNode;
//       if (stringToVisibleText(updatedElement.innerText).length === 0) {
//         updatedElement.setAttribute('data-flagged-remove', 'complete');
//         this.setNextBackgroundColorCycleOnComplete(
//           removedElement,
//           updatedElement
//         );
//       } else if (this.doesElementLengthRequireAlmostComplete(updatedElement)) {
//         updatedElement.setAttribute('data-flagged-remove', 'almost-complete');
//       }
//     }
//   };

//   doesElementLengthRequireAlmostComplete(element: HTMLElement): boolean {
//     const visibleLength = stringToVisibleText(element.innerText).length;
//     return visibleLength < TEXT_LENGTH_ALMOST_COMPLETE_TRESHOLD;
//   }

//   isRdfaNode(node: Element): boolean {
//     for (const key of rdfaKeywords) {
//       if (node.getAttribute(key)) {
//         return true;
//       }
//     }
//     return false;
//   }

//   hasFlagForRemoval(element: Element): boolean {
//     const attrValue = element.getAttribute('data-flagged-remove');
//     return attrValue !== null && attrValue.length > 0;
//   }

//   hasFlagAlmostComplete(element: Element): boolean {
//     const attrValue = element.getAttribute('data-flagged-remove');
//     return attrValue === 'almost-complete';
//   }

//   hasFlagComplete(element: Element): boolean {
//     const attrValue = element.getAttribute('data-flagged-remove');
//     return attrValue === 'complete';
//   }

//   /*
//    * Some clumsy background color cycle, when you backspace in a set of nested
//    * RDFA-elements, while removing, a different warning background color is shown.
//    * <rdfa-1><rdfa-2><rdfa-3>|</rdfa-3></rdfa-2></rdfa-1>
//    * While pressing subsequent backspaces:
//    *  - rdfa-3: default warning background color (from css)
//    *  - rdfa-2: lightbleu
//    *  - rdfa-1: lightgreen
//    * This is probably provisionary logic, but more visible for the user.
//    */
//   setNextBackgroundColorCycleOnComplete(
//     previousElement: HTMLElement,
//     element: HTMLElement
//   ): void {
//     const currentColor = previousElement.style.backgroundColor;
//     if (currentColor && currentColor === 'lightblue') {
//       element.style.backgroundColor = 'lightgreen';
//     } else {
//       element.style.backgroundColor = 'lightblue';
//     }
//   }

//   isManipulationSupportedFor(
//     manipulationTypes: Array<string>,
//     manipulation: BackspaceHandlerManipulation
//   ): boolean {
//     return manipulationTypes.some(
//       (manipulationType) => manipulationType === manipulation.type
//     );
//   }
// }

// function updateDataFlaggedRemove(
//   manipulation: TextHandlerManipulation,
//   editor: RawEditor
// ) {
//   const { range } = manipulation;
//   const parent = range.start.parent;
//   const textNodeWalker = new ModelTreeWalker<ModelText>({
//     range: ModelRange.fromInElement(parent, 0, parent.getMaxOffset()),
//     descend: false,
//     filter: toFilterSkipFalse(ModelNode.isModelText),
//   });

//   let innerText = '';
//   for (const node of textNodeWalker) {
//     innerText += node.content;
//   }

//   const length = stringToVisibleText(innerText || '').length;

//   if (length <= 2) {
//     //TODO this should be done with a command
//     parent.setAttribute('data-flagged-remove', 'almost-complete');
//   } else if (length > 2) {
//     //TODO this should be done with a command
//     parent.removeAttribute('data-flagged-remove');
//   }

//   editor.executeCommand('insert-text', manipulation.text, manipulation.range);
// }

// export default class RdfaTextInputPlugin implements TextInputPlugin {
//   label = 'Text input plugin for handling RDFA specific logic';

//   guidanceForManipulation(
//     manipulation: TextHandlerManipulation
//   ): ManipulationGuidance | null {
//     const { type, range } = manipulation;
//     if (
//       type === 'insertTextIntoRange' &&
//       range.start.parent.getAttribute('data-flagged-remove')
//     ) {
//       return {
//         allow: true,
//         executor: updateDataFlaggedRemove,
//       };
//     }

//     return null;
//   }
// }

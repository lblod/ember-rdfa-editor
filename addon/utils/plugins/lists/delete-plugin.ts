import { DeletePlugin } from "@lblod/ember-rdfa-editor/editor/input-handlers/delete-handler";
import {
  Manipulation,
  ManipulationGuidance,
  RemoveEmptyTextNodeManipulation,
  MoveCursorAfterElementManipulation,
  Editor,
} from "@lblod/ember-rdfa-editor/editor/input-handlers/manipulation";
import { runInDebug } from "@ember/debug";
import {
  findLastLi,
  tagName,
} from "@lblod/ember-rdfa-editor/utils/dom-helpers";

function debug(message: String, object: Object | null = null): void {
  runInDebug(() => {
    console.debug(`list delete plugin: ${message}`, object);
  });
}

/**
 * This plugin provides sensible behaviour for delete in lists.
 * @class ListDeletePlugin
 * @module plugin/lists
 */
export default class ListDeletePlugin implements DeletePlugin {
  label = "delete plugin for handling lists";
  changeRef?: Node;

  guidanceForManipulation(
    manipulation: Manipulation
  ): ManipulationGuidance | null {
    this.changeRef = manipulation.node.cloneNode(true);
    if (manipulation.type == "moveCursorAfterElement") {
      manipulation as MoveCursorAfterElementManipulation;
      const element = manipulation.node;
      if (tagName(element) == "li") {
        return this.guidanceForDeleteAtEndOfLi(element);
      }
    }
    return null;
  }

  detectChange(manipulation: Manipulation): boolean {
    debugger;
    if (["moveCursorAfterElement"].includes(manipulation.type)) {
      const element = manipulation.node as Element;
      if (!this.changeRef) return true;
      return element.textContent !== this.changeRef.textContent;
    }
    return false;
  }

  guidanceForDeleteAtEndOfLi(element: Element): ManipulationGuidance {
    debug("providing guidance for delete at end of li");
    if (tagName(element.nextElementSibling) == "li") {
      return {
        allow: true,
        executor: this.mergeNextLi,
      };
    } else {
      return {
        allow: true,
        executor: this.removeListItemAndListButKeepContent,
      };
    }
  }
  mergeNextLi(manipulation: Manipulation, editor: Editor) {
    const currentLi = manipulation.node as HTMLLIElement;
    const nextLi = currentLi.nextElementSibling;
    if (!nextLi)
      throw new Error("Invariant violation: node has no nextElementSibling");

    currentLi.append(...nextLi.childNodes);
    nextLi.remove();
    editor.updateRichNode();
  }
  removeListItemAndListButKeepContent(
    manipulation: Manipulation,
    editor: Editor
  ) {}
}

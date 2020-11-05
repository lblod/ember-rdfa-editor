import { DeletePlugin } from "@lblod/ember-rdfa-editor/editor/input-handlers/delete-handler";
import {
    Manipulation,
    ManipulationGuidance
} from "@lblod/ember-rdfa-editor/editor/input-handlers/manipulation";
import { runInDebug } from '@ember/debug';

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

  guidanceForManipulation(
    manipulation: Manipulation
  ): ManipulationGuidance | null {

    debug("hello from the delete plugin");
    return null;
  }

  detectChange(manipulation: Manipulation): boolean {
    return false;
  }
}

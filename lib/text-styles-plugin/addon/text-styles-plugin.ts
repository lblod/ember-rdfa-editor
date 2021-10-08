import {EditorPlugin} from "@lblod/ember-rdfa-editor/core/editor-plugin";
import EditorController from "@lblod/ember-rdfa-editor/core/editor-controller";
import MakeBoldCommand from "./commands/make-bold-command";

export default class TextStylesPlugin implements EditorPlugin {
  static create(): TextStylesPlugin {
    return new TextStylesPlugin();
  }

  get name(): string {
    return "text-styles";
  }

  async initialize(controller: EditorController): Promise<void> {
    controller.registerCommand(MakeBoldCommand);
    // controller.registerCommand(RemoveBoldCommand);
    controller.registerWidget({
      desiredLocation: "toolbar",
      componentName: "text-styles-bold-button",
      identifier: "text-styles-bold-button"
    });

  }


}

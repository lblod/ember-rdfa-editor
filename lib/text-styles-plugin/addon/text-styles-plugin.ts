import {EditorPlugin} from "@lblod/ember-rdfa-editor/core/editor-plugin";
import EditorController from "@lblod/ember-rdfa-editor/core/editor-controller";
import MakeBoldCommand from "./commands/make-bold-command";
import RemoveBoldCommand from "./commands/remove-bold-command";
import MakeItalicCommand from "./commands/make-italic-command";
import RemoveItalicCommand from "./commands/remove-italic-command";
import MakeUnderlineCommand from "./commands/make-underline-command";
import RemoveUnderlineCommand from "./commands/remove-underline-command";
import MakeStrikethroughCommand from "./commands/make-strikethrough-command";
import RemoveStrikethroughCommand from "./commands/remove-strikethrough-command";

export default class TextStylesPlugin implements EditorPlugin {
  static create(): TextStylesPlugin {
    return new TextStylesPlugin();
  }

  get name(): string {
    return "text-styles";
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async initialize(controller: EditorController): Promise<void> {

    controller.registerCommand(MakeBoldCommand);
    controller.registerCommand(RemoveBoldCommand);
    controller.registerWidget({
      desiredLocation: "toolbar",
      componentName: "text-styles-bold-button",
      identifier: "text-styles-bold-button"
    });

    controller.registerCommand(MakeItalicCommand);
    controller.registerCommand(RemoveItalicCommand);
    controller.registerWidget({
      desiredLocation: "toolbar",
      componentName: "text-styles-italic-button",
      identifier: "text-styles-italic-button"
    });

    controller.registerCommand(MakeUnderlineCommand);
    controller.registerCommand(RemoveUnderlineCommand);
    controller.registerWidget({
      desiredLocation: "toolbar",
      componentName: "text-styles-underline-button",
      identifier: "text-styles-underline-button"
    });

    controller.registerCommand(MakeStrikethroughCommand);
    controller.registerCommand(RemoveStrikethroughCommand);
    controller.registerWidget({
      desiredLocation: "toolbar",
      componentName: "text-styles-strikethrough-button",
      identifier: "text-styles-strikethrough-button"
    });
  }


}

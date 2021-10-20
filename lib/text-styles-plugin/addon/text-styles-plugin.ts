import {EditorPlugin} from "@lblod/ember-rdfa-editor/core/editor-plugin";
import EditorController from "@lblod/ember-rdfa-editor/core/editor-controller";
import MakeBoldCommand from "./commands/make-bold-command";
import MakeHighlightCommand from "text-styles-plugin/commands/make-highlight-command";
import MakeItalicCommand from "text-styles-plugin/commands/make-italic-command";
import MakeStrikethroughCommand from "text-styles-plugin/commands/make-strikethrough-command";
import MakeUnderlineCommand from "text-styles-plugin/commands/make-underline-command";
import RemoveBoldCommand from "text-styles-plugin/commands/remove-bold-command";
import RemoveHighlightCommand from "text-styles-plugin/commands/remove-highlight-command";
import RemoveItalicCommand from "text-styles-plugin/commands/remove-italic-command";
import RemoveStrikethroughCommand from "text-styles-plugin/commands/remove-strikethrough-command";
import RemoveUnderlineCommand from "text-styles-plugin/commands/remove-underline-command";

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
    controller.registerCommand(MakeHighlightCommand);
    controller.registerCommand(MakeItalicCommand);
    controller.registerCommand(MakeStrikethroughCommand);
    controller.registerCommand(MakeUnderlineCommand);
    controller.registerCommand(RemoveBoldCommand);
    controller.registerCommand(RemoveHighlightCommand);
    controller.registerCommand(RemoveItalicCommand);
    controller.registerCommand(RemoveStrikethroughCommand);
    controller.registerCommand(RemoveUnderlineCommand);
    controller.registerWidget({
      desiredLocation: "toolbar",
      componentName: "text-styles-bold-button",
      identifier: "text-styles-bold-button"
    });

  }


}

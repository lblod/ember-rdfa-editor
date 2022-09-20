import ModelNode from '@lblod/ember-rdfa-editor/core/model/nodes/model-node';
import Command, {
  CommandContext,
} from '@lblod/ember-rdfa-editor/commands/command';
import {
  HtmlReaderContext,
  readHtml,
} from '@lblod/ember-rdfa-editor/core/model/readers/html-reader';
import ModelRange from '../core/model/model-range';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
declare module '@lblod/ember-rdfa-editor' {
  export interface Commands {
    insertHtml: InsertHtmlCommand;
  }
}
export interface InsertHtmlCommandArgs {
  htmlString: string;
  range?: ModelRange | null;
}

export default class InsertHtmlCommand
  implements Command<InsertHtmlCommandArgs, void>
{
  canExecute(): boolean {
    return true;
  }

  @logExecute
  execute(
    { transaction }: CommandContext,

    {
      htmlString,
      range = transaction.workingCopy.selection.lastRange,
    }: InsertHtmlCommandArgs
  ) {
    if (!range) {
      return;
    }

    const parser = new DOMParser();
    const html = parser.parseFromString(htmlString, 'text/html');
    const bodyContent = html.body.childNodes;

    // dom NodeList doesn't have a map method
    const modelNodes: ModelNode[] = [];
    bodyContent.forEach((node) => {
      const parsed = readHtml(
        node,
        new HtmlReaderContext({
          marksRegistry: transaction.workingCopy.marksRegistry,
          shouldConvertWhitespace: true,
          inlineComponentsRegistry:
            transaction.workingCopy.inlineComponentsRegistry,
        })
      );
      if (parsed) {
        modelNodes.push(...parsed);
      }
    });

    const resultRange = transaction.insertNodes(range, ...modelNodes);
    transaction.selectRange(resultRange);
  }
}

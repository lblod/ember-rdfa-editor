import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import Command, {
  CommandContext,
} from '@lblod/ember-rdfa-editor/commands/command';
import HtmlReader, {
  HtmlReaderContext,
} from '@lblod/ember-rdfa-editor/model/readers/html-reader';
import ModelRange from '../model/model-range';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
export interface InsertHtmlCommandArgs {
  htmlString: string;
  range?: ModelRange | null;
}
export default class InsertHtmlCommand
  implements Command<InsertHtmlCommandArgs, void>
{
  name = 'insert-html';
  arguments = ['htmlString', 'range'];

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
    const reader = new HtmlReader();

    // dom NodeList doesn't have a map method
    const modelNodes: ModelNode[] = [];
    bodyContent.forEach((node) => {
      const parsed = reader.read(
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

    const newRange = transaction.insertNodes(range, ...modelNodes);
    transaction.selectRange(newRange);
  }
}

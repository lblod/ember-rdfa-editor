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
    { state, dispatch }: CommandContext,

    { htmlString, range = state.selection.lastRange }: InsertHtmlCommandArgs
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
          marksRegistry: state.marksRegistry,
          shouldConvertWhitespace: true,
          inlineComponentsRegistry: state.inlineComponentsRegistry,
        })
      );
      if (parsed) {
        modelNodes.push(...parsed);
      }
    });

    const tr = state.createTransaction();
    const newRange = tr.insertNodes(range, ...modelNodes);
    tr.selectRange(newRange);
    dispatch(tr);
  }
}

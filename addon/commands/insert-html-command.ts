import Model from '@lblod/ember-rdfa-editor/model/model';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import Command, {
  CommandContext,
} from '@lblod/ember-rdfa-editor/commands/command';
import HtmlReader from '@lblod/ember-rdfa-editor/model/readers/html-reader';
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
    const tr = state.createTransaction();

    // dom NodeList doesn't have a map method
    const modelNodes: ModelNode[] = [];
    bodyContent.forEach((node) => {
      //TODO
      // const parsed = reader.read(node, true);
      // if (parsed) {
      //   modelNodes.push(...parsed);
      // }
    });

    const newRange = tr.insertNodes(range, ...modelNodes);
    tr.selectRange(newRange);
    dispatch(tr);
  }
}

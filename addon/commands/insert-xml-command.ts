import Command, {
  CommandContext,
} from '@lblod/ember-rdfa-editor/commands/command';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import setNodeAndChildDirty from '@lblod/ember-rdfa-editor/model/util/set-node-and-child-dirty';
import { parseXmlSiblings } from '@lblod/ember-rdfa-editor/model/util/xml-utils';
import { MisbehavedSelectionError } from '@lblod/ember-rdfa-editor/utils/errors';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';

export interface InsertXmlCommandArgs {
  xml: string;
  range?: ModelRange | null;
}
/**
 * Allows you to insert model nodes from an xml string.
 * Particularly useful for testing and debugging.
 */
export default class InsertXmlCommand
  implements Command<InsertXmlCommandArgs, void>
{
  name = 'insert-xml';
  arguments: string[] = ['xml', 'range'];

  canExecute(): boolean {
    return true;
  }
  @logExecute
  execute(
    { state, dispatch }: CommandContext,

    { xml, range = state.selection.lastRange }: InsertXmlCommandArgs
  ): void {
    if (!range) {
      throw new MisbehavedSelectionError();
    }

    const tr = state.createTransaction();
    const parsedModelNodes = parseXmlSiblings(xml);
    //All nodes are marked as dirty by default when inserted but not in the xml writer
    // as we need to set dirtiness statuses in the tests, in order to solve bugs related to
    // nodes not being properly inserted we set them all dirty in this function below
    parsedModelNodes.forEach((node) => setNodeAndChildDirty(node));
    const newRange = tr.insertNodes(range, ...parsedModelNodes);
    tr.selectRange(newRange);
    dispatch(tr);
  }
}

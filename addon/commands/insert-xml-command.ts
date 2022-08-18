import Command, {
  CommandContext,
} from '@lblod/ember-rdfa-editor/commands/command';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import { parseXmlSiblings } from '@lblod/ember-rdfa-editor/model/util/xml-utils';
import { MisbehavedSelectionError } from '@lblod/ember-rdfa-editor/utils/errors';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';

declare module '@lblod/ember-rdfa-editor' {
  export interface Commands {
    insertXml: InsertXmlCommand;
  }
}
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
  canExecute(): boolean {
    return true;
  }
  @logExecute
  execute(
    { transaction }: CommandContext,

    {
      xml,
      range = transaction.workingCopy.selection.lastRange,
    }: InsertXmlCommandArgs
  ): void {
    if (!range) {
      throw new MisbehavedSelectionError();
    }

    const parsedModelNodes = parseXmlSiblings(xml);
    //All nodes are marked as dirty by default when inserted but not in the xml writer
    // as we need to set dirtiness statuses in the tests, in order to solve bugs related to
    // nodes not being properly inserted we set them all dirty in this function below
    const newRange = transaction.insertNodes(range, ...parsedModelNodes);
    transaction.selectRange(newRange);
  }
}

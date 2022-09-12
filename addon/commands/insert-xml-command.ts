import Command, {
  CommandContext,
} from '@lblod/ember-rdfa-editor/commands/command';
import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import { parseXmlSiblings } from '@lblod/ember-rdfa-editor/utils/xml-utils';
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
    transaction.insertNodes(range, ...parsedModelNodes);
  }
}

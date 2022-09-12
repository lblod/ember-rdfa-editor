import Command, {
  CommandContext,
} from '@lblod/ember-rdfa-editor/commands/command';
import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import { AttributeSpec } from '../utils/render-spec';

declare module '@lblod/ember-rdfa-editor' {
  export interface Commands {
    removeMarksFromRanges: RemoveMarksFromRangesCommand;
  }
}

interface MarkConfig {
  name: string;
  attributes: AttributeSpec;
}

export interface RemoveMarkFromRangeArgs {
  ranges: Iterable<ModelRange>;
  markConfigs: Iterable<MarkConfig>;
}

export default class RemoveMarksFromRangesCommand
  implements Command<RemoveMarkFromRangeArgs, void>
{
  canExecute(): boolean {
    return true;
  }

  execute(
    { transaction }: CommandContext,
    { ranges, markConfigs }: RemoveMarkFromRangeArgs
  ): void {
    for (const { name, attributes } of markConfigs) {
      for (const range of ranges) {
        transaction.commands.removeMarkFromRange({
          range,
          markName: name,
          attributes,
        });
      }
    }
  }
}

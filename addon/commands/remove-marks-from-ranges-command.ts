import Command, {
  CommandContext,
} from '@lblod/ember-rdfa-editor/commands/command';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import { ModelError } from '@lblod/ember-rdfa-editor/utils/errors';
import { AttributeSpec } from '../model/util/render-spec';

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
      const spec = transaction.workingCopy.marksRegistry.lookupMark(name);
      if (spec) {
        for (const range of ranges) {
          transaction.removeMark(range, spec, attributes);
        }
      } else {
        throw new ModelError(`Unrecognized mark: ${name}`);
      }
    }
  }
}

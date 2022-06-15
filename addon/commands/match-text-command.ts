import Command, {
  CommandContext,
} from '@lblod/ember-rdfa-editor/commands/command';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import {
  matchText,
  TextMatch,
} from '@lblod/ember-rdfa-editor/utils/match-text';
export interface MatchTextCommandArgs {
  limitRange: ModelRange;
  regex: RegExp;
}

export default class MatchTextCommand
  implements Command<MatchTextCommandArgs, TextMatch[]>
{
  name = 'match-text';
  arguments: string[] = ['limitRange', 'regex'];

  canExecute(): boolean {
    return true;
  }

  execute(
    {}: CommandContext,
    { limitRange, regex }: MatchTextCommandArgs
  ): TextMatch[] {
    return matchText(limitRange, regex);
  }
}

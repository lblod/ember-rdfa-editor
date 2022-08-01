import Command, {
  CommandContext,
} from '@lblod/ember-rdfa-editor/commands/command';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import {
  matchText,
  TextMatch,
} from '@lblod/ember-rdfa-editor/utils/match-text';
declare module '@lblod/ember-rdfa-editor' {
  export interface Commands {
    matchText: MatchTextCommand;
  }
}
export interface MatchTextCommandArgs {
  limitRange: ModelRange;
  regex: RegExp;
}

export default class MatchTextCommand
  implements Command<MatchTextCommandArgs, TextMatch[]>
{
  canExecute(): boolean {
    return true;
  }

  execute(
    _: CommandContext,
    { limitRange, regex }: MatchTextCommandArgs
  ): TextMatch[] {
    return matchText(limitRange, regex);
  }
}

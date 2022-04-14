import Model from '@lblod/ember-rdfa-editor/model/model';
import Command from '@lblod/ember-rdfa-editor/commands/command';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import {
  matchText,
  TextMatch,
} from '@lblod/ember-rdfa-editor/utils/match-text';

export default class MatchTextCommand extends Command<
  [ModelRange, RegExp],
  TextMatch[]
> {
  name = 'match-text';

  constructor(model: Model) {
    super(model);
  }

  execute(limitRange: ModelRange, regex: RegExp): TextMatch[] {
    return matchText(limitRange, regex);
  }
}

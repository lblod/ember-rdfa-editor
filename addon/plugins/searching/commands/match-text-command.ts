import Command from "@lblod/ember-rdfa-editor/commands/command";
import ModelRange from "@lblod/ember-rdfa-editor/core/model/model-range";
import Model from "@lblod/ember-rdfa-editor/model/model";

export default class MatchTextCommand extends Command<[ModelRange, RegExp], ModelRange[]> {
  name = "match-text";

  constructor(model: Model) {
    super(model);
  }

  execute(_executedBy: string, limitRange: ModelRange, regex: RegExp): ModelRange[] {

    const {textContent, indexToPos} = limitRange.getTextContentWithMapping();

    const result = [];
    for (const match of textContent.matchAll(regex)) {
      const matchIndex = match.index;
      if (matchIndex !== undefined) {
        const startPos = indexToPos(matchIndex);
        const matchedString = match[0];
        const endPos = indexToPos(matchIndex + matchedString.length);
        result.push(new ModelRange(startPos, endPos));
      }
    }
    return result;
  }
}

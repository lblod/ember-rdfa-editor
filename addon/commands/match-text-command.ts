import Model from '@lblod/ember-rdfa-editor/model/model';
import Command from '@lblod/ember-rdfa-editor/commands/command';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';

export interface TextMatch {
  /**
   * The range that encompasses the matched text
   */
  range: ModelRange;
  /**
   * The matched text
   */
  text: string;
  /**
   * The matched text in the capture groups
   */
  groups: string[];
  /**
   * The index in the inputstring where the match was found (0-based)
   */
  index: number;
  /**
   * The inputstring that was matched against
   */
  input: string;
}

export default class MatchTextCommand extends Command<
  [ModelRange, RegExp],
  TextMatch[]
> {
  name = 'match-text';

  constructor(model: Model) {
    super(model);
  }

  execute(limitRange: ModelRange, regex: RegExp): TextMatch[] {
    const { textContent, indexToPos } = limitRange.getTextContentWithMapping();

    const result: TextMatch[] = [];
    if (regex.global) {
      for (const match of textContent.matchAll(regex)) {
        const textMatch = convertMatch(match, indexToPos);
        if (textMatch) {
          result.push(textMatch);
        }
      }
      return result;
    } else {
      const match = textContent.match(regex);
      if (match) {
        const textMatch = convertMatch(match, indexToPos);
        if (textMatch) {
          return [textMatch];
        }
      }
      return [];
    }
  }
}

function convertMatch(
  match: RegExpMatchArray,
  indexToPos: (textIndex: number) => ModelPosition
): TextMatch | null {
  const matchIndex = match.index;
  if (matchIndex !== undefined) {
    const startPos = indexToPos(matchIndex);
    const matchedString = match[0];
    const endPos = indexToPos(matchIndex + matchedString.length);
    return {
      input: match.input || '',
      text: matchedString,
      groups: match.slice(1),
      range: new ModelRange(startPos, endPos),
      index: matchIndex,
    };
  }
  return null;
}

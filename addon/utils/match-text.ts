import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import { IllegalArgumentError } from '@lblod/ember-rdfa-editor/utils/errors';

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
  groups: Array<string | undefined>;
  /**
   * The index in the inputstring where the match was found (0-based)
   */
  index: number;
  /**
   * The [start, end] indices of each capture group
   */
  indices: Array<[number, number] | undefined>;
  /**
   * The range where each capture group was found
   */
  groupRanges: Array<ModelRange | undefined>;
  /**
   * The inputstring that was matched against
   */
  input: string;
}

/**
 * Regex match the text content inside limitRange.
 * Block element boundaries are converted into newlines, as that is how
 * they appear when rendered.
 * Flags are respected, but the "d" flag (generate substring match indices) is forced.
 * Note that the state (e.g. lastIndex) of the passed in regex object is not respected.
 * @param limitRange
 * @param regex
 */
export function matchText(limitRange: ModelRange, regex: RegExp): TextMatch[] {
  // the d flag is crucial to generating ranges for every capture group, so we force it
  const myRegex = new RegExp(regex, `${regex.flags}d`);
  const { textContent, indexToPos } = limitRange.getTextContentWithMapping();

  const result: TextMatch[] = [];
  if (myRegex.global) {
    for (const match of textContent.matchAll(myRegex)) {
      const textMatch = convertMatch(match, indexToPos);
      if (textMatch) {
        result.push(textMatch);
      }
    }
    return result;
  } else {
    const match = textContent.match(myRegex);
    if (match) {
      const textMatch = convertMatch(match, indexToPos);
      if (textMatch) {
        return [textMatch];
      }
    }
    return [];
  }
}

function convertMatch(
  match: RegExpMatchArray & { indices?: Array<[number, number] | undefined> },
  indexToPos: (textIndex: number) => ModelPosition
): TextMatch | null {
  if (!match.indices) {
    throw new IllegalArgumentError(
      "can not work with a regex which does not have a 'd' flag"
    );
  }
  const matchIndex = match.index;
  if (matchIndex !== undefined) {
    const groups = match;
    const indices = match.indices;
    const groupRanges = indices.map((value) => {
      if (!value) {
        return value;
      } else {
        const startPos = indexToPos(value[0]);
        const endPos = indexToPos(value[1]);
        return new ModelRange(startPos, endPos).shrinkToVisible();
      }
    });
    const matchedString = match[0];
    const range = groupRanges[0]!;

    console.log(match);
    return {
      input: match.input || '',
      text: matchedString,
      groups,
      groupRanges,
      indices,
      range,
      index: matchIndex,
    };
  }
  return null;
}

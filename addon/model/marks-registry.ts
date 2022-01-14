import {
  MarkSpec,
  MarkSet,
  TagMatch,
  Mark,
} from '@lblod/ember-rdfa-editor/model/markSpec';
import MapUtils from '@lblod/ember-rdfa-editor/model/util/map-utils';
import { tagName } from '@lblod/ember-rdfa-editor/utils/dom-helpers';

export default class MarksRegistry {
  private markMatchMap: Map<TagMatch, MarkSpec[]> = new Map<
    keyof HTMLElementTagNameMap,
    MarkSpec[]
  >();
  private registeredMarks: Map<string, MarkSpec> = new Map<string, MarkSpec>();

  matchMark(node: Node): MarkSet {
    const potentialMatches =
      this.markMatchMap.get(tagName(node) as TagMatch) || [];
    const defaultMatches = this.markMatchMap.get('*') || [];

    const result = new MarkSet();
    potentialMatches.concat(defaultMatches);
    for (const spec of potentialMatches) {
      for (const matcher of spec.matchers) {
        if (matcher.attributeBuilder) {
          const attrs = matcher.attributeBuilder(node);
          if (attrs) {
            result.add(new Mark<Record<string, unknown>>(spec, attrs));
          }
        } else {
          result.add(new Mark<Record<string, unknown>>(spec, {}));
        }
      }
    }
    return result;
  }

  lookupMark(name: string): MarkSpec | null {
    return this.registeredMarks.get(name) || null;
  }

  registerMark(mark: MarkSpec) {
    this.registeredMarks.set(mark.name, mark);
    for (const matcher of mark.matchers) {
      MapUtils.setOrPush(this.markMatchMap, matcher.tag, mark);
    }
  }
}

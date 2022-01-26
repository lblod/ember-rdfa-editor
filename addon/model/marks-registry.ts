import {
  AttributeSpec,
  Mark,
  MarkSpec,
  TagMatch,
} from '@lblod/ember-rdfa-editor/model/markSpec';
import MapUtils from '@lblod/ember-rdfa-editor/model/util/map-utils';
import { tagName } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import ModelText from '@lblod/ember-rdfa-editor/model/model-text';
import { CORE_OWNER } from '@lblod/ember-rdfa-editor/model/util/constants';

export interface SpecAttributes {
  spec: MarkSpec;
  attributes: AttributeSpec;
}

export default class MarksRegistry {
  private markStore: Map<string, Set<Mark>> = new Map<string, Set<Mark>>();
  private markMatchMap: Map<TagMatch, MarkSpec[]> = new Map<
    keyof HTMLElementTagNameMap,
    MarkSpec[]
  >();
  private registeredMarks: Map<string, MarkSpec> = new Map<string, MarkSpec>();

  matchMarkSpec(node: Node): Set<SpecAttributes> {
    const potentialMatches =
      this.markMatchMap.get(tagName(node) as TagMatch) || [];
    const defaultMatches = this.markMatchMap.get('*') || [];

    const result = new Set<SpecAttributes>();
    potentialMatches.concat(defaultMatches);
    for (const spec of potentialMatches) {
      for (const matcher of spec.matchers) {
        if (matcher.attributeBuilder) {
          const attributes = matcher.attributeBuilder(node);
          if (attributes) {
            result.add({ spec, attributes });
          }
        } else {
          result.add({ spec, attributes: {} });
        }
      }
    }
    return result;
  }

  addMark<A extends AttributeSpec>(
    node: ModelText,
    spec: MarkSpec<A>,
    attributes: A
  ) {
    const mark = new Mark(spec, attributes, node);
    MapUtils.setOrAdd(this.markStore, attributes.setBy ?? CORE_OWNER, mark);
    node.addMark(mark);
  }

  removeMarkByName(node: ModelText, markName: string) {
    node.removeMarkByName(markName);
    const mark = node.marks.lookupHash(markName);
    if (mark) {
      const marks = this.markStore.get(mark.attributes.setBy ?? CORE_OWNER);
      if (marks) {
        marks.delete(mark);
      }
    }
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

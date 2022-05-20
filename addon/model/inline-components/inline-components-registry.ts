import { tagName } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import { TagMatch } from '../mark';
import MapUtils from '../util/map-utils';
import { InlineComponent } from './model-inline-component';

export default class InlineComponentsRegistry {
  private registeredComponents: Map<string, InlineComponent> = new Map();
  private componentMatchMap: Map<TagMatch, InlineComponent[]> = new Map<
    keyof HTMLElementTagNameMap,
    InlineComponent[]
  >();
  matchInlineComponentSpec(node: Node): InlineComponent | null {
    const potentialMatches =
      this.componentMatchMap.get(tagName(node) as TagMatch) || [];

    let result: InlineComponent | null = null;

    for (const component of potentialMatches) {
      for (const matcher of component.matchers) {
        if (matcher.attributeBuilder) {
          const attributes = matcher.attributeBuilder(node);
          if (attributes) {
            result = component;
          }
        } else {
          result = component;
        }
      }
    }

    return result;
  }

  registerComponent(component: InlineComponent) {
    this.registeredComponents.set(component.name, component);
    component.matchers.forEach((matcher) => {
      MapUtils.setOrPush(this.componentMatchMap, matcher.tag, component);
    });
  }

  lookUpComponent(name: string) {
    return this.registeredComponents.get(name);
  }
}

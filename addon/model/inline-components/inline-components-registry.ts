import { tagName } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import { TagMatch } from '../mark';
import { tracked } from 'tracked-built-ins';
import MapUtils from '../util/map-utils';
import {
  InlineComponentSpec,
  ModelInlineComponent,
} from './model-inline-component';
export type ActiveComponentEntry = {
  node: Node;
  emberComponentName: string;
  model: ModelInlineComponent;
};
export default class InlineComponentsRegistry {
  private registeredComponents: Map<string, InlineComponentSpec> = new Map();
  private componentMatchMap: Map<TagMatch, InlineComponentSpec[]> = new Map<
    keyof HTMLElementTagNameMap,
    InlineComponentSpec[]
  >();

  activeComponents = tracked<ActiveComponentEntry>([]);

  matchInlineComponentSpec(node: Node): InlineComponentSpec | null {
    const potentialMatches =
      this.componentMatchMap.get(tagName(node) as TagMatch) || [];

    let result: InlineComponentSpec | null = null;

    for (const component of potentialMatches) {
      const baseAttributesMatch = component.baseMatcher.attributeBuilder!(node);
      if (baseAttributesMatch) {
        result = component;
        break;
      }
    }

    return result;
  }

  registerComponent(component: InlineComponentSpec) {
    this.registeredComponents.set(component.name, component);
    MapUtils.setOrPush(
      this.componentMatchMap,
      component.baseMatcher.tag,
      component
    );
  }

  lookUpComponent(name: string) {
    return this.registeredComponents.get(name);
  }

  clearComponentInstances() {
    this.activeComponents.length = 0;
  }

  addComponentInstance(
    node: Node,
    emberComponentName: string,
    model: ModelInlineComponent
  ) {
    this.activeComponents.push({ node, emberComponentName, model });
  }

  get componentInstances() {
    return this.activeComponents;
  }
}

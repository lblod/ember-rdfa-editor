import { tagName } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import { TagMatch } from '../mark';
import { tracked } from 'tracked-built-ins';
import MapUtils from '../util/map-utils';
import {
  InlineComponentSpec,
  InternalInlineComponentSpec,
  ModelInlineComponent,
} from './model-inline-component';
import Controller from '../controller';
import { ComponentNotFoundError } from '@lblod/ember-rdfa-editor/utils/errors';
export type ActiveComponentEntry = {
  node: Node;
  emberComponentName: string;
  model: ModelInlineComponent;
  controller: Controller;
};
export default class InlineComponentsRegistry {
  private registeredComponents: Map<string, InternalInlineComponentSpec> =
    new Map();
  private componentMatchMap: Map<TagMatch, InternalInlineComponentSpec[]> =
    new Map<keyof HTMLElementTagNameMap, InternalInlineComponentSpec[]>();

  activeComponents = tracked<ActiveComponentEntry>([]);

  matchInlineComponentSpec(node: Node): InlineComponentSpec | null {
    const potentialMatches =
      this.componentMatchMap.get(tagName(node) as TagMatch) || [];

    let result: InlineComponentSpec | null = null;

    for (const match of potentialMatches) {
      const baseAttributesMatch =
        match.componentSpec.baseMatcher.attributeBuilder!(node);
      if (baseAttributesMatch) {
        result = match.componentSpec;
        break;
      }
    }

    return result;
  }

  registerComponent({
    componentSpec,
    controller,
  }: InternalInlineComponentSpec) {
    this.registeredComponents.set(componentSpec.name, {
      componentSpec,
      controller,
    });
    MapUtils.setOrPush(this.componentMatchMap, componentSpec.baseMatcher.tag, {
      componentSpec,
      controller,
    });
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
    const componentSpec = this.lookUpComponent(emberComponentName);
    if (componentSpec) {
      this.activeComponents.push({
        node,
        emberComponentName,
        model,
        controller: componentSpec.controller,
      });
    } else {
      throw new ComponentNotFoundError(
        `Component ${emberComponentName} not found`
      );
    }
  }

  get componentInstances() {
    return this.activeComponents;
  }
}

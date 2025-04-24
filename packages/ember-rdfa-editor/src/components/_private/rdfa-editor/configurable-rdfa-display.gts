import Component from '@glimmer/component';
import { get } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import { trackedFunction } from 'reactiveweb/function';
import AuLoader from '@appuniversum/ember-appuniversum/components/au-loader';
import AuPill from '@appuniversum/ember-appuniversum/components/au-pill';
import { type OutgoingTriple } from '#root/core/rdfa-processor.ts';
import type SayController from '#root/core/say-controller.ts';

export const predicateDisplay: DisplayGenerator<OutgoingTriple> = (triple) => {
  return [{ strong: 'predicate:' }, triple.predicate];
};

export type StringDisplay = string;
export type StrongDisplay = { strong: string };
export type PillDisplay = { pill: string };
export type DisplayElement = StringDisplay | StrongDisplay | PillDisplay;
export type DisplayMeta = { title?: string };
export type DisplayConfig =
  | { meta: DisplayMeta; elements: DisplayElement[] }
  | DisplayElement[];

interface GeneratorContext {
  controller: SayController;
}
export type DisplayGenerator<T> = (
  value: T,
  context: GeneratorContext,
) => DisplayConfig | Promise<DisplayConfig>;

interface Sig<T> {
  Args: {
    controller: SayController;
    value: T;
    generator: DisplayGenerator<T>;
  };
}

export default class ConfigurableRdfaDisplay<T> extends Component<Sig<T>> {
  elementConfig = trackedFunction(this, () => {
    return this.args.generator(this.args.value, {
      controller: this.args.controller,
    });
  });
  get elements(): DisplayElement[] {
    const conf = this.elementConfig.value;
    if (!conf) return [];
    return 'elements' in conf ? conf.elements : conf;
  }
  get meta(): DisplayMeta {
    const conf = this.elementConfig.value;
    if (!conf) return {};
    return 'meta' in conf ? conf.meta : {};
  }

  <template>
    <span title={{this.meta.title}}>
      {{#if this.elementConfig.isLoading}}
        <AuLoader @hideMessage={{true}}>
          {{t "ember-rdfa-editor.utils.loading"}}
        </AuLoader>
      {{else}}
        {{#each this.elements as |element|}}
          {{#if (get element "strong")}}
            {{! @glint-expect-error}}
            <strong>{{element.strong}}</strong>
          {{else if (get element "pill")}}
            {{! @glint-expect-error}}
            <AuPill @size="small">{{element.pill}}</AuPill>
          {{else}}
            {{! @glint-expect-error}}
            {{element}}
          {{/if}}
        {{/each}}
      {{/if}}
    </span>
  </template>
}

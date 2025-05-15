import Component from '@glimmer/component';
import { get } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import { trackedFunction } from 'reactiveweb/function';
import AuLoader from '@appuniversum/ember-appuniversum/components/au-loader';
import AuPill from '@appuniversum/ember-appuniversum/components/au-pill';
import { type OutgoingTriple } from '#root/core/rdfa-processor.ts';
import type SayController from '#root/core/say-controller.ts';
import {
  type DisplayElement,
  type DisplayGenerator,
  type DisplayMeta,
} from '#root/plugins/rdfa-info/types.ts';

export const predicateDisplay: DisplayGenerator<OutgoingTriple> = (triple) => {
  return [{ strong: 'predicate:' }, triple.predicate];
};

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

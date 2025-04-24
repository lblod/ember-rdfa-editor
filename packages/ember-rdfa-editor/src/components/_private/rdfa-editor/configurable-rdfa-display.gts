import Component from '@glimmer/component';
import { get } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import AuLoader from '@appuniversum/ember-appuniversum/components/au-loader';
import AuPill from '@appuniversum/ember-appuniversum/components/au-pill';
import { type OutgoingTriple } from '#root/core/rdfa-processor.ts';

export function predicateDisplay(triple: OutgoingTriple): DisplayElement[] {
  return [{ strong: 'predicate:' }, triple.predicate];
}

export type StringDisplay = string;
export type StrongDisplay = { strong: string };
export type PillDisplay = { pill: string };
export type DisplayElement = StringDisplay | StrongDisplay | PillDisplay;

interface Sig<T> {
  Args: {
    value: T;
    generator: (value: T) => DisplayElement[];
    // generator: (value: T) => Promise<DisplayElement[]>;
  };
}

export default class ConfigurableRdfaDisplay<T> extends Component<Sig<T>> {
  elementsTask = { isRunning: false };

  get elements() {
    return this.args.generator(this.args.value);
  }

  <template>
    {{#if this.elementsTask.isRunning}}
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
          <AuPill>{{element.pill}}</AuPill>
        {{else}}
          {{! @glint-expect-error}}
          {{element}}
        {{/if}}
      {{/each}}
    {{/if}}
  </template>
}

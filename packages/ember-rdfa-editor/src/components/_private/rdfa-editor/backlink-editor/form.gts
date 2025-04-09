import Component from '@glimmer/component';
import { on } from '@ember/modifier';
import type { IncomingTriple } from '#root/core/rdfa-processor.ts';
import { localCopy } from 'tracked-toolbox';
import AuFormRow from '@appuniversum/ember-appuniversum/components/au-form-row';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import AuInput from '@appuniversum/ember-appuniversum/components/au-input';
import { sayDataFactory } from '#root/core/say-data-factory/index.ts';
import PowerSelect from 'ember-power-select/components/power-select';
import { type Option } from '#root/utils/_private/option.ts';
import type { Select } from 'ember-power-select/components/power-select';
import { uniqueId } from '@ember/helper';
import { action } from '@ember/object';
import type SayController from '#root/core/say-controller.ts';
import { getSubjects } from '#root/plugins/rdfa-info/index.ts';

interface BacklinkFormSig {
  Element: HTMLFormElement;
  Args: {
    controller: SayController;
    onSubmit: (backlink: IncomingTriple) => void;
    backlink?: Option<IncomingTriple>;
  };
}
const DEFAULT_BACKLINK: IncomingTriple = {
  subject: sayDataFactory.resourceNode(''),
  predicate: '',
};
export default class BacklinkForm extends Component<BacklinkFormSig> {
  @localCopy('args.backlink.subject.value')
  subject: string = '';

  @localCopy('args.backlink.predicate')
  predicate: string = '';

  get controller() {
    return this.args.controller;
  }

  get subjectOptions(): string[] {
    return getSubjects(this.controller.mainEditorState);
  }

  get backlink() {
    return this.args.backlink ?? DEFAULT_BACKLINK;
  }

  @action
  updateSubject(subject: string) {
    this.subject = subject;
  }
  @action
  onSubjectKeydown(select: Select, event: KeyboardEvent): undefined {
    // Based on example from ember-power-select docs, allows for selecting a previously non-existent
    // entry by typing in the power-select 'search' and hitting 'enter'
    if (
      event.key === 'Enter' &&
      select.isOpen &&
      !select.highlighted &&
      !!select.searchText
    ) {
      select.actions.choose(select.searchText);
    }
    return;
  }

  @action
  updatePredicate(event: InputEvent) {
    const target = event.target as HTMLInputElement;
    this.predicate = target.value;
  }

  handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    const backlink: IncomingTriple = {
      subject: sayDataFactory.resourceNode(this.subject),
      predicate: this.predicate,
    };
    this.args.onSubmit(backlink);
  };
  <template>
    <form class="au-c-form" {{on "submit" this.handleSubmit}} ...attributes>
      <AuFormRow>
        {{#let (uniqueId) as |id|}}
          <AuLabel
            for={{id}}
            @required={{true}}
            @requiredLabel="Required"
          >Subject</AuLabel>
          <PowerSelect
            id={{id}}
            {{! For some reason need to manually set width }}
            class="au-u-1-1"
            @searchEnabled={{true}}
            @options={{this.subjectOptions}}
            @selected={{this.subject}}
            @onChange={{this.updateSubject}}
            @onKeydown={{this.onSubjectKeydown}}
            @allowClear={{true}}
            as |obj|
          >
            {{obj}}
          </PowerSelect>
        {{/let}}
      </AuFormRow>
      <AuFormRow>
        {{#let (uniqueId) as |id|}}
          <AuLabel
            for={{id}}
            @required={{true}}
            @requiredLabel="Required"
          >Predicate</AuLabel>
          <AuInput
            id={{id}}
            value={{this.predicate}}
            {{on "input" this.updatePredicate}}
            required={{true}}
            @width="block"
          />
        {{/let}}
      </AuFormRow>
    </form>
  </template>
}

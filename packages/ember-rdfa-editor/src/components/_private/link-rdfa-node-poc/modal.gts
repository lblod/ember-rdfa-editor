import AuFormRow from '@appuniversum/ember-appuniversum/components/au-form-row';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import AuModal, {
  type AuModalSignature,
} from '@appuniversum/ember-appuniversum/components/au-modal';
import Component from '@glimmer/component';
import WithUniqueId from '../with-unique-id.ts';
import PowerSelect from 'ember-power-select/components/power-select';
import type { SayTerm } from '#root/core/say-data-factory/term.ts';
import { tracked } from 'tracked-built-ins';
import AuIcon from '@appuniversum/ember-appuniversum/components/au-icon';
import { CommentIcon } from '@appuniversum/ember-appuniversum/components/icons/comment';
import { QuestionCircleIcon } from '@appuniversum/ember-appuniversum/components/icons/question-circle';
import { not, or } from 'ember-truth-helpers';
import AuBadge from '@appuniversum/ember-appuniversum/components/au-badge';
import AuButtonGroup from '@appuniversum/ember-appuniversum/components/au-button-group';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { on } from '@ember/modifier';
import type { SayNamedNode } from '#root/core/say-data-factory/named-node.ts';
import type { ResourceNodeTerm } from '#root/core/say-data-factory/index.ts';

type TermOptionGeneratorResult<TermType extends SayTerm> =
  | TermOption<TermType>[]
  | Promise<TermOption<TermType>[]>;

type PredicateOptionGeneratorArgs = {
  selectedObject?: SayTerm;
  searchString?: string;
};

export type PredicateOptionGenerator = (
  args?: PredicateOptionGeneratorArgs,
) => TermOptionGeneratorResult<SayNamedNode>;

type SubjectOptionGeneratorArgs = {
  selectedObject?: SayTerm;
  selectedPredicate?: SayTerm;
  searchString?: string;
};

export type SubjectOptionGenerator = (
  args?: SubjectOptionGeneratorArgs,
) => TermOptionGeneratorResult<ResourceNodeTerm>;

export type SubmissionBody = {
  subject: ResourceNodeTerm;
  predicate: SayNamedNode;
};

type LinkRdfaNodeModalSig = {
  Element: AuModalSignature['Element'];
  Args: {
    selectedObject: SayTerm;
    onSubmit: (body: SubmissionBody) => unknown;
    onCancel: () => unknown;
    predicateOptionGenerator: PredicateOptionGenerator;
    subjectOptionGenerator: SubjectOptionGenerator;
  };
};

export type TermOption<TermType extends SayTerm> = {
  label?: string;
  description?: string;
  term: TermType;
};
export default class LinkRdfaNodeModal extends Component<LinkRdfaNodeModalSig> {
  @tracked selectedPredicate?: TermOption<SayNamedNode>;
  @tracked selectedSubject?: TermOption<ResourceNodeTerm>;

  onSubmit = () => {
    if (this.selectedPredicate && this.selectedSubject) {
      this.args.onSubmit({
        subject: this.selectedSubject.term,
        predicate: this.selectedPredicate.term,
      });
    }
  };

  onCancel = () => {
    this.selectedPredicate = undefined;
    this.selectedSubject = undefined;
    this.args.onCancel();
  };

  selectPredicate = (option: TermOption<SayNamedNode>) => {
    this.selectedPredicate = option;
    this.selectedSubject = undefined;
  };

  selectSubject = (option: TermOption<ResourceNodeTerm>) => {
    this.selectedSubject = option;
  };

  searchPredicates = async (searchString: string) => {
    const options = await this.args.predicateOptionGenerator({
      searchString,
      selectedObject: this.args.selectedObject,
    });
    return options;
  };

  searchSubjects = async (searchString: string) => {
    const options = await this.args.subjectOptionGenerator({
      searchString,
      selectedPredicate: this.selectedPredicate?.term,
      selectedObject: this.args.selectedObject,
    });
    return options;
  };
  <template>
    <AuModal @modalOpen={{true}} @closeModal={{this.onCancel}} ...attributes>
      <:title>Voeg relatie toe</:title>
      <:body>
        <form class="au-c-form">
          <AuFormRow>
            <WithUniqueId as |id|>
              <AuLabel for={{id}} @required={{true}} @requiredLabel="Vereist">
                Relatie-type
                <AuBadge
                  @icon={{QuestionCircleIcon}}
                  @size="small"
                  class="au-u-margin-left-tiny"
                />
              </AuLabel>
              <PowerSelect
                class="au-u-1-1"
                @options={{this.searchPredicates ""}}
                @search={{this.searchPredicates}}
                @searchEnabled={{true}}
                @onChange={{this.selectPredicate}}
                @selected={{this.selectedPredicate}}
                as |option|
              >
                <div
                  class="au-u-flex au-u-flex--spaced-tiny au-u-flex--vertical-center"
                >
                  <AuIcon @icon={{CommentIcon}} />
                  <p><strong>{{or option.label option.term.value}}</strong></p>
                </div>
                {{#if option.description}}
                  <p>{{option.description}}</p>
                {{/if}}

              </PowerSelect>
            </WithUniqueId>

          </AuFormRow>
          <AuFormRow>
            <WithUniqueId as |id|>
              <AuLabel for={{id}} @required={{true}} @requiredLabel="Vereist">
                Onderwerp
                <AuBadge
                  @icon={{QuestionCircleIcon}}
                  @size="small"
                  class="au-u-margin-left-tiny"
                />
              </AuLabel>
              <PowerSelect
                class="au-u-1-1"
                @disabled={{not this.selectedPredicate}}
                @options={{this.searchSubjects ""}}
                @search={{this.searchSubjects}}
                @searchEnabled={{true}}
                @onChange={{this.selectSubject}}
                @selected={{this.selectedSubject}}
                as |option|
              >
                <div
                  class="au-u-flex au-u-flex--spaced-tiny au-u-flex--vertical-center"
                >
                  <AuIcon @icon={{CommentIcon}} />
                  <p><strong>{{or option.label option.term.value}}</strong></p>
                </div>
                {{#if option.description}}
                  <p>{{option.description}}</p>
                {{/if}}

              </PowerSelect>
            </WithUniqueId>

          </AuFormRow>
        </form>
      </:body>
      <:footer>
        <AuButtonGroup>
          <AuButton
            type="submit"
            {{on "click" this.onSubmit}}
          >Invoegen</AuButton>
          <AuButton
            @skin="secondary"
            {{on "click" this.onCancel}}
          >Annuleren</AuButton>
        </AuButtonGroup>
      </:footer>
    </AuModal>
  </template>
}

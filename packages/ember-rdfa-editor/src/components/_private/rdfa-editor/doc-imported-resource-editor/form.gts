import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { ValidationError, string } from 'yup';
import type SayController from '#root/core/say-controller.ts';
import { on } from '@ember/modifier';
import AuFormRow from '@appuniversum/ember-appuniversum/components/au-form-row';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import AuPill from '@appuniversum/ember-appuniversum/components/au-pill';
import AuInput from '@appuniversum/ember-appuniversum/components/au-input';
import { uniqueId } from '@ember/helper';

const resourceSchema = string().curie().required();

interface Sig {
  Args: {
    onSave: (resource: string) => void;
    onCancel: () => void;
    controller?: SayController;
  };
  Element: HTMLFormElement;
}

export default class PropertyEditorForm extends Component<Sig> {
  @tracked
  resource: string | undefined = undefined;
  @tracked
  errors: ValidationError[] = [];

  validateForm(): string | false {
    this.errors = [];
    try {
      return resourceSchema.validateSync(this.resource);
    } catch (e) {
      if (e instanceof ValidationError) {
        this.errors = e.inner;
        return false;
      } else {
        throw e;
      }
    }
  }
  findError = (path: string) => {
    return this.errors.find((error) => error.path === path)?.message ?? null;
  };

  handleInput = (event: Event) => {
    this.resource =
      (event.currentTarget &&
        'value' in event.currentTarget &&
        (event.currentTarget?.value as string)) ||
      '';
  };
  handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    const validated = this.validateForm();
    if (validated) {
      this.args.onSave(validated);
    }
  };

  <template>
    <form ...attributes {{on "submit" this.handleSubmit}}>
      <AuFormRow>
        {{#let (uniqueId) "resource" as |id name|}}
          {{#let (this.findError name) as |error|}}
            <AuLabel
              for={{id}}
              @required={{true}}
              @requiredLabel="Required"
            >Resource</AuLabel>
            <AuInput
              id={{id}}
              name={{name}}
              value={{this.resource}}
              required={{true}}
              @width="block"
              {{on "input" this.handleInput}}
            />
            {{#if error}}
              <AuPill>{{error}}</AuPill>
            {{/if}}
          {{/let}}
        {{/let}}
      </AuFormRow>
    </form>
  </template>
}

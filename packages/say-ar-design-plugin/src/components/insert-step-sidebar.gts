import Component from '@glimmer/component';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import SignAccordion from '#root/components/sign-accordion.gts';
import PowerSelect from 'ember-power-select/components/power-select';
import t from 'ember-intl/helpers/t';
import { fn } from '@ember/helper';
import type {
  MainSignWithInstruction,
  SignWithInstruction,
} from '#root/plugin/types.ts';
import { action } from '@ember/object';
import type Instruction from '#root/plugin/models/instruction.ts';
import type { State } from 'reactiveweb/get-promise-state';

type ArPreviewSignature = {
  Args: {
    measureDesigns: State<{ signs: MainSignWithInstruction[] }[]>;
  };
  Element: HTMLDivElement;
};

export default class InsertStepSidebar extends Component<ArPreviewSignature> {
  @action
  selectInstruction(sign: SignWithInstruction, instruction: Instruction) {
    sign.selectedInstruction = instruction;
  }

  <template>
    <AuHeading @level="3" @skin="4" class="au-u-margin-bottom-small">
      {{t "ar-importer.insert.instructions-header"}}
    </AuHeading>
    {{#if @measureDesigns.resolved}}
      {{#each @measureDesigns.resolved as |design index|}}
        <AuHeading @level="4" @skin="4">
          {{t "ar-importer.insert.article"}}
          {{generateArticleNumber index}}
          .
        </AuHeading>
        {{#each design.signs as |signWithInstruction|}}
          <SignAccordion @signWithInstruction={{signWithInstruction}} />
        {{/each}}
        {{#each (flattenAndSortSigns design.signs) as |signWithInstruction|}}
          <div class="au-u-margin-bottom">
            <AuHeading @skin="6" @level="3">
              {{t "ar-importer.insert.instruction"}}
              {{signWithInstruction.sign.code}}
            </AuHeading>
            <PowerSelect
              @onChange={{fn this.selectInstruction signWithInstruction}}
              @selected={{signWithInstruction.selectedInstruction}}
              @options={{signWithInstruction.sign.instructions}}
              @placeholder={{t "ar-importer.insert.instruction-placeholder"}}
              as |option|
            >{{option.preview}}</PowerSelect>
          </div>
        {{/each}}
      {{/each}}
    {{/if}}
  </template>
}

function generateArticleNumber(index: number) {
  return index + 1;
}

function flattenAndSortSigns(signs: MainSignWithInstruction[]) {
  const sortedAndFlattedSigns: SignWithInstruction[] = [];
  const selectedSignsSorted: MainSignWithInstruction[] = [...signs];
  selectedSignsSorted.sort((signA, signB) => {
    return signA.mainSign.position - signB.mainSign.position;
  });
  for (const sign of selectedSignsSorted) {
    sortedAndFlattedSigns.push(sign.mainSign);
    for (const subSign of sign.subSigns.values()) {
      sortedAndFlattedSigns.push(subSign);
    }
  }
  return sortedAndFlattedSigns;
}

import Component from '@glimmer/component';
import type ArDesign from '../plugin/models/ar-design.ts';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import { getPromiseState } from 'reactiveweb/get-promise-state';
import { cached } from '@glimmer/tracking';
import generateDesignSignTree from '#root/plugin/utils/generate-design-sign-tree.ts';
import SignAccordion from '#root/components/sign-accordion.gts';

type ArPreviewSignature = {
  Args: {
    arDesign: ArDesign;
  };
  Element: HTMLDivElement;
};

export default class InsertStepSidebar extends Component<ArPreviewSignature> {
  @cached
  get measureDesignSignTree() {
    return generateDesignSignTree(this.args.arDesign);
  }
  get measureDesigns() {
    return getPromiseState(this.measureDesignSignTree);
  }
  <template>
    {{#if this.measureDesigns.resolved}}
      {{#each this.measureDesigns.resolved as |design index|}}
        <AuHeading @level="4" @skin="4">
          Artikel
          {{generateArticleNumber index}}
          .
          {{#each design.signs as |sign|}}
            <SignAccordion @sign={{sign}} />
          {{/each}}
        </AuHeading>
      {{/each}}
    {{/if}}
  </template>
}

function generateArticleNumber(index: number) {
  return index + 1;
}

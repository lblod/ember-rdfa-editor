import Component from '@glimmer/component';
import type { State } from 'reactiveweb/get-promise-state';
import type ArDesign from '#root/plugin/models/ar-design.ts';
import type {
  InsertPositionOption,
  MainSignWithInstruction,
  ProcessDocumentHeadlessly,
} from '#root/plugin/types.ts';
import InsertStepSidebar from '#root/components/insert-step-sidebar.gts';
import InsertStepContent from '#root/components/insert-step-content.gts';

type ArPreviewSignature = {
  Args: {
    arDesign: ArDesign;
    onReturnToOverview: () => unknown;
    processDocumentHeadlessly: ProcessDocumentHeadlessly;
    measureDesigns: State<{ signs: MainSignWithInstruction[] }[]>;
    measureTemplates?: string[];
    options: InsertPositionOption[];
    selected: InsertPositionOption;
    onChange: (selected: InsertPositionOption | null) => void;
  };
  Element: HTMLDivElement;
};

export default class InsertStep extends Component<ArPreviewSignature> {
  returnToOverview = () => {
    this.args.onReturnToOverview();
  };

  <template>
    <div class="ar-importer-preview" ...attributes>
      <div class="au-o-grid ar-importer-preview__grid au-u-margin-none">
        <div
          class="au-o-grid__item ar-importer-preview__pane au-u-1-3 au-u-1-4@medium au-u-1-5@large"
        >
          <InsertStepSidebar @measureDesigns={{@measureDesigns}} />
        </div>
        <div
          class="au-o-grid__item ar-importer-preview__pane au-u-2-3 au-u-3-4@medium au-u-4-5@large"
        >
          <InsertStepContent
            @arDesign={{@arDesign}}
            @processDocumentHeadlessly={{@processDocumentHeadlessly}}
            @measureTemplates={{@measureTemplates}}
            @options={{@options}}
            @selected={{@selected}}
            @onChange={{@onChange}}
          />
        </div>
      </div>
    </div>
  </template>
}

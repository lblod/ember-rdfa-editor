import type { TOC } from '@ember/component/template-only';
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
    processDocumentHeadlessly: ProcessDocumentHeadlessly;
    measureDesigns: State<{ signs: MainSignWithInstruction[] }[]>;
    measureTemplates?: string[];
    options: InsertPositionOption[];
    selected: InsertPositionOption;
    onChange: (selected: InsertPositionOption | null) => void;
  };
  Element: HTMLDivElement;
};

const InsertStep: TOC<ArPreviewSignature> = <template>
  <div class="ar-importer-preview" ...attributes>
    <div class="au-o-grid ar-importer-preview__grid au-u-margin-none">
      <div class="au-o-grid__item ar-importer-preview__pane au-u-1-3">
        <InsertStepSidebar @measureDesigns={{@measureDesigns}} />
      </div>
      <div class="au-o-grid__item ar-importer-preview__pane au-u-2-3">
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
</template>;

export default InsertStep;

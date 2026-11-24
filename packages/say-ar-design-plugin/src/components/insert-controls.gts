import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import type { TOC } from '@ember/component/template-only';
import type ArDesign from '#root/plugin/models/ar-design.ts';
import t from 'ember-intl/helpers/t';
import type { ArInsertFunc } from '#root/plugin/types.ts';
import { ArticleInsertPosition } from '#root/plugin/utils/article-insert-position.ts';
import { not } from 'ember-truth-helpers';

const InsertButton: TOC<{
  Args: {
    arDesign: ArDesign;
    insertLoading?: boolean;
    onInsertAr: ArInsertFunc;
    insertPosition: ArticleInsertPosition | false;
    insertEnabled: boolean;
  };
}> = <template>
  <AuButton
    @loading={{@insertLoading}}
    @loadingMessage={{t "application.loading"}}
    @disabled={{not @insertEnabled}}
    {{on "click" (fn @onInsertAr @arDesign @insertPosition)}}
  >{{t "ar-importer.controls.insert"}}</AuButton>
</template>;

export interface ArInsertControlArgs {
  arDesign: ArDesign;
  onInsertAr: ArInsertFunc;
  insertLoading?: boolean;
  insertPosition: ArticleInsertPosition | false;
  closeModal: () => void;
  insertEnabled: boolean;
}
type Sig = {
  Args: ArInsertControlArgs;
};

const InsertControls: TOC<Sig> = <template>
  <div class="ar-importer-insert-controls">

    <AuButton @skin="naked" {{on "click" @closeModal}}>
      {{t "ar-importer.controls.cancel"}}
    </AuButton>
    <InsertButton
      @arDesign={{@arDesign}}
      @onInsertAr={{@onInsertAr}}
      @insertLoading={{@insertLoading}}
      @insertPosition={{@insertPosition}}
      @insertEnabled={{@insertEnabled}}
    />
  </div>
</template>;

export default InsertControls;

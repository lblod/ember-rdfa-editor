import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { PlusIcon } from '@appuniversum/ember-appuniversum/components/icons/plus';
import type { TOC } from '@ember/component/template-only';
import type ArDesign from '#root/plugin/models/ar-design.ts';
import t from 'ember-intl/helpers/t';
import type { ArInsertFunc, ArticlePosition } from '#root/plugin/types.ts';
import { ArticleInsertPosition } from '#root/plugin/utils/article-insert-position.ts';

const InsertButton: TOC<{
  Args: {
    arDesign: ArDesign;
    insertLoading?: boolean;
    onInsertAr: ArInsertFunc;
    insertPosition: ArticleInsertPosition | false;
  };
}> = <template>
  <AuButton
    @icon={{PlusIcon}}
    @loading={{@insertLoading}}
    @loadingMessage={{t "application.loading"}}
    {{on "click" (fn @onInsertAr @arDesign @insertPosition true)}}
  >{{t "ar-importer.controls.insert"}}</AuButton>
</template>;

export interface ArInsertControlArgs {
  arDesign: ArDesign;
  onInsertAr: ArInsertFunc;
  insertLoading?: boolean;
  articles: ArticlePosition[];
  regulatoryStatementMode?: boolean;
  insertPosition: ArticleInsertPosition | false;
}
type Sig = {
  Args: ArInsertControlArgs;
};

const InsertControls: TOC<Sig> = <template>
  <div class="ar-importer-insert-controls">
    <InsertButton
      @arDesign={{@arDesign}}
      @onInsertAr={{@onInsertAr}}
      @insertLoading={{@insertLoading}}
      @insertPosition={{@insertPosition}}
    />
  </div>
</template>;

export default InsertControls;

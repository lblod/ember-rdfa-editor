import { fn } from '@ember/helper';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import { PlusIcon } from '@appuniversum/ember-appuniversum/components/icons/plus';
import type { TOC } from '@ember/component/template-only';
import type ArDesign from '#root/plugin/models/ar-design.ts';
import t from 'ember-intl/helpers/t';
import PowerSelect, {
  type Select,
} from 'ember-power-select/components/power-select';
import Component from '@glimmer/component';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import type {
  ArInsertFunc,
  ArticlePosition,
  InsertPositionOption,
} from '#root/plugin/types.ts';
import {
  afterLastArticle,
  ArticleInsertPosition,
  beforeFirstArticle,
} from '#root/plugin/utils/article-insert-position.ts';

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
}
type Sig = {
  Args: ArInsertControlArgs;
};

export class InsertControls extends Component<Sig> {
  <template>
    <div class="ar-importer-insert-controls">
      <InsertButton
        @arDesign={{@arDesign}}
        @onInsertAr={{@onInsertAr}}
        @insertLoading={{@insertLoading}}
        @insertPosition={{this.selected.value}}
      />
    </div>
  </template>
}

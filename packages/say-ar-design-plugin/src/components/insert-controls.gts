import { fn } from '@ember/helper';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import { PlusIcon } from '@appuniversum/ember-appuniversum/components/icons/plus';
import type { TOC } from '@ember/component/template-only';
import type ArDesign from '../plugin/models/ar-design.ts';
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
} from '../plugin/types.ts';
import {
  afterLastArticle,
  ArticleInsertPosition,
  beforeFirstArticle,
} from '../plugin/utils/article-insert-position.ts';

const InsertButton: TOC<{
  Args: {
    arDesign: ArDesign;
    insertLoading?: boolean;
    onInsertAr: ArInsertFunc;
    insertPosition: ArticleInsertPosition;
  };
}> = <template>
  <AuButton
    @icon={{PlusIcon}}
    @loading={{@insertLoading}}
    @loadingMessage={{t 'application.loading'}}
    {{on 'click' (fn @onInsertAr @arDesign @insertPosition true)}}
  >{{t 'ar-importer.controls.insert'}}</AuButton>
</template>;

const InsertPositionSelector: TOC<{
  Args: {
    options: InsertPositionOption[];
    selected: InsertPositionOption | null;
    onChange: (
      selected: InsertPositionOption,
      select: Select,
      event?: Event,
    ) => void;
  };
}> = <template>
  <AuLabel for='ar-importer-position-selector'>{{t
      'ar-importer.controls.select-position'
    }}:</AuLabel>
  <div class='ar-importer-insert-controls__selector'>
    <PowerSelect
      id='ar-importer-position-selector'
      @allowClear={{false}}
      @onChange={{@onChange}}
      @selected={{@selected}}
      @options={{@options}}
      as |option|
    >{{option.label}}</PowerSelect>
  </div>
</template>;

export interface ArInsertControlArgs {
  arDesign: ArDesign;
  onInsertAr: ArInsertFunc;
  insertLoading?: boolean;
  articles: ArticlePosition[];
}
type Sig = {
  Args: ArInsertControlArgs;
};

export class InsertControls extends Component<Sig> {
  @tracked _selected: InsertPositionOption | null = null;
  @service declare intl: IntlService;

  get beforeFirst(): InsertPositionOption {
    return {
      value: beforeFirstArticle,
      label: this.intl.t('ar-importer.controls.first'),
    };
  }
  get afterLast(): InsertPositionOption {
    return {
      value: afterLastArticle,
      label: this.intl.t('ar-importer.controls.last'),
    };
  }

  get articleOptions(): InsertPositionOption[] {
    return this.args.articles.map((_, i) => ({
      value: new ArticleInsertPosition(i),
      label: this.intl.t('ar-importer.controls.after-article-x', {
        articleNumber: i + 1,
      }),
    }));
  }

  get options(): InsertPositionOption[] {
    return [this.afterLast, this.beforeFirst, ...this.articleOptions];
  }

  get selected(): InsertPositionOption {
    return this._selected ?? this.afterLast;
  }

  setSelected = (val: InsertPositionOption | null) => {
    this._selected = val;
  };

  <template>
    <div class='ar-importer-insert-controls'>
      <InsertPositionSelector
        @options={{this.options}}
        @selected={{this.selected}}
        @onChange={{this.setSelected}}
      />
      <InsertButton
        @arDesign={{@arDesign}}
        @onInsertAr={{@onInsertAr}}
        @insertLoading={{@insertLoading}}
        @insertPosition={{this.selected.value}}
      />
    </div>
  </template>
}

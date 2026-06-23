import Component from '@glimmer/component';
import { fn, get } from '@ember/helper';
import type { AuMainContainerSignature } from '@appuniversum/ember-appuniversum/components/au-main-container';
import ReactiveTable from './reactive-table.gts';
import AuButtonGroup from '@appuniversum/ember-appuniversum/components/au-button-group';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { VisibleIcon } from '@appuniversum/ember-appuniversum/components/icons/visible';
import AuFormRow from '@appuniversum/ember-appuniversum/components/au-form-row';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuInput from '@appuniversum/ember-appuniversum/components/au-input';
import AuPill from '@appuniversum/ember-appuniversum/components/au-pill';
import AuLoader from '@appuniversum/ember-appuniversum/components/au-loader';
import { v4 as uuidv4 } from 'uuid';
import { CrossIcon } from '@appuniversum/ember-appuniversum/components/icons/cross';
import { detailedDate } from '@lblod/ember-rdfa-editor/utils/_private/lblod-utils/detailed-date';
import type ArDesign from '../plugin/models/ar-design.ts';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import type { ArDesignOverviewSortField, DesignInfo } from '../plugin/types.ts';
import { trackedFunction } from 'reactiveweb/function';
import type { TOC } from '@ember/component/template-only';

export type ArDesignOverviewSignature = {
  Element: AuMainContainerSignature['Element'];
  Args: {
    arDesigns?: DesignInfo | null;
    loading?: boolean;
    onShowPreview: (arDesign: ArDesign) => void;
    nameFilter?: string;
    setNameFilter: (event: Event) => unknown;
    resetFilters: () => unknown;
    pageNumber: number;
    pageSize: number;
    updatePageNumber: (page: number) => unknown;
    sort?: ArDesignOverviewSortField;
    updateSort: (field?: ArDesignOverviewSortField) => unknown;
  };
};

const ArDesignOverview: TOC<ArDesignOverviewSignature> = <template>
  <div class='ar-importer-overview' ...attributes>
    <div class='ar-importer-overview__sidebar'>
      <AuHeading @level='2' @skin='3'>{{t
          'ar-importer.overview.filters.title'
        }}</AuHeading>
      <form class='ar-importer-overview__form'>
        <AuFormRow>
          {{#let (uuidv4) as |id|}}
            <AuLabel class='ar-importer-overview__form__label' for={{id}}>
              {{t 'ar-importer.overview.filters.name.label'}}
            </AuLabel>
            <AuInput
              id={{id}}
              @width='block'
              value={{@nameFilter}}
              {{on 'input' @setNameFilter}}
            />
          {{/let}}
        </AuFormRow>
        <AuButton
          class='ar-importer-overview__reset-filters-button'
          @skin='naked'
          @size='large'
          @icon={{CrossIcon}}
          {{on 'click' @resetFilters}}
        >{{t 'ar-importer.overview.filters.reset'}}</AuButton>
      </form>
    </div>
    <div class='ar-importer-overview__content'>
      <ReactiveTable
        @content={{@arDesigns.designs}}
        @isLoading={{@loading}}
        @page={{@pageNumber}}
        @pageSize={{@pageSize}}
        @onPageChange={{@updatePageNumber}}
        @onSortChange={{@updateSort}}
        @sort={{@sort}}
        @noDataMessage={{t 'ar-importer.overview.table.no-data'}}
        @hidePagination={{false}}
      >
        <:header as |header|>
          <header.Sortable
            @field=':no-case:name'
            @label={{t 'ar-importer.overview.table.headers.name'}}
          />
          <header.Sortable
            @field='date'
            @label={{t 'ar-importer.overview.table.headers.date'}}
          />
          <th>{{t 'ar-importer.overview.table.headers.status'}}</th>
          <th />
        </:header>
        <:body as |arDesign|>
          <td>
            {{arDesign.name}}
          </td>
          <td>
            {{detailedDate arDesign.date}}
          </td>
          <td>
            {{#if arDesign.id}}
              <UsageStatus @inDocs={{get @arDesigns.inDocs arDesign.id}} />
            {{/if}}
          </td>
          <td>
            <AuButtonGroup>
              <AuButton
                @skin='link'
                @icon={{VisibleIcon}}
                {{on 'click' (fn @onShowPreview arDesign)}}
              >{{t 'ar-importer.overview.table.actions.select'}}</AuButton>
            </AuButtonGroup>
          </td>
        </:body>
      </ReactiveTable>
    </div>
  </div>
</template>;

export default ArDesignOverview;

type UsageStatusSig = {
  Args: {
    inDocs: Promise<number> | undefined;
  };
};
class UsageStatus extends Component<UsageStatusSig> {
  count = trackedFunction(this, () => this.args.inDocs ?? 0);

  <template>
    {{#if this.count.isPending}}
      <AuLoader @inline={{true}} @hideMessage={{true}}>
        {{t 'application.loading'}}
      </AuLoader>
    {{else}}
      {{#if this.count.value}}
        <AuPill @size='small'>
          {{t 'ar-importer.overview.table.statuses.used'}}
        </AuPill>
      {{else}}
        <AuPill @size='small'>
          {{t 'ar-importer.overview.table.statuses.unused'}}
        </AuPill>
      {{/if}}
    {{/if}}
  </template>
}

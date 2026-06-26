// eslint-disable-next-line ember/no-at-ember-render-modifiers
import didUpdate from '@ember/render-modifiers/modifiers/did-update';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
// eslint-disable-next-line ember/no-at-ember-render-modifiers
import didInsert from '@ember/render-modifiers/modifiers/did-insert';
import AuDataTable from '@appuniversum/ember-appuniversum/components/au-data-table';
import AuDataTableThSortable from '@appuniversum/ember-appuniversum/components/au-data-table/th-sortable';
import { hash } from '@ember/helper';
import type { ComponentLike } from '@glint/template';

export type ReactiveTableSignature<T, S extends string> = {
  Args: {
    pageSize?: number;
    page?: number;
    sort?: S;
    isLoading?: boolean;
    noDataMessage?: string;
    hidePagination?: boolean;
    fields?: string | string[];
    content?: T[] | null;

    onPageChange?: (newPage: number) => void;
    onSortChange?: (newSort?: S) => void;
  };
  Blocks: {
    menu?: [];
    header: [
      {
        Sortable: ComponentLike<{ field: string; label: string }>;
      },
    ];
    body: [item: T];
  };
};

export default class ReactiveTable<T, S extends string> extends Component<
  ReactiveTableSignature<T, S>
> {
  @tracked declare _page: number;
  @tracked declare _sort: S | '';

  get pageSize() {
    return this.args.pageSize ?? 20;
  }

  get page() {
    return this.args.page ?? 0;
  }

  get sort() {
    return this.args.sort ?? '';
  }

  @action
  initialize() {
    this._page = this.page;
    this._sort = this.sort;
  }

  @action
  onPageChange() {
    if (this._page !== this.page) {
      this.args.onPageChange?.(this._page);
    }
  }

  @action
  onSortChange() {
    if (this._sort !== this.sort) {
      this.args.onSortChange?.(this._sort || undefined);
    }
  }

  @action
  onExternalPageChange() {
    if (this._page !== this.page) {
      this._page = this.page;
    }
  }

  @action
  onExternalSortChange() {
    if (this._sort !== this.sort) {
      this._sort = this.sort;
    }
  }

  <template>
    {{! @glint-nocheck: not typesafe yet }}
    <AuDataTable
      @content={{@content}}
      @isLoading={{@isLoading}}
      @fields={{@fields}}
      @noDataMessage={{@noDataMessage}}
      @size={{this.pageSize}}
      @page={{this._page}}
      @sort={{this._sort}}
      @hidePagination={{@hidePagination}}
      as |table|
    >
      <span
        {{! TODO: refactor did-insert and did-update }}
        {{!template-lint-disable no-at-ember-render-modifiers}}
        {{didInsert this.initialize}}
        {{didUpdate this.onPageChange this._page}}
        {{didUpdate this.onSortChange this._sort}}
        {{didUpdate this.onExternalPageChange @page}}
        {{didUpdate this.onExternalSortChange @sort}}
      ></span>
      {{#if (has-block "menu")}}
        <table.menu as |menu|>
          <menu.general>
            {{yield to="menu"}}
          </menu.general>
        </table.menu>
      {{/if}}
      <table.content class="table-centered-content" as |content|>
        <content.header>
          {{yield
            (hash
              Sortable=(component
                AuDataTableThSortable currentSorting=this._sort
              )
            )
            to="header"
          }}
        </content.header>
        <content.body as |item|>
          {{yield item to="body"}}
        </content.body>

      </table.content>

    </AuDataTable>
  </template>
}

import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import AuToolbar from '@appuniversum/ember-appuniversum/components/au-toolbar';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { NavLeftIcon } from '@appuniversum/ember-appuniversum/components/icons/nav-left';
import { NavRightIcon } from '@appuniversum/ember-appuniversum/components/icons/nav-right';
import { type TOC } from '@ember/component/template-only';

type Signature = {
  Args: {
    rangeStart: number;
    rangeEnd: number;
    totalCount: number;
    isFirstPage: boolean;
    isLastPage: boolean;
    onPreviousPage: () => void;
    onNextPage: () => void;
  };
};
const PaginationView: TOC<Signature> = <template>
  <div class="au-u-background-gray-100">
    <AuToolbar @border="top" @size="large" @nowrap={{true}}>
      <div class="au-c-pagination">
        <p>
          <span class="au-u-hidden-visually">
            {{t "pagination.results"}}</span>
          <strong>
            {{@rangeStart}}
            -
            {{@rangeEnd}}
          </strong>
          {{t "pagination.of"}}
          {{@totalCount}}
        </p>
        <div class="au-u-flex">
          {{#unless @isFirstPage}}
            <AuButton
              @skin="link"
              @icon={{NavLeftIcon}}
              @iconAlignment="left"
              {{on "click" @onPreviousPage}}
            >
              {{t "pagination.previous"}}
            </AuButton>
          {{/unless}}
          {{#unless @isLastPage}}
            <AuButton
              @skin="link"
              @icon={{NavRightIcon}}
              @iconAlignment="right"
              {{on "click" @onNextPage}}
            >
              {{t "pagination.next"}}
            </AuButton>
          {{/unless}}
        </div>
      </div>
    </AuToolbar>
  </div>
</template>;

export default PaginationView;

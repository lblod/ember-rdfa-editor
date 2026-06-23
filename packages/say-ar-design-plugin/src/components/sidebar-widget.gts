import { on } from '@ember/modifier';
import Component from '@glimmer/component';
import { tracked } from 'tracked-built-ins';
import t from 'ember-intl/helpers/t';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuModal from '@appuniversum/ember-appuniversum/components/au-modal';
import type { SayController } from '@lblod/ember-rdfa-editor';
import ArWidgetContents from './widget-contents.gts';
import { getCurrentBesluitRange } from '@lblod/ember-rdfa-editor/utils/_private/lblod-utils/decision-utils';
import { getArticleNodes } from '@lblod/ember-rdfa-editor/utils/_private/lblod-utils/document-structure-utils';
import type {
  ArDesignQuery,
  ArticlePosition,
  ProcessDocumentHeadlessly,
} from '../plugin/types.ts';

type Sig = {
  Args: {
    controller: SayController;
    designQuery: ArDesignQuery;
    processDocumentHeadlessly: ProcessDocumentHeadlessly;
  };
  Element: HTMLLIElement;
};

export default class ArDesignSidebarWidget extends Component<Sig> {
  @tracked modalOpen = false;
  @tracked articles: ArticlePosition[] = [];
  openModal = () => {
    this.articles = getArticleNodes(this.args.controller.mainEditorState);
    this.modalOpen = true;
  };
  closeModal = () => {
    this.modalOpen = false;
  };
  get disableInsert() {
    return !getCurrentBesluitRange(this.args.controller);
  }

  <template>
    <li class="au-c-list__item" ...attributes>
      <AuButton
        @icon="add"
        @iconAlignment="left"
        @skin="link"
        @disabled={{this.disableInsert}}
        {{on "click" this.openModal}}
      >
        {{t "ar-importer.sidebar-widget.label"}}
      </AuButton>
    </li>
    <AuModal
      @size="large"
      @modalOpen={{this.modalOpen}}
      @closeModal={{this.closeModal}}
      @title={{t "ar-importer.modal.title"}}
      @padding="none"
      as |modal|
    >
      <modal.Body>
        <ArWidgetContents
          @controller={{@controller}}
          @onInsert={{this.closeModal}}
          @articles={{this.articles}}
          @designQuery={{@designQuery}}
          @processDocumentHeadlessly={{@processDocumentHeadlessly}}
        />
      </modal.Body>
    </AuModal>
  </template>
}
